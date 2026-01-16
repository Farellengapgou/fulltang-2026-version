from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.decorators import method_decorator
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework import status, permissions
from rest_framework.response import Response
from django.utils.dateparse import parse_date
from django.utils import timezone
from django.db.models import Sum, F, DecimalField
from django.db.models.functions import Coalesce
from django.db import transaction
from django.core.exceptions import ValidationError
from decimal import Decimal
import csv
from django.http import HttpResponse

from accounting.stock_models import Inventory, InventoryLine, Stock, StockMovement
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
    """Applique les filtres sur les inventaires"""

    state = params.get("state")
    if state:
        qs = qs.filter(status__iexact=state)

    inventory_type = params.get("inventory_type")
    if inventory_type:
        qs = qs.filter(inventory_type__iexact=inventory_type)

    warehouse_id = params.get("warehouse_id")
    if warehouse_id:
        qs = qs.filter(depot_id=warehouse_id)

    depot_id = params.get("depot_id")
    if depot_id:
        qs = qs.filter(depot_id=depot_id)

    start_date = params.get("start_date")
    end_date = params.get("end_date")
    if start_date:
        sd = parse_date(start_date)
        if sd:
            qs = qs.filter(inventory_date__gte=sd)
    if end_date:
        ed = parse_date(end_date)
        if ed:
            qs = qs.filter(inventory_date__lte=ed)

    inventory_number = params.get("inventory_number")
    if inventory_number:
        qs = qs.filter(inventory_number__icontains=inventory_number)

    return qs


