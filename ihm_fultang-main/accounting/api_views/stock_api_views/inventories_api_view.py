from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.decorators import method_decorator
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework import status, permissions
from rest_framework.response import Response
from django.utils.dateparse import parse_date
from django.db.models import Q
from django.core.exceptions import ValidationError

from accounting.stock_models import Inventory, InventoryLine, Stock, StockMovement, Batch
from accounting.stock_serializers import InventorySerializer, InventoryLineSerializer

auth_header_param = openapi.Parameter(
    name="Authorization",
    in_=openapi.IN_HEADER,
    description="Token JWT (Bearer <token>)",
    type=openapi.TYPE_STRING,
    required=True,
)

tags = ["material-accounting"]


def apply_inventory_filters(qs, params):
    state = params.get('state')
    if state:
        qs = qs.filter(status__iexact=state)

    warehouse_id = params.get('warehouse_id')
    if warehouse_id:
        qs = qs.filter(depot_id=warehouse_id)

    category_id = params.get('category_id')
    if category_id:
        qs = qs.filter(lines__article__category_id=category_id).distinct()

    start_date = params.get('start_date')
    end_date = params.get('end_date')
    if start_date:
        sd = parse_date(start_date)
        if sd:
            qs = qs.filter(created_at__date__gte=sd)
    if end_date:
        ed = parse_date(end_date)
        if ed:
            qs = qs.filter(created_at__date__lte=ed)

    return qs


@method_decorator(
    name="list",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
class InventoryViewSet(ModelViewSet):
    queryset = Inventory.objects.all().order_by('-created_at')
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        return apply_inventory_filters(qs, self.request.query_params)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["get"], url_path="lines")
    def lines(self, request, pk=None):
        inv = self.get_object()
        lines = InventoryLine.objects.filter(inventory_id=inv.pk).order_by('article_id')
        serializer = InventoryLineSerializer(lines, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="lines")
    def create_line(self, request, pk=None):
        data = request.data.copy()
        data['inventory_id'] = pk
        serializer = InventoryLineSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get", "put"], url_path=r"lines/(?P<line_id>[^/.]+)")
    def line_detail(self, request, pk=None, line_id=None):
        try:
            line = InventoryLine.objects.get(inventory_id=pk, pk=line_id)
        except InventoryLine.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            serializer = InventoryLineSerializer(line)
            return Response(serializer.data)
        if request.method == 'PUT':
            serializer = InventoryLineSerializer(line, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="initialize")
    def initialize(self, request, pk=None):
        try:
            inv = Inventory.objects.get(pk=pk)
        except Inventory.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        depot = inv.depot
        stocks = Stock.objects.filter(depot=depot)
        created = 0
        for s in stocks:
            line, created_flag = InventoryLine.objects.get_or_create(
                inventory=inv,
                article=s.article,
                defaults={
                    'counted_quantity': None,
                    'theoretical_quantity': s.physical_quantity,
                }
            )
            if created_flag:
                created += 1

        return Response({'detail': f'Initialized {created} lines'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="start-counting")
    def start_counting(self, request, pk=None):
        try:
            inv = Inventory.objects.get(pk=pk)
        except Inventory.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        inv.status = 'IN_PROGRESS'
        inv.save()
        return Response({'detail': 'Inventory started (COUNTING)'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="validate")
    def validate(self, request, pk=None):
        try:
            inv = Inventory.objects.get(pk=pk)
        except Inventory.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        if inv.status not in ['IN_PROGRESS', 'COUNTING']:
            return Response({'detail': 'Inventory not in counting state'}, status=status.HTTP_400_BAD_REQUEST)

        adjustments = []
        for line in inv.lines.all():
            theoretical = line.theoretical_quantity or 0
            counted = line.counted_quantity or 0
            diff = counted - theoretical
            if diff == 0:
                continue

            mv_type = 'IN' if diff > 0 else 'OUT'
            mv = StockMovement.objects.create(
                movement_type=mv_type,
                movement_reason='INVENTORY',
                article=line.article,
                source_depot=inv.depot if mv_type == 'OUT' else None,
                destination_depot=inv.depot if mv_type == 'IN' else None,
                quantity=abs(diff),
                unit_price=line.article.weighted_average_price,
                total_value=abs(diff) * line.article.weighted_average_price,
                operation_date=getattr(inv, 'count_date', None),
                reference_document=getattr(inv, 'inventory_number', f'INV{inv.pk}'),
                document_type='INVENTORY_ADJUSTMENT',
                status='CONFIRMED',
                created_by=request.user
            )
            adjustments.append(mv.id)

            stock, _ = Stock.objects.get_or_create(article=line.article, depot=inv.depot, defaults={'physical_quantity': 0, 'theoretical_quantity':0})
            if mv_type == 'IN':
                stock.physical_quantity += abs(diff)
                stock.theoretical_quantity += abs(diff)
            else:
                stock.physical_quantity -= abs(diff)
                stock.theoretical_quantity -= abs(diff)
            stock.update_value()

        inv.status = 'VALIDATED'
        inv.save()

        return Response({'detail': 'Inventory validated', 'adjustments': adjustments}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        try:
            inv = Inventory.objects.get(pk=pk)
        except Inventory.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        if inv.status == 'DRAFT':
            inv.delete()
            return Response({'detail': 'Inventory deleted'}, status=status.HTTP_200_OK)

        inv.status = 'CANCELLED'
        inv.save()
        return Response({'detail': 'Inventory cancelled'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], url_path="variances")
    def variances(self, request, pk=None):
        try:
            inv = Inventory.objects.get(pk=pk)
        except Inventory.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        rows = []
        for line in inv.lines.all():
            theoretical = float(line.theoretical_quantity or 0)
            counted = float(line.counted_quantity or 0)
            diff = counted - theoretical
            rows.append({
                'line_id': line.id,
                'article_id': line.article_id,
                'theoretical': theoretical,
                'counted': counted,
                'variance': diff,
                'variance_value': diff * float(getattr(line.article, 'weighted_average_price', 0)),
            })

        return Response({'variances': rows})

    @action(detail=True, methods=["get"], url_path="summary")
    def summary(self, request, pk=None):
        try:
            inv = Inventory.objects.get(pk=pk)
        except Inventory.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        total_articles = inv.lines.count()
        total_variance_value = 0
        for line in inv.lines.all():
            diff = float(line.counted_quantity or 0) - float(line.theoretical_quantity or 0)
            total_variance_value += diff * float(getattr(line.article, 'weighted_average_price', 0))

        return Response({'total_articles': total_articles, 'total_variance_value': total_variance_value})

    @action(detail=True, methods=["get"], url_path="export")
    def export(self, request, pk=None):
        try:
            inv = Inventory.objects.get(pk=pk)
        except Inventory.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        import csv
        from io import StringIO

        si = StringIO()
        writer = csv.writer(si)
        writer.writerow(['article_code', 'article_name', 'theoretical', 'counted', 'variance'])
        for line in inv.lines.all():
            writer.writerow([
                getattr(line.article, 'code', ''),
                getattr(line.article, 'name', ''),
                float(line.theoretical_quantity or 0),
                float(line.counted_quantity or 0),
                float((line.counted_quantity or 0) - (line.theoretical_quantity or 0))
            ])

        response = Response(si.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="inventory_{pk}.csv"'
        return response
