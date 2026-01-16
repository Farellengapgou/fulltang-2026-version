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

from accounting.stock_models import (
    GoodsIssueNote, GoodsIssueLine, StockMovement, Batch, Stock
)
from accounting.stock_serializers import GoodsIssueNoteSerializer, GoodsIssueLineSerializer

auth_header_param = openapi.Parameter(
    name="Authorization",
    in_=openapi.IN_HEADER,
    description="Token JWT (Bearer <token>)",
    type=openapi.TYPE_STRING,
    required=True,
)

tags = ["material-accounting"]


def apply_issue_filters(qs, params):
    state = params.get('state')
    if state:
        qs = qs.filter(status__iexact=state)

    issue_type = params.get('issue_type')
    if issue_type:
        qs = qs.filter(issue_type__iexact=issue_type)

    warehouse_id = params.get('warehouse_id')
    if warehouse_id:
        qs = qs.filter(depot_id=warehouse_id)

    beneficiary_type = params.get('beneficiary_type')
    if beneficiary_type:
        qs = qs.filter(issue_type__iexact=beneficiary_type)

    start_date = params.get('start_date')
    end_date = params.get('end_date')
    if start_date:
        sd = parse_date(start_date)
        if sd:
            qs = qs.filter(issue_date__gte=sd)
    if end_date:
        ed = parse_date(end_date)
        if ed:
            qs = qs.filter(issue_date__lte=ed)

    return qs


@method_decorator(
    name="list",
    decorator=swagger_auto_schema(manual_parameters=[auth_header_param], tags=tags),
)
class GoodsIssueNoteViewSet(ModelViewSet):
    queryset = GoodsIssueNote.objects.all().order_by('-issue_date', '-created_at')
    serializer_class = GoodsIssueNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        return apply_issue_filters(qs, self.request.query_params)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["get"], url_path="lines")
    def lines(self, request, pk=None):
        issue = self.get_object()
        lines = GoodsIssueLine.objects.filter(issue_id=issue.pk).order_by('sequence')
        serializer = GoodsIssueLineSerializer(lines, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="lines")
    def create_line(self, request, pk=None):
        data = request.data.copy()
        data['issue_id'] = pk
        serializer = GoodsIssueLineSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get", "put", "delete"], url_path=r"lines/(?P<line_id>[^/.]+)")
    def line_detail(self, request, pk=None, line_id=None):
        try:
            line = GoodsIssueLine.objects.get(issue_id=pk, pk=line_id)
        except GoodsIssueLine.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            serializer = GoodsIssueLineSerializer(line)
            return Response(serializer.data)
        if request.method == 'PUT':
            serializer = GoodsIssueLineSerializer(line, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        if request.method == 'DELETE':
            line.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"], url_path="validate")
    def validate(self, request, pk=None):
        issue = self.get_object()
        try:
            issue.confirm(request.user)
        except ValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({'detail': 'Issue confirmed'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        issue = self.get_object()
        if issue.status != 'CONFIRMED':
            return Response({'detail': 'Only confirmed issues can be cancelled'}, status=status.HTTP_400_BAD_REQUEST)

        movements = StockMovement.objects.filter(reference_document=issue.issue_number)
        errors = []
        for mv in movements:
            try:
                mv.cancel(request.user, reason=f"Cancel issue {issue.issue_number}")
            except Exception as e:
                errors.append(str(e))

        if issue.journal_entry:
            issue.journal_entry.state = 'CANCELLED'
            issue.journal_entry.save()

        issue.status = 'CANCELLED'
        issue.notes = (issue.notes or '') + f"\n[Annulé le by {request.user}]"
        issue.save()

        if errors:
            return Response({'detail': 'Some movements failed to cancel', 'errors': errors}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'detail': 'Issue cancelled'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="check-availability")
    def check_availability(self, request, pk=None):
        issue = self.get_object()
        result = []
        for line in issue.lines.all():
            try:
                stock = Stock.objects.get(article=line.article, depot=issue.depot)
                available = float(getattr(stock, 'available_quantity', 0))
            except Stock.DoesNotExist:
                available = 0.0

            ok = available >= float(line.quantity)
            result.append({
                'line_id': line.id,
                'article_id': line.article_id,
                'required': float(line.quantity),
                'available': available,
                'ok': ok,
            })

        return Response({'availability': result})

    @action(detail=True, methods=["get"], url_path="suggested-batches")
    def suggested_batches(self, request, pk=None):
        issue = self.get_object()
        suggestions = []
        for line in issue.lines.all():
            needed = float(line.quantity)
            batches = Batch.objects.filter(
                article=line.article,
                remaining_quantity__gt=0,
                is_blocked=False
            ).order_by('expiry_date', 'reception_date')

            chosen = []
            for b in batches:
                if needed <= 0:
                    break
                take = min(needed, float(b.remaining_quantity))
                if take > 0:
                    chosen.append({
                        'batch_id': b.id,
                        'batch_number': b.batch_number,
                        'available': float(b.remaining_quantity),
                        'take': take,
                        'expiry_date': b.expiry_date.isoformat() if b.expiry_date else None,
                    })
                    needed -= take

            suggestions.append({
                'line_id': line.id,
                'article_id': line.article_id,
                'required': float(line.quantity),
                'chosen_batches': chosen,
                'satisfied': needed <= 0,
            })

        return Response({'suggestions': suggestions})
