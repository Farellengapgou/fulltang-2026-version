from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.decorators import method_decorator

from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, F

from accounting.permissions.accounting_staff_permissions import AccountingStaffPermission

from accounting.stock_models import Stock, StockMovement
from accounting.stock_serializers import StockSerializer

tags = ["stock-levels"]

auth_header_param = openapi.Parameter(
    name="Authorization",
    in_=openapi.IN_HEADER,
    description="JWT Bearer Token",
    type=openapi.TYPE_STRING,
    required=True
)

@method_decorator(
    name="list",
    decorator=swagger_auto_schema(
        operation_summary="Lister les niveaux de stock",
        operation_description=(
            "Retourne les niveaux de stock par article et dépôt.\n\n"
            "Filtres possibles :\n"
            "- `article_id`\n"
            "- `depot_id`\n"
            "- `quantity_gt`\n"
            "- `quantity_lt`"
        ),
        manual_parameters=[auth_header_param],
        tags=tags
    )
)
@method_decorator(
    name="retrieve",
    decorator=swagger_auto_schema(
        operation_summary="Détail d’un stock",
        operation_description="Retourne le niveau de stock détaillé (article + dépôt).",
        manual_parameters=[auth_header_param],
        tags=tags
    )
)
class StockLevelViewSet(ReadOnlyModelViewSet):
    serializer_class = StockSerializer
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get_queryset(self):
        return (
            Stock.objects
            .select_related("article", "depot")
            .all()
        )

    @swagger_auto_schema(
        operation_summary="Stock par article",
        operation_description="Agrégation du stock par article (tous dépôts confondus).",
        manual_parameters=[auth_header_param],
        tags=tags
    )
    @action(detail=False, methods=["get"], url_path="by-article")
    def by_article(self, request):
        data = (
            Stock.objects
            .values(
                article_id=F("article__id"),
                article_code=F("article__code"),
                article_name=F("article__name")
            )
            .annotate(
                total_quantity=Sum("quantity"),
                available_quantity=Sum("available_quantity")
            )
            .order_by("article_name")
        )

        return Response(data)

    @swagger_auto_schema(
        operation_summary="Stock par dépôt",
        operation_description="Agrégation du stock par dépôt.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
    @action(detail=False, methods=["get"], url_path="by-warehouse")
    def by_warehouse(self, request):
        data = (
            Stock.objects
            .values(
                depot_id=F("depot__id"),
                depot_code=F("depot__code"),
                depot_name=F("depot__name")
            )
            .annotate(
                total_quantity=Sum("quantity"),
                total_value=Sum(F("quantity") * F("unit_cost"))
            )
            .order_by("depot_name")
        )

        return Response(data)

    @swagger_auto_schema(
        operation_summary="Valorisation totale du stock",
        operation_description="Retourne la valeur totale du stock (PMP).",
        manual_parameters=[auth_header_param],
        tags=tags
    )
    @action(detail=False, methods=["get"], url_path="total-valuation")
    def total_valuation(self, request):
        total = (
            Stock.objects
            .aggregate(
                value=Sum(F("quantity") * F("unit_cost"))
            )["value"] or 0
        )

        return Response({"total_stock_value": total})

    @swagger_auto_schema(
        operation_summary="Historique du stock",
        operation_description="Historique des mouvements liés à ce stock.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
    @action(detail=True, methods=["get"], url_path="history")
    def history(self, request, pk=None):
        stock = self.get_object()

        movements = (
            StockMovement.objects
            .filter(stock=stock)
            .order_by("-movement_date")
        )

        data = [{
            "movement_number": m.movement_number,
            "type": m.movement_type,
            "quantity": m.quantity,
            "unit_cost": m.unit_cost,
            "total_value": m.total_value,
            "date": m.movement_date,
            "reference": m.reference
        } for m in movements]

        return Response(data)

    @swagger_auto_schema(
        operation_summary="Alertes stock",
        operation_description="Liste des stocks en dessous du seuil minimum.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
    @action(detail=False, methods=["get"], url_path="alerts")
    def alerts(self, request):
        stocks = Stock.objects.filter(
            quantity__lte=F("article__minimum_stock")
        )

        return Response(StockSerializer(stocks, many=True).data)

    @swagger_auto_schema(
        operation_summary="Stock faible",
        operation_description="Stocks proches du seuil minimum.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
    @action(detail=False, methods=["get"], url_path="low-stock")
    def low_stock(self, request):
        stocks = Stock.objects.filter(
            quantity__gt=0,
            quantity__lte=F("article__minimum_stock")
        )

        return Response(StockSerializer(stocks, many=True).data)

    @swagger_auto_schema(
        operation_summary="Rupture de stock",
        operation_description="Stocks à zéro.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
    @action(detail=False, methods=["get"], url_path="out-of-stock")
    def out_of_stock(self, request):
        stocks = Stock.objects.filter(quantity=0)

        return Response(StockSerializer(stocks, many=True).data)

    @swagger_auto_schema(
        operation_summary="Réserver du stock",
        operation_description="Réserve une quantité du stock disponible.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "quantity": openapi.Schema(type=openapi.TYPE_NUMBER)
            },
            required=["quantity"]
        ),
        manual_parameters=[auth_header_param],
        tags=tags
    )
    @action(detail=True, methods=["post"], url_path="reserve")
    def reserve(self, request, pk=None):
        stock = self.get_object()
        quantity = request.data.get("quantity")

        if quantity <= 0:
            return Response(
                {"error": "Quantité invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity > stock.available_quantity:
            return Response(
                {"error": "Stock disponible insuffisant"},
                status=status.HTTP_400_BAD_REQUEST
            )

        stock.reserved_quantity += quantity
        stock.save()

        return Response({"message": "Stock réservé avec succès"})

    @swagger_auto_schema(
        operation_summary="Libérer une réservation",
        operation_description="Libère une quantité précédemment réservée.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "quantity": openapi.Schema(type=openapi.TYPE_NUMBER)
            },
            required=["quantity"]
        ),
        manual_parameters=[auth_header_param],
        tags=tags
    )
    @action(detail=True, methods=["post"], url_path="release-reservation")
    def release_reservation(self, request, pk=None):
        stock = self.get_object()
        quantity = request.data.get("quantity")

        if quantity <= 0 or quantity > stock.reserved_quantity:
            return Response(
                {"error": "Quantité invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )

        stock.reserved_quantity -= quantity
        stock.save()

        return Response({"message": "Réservation libérée"})

