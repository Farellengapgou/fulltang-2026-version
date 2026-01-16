from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.decorators import method_decorator

from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

from accounting.permissions.accounting_staff_permissions import AccountingStaffPermission

from accounting.stock_models import Depot, Stock
from accounting.stock_serializers import DepotSerializer, StockSerializer

tags = ["Material Accounting - Warehouses"]

auth_header_param = openapi.Parameter(
    name="Authorization",
    in_=openapi.IN_HEADER,
    description="Token JWT (Bearer <token>)",
    type=openapi.TYPE_STRING,
    required=True
)

@method_decorator(
    name="list",
    decorator=swagger_auto_schema(
        operation_summary="Lister les dépôts",
        operation_description=(
            "Retourne la liste des dépôts/magasins.\n\n"
            "Filtres disponibles :\n"
            "- `is_active=true|false`\n"
            "- `depot_type=PHARMACY`\n"
            "- `search=pharmacie`"
        ),
        manual_parameters=[auth_header_param],
        tags=tags
    )
)
@method_decorator(
    name="retrieve",
    decorator=swagger_auto_schema(
        operation_summary="Détails d’un dépôt",
        operation_description="Retourne les informations détaillées d’un dépôt.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
)
@method_decorator(
    name="create",
    decorator=swagger_auto_schema(
        operation_summary="Créer un dépôt",
        operation_description="Crée un nouveau dépôt/magasin de stockage.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
)
@method_decorator(
    name="update",
    decorator=swagger_auto_schema(
        operation_summary="Mettre à jour un dépôt",
        operation_description="Met à jour complètement un dépôt.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
)
@method_decorator(
    name="partial_update",
    decorator=swagger_auto_schema(
        operation_summary="Mise à jour partielle d’un dépôt",
        operation_description="Met à jour partiellement un dépôt.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
)
@method_decorator(
    name="destroy",
    decorator=swagger_auto_schema(
        operation_summary="Supprimer un dépôt",
        operation_description="Supprime un dépôt (si aucune contrainte métier).",
        manual_parameters=[auth_header_param],
        tags=tags
    )
)
class DepotViewSet(ModelViewSet):
    serializer_class = DepotSerializer
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["is_active", "depot_type"]
    search_fields = ["code", "name", "location"]

    def get_queryset(self):
        return Depot.objects.all().order_by("code")

    @swagger_auto_schema(
        operation_summary="Valeur totale du stock du dépôt",
        operation_description="Retourne la valeur totale du stock du dépôt (valorisation PMP).",
        manual_parameters=[auth_header_param],
        tags=tags
    )
    @action(detail=True, methods=["get"], url_path="total-value")
    def total_value(self, request, pk=None):
        depot = self.get_object()

        return Response({
            "depot_id": depot.id,
            "depot_code": depot.code,
            "total_value": depot.get_total_value()
        })

    @swagger_auto_schema(
        operation_summary="Niveaux de stock du dépôt",
        operation_description="Retourne la liste des stocks par article pour un dépôt.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
    @action(detail=True, methods=["get"], url_path="stock-levels")
    def stock_levels(self, request, pk=None):
        depot = self.get_object()

        stocks = Stock.objects.filter(depot=depot).select_related("article")

        serializer = StockSerializer(stocks, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_summary="Alertes de stock",
        operation_description=(
            "Retourne les articles dont le stock disponible est inférieur "
            "au seuil minimum ou au stock de sécurité."
        ),
        manual_parameters=[auth_header_param],
        tags=tags
    )
    @action(detail=True, methods=["get"], url_path="alerts")
    def alerts(self, request, pk=None):
        depot = self.get_object()

        alerts = []
        stocks = Stock.objects.filter(depot=depot).select_related("article")

        for stock in stocks:
            article = stock.article
            available = stock.available_quantity

            if available < article.minimum_stock:
                alerts.append({
                    "article_id": article.id,
                    "article_code": article.code,
                    "article_name": article.name,
                    "available_quantity": available,
                    "minimum_stock": article.minimum_stock,
                    "alert_type": "MINIMUM_STOCK"
                })

        return Response(alerts)

    @swagger_auto_schema(
        operation_summary="Définir le dépôt principal",
        operation_description="Marque ce dépôt comme dépôt principal.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
    @action(detail=True, methods=["post"], url_path="set-main")
    def set_main(self, request, pk=None):
        depot = self.get_object()

        Depot.objects.filter(depot_type="CENTRAL").update(is_active=False)

        depot.is_active = True
        depot.save(update_fields=["is_active"])

        return Response(
            {"message": f"Le dépôt {depot.code} est désormais le dépôt principal."},
            status=status.HTTP_200_OK
        )

