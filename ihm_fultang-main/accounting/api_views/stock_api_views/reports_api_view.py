from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.decorators import method_decorator

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounting.permissions.accounting_staff_permissions import AccountingStaffPermission

tags = ["report"]

auth_header_param = openapi.Parameter(
    name="Authorization",
    in_=openapi.IN_HEADER,
    description="JWT Bearer Token",
    type=openapi.TYPE_STRING,
    required=True
)

date_from_param = openapi.Parameter(
    "date_from",
    openapi.IN_QUERY,
    type=openapi.TYPE_STRING,
    format="date",
    description="Date de début (YYYY-MM-DD)"
)

date_to_param = openapi.Parameter(
    "date_to",
    openapi.IN_QUERY,
    type=openapi.TYPE_STRING,
    format="date",
    description="Date de fin (YYYY-MM-DD)"
)

@method_decorator(
    swagger_auto_schema(
        operation_summary="État des stocks",
        operation_description=(
            "Retourne l’état actuel des stocks par article et dépôt.\n\n"
            "Filtres possibles :\n"
            "- `article_id`\n"
            "- `depot_id`"
        ),
        manual_parameters=[auth_header_param],
        tags=tags
    ),
    name="get"
)
class StockStatusReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        data = []
        return Response(data)

@method_decorator(
    swagger_auto_schema(
        operation_summary="Valorisation des stocks",
        operation_description=(
            "Valorisation des stocks selon la méthode du PMP "
            "(Prix Moyen Pondéré – conforme OHADA)."
        ),
        manual_parameters=[auth_header_param],
        tags=tags
    ),
    name="get"
)
class StockValuationReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        data = []
        return Response(data)

@method_decorator(
    swagger_auto_schema(
        operation_summary="Ancienneté des stocks",
        operation_description="Répartition des stocks par tranche d’ancienneté.",
        manual_parameters=[auth_header_param],
        tags=tags
    ),
    name="get"
)
class StockAgingReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        data = []
        return Response(data)

@method_decorator(
    swagger_auto_schema(
        operation_summary="Résumé des mouvements",
        operation_description="Synthèse des entrées et sorties de stock.",
        manual_parameters=[auth_header_param, date_from_param, date_to_param],
        tags=tags
    ),
    name="get"
)
class MovementsSummaryReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        data = []
        return Response(data)

@method_decorator(
    swagger_auto_schema(
        operation_summary="Analyse de consommation",
        operation_description="Analyse de la consommation par article ou service.",
        manual_parameters=[auth_header_param, date_from_param, date_to_param],
        tags=tags
    ),
    name="get"
)
class ConsumptionAnalysisReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        data = []
        return Response(data)

@method_decorator(
    swagger_auto_schema(
        operation_summary="Taux de rotation des stocks",
        operation_description="Calcul du taux de rotation des stocks.",
        manual_parameters=[auth_header_param],
        tags=tags
    ),
    name="get"
)
class RotationRateReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        data = []
        return Response(data)

@method_decorator(
    swagger_auto_schema(
        operation_summary="Achats par fournisseur",
        operation_description="Montant et quantités achetées par fournisseur.",
        manual_parameters=[auth_header_param, date_from_param, date_to_param],
        tags=tags
    ),
    name="get"
)
class PurchasesBySupplierReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        data = []
        return Response(data)

@method_decorator(
    swagger_auto_schema(
        operation_summary="Achats par catégorie",
        operation_description="Analyse des achats par catégorie d’articles.",
        manual_parameters=[auth_header_param],
        tags=tags
    ),
    name="get"
)
class PurchasesByCategoryReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        data = []
        return Response(data)

@method_decorator(
    swagger_auto_schema(
        operation_summary="Achats par période",
        operation_description="Analyse des achats sur une période donnée.",
        manual_parameters=[auth_header_param, date_from_param, date_to_param],
        tags=tags
    ),
    name="get"
)
class PurchasesByPeriodReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        data = []
        return Response(data)

@method_decorator(
    swagger_auto_schema(
        operation_summary="Écarts d’inventaire",
        operation_description="Différences entre stock théorique et stock physique.",
        manual_parameters=[auth_header_param],
        tags=tags
    ),
    name="get"
)
class InventoryVariancesReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        data = []
        return Response(data)

@method_decorator(
    swagger_auto_schema(
        operation_summary="Historique des inventaires",
        operation_description="Liste des inventaires réalisés.",
        manual_parameters=[auth_header_param],
        tags=tags
    ),
    name="get"
)
class InventoryHistoryReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        data = []
        return Response(data)

@method_decorator(
    swagger_auto_schema(
        operation_summary="Alertes de péremption",
        operation_description="Lots bientôt périmés.",
        manual_parameters=[auth_header_param],
        tags=tags
    ),
    name="get"
)
class ExpiryAlertsReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        data = []
        return Response(data)

@method_decorator(
    swagger_auto_schema(
        operation_summary="Produits expirés",
        operation_description="Liste des produits déjà périmés.",
        manual_parameters=[auth_header_param],
        tags=tags
    ),
    name="get"
)
class ExpiredProductsReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        data = []
        return Response(data)

@method_decorator(
    swagger_auto_schema(
        operation_summary="Alertes stock bas",
        operation_description="Articles dont le stock est sous le seuil minimum.",
        manual_parameters=[auth_header_param],
        tags=tags
    ),
    name="get"
)
class LowStockAlertsReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        data = []
        return Response(data)

@method_decorator(
    swagger_auto_schema(
        operation_summary="Ruptures de stock",
        operation_description="Articles totalement en rupture.",
        manual_parameters=[auth_header_param],
        tags=tags
    ),
    name="get"
)
class OutOfStockAlertsReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        data = []
        return Response(data)

@method_decorator(
    swagger_auto_schema(
        operation_summary="Export Excel",
        operation_description="Export des rapports au format Excel.",
        manual_parameters=[auth_header_param],
        tags=tags
    ),
    name="get"
)
class ExportExcelReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        return Response({"message": "Export Excel"})

@method_decorator(
    swagger_auto_schema(
        operation_summary="Export PDF",
        operation_description="Export des rapports au format PDF.",
        manual_parameters=[auth_header_param],
        tags=tags
    ),
    name="get"
)
class ExportPDFReportAPI(APIView):
    def get(self, request):
        return Response({"message": "PDF export"})


@method_decorator(
    swagger_auto_schema(
        operation_summary="Export CSV",
        operation_description="Export des rapports au format CSV.",
        manual_parameters=[auth_header_param],
        tags=tags
    ),
    name="get"
)
class ExportCSVReportAPI(APIView):
    def get(self, request):
        return Response({"message": "CSV export"})
