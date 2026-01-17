from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.decorators import method_decorator
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework import status, permissions
from rest_framework.response import Response
from django.utils.dateparse import parse_date
from django.utils import timezone
from django.db.models import Q, Sum
from django.db.models.functions import TruncDate, TruncMonth, TruncYear
from django.db import transaction

from accounting.stock_models import StockMovement
from accounting.stock_serializers import StockMovementSerializer

auth_header_param = openapi.Parameter(
    name="Authorization",
    in_=openapi.IN_HEADER,
    description="Token JWT (Bearer <token>)",
    type=openapi.TYPE_STRING,
    required=True,
)

tags = ["movements"]


def apply_movement_filters(qs, params):
    """Applique les filtres sur les mouvements de stock"""

    movement_type = params.get("movement_type")
    if movement_type:
        qs = qs.filter(movement_type__iexact=movement_type)

    movement_reason = params.get("movement_reason")
    if movement_reason:
        qs = qs.filter(movement_reason__iexact=movement_reason)

    state = params.get("state")
    if state:
        if state.upper() == "VALIDATED":
            qs = qs.filter(validated_by__isnull=False)
        else:
            qs = qs.filter(status__iexact=state)

    # CORRIGÉ: warehouse_id filtre sur source_depot OU destination_depot
    warehouse_id = params.get("warehouse_id")
    if warehouse_id:
        qs = qs.filter(
            Q(source_depot_id=warehouse_id) | Q(destination_depot_id=warehouse_id)
        )

    article_type = params.get("article_type")
    if article_type:
        qs = qs.filter(article__article_type__iexact=article_type)

    article_id = params.get("article_id")
    if article_id:
        qs = qs.filter(article_id=article_id)

    start_date = params.get("start_date")
    end_date = params.get("end_date")
    if start_date:
        sd = parse_date(start_date)
        if sd:
            qs = qs.filter(operation_date__date__gte=sd)
    if end_date:
        ed = parse_date(end_date)
        if ed:
            qs = qs.filter(operation_date__date__lte=ed)

    supplier_id = params.get("supplier_id")
    if supplier_id:
        qs = qs.filter(batch__supplier_id=supplier_id)

    is_posted = params.get("is_posted_to_finance")
    if is_posted is not None:
        val = is_posted.lower()
        if val in ["true", "1", "yes"]:
            qs = qs.filter(journal_entry__isnull=False)
        elif val in ["false", "0", "no"]:
            qs = qs.filter(journal_entry__isnull=True)

    return qs


