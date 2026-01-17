from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.decorators import method_decorator
from django.utils.timezone import now
from datetime import timedelta

from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from accounting.permissions.accounting_staff_permissions import AccountingStaffPermission

from accounting.stock_models import Batch
from accounting.stock_serializers import BatchSerializer

tags = ["batches"]

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
        operation_summary="Lister les lots",
        operation_description=(
            "Retourne la liste des lots (batches).\n\n"
            "Filtres possibles :\n"
            "- `article_id`\n"
            "- `depot_id`\n"
            "- `is_blocked`\n"
            "- `is_expired`"
        ),
        manual_parameters=[auth_header_param],
        tags=tags
    )
)
@method_decorator(
    name="retrieve",
    decorator=swagger_auto_schema(
        operation_summary="Détail d’un lot",
        operation_description="Retourne les informations détaillées d’un lot.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
)
@method_decorator(
    name="create",
    decorator=swagger_auto_schema(
        operation_summary="Créer un lot",
        operation_description="Création d’un lot (batch) avec date d’expiration.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
)
@method_decorator(
    name="partial_update",
    decorator=swagger_auto_schema(
        operation_summary="Modifier un lot",
        operation_description="Modification partielle d’un lot.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
)
class BatchViewSet(ModelViewSet):
    serializer_class = BatchSerializer
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get_queryset(self):
        qs = Batch.objects.select_related("article", "depot")

        # 🔍 Filtres
        article_id = self.request.query_params.get("article_id")
        depot_id = self.request.query_params.get("depot_id")
        is_blocked = self.request.query_params.get("is_blocked")
        is_expired = self.request.query_params.get("is_expired")

        if article_id:
            qs = qs.filter(article_id=article_id)

        if depot_id:
            qs = qs.filter(depot_id=depot_id)

        if is_blocked is not None:
            qs = qs.filter(is_blocked=is_blocked.lower() == "true")

        if is_expired is not None:
            today = now().date()
            if is_expired.lower() == "true":
                qs = qs.filter(expiry_date__lt=today)
            else:
                qs = qs.filter(expiry_date__gte=today)

        return qs.order_by("expiry_date")

    @swagger_auto_schema(
        operation_summary="Lots expirant bientôt",
        operation_description="Lots expirant dans les 30 prochains jours.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
    @action(detail=False, methods=["get"], url_path="expiring-soon")
    def expiring_soon(self, request):
        today = now().date()
        limit_date = today + timedelta(days=30)

        batches = Batch.objects.filter(
            expiry_date__range=(today, limit_date),
            is_blocked=False
        )

        return Response(BatchSerializer(batches, many=True).data)

    @swagger_auto_schema(
        operation_summary="Lots expirés",
        operation_description="Liste des lots déjà expirés.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
    @action(detail=False, methods=["get"], url_path="expired")
    def expired(self, request):
        today = now().date()

        batches = Batch.objects.filter(expiry_date__lt=today)

        return Response(BatchSerializer(batches, many=True).data)

    @swagger_auto_schema(
        operation_summary="Lots proches de l’expiration",
        operation_description=(
            "Lots expirant très prochainement.\n"
            "Paramètre optionnel : `days` (défaut = 7)."
        ),
        manual_parameters=[
            auth_header_param,
            openapi.Parameter(
                "days",
                openapi.IN_QUERY,
                type=openapi.TYPE_INTEGER,
                description="Nombre de jours avant expiration"
            )
        ],
        tags=tags
    )
    @action(detail=False, methods=["get"], url_path="near-expiry")
    def near_expiry(self, request):
        days = int(request.query_params.get("days", 7))
        today = now().date()
        limit_date = today + timedelta(days=days)

        batches = Batch.objects.filter(
            expiry_date__range=(today, limit_date),
            is_blocked=False
        )

        return Response(BatchSerializer(batches, many=True).data)

    @swagger_auto_schema(
        operation_summary="Bloquer un lot",
        operation_description="Empêche toute sortie de stock pour ce lot.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
    @action(detail=True, methods=["post"], url_path="block")
    def block(self, request, pk=None):
        batch = self.get_object()

        if batch.is_blocked:
            return Response(
                {"message": "Lot déjà bloqué"},
                status=status.HTTP_400_BAD_REQUEST
            )

        batch.is_blocked = True
        batch.save()

        return Response({"message": "Lot bloqué avec succès"})

    @swagger_auto_schema(
        operation_summary="Débloquer un lot",
        operation_description="Autorise à nouveau l’utilisation du lot.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
    @action(detail=True, methods=["post"], url_path="unblock")
    def unblock(self, request, pk=None):
        batch = self.get_object()

        if batch.is_expired():
            return Response(
                {"error": "Impossible de débloquer un lot expiré"},
                status=status.HTTP_400_BAD_REQUEST
            )

        batch.is_blocked = False
        batch.save()

        return Response({"message": "Lot débloqué avec succès"})
