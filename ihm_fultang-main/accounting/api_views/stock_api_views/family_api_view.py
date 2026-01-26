from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.decorators import method_decorator

from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from rest_framework import status
from django.db.models import ProtectedError

from accounting.permissions.accounting_staff_permissions import AccountingStaffPermission

from accounting.stock_models import Family
from accounting.stock_serializers import FamilySerializer

tags = ["families"]

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
        operation_summary="Lister les familles",
        operation_description=(
            "Retourne la liste des familles (sous-catégories) d'articles.\n\n"
            "Filtres disponibles :\n"
            "- `is_active=true|false`\n"
            "- `category=ID_CATEGORIE` (Filtrer par catégorie parente)\n"
            "- `search=mot-clé`"
        ),
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
@method_decorator(
    name="retrieve",
    decorator=swagger_auto_schema(
        operation_summary="Détails d'une famille",
        operation_description="Retourne les détails d'une famille à partir de son ID.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
@method_decorator(
    name="create",
    decorator=swagger_auto_schema(
        operation_summary="Créer une famille",
        operation_description="Permet de créer une nouvelle famille (sous-catégorie).",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
@method_decorator(
    name="update",
    decorator=swagger_auto_schema(
        operation_summary="Mettre à jour une famille",
        operation_description="Met à jour complètement une famille existante.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
@method_decorator(
    name="partial_update",
    decorator=swagger_auto_schema(
        operation_summary="Mise à jour partielle d'une famille",
        operation_description="Met à jour partiellement une famille existante.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
@method_decorator(
    name="destroy",
    decorator=swagger_auto_schema(
        operation_summary="Supprimer une famille",
        operation_description="Supprime une famille existante.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
class FamilyViewSet(ModelViewSet):
    serializer_class = FamilySerializer
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["is_active", "category"]
    search_fields = ["code", "name", "description"]

    def get_queryset(self):
        """
        Logique métier de récupération des familles
        """
        queryset = Family.objects.all().select_related("category")

        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == "true")

        return queryset.order_by("category__code", "code")

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {"detail": "Impossible de supprimer cette famille car elle contient des articles."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"detail": f"Erreur lors de la suppression : {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
