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

from accounting.stock_models import GoodsReceiptNote, GoodsReceiptLine, StockMovement
from accounting.stock_serializers import GoodsReceiptNoteSerializer, GoodsReceiptLineSerializer

auth_header_param = openapi.Parameter(
    name="Authorization",
    in_=openapi.IN_HEADER,
    description="Token JWT (Bearer <token>)",
    type=openapi.TYPE_STRING,
    required=True,
)

tags = ["material-accounting"]


def apply_receipt_filters(qs, params):
    state = params.get('state')
    if state:
        qs = qs.filter(status__iexact=state)

    receipt_type = params.get('receipt_type')
    if receipt_type:
        qs = qs.filter(receipt_type__iexact=receipt_type)

    warehouse_id = params.get('warehouse_id')
    if warehouse_id:
        qs = qs.filter(depot_id=warehouse_id)

    supplier_id = params.get('supplier_id')
    if supplier_id:
        qs = qs.filter(supplier_id=supplier_id)

    start_date = params.get('start_date')
    end_date = params.get('end_date')
    if start_date:
        sd = parse_date(start_date)
        if sd:
            qs = qs.filter(receipt_date__gte=sd)
    if end_date:
        ed = parse_date(end_date)
        if ed:
            qs = qs.filter(receipt_date__lte=ed)

    is_posted = params.get('is_posted_to_finance')
    if is_posted is not None:
        val = is_posted.lower()
        if val in ['true', '1', 'yes']:
            qs = qs.filter(journal_entry__isnull=False)
        elif val in ['false', '0', 'no']:
            qs = qs.filter(journal_entry__isnull=True)

    return qs


@method_decorator(
    name="list",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
class GoodsReceiptNoteViewSet(ModelViewSet):
    queryset = GoodsReceiptNote.objects.all().order_by('-receipt_date', '-created_at')
    serializer_class = GoodsReceiptNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        return apply_receipt_filters(qs, self.request.query_params)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["get"], url_path="lines")
    def lines(self, request, pk=None):
        receipt = self.get_object()
        lines = GoodsReceiptLine.objects.filter(receipt_id=receipt.pk).order_by('sequence')
        serializer = GoodsReceiptLineSerializer(lines, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="lines")
    def create_line(self, request, pk=None):
        data = request.data.copy()
        data['receipt_id'] = pk
        serializer = GoodsReceiptLineSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get", "put", "delete"], url_path=r"lines/(?P<line_id>[^/.]+)")
    def line_detail(self, request, pk=None, line_id=None):
        try:
            line = GoodsReceiptLine.objects.get(receipt_id=pk, pk=line_id)
        except GoodsReceiptLine.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            serializer = GoodsReceiptLineSerializer(line)
            return Response(serializer.data)
        if request.method == 'PUT':
            serializer = GoodsReceiptLineSerializer(line, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        if request.method == 'DELETE':
            line.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"], url_path="validate")
    def validate(self, request, pk=None):
        receipt = self.get_object()
        try:
            receipt.confirm(request.user)
        except ValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({'detail': 'Receipt confirmed'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        receipt = self.get_object()
        if receipt.status != 'CONFIRMED':
            return Response({'detail': 'Only confirmed receipts can be cancelled'}, status=status.HTTP_400_BAD_REQUEST)

        movements = StockMovement.objects.filter(reference_document=receipt.receipt_number)
        errors = []
        for mv in movements:
            try:
                mv.cancel(request.user, reason=f"Cancel receipt {receipt.receipt_number}")
            except Exception as e:
                errors.append(str(e))

        if receipt.journal_entry:
            receipt.journal_entry.state = 'CANCELLED'
            receipt.journal_entry.save()

        receipt.status = 'CANCELLED'
        receipt.notes = (receipt.notes or '') + f"\n[Annulé le by {request.user}]"
        receipt.save()

        if errors:
            return Response({'detail': 'Some movements failed to cancel', 'errors': errors}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'detail': 'Receipt cancelled'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="update-totals")
    def update_totals(self, request, pk=None):
        receipt = self.get_object()
        receipt.update_totals()
        return Response({'detail': 'Totals updated'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], url_path="preview-accounting")
    def preview_accounting(self, request, pk=None):
        receipt = self.get_object()
        preview_lines = []
        total = 0
        for line in receipt.lines.all():
            preview_lines.append({
                'debit_account': str(line.article.stock_account) if line.article.stock_account else None,
                'credit_account': str(receipt.supplier.account) if receipt.supplier and getattr(receipt.supplier, 'account', None) else None,
                'label': f"Stock {line.article.name}",
                'amount': float(line.line_amount),
            })
            total += float(line.line_amount)

        return Response({
            'reference': receipt.receipt_number,
            'date': receipt.receipt_date.isoformat() if getattr(receipt, 'receipt_date', None) else None,
            'lines': preview_lines,
            'total_amount': float(total)
        })
