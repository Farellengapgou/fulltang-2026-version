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
from django.db import models

from accounting.permissions.accounting_staff_permissions import AccountingStaffPermission

from accounting.stock_models import StockSupplier
from accounting.stock_serializers import SupplierSerializer

from accounting.stock_models import GoodsReceiptNote, Category

tags = ["supplier"]

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
        operation_summary="Lister les fournisseurs",
        operation_description=(
            "Retourne la liste des fournisseurs.\n\n"
            "Filtres disponibles :\n"
            "- `is_active=true|false`\n"
            "- `search=pharma`"
        ),
        manual_parameters=[auth_header_param],
        tags=tags
    )
)
@method_decorator(
    name="retrieve",
    decorator=swagger_auto_schema(
        operation_summary="Détails fournisseur",
        operation_description="Retourne les informations détaillées d’un fournisseur.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
)
@method_decorator(
    name="create",
    decorator=swagger_auto_schema(
        operation_summary="Créer un fournisseur",
        operation_description="Crée un nouveau fournisseur.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
)
@method_decorator(
    name="update",
    decorator=swagger_auto_schema(
        operation_summary="Mettre à jour un fournisseur",
        operation_description="Met à jour complètement un fournisseur.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
)
@method_decorator(
    name="partial_update",
    decorator=swagger_auto_schema(
        operation_summary="Mise à jour partielle fournisseur",
        operation_description="Met à jour partiellement un fournisseur.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
)
@method_decorator(
    name="destroy",
    decorator=swagger_auto_schema(
        operation_summary="Supprimer un fournisseur",
        operation_description="Supprime un fournisseur (si aucune contrainte métier).",
        manual_parameters=[auth_header_param],
        tags=tags
    )
)
class SupplierViewSet(ModelViewSet):
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["is_active"]
    search_fields = ["code", "name", "email", "phone"]

    def get_queryset(self):
        return StockSupplier.objects.all().order_by("name")

    @swagger_auto_schema(
        operation_summary="Achats du fournisseur",
        operation_description="Liste des bons d’entrée liés à ce fournisseur.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
    @action(detail=True, methods=["get"], url_path="purchases")
    def purchases(self, request, pk=None):
        supplier = self.get_object()

        receipts = GoodsReceiptNote.objects.filter(
            supplier=supplier,
            status__in=["CONFIRMED", "POSTED"]
        ).order_by("-receipt_date")

        data = [{
            "receipt_number": r.receipt_number,
            "date": r.receipt_date,
            "total_amount": r.total_amount,
            "status": r.status
        } for r in receipts]

        return Response(data)

    @swagger_auto_schema(
        operation_summary="Total des achats",
        operation_description="Retourne le montant total des achats effectués chez ce fournisseur.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
    @action(detail=True, methods=["get"], url_path="total-purchases")
    def total_purchases(self, request, pk=None):
        supplier = self.get_object()

        total = GoodsReceiptNote.objects.filter(
            supplier=supplier,
            status="POSTED"
        ).aggregate(total=models.Sum("total_amount"))["total"] or 0

        return Response({
            "supplier_id": supplier.id,
            "supplier_name": supplier.name,
            "total_purchases": total
        })
    
    @swagger_auto_schema(
        operation_summary="Performance fournisseur",
        operation_description=(
            "Indicateurs de performance :\n"
            "- nombre de livraisons\n"
            "- montant total\n"
            "- panier moyen"
        ),
        manual_parameters=[auth_header_param],
        tags=tags
    )
    @action(detail=True, methods=["get"], url_path="performance")
    def performance(self, request, pk=None):
        supplier = self.get_object()

        receipts = GoodsReceiptNote.objects.filter(
            supplier=supplier,
            status="POSTED"
        )

        count = receipts.count()
        total = receipts.aggregate(total=models.Sum("total_amount"))["total"] or 0
        average = total / count if count > 0 else 0

        return Response({
            "supplier": supplier.name,
            "deliveries": count,
            "total_amount": total,
            "average_delivery_value": round(average, 2)
        })
    
    @swagger_auto_schema(
        operation_summary="Catégories autorisées",
        operation_description="Liste des catégories que ce fournisseur peut livrer.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
    @action(detail=True, methods=["get"], url_path="categories")
    def categories(self, request, pk=None):
        supplier = self.get_object()

        categories = supplier.categories.all()

        return Response([
            {"id": c.id, "code": c.code, "name": c.name}
            for c in categories
        ])
    
    @swagger_auto_schema(
        operation_summary="Ajouter des catégories",
        operation_description="Associe une ou plusieurs catégories au fournisseur.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "category_ids": openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Items(type=openapi.TYPE_INTEGER)
                )
            },
            required=["category_ids"]
        ),
        manual_parameters=[auth_header_param],
        tags=tags
    )
    @action(detail=True, methods=["post"], url_path="categories")
    def add_categories(self, request, pk=None):
        supplier = self.get_object()
        category_ids = request.data.get("category_ids", [])

        categories = Category.objects.filter(id__in=category_ids)
        supplier.categories.add(*categories)

        return Response(
            {"message": "Catégories ajoutées avec succès"},
            status=status.HTTP_200_OK
        )

    @swagger_auto_schema(
        operation_summary="Retirer une catégorie",
        operation_description="Retire une catégorie autorisée pour ce fournisseur.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
    @action(
        detail=True,
        methods=["delete"],
        url_path="categories/(?P<category_id>[^/.]+)"
    )
    def remove_category(self, request, pk=None, category_id=None):
        supplier = self.get_object()

        try:
            category = Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            return Response(
                {"error": "Catégorie introuvable"},
                status=status.HTTP_404_NOT_FOUND
            )

        supplier.categories.remove(category)

        return Response(
            {"message": "Catégorie supprimée"},
            status=status.HTTP_204_NO_CONTENT
        )



