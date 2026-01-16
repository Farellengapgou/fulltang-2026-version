from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.decorators import method_decorator
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework import status, permissions
from rest_framework.response import Response
from django.db.models import Q

from accounting.stock_models import TransferNote, TransferLine, StockMovement, Stock
from accounting.stock_serializers import TransferNoteSerializer, TransferLineSerializer

auth_header_param = openapi.Parameter(
    name="Authorization",
    in_=openapi.IN_HEADER,
    description="Token JWT (Bearer <token>)",
    type=openapi.TYPE_STRING,
    required=True,
)

tags = ["material-accounting"]


@method_decorator(
    name="list",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
@method_decorator(
    name="retrieve",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
@method_decorator(
    name="create",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
@method_decorator(
    name="update",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
@method_decorator(
    name="partial_update",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
@method_decorator(
    name="destroy",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
class TransferNoteViewSet(ModelViewSet):
    queryset = TransferNote.objects.all().order_by('-created_at')
    serializer_class = TransferNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        # basic filters: state, source/destination, start_date
        params = self.request.query_params
        state = params.get('state')
        if state:
            qs = qs.filter(status__iexact=state)

        src = params.get('source_warehouse_id')
        if src:
            qs = qs.filter(source_depot_id=src)

        dst = params.get('destination_warehouse_id')
        if dst:
            qs = qs.filter(destination_depot_id=dst)

        start_date = params.get('start_date')
        if start_date:
            from django.utils.dateparse import parse_date
            sd = parse_date(start_date)
            if sd:
                qs = qs.filter(created_at__date__gte=sd)

        return qs

    @action(detail=True, methods=["get"], url_path="lines")
    def lines(self, request, pk=None):
        transfer = self.get_object()
        lines = TransferLine.objects.filter(transfer_id=transfer.pk).order_by('sequence')
        serializer = TransferLineSerializer(lines, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="lines")
    def create_line(self, request, pk=None):
        data = request.data.copy()
        data['transfer'] = pk
        serializer = TransferLineSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get", "put", "delete"], url_path=r"lines/(?P<line_id>[^/.]+)")
    def line_detail(self, request, pk=None, line_id=None):
        try:
            line = TransferLine.objects.get(transfer_id=pk, pk=line_id)
        except TransferLine.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            serializer = TransferLineSerializer(line)
            return Response(serializer.data)
        if request.method == 'PUT':
            serializer = TransferLineSerializer(line, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        if request.method == 'DELETE':
            line.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"], url_path="send")
    def send(self, request, pk=None):
        tr = self.get_object()
        if tr.status != 'PENDING':
            return Response({'detail': 'Only pending transfers can be sent'}, status=status.HTTP_400_BAD_REQUEST)

        movements = []
        for line in tr.lines.all():
            mv = StockMovement.objects.create(
                movement_type='OUT',
                movement_reason='TRANSFER',
                article=line.article,
                source_depot=tr.source_depot,
                destination_depot=tr.destination_depot,
                quantity=line.quantity,
                unit_price=getattr(line.article, 'weighted_average_price', 0),
                total_value=line.quantity * getattr(line.article, 'weighted_average_price', 0),
                operation_date=None,
                reference_document=tr.transfer_number,
                document_type='TRANSFER',
                status='CONFIRMED',
                created_by=request.user
            )
            movements.append(mv.id)

            stock, _ = Stock.objects.get_or_create(article=line.article, depot=tr.source_depot, defaults={'physical_quantity':0,'theoretical_quantity':0})
            stock.physical_quantity -= line.quantity
            stock.theoretical_quantity -= line.quantity
            stock.update_value()

        tr.status = 'IN_TRANSIT'
        tr.save()
        return Response({'detail': 'Transfer sent', 'movements': movements}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="receive")
    def receive(self, request, pk=None):
        tr = self.get_object()
        if tr.status != 'IN_TRANSIT':
            return Response({'detail': 'Only in-transit transfers can be received'}, status=status.HTTP_400_BAD_REQUEST)

        movements = []
        for line in tr.lines.all():
            mv = StockMovement.objects.create(
                movement_type='IN',
                movement_reason='TRANSFER',
                article=line.article,
                source_depot=tr.source_depot,
                destination_depot=tr.destination_depot,
                quantity=line.quantity,
                unit_price=getattr(line.article, 'weighted_average_price', 0),
                total_value=line.quantity * getattr(line.article, 'weighted_average_price', 0),
                operation_date=None,
                reference_document=tr.transfer_number,
                document_type='TRANSFER',
                status='CONFIRMED',
                created_by=request.user
            )
            movements.append(mv.id)

            stock, _ = Stock.objects.get_or_create(article=line.article, depot=tr.destination_depot, defaults={'physical_quantity':0,'theoretical_quantity':0})
            stock.physical_quantity += line.quantity
            stock.theoretical_quantity += line.quantity
            stock.update_value()

        tr.status = 'RECEIVED'
        tr.save()
        return Response({'detail': 'Transfer received', 'movements': movements}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        tr = self.get_object()
        if tr.status == 'PENDING':
            tr.delete()
            return Response({'detail': 'Transfer deleted'}, status=status.HTTP_200_OK)

        movements = StockMovement.objects.filter(reference_document=tr.transfer_number)
        errors = []
        for mv in movements:
            try:
                mv.cancel(request.user, reason=f"Cancel transfer {tr.transfer_number}")
            except Exception as e:
                errors.append(str(e))

        tr.status = 'CANCELLED'
        tr.save()

        if errors:
            return Response({'detail': 'Some movements failed to cancel', 'errors': errors}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'detail': 'Transfer cancelled'}, status=status.HTTP_200_OK)
