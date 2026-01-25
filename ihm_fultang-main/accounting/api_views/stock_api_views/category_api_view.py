from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.decorators import method_decorator

from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from rest_framework import status
from django.db.models import ProtectedError

from accounting.permissions.accounting_staff_permissions import AccountingStaffPermission

from accounting.stock_models import Category
from accounting.stock_serializers import CategorySerializer, FamilySerializer

tags = ["categories"]

auth_header_param = openapi.Parameter(
    name="Authorization",
    in_=openapi.IN_HEADER,
    description="Token JWT pour l'authentification (Bearer <token>)",
    type=openapi.TYPE_STRING,
    required=True
)

@method_decorator(
    name="list",
    decorator=swagger_auto_schema(
        operation_summary="Lister les catégories",
        operation_description=(
            "Retourne la liste des catégories d’articles.\n\n"
            "Filtres disponibles :\n"
            "- `is_active=true|false`\n"
            "- `search=mot-clé`"
        ),
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
@method_decorator(
    name="retrieve",
    decorator=swagger_auto_schema(
        operation_summary="Détails d'une catégorie",
        operation_description="Retourne les détails d’une catégorie à partir de son ID.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
@method_decorator(
    name="create",
    decorator=swagger_auto_schema(
        operation_summary="Créer une catégorie",
        operation_description="Permet de créer une nouvelle catégorie d’articles.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
@method_decorator(
    name="update",
    decorator=swagger_auto_schema(
        operation_summary="Mettre à jour une catégorie",
        operation_description="Met à jour complètement une catégorie existante.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
@method_decorator(
    name="partial_update",
    decorator=swagger_auto_schema(
        operation_summary="Mise à jour partielle d'une catégorie",
        operation_description="Met à jour partiellement une catégorie existante.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
@method_decorator(
    name="destroy",
    decorator=swagger_auto_schema(
        operation_summary="Supprimer une catégorie",
        operation_description="Supprime une catégorie existante.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
class CategoryViewSet(ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["is_active"]
    search_fields = ["code", "name", "description"]

    def get_queryset(self):
        """
        Logique métier de récupération des catégories
        """
        queryset = Category.objects.prefetch_related("families")

        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == "true")

        return queryset.order_by("code")

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {"detail": "Impossible de supprimer cette catégorie car elle contient des articles ou des sous-catégories actifs."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"detail": f"Erreur lors de la suppression : {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @swagger_auto_schema(
        operation_summary="Lister les sous-catégories",
        operation_description=(
            "Retourne la liste des familles (sous-catégories) "
            "associées à une catégorie donnée."
        ),
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @action(detail=True, methods=["get"], url_path="subcategories")
    def subcategories(self, request, pk=None):
        category = self.get_object()

        families = category.families.all()

        is_active = request.query_params.get("is_active")
        if is_active is not None:
            families = families.filter(is_active=is_active.lower() == "true")

        serializer = FamilySerializer(families, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_summary="Arbre des catégories",
        operation_description=(
            "Retourne la hiérarchie complète des catégories et de leurs sous-catégories."
        ),
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @action(detail=False, methods=["get"], url_path="tree")
    def tree(self, request):
        categories = Category.objects.prefetch_related("families").filter(is_active=True)

        data = []
        for category in categories:
            data.append({
                "id": category.id,
                "code": category.code,
                "name": category.name,
                "description": category.description,
                "families": FamilySerializer(
                    category.families.filter(is_active=True),
                    many=True
                ).data
            })

        return Response(data)