@method_decorator(
    name="list",
    decorator=swagger_auto_schema(
        operation_summary="Lister les mouvements de stock",
        operation_description="Retourne une liste paginée des mouvements de stock avec filtres optionnels.",
        manual_parameters=[
            auth_header_param,
            openapi.Parameter(
                "movement_type",
                openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                enum=["IN", "OUT", "TRANSFER", "ADJUSTMENT", "RETURN"],
            ),
            openapi.Parameter(
                "movement_reason", openapi.IN_QUERY, type=openapi.TYPE_STRING
            ),
            openapi.Parameter(
                "state",
                openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                enum=["DRAFT", "CONFIRMED", "POSTED", "CANCELLED", "VALIDATED"],
            ),
            openapi.Parameter(
                "warehouse_id",
                openapi.IN_QUERY,
                type=openapi.TYPE_INTEGER,
                description="Filtre sur source_depot OU destination_depot",
            ),
            openapi.Parameter(
                "article_id", openapi.IN_QUERY, type=openapi.TYPE_INTEGER
            ),
            openapi.Parameter(
                "start_date", openapi.IN_QUERY, type=openapi.TYPE_STRING, format="date"
            ),
            openapi.Parameter(
                "end_date", openapi.IN_QUERY, type=openapi.TYPE_STRING, format="date"
            ),
        ],
        tags=tags,
    ),
)
@method_decorator(
    name="retrieve",
    decorator=swagger_auto_schema(
        operation_summary="Récupérer un mouvement de stock",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
@method_decorator(
    name="create",
    decorator=swagger_auto_schema(
        operation_summary="Créer un mouvement de stock",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
@method_decorator(
    name="update",
    decorator=swagger_auto_schema(
        operation_summary="Mettre à jour un mouvement de stock",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
@method_decorator(
    name="partial_update",
    decorator=swagger_auto_schema(
        operation_summary="Mise à jour partielle d'un mouvement",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
@method_decorator(
    name="destroy",
    decorator=swagger_auto_schema(
        operation_summary="Supprimer un mouvement de stock",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
class StockMovementViewSet(ModelViewSet):
    """
    ViewSet pour la gestion des mouvements de stock.

    Filtres disponibles: movement_type, movement_reason, state, warehouse_id,
    article_id, start_date, end_date, supplier_id, is_posted_to_finance
    """

    queryset = StockMovement.objects.select_related(
        "article", "batch", "source_depot", "destination_depot", "created_by"
    ).order_by("-operation_date", "-created_at")
    serializer_class = StockMovementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        return apply_movement_filters(qs, self.request.query_params)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @swagger_auto_schema(
        operation_summary="Résumé des mouvements",
        operation_description="Retourne les totaux des mouvements (entrées/sorties) selon les filtres appliqués.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @action(detail=False, methods=["get"], url_path="summary")
    def summary(self, request):
        qs = apply_movement_filters(StockMovement.objects.all(), request.query_params)
        totals = {
            "count": qs.count(),
            "total_in_quantity": float(
                qs.filter(movement_type="IN").aggregate(q=Sum("quantity"))["q"] or 0
            ),
            "total_in_value": float(
                qs.filter(movement_type="IN").aggregate(v=Sum("total_value"))["v"] or 0
            ),
            "total_out_quantity": float(
                qs.filter(movement_type="OUT").aggregate(q=Sum("quantity"))["q"] or 0
            ),
            "total_out_value": float(
                qs.filter(movement_type="OUT").aggregate(v=Sum("total_value"))["v"] or 0
            ),
        }
        return Response(totals)

    @swagger_auto_schema(
        operation_summary="Mouvements par période",
        operation_description="Agrège les mouvements par jour, mois ou année.",
        manual_parameters=[
            auth_header_param,
            openapi.Parameter(
                "period",
                openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                enum=["day", "month", "year"],
                default="day",
            ),
        ],
        tags=tags,
    )
    @action(detail=False, methods=["get"], url_path="by-period")
    def by_period(self, request):
        params = request.query_params
        period = (params.get("period") or "day").lower()
        qs = apply_movement_filters(StockMovement.objects.all(), params)

        if period == "month":
            trunc = TruncMonth("operation_date")
        elif period == "year":
            trunc = TruncYear("operation_date")
        else:
            trunc = TruncDate("operation_date")

        aggregated = (
            qs.annotate(period=trunc)
            .values("period")
            .annotate(
                total_in_quantity=Sum("quantity", filter=Q(movement_type="IN")),
                total_in_value=Sum("total_value", filter=Q(movement_type="IN")),
                total_out_quantity=Sum("quantity", filter=Q(movement_type="OUT")),
                total_out_value=Sum("total_value", filter=Q(movement_type="OUT")),
            )
            .order_by("period")
        )

        result = []
        for row in aggregated:
            p = row.get("period")
            result.append(
                {
                    "period": p.isoformat() if p is not None else None,
                    "total_in_quantity": float(row.get("total_in_quantity") or 0),
                    "total_in_value": float(row.get("total_in_value") or 0),
                    "total_out_quantity": float(row.get("total_out_quantity") or 0),
                    "total_out_value": float(row.get("total_out_value") or 0),
                }
            )

        return Response(result)

    @swagger_auto_schema(
        operation_summary="Annuler un mouvement",
        operation_description="Annule un mouvement de stock et inverse les quantités si déjà confirmé.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "reason": openapi.Schema(
                    type=openapi.TYPE_STRING, description="Raison de l'annulation"
                )
            },
        ),
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @action(detail=True, methods=["post"], url_path="cancel")
    @transaction.atomic
    def cancel(self, request, pk=None):
        try:
            mv = StockMovement.objects.select_for_update().get(pk=pk)
        except StockMovement.DoesNotExist:
            return Response(
                {"detail": "Mouvement non trouvé"}, status=status.HTTP_404_NOT_FOUND
            )

        reason = request.data.get("reason", "")
        try:
            mv.cancel(request.user, reason=reason)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(
            {"detail": "Mouvement annulé avec succès"}, status=status.HTTP_200_OK
        )

    @swagger_auto_schema(
        operation_summary="Mouvements par article",
        operation_description="Retourne les mouvements filtrés par article.",
        manual_parameters=[
            auth_header_param,
            openapi.Parameter(
                "article_id", openapi.IN_QUERY, type=openapi.TYPE_INTEGER, required=True
            ),
        ],
        tags=tags,
    )
    @action(detail=False, methods=["get"], url_path="by-article")
    def by_article(self, request):
        article_id = request.query_params.get("article_id")
        if not article_id:
            return Response(
                {"detail": "article_id est requis"}, status=status.HTTP_400_BAD_REQUEST
            )

        qs = self.filter_queryset(self.get_queryset()).filter(article_id=article_id)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_summary="Mouvements par dépôt",
        operation_description="Retourne les mouvements liés à un dépôt (source ou destination).",
        manual_parameters=[
            auth_header_param,
            openapi.Parameter(
                "warehouse_id",
                openapi.IN_QUERY,
                type=openapi.TYPE_INTEGER,
                required=True,
            ),
        ],
        tags=tags,
    )
    @action(detail=False, methods=["get"], url_path="by-warehouse")
    def by_warehouse(self, request):
        warehouse_id = request.query_params.get("warehouse_id")
        if not warehouse_id:
            return Response(
                {"detail": "warehouse_id est requis"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # CORRIGÉ: Filtre sur source_depot OU destination_depot
        qs = self.filter_queryset(self.get_queryset()).filter(
            Q(source_depot_id=warehouse_id) | Q(destination_depot_id=warehouse_id)
        )
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