@method_decorator(
    name="list",
    decorator=swagger_auto_schema(
        operation_summary="Lister les inventaires",
        operation_description="Retourne une liste paginée des inventaires avec filtres optionnels.",
        manual_parameters=[
            auth_header_param,
            openapi.Parameter(
                "state",
                openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                enum=["DRAFT", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
            ),
            openapi.Parameter(
                "inventory_type",
                openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                enum=["FULL", "PARTIAL", "CYCLIC"],
            ),
            openapi.Parameter(
                "warehouse_id", openapi.IN_QUERY, type=openapi.TYPE_INTEGER
            ),
            openapi.Parameter(
                "start_date", openapi.IN_QUERY, type=openapi.TYPE_STRING, format="date"
            ),
            openapi.Parameter(
                "end_date", openapi.IN_QUERY, type=openapi.TYPE_STRING, format="date"
            ),
            openapi.Parameter(
                "inventory_number", openapi.IN_QUERY, type=openapi.TYPE_STRING
            ),
        ],
        tags=tags,
    ),
)
@method_decorator(
    name="retrieve",
    decorator=swagger_auto_schema(
        operation_summary="Récupérer un inventaire",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
@method_decorator(
    name="create",
    decorator=swagger_auto_schema(
        operation_summary="Créer un inventaire",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
@method_decorator(
    name="update",
    decorator=swagger_auto_schema(
        operation_summary="Mettre à jour un inventaire",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
@method_decorator(
    name="partial_update",
    decorator=swagger_auto_schema(
        operation_summary="Mise à jour partielle d'un inventaire",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
@method_decorator(
    name="destroy",
    decorator=swagger_auto_schema(
        operation_summary="Supprimer un inventaire",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
class InventoryViewSet(ModelViewSet):
    """
    ViewSet pour la gestion des inventaires physiques.

    Actions disponibles:
    - lines: Lister/Ajouter des lignes
    - initialize: Initialiser les lignes avec le stock théorique
    - start-counting: Démarrer le comptage
    - validate: Valider l'inventaire et créer les ajustements
    - variances: Calculer les écarts
    - summary: Résumé de l'inventaire
    - export: Exporter en CSV
    """

    queryset = (
        Inventory.objects.select_related("depot", "created_by", "validated_by")
        .prefetch_related("lines__article")
        .order_by("-inventory_date", "-created_at")
    )
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        return apply_inventory_filters(qs, self.request.query_params)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        instance = serializer.instance
        if instance.status not in ["DRAFT", "IN_PROGRESS"]:
            raise ValidationError(
                "Seuls les inventaires en brouillon ou en cours peuvent être modifiés"
            )
        serializer.save()

    def perform_destroy(self, instance):
        if instance.status not in ["DRAFT"]:
            raise ValidationError(
                "Seuls les inventaires en brouillon peuvent être supprimés"
            )
        instance.delete()

    @swagger_auto_schema(
        operation_summary="Lister les lignes d'un inventaire",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @action(detail=True, methods=["get"], url_path="lines")
    def lines(self, request, pk=None):
        inventory = self.get_object()
        lines = (
            InventoryLine.objects.filter(inventory_id=inventory.pk)
            .select_related("article", "batch")
            .order_by("id")
        )
        serializer = InventoryLineSerializer(lines, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_summary="Ajouter une ligne à l'inventaire",
        request_body=InventoryLineSerializer,
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @lines.mapping.post
    @transaction.atomic
    def add_line(self, request, pk=None):
        inventory = self.get_object()

        if inventory.status not in ["DRAFT", "IN_PROGRESS"]:
            return Response(
                {"detail": "Impossible d'ajouter des lignes à un inventaire terminé"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = request.data.copy()
        data["inventory"] = pk

        serializer = InventoryLineSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @swagger_auto_schema(
        operation_summary="Initialiser les lignes d'inventaire",
        operation_description="Crée les lignes avec le stock théorique actuel du dépôt.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @action(detail=True, methods=["post"], url_path="initialize")
    @transaction.atomic
    def initialize(self, request, pk=None):
        inventory = self.get_object()

        if inventory.status != "DRAFT":
            return Response(
                {"detail": "L'inventaire doit être en brouillon pour être initialisé"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if inventory.lines.exists():
            return Response(
                {
                    "detail": "L'inventaire contient déjà des lignes. Supprimez-les d'abord."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Récupérer les stocks du dépôt
        stocks = Stock.objects.filter(depot=inventory.depot).select_related("article")

        lines_created = 0
        for stock in stocks:
            InventoryLine.objects.create(
                inventory=inventory,
                article=stock.article,
                theoretical_quantity=stock.quantity,
                counted_quantity=None,  # À remplir lors du comptage
                unit_price=stock.average_unit_price or Decimal("0"),
            )
            lines_created += 1

        return Response(
            {"detail": f"{lines_created} lignes créées", "lines_count": lines_created},
            status=status.HTTP_201_CREATED,
        )

    @swagger_auto_schema(
        operation_summary="Démarrer le comptage",
        operation_description="Passe l'inventaire en statut 'En cours'.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @action(detail=True, methods=["post"], url_path="start-counting")
    @transaction.atomic
    def start_counting(self, request, pk=None):
        inventory = self.get_object()

        if inventory.status != "DRAFT":
            return Response(
                {
                    "detail": "L'inventaire doit être en brouillon pour démarrer le comptage"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not inventory.lines.exists():
            return Response(
                {"detail": "L'inventaire doit contenir au moins une ligne"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        inventory.status = "IN_PROGRESS"
        inventory.save(update_fields=["status"])

        return Response(
            {"detail": "Comptage démarré", "status": inventory.status},
            status=status.HTTP_200_OK,
        )

    @swagger_auto_schema(
        operation_summary="Valider l'inventaire",
        operation_description="Valide l'inventaire et crée les mouvements d'ajustement pour les écarts.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @action(detail=True, methods=["post"], url_path="validate")
    @transaction.atomic
    def validate_inventory(self, request, pk=None):
        inventory = self.get_object()

        if inventory.status != "IN_PROGRESS":
            return Response(
                {"detail": "L'inventaire doit être en cours pour être validé"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Vérifier que toutes les lignes ont été comptées
        uncounted = inventory.lines.filter(counted_quantity__isnull=True).count()
        if uncounted > 0:
            return Response(
                {"detail": f"{uncounted} lignes n'ont pas été comptées"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Créer les mouvements d'ajustement
        adjustments_created = 0
        errors = []

        for line in inventory.lines.select_related("article").all():
            variance = line.counted_quantity - line.theoretical_quantity

            if variance != 0:
                try:
                    movement_type = "IN" if variance > 0 else "OUT"

                    StockMovement.objects.create(
                        movement_type=movement_type,
                        movement_reason="ADJUSTMENT",
                        article=line.article,
                        quantity=abs(variance),
                        unit_price=line.unit_price,
                        total_value=abs(variance) * line.unit_price,
                        source_depot=None if movement_type == "IN" else inventory.depot,
                        destination_depot=(
                            inventory.depot if movement_type == "IN" else None
                        ),
                        reference_document=inventory.inventory_number,
                        # CORRIGÉ: Utiliser inventory_date au lieu de count_date
                        operation_date=inventory.inventory_date or timezone.now(),
                        notes=f"Ajustement inventaire {inventory.inventory_number}",
                        created_by=request.user,
                    )
                    adjustments_created += 1
                except Exception as e:
                    errors.append(f"Article {line.article.code}: {str(e)}")

        # Mettre à jour le statut
        inventory.status = "COMPLETED"
        inventory.validated_by = request.user
        inventory.validated_at = timezone.now()
        inventory.save()

        response_data = {
            "detail": "Inventaire validé avec succès",
            "adjustments_created": adjustments_created,
            "status": inventory.status,
        }

        if errors:
            response_data["errors"] = errors
            return Response(response_data, status=status.HTTP_207_MULTI_STATUS)

        return Response(response_data, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="Calculer les écarts",
        operation_description="Retourne les écarts entre stock théorique et comptage pour chaque ligne.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @action(detail=True, methods=["get"], url_path="variances")
    def variances(self, request, pk=None):
        inventory = self.get_object()

        variances = []
        total_positive = Decimal("0")
        total_negative = Decimal("0")

        for line in inventory.lines.select_related("article").all():
            theoretical = line.theoretical_quantity or Decimal("0")
            counted = line.counted_quantity

            if counted is not None:
                variance_qty = counted - theoretical
                variance_value = variance_qty * (line.unit_price or Decimal("0"))

                if variance_qty > 0:
                    total_positive += variance_value
                else:
                    total_negative += abs(variance_value)

                variances.append(
                    {
                        "line_id": line.id,
                        "article_id": line.article_id,
                        "article_code": line.article.code,
                        "article_name": line.article.name,
                        "theoretical_quantity": float(theoretical),
                        "counted_quantity": float(counted),
                        "variance_quantity": float(variance_qty),
                        "unit_price": float(line.unit_price or 0),
                        "variance_value": float(variance_value),
                        "status": (
                            "surplus"
                            if variance_qty > 0
                            else ("deficit" if variance_qty < 0 else "ok")
                        ),
                    }
                )
            else:
                variances.append(
                    {
                        "line_id": line.id,
                        "article_id": line.article_id,
                        "article_code": line.article.code,
                        "article_name": line.article.name,
                        "theoretical_quantity": float(theoretical),
                        "counted_quantity": None,
                        "variance_quantity": None,
                        "unit_price": float(line.unit_price or 0),
                        "variance_value": None,
                        "status": "not_counted",
                    }
                )

        return Response(
            {
                "inventory_number": inventory.inventory_number,
                "depot_code": inventory.depot.code if inventory.depot else None,
                "total_positive_variance": float(total_positive),
                "total_negative_variance": float(total_negative),
                "net_variance": float(total_positive - total_negative),
                "variances": variances,
            }
        )

    @swagger_auto_schema(
        operation_summary="Résumé de l'inventaire",
        operation_description="Retourne un résumé statistique de l'inventaire.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @action(detail=True, methods=["get"], url_path="summary")
    def summary(self, request, pk=None):
        inventory = self.get_object()

        lines = inventory.lines.all()
        total_lines = lines.count()
        counted_lines = lines.exclude(counted_quantity__isnull=True).count()

        # Calculer les totaux
        totals = lines.aggregate(
            total_theoretical=Coalesce(Sum("theoretical_quantity"), Decimal("0")),
            total_counted=Coalesce(Sum("counted_quantity"), Decimal("0")),
        )

        return Response(
            {
                "inventory_number": inventory.inventory_number,
                "status": inventory.status,
                "depot_code": inventory.depot.code if inventory.depot else None,
                "inventory_date": (
                    inventory.inventory_date.isoformat()
                    if inventory.inventory_date
                    else None
                ),
                "total_lines": total_lines,
                "counted_lines": counted_lines,
                "remaining_lines": total_lines - counted_lines,
                "progress_percent": round(
                    (counted_lines / total_lines * 100) if total_lines > 0 else 0, 2
                ),
                "total_theoretical_quantity": float(totals["total_theoretical"]),
                "total_counted_quantity": float(totals["total_counted"]),
            }
        )

    @swagger_auto_schema(
        operation_summary="Exporter en CSV",
        operation_description="Exporte les lignes de l'inventaire au format CSV.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @action(detail=True, methods=["get"], url_path="export")
    def export(self, request, pk=None):
        inventory = self.get_object()

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = (
            f'attachment; filename="inventaire_{inventory.inventory_number}.csv"'
        )

        writer = csv.writer(response, delimiter=";")
        writer.writerow(
            [
                "Code Article",
                "Désignation",
                "Qté Théorique",
                "Qté Comptée",
                "Écart",
                "Prix Unitaire",
                "Valeur Écart",
            ]
        )

        for line in inventory.lines.select_related("article").all():
            theoretical = line.theoretical_quantity or Decimal("0")
            counted = line.counted_quantity
            variance = (counted - theoretical) if counted is not None else None
            variance_value = (
                (variance * line.unit_price)
                if variance is not None and line.unit_price
                else None
            )

            writer.writerow(
                [
                    line.article.code,
                    line.article.name,
                    float(theoretical),
                    float(counted) if counted is not None else "",
                    float(variance) if variance is not None else "",
                    float(line.unit_price) if line.unit_price else "",
                    float(variance_value) if variance_value is not None else "",
                ]
            )

        return response
