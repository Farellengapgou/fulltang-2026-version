from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.decorators import method_decorator

from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

from accounting.permissions.accounting_staff_permissions import AccountingStaffPermission
from accounting.stock_models import Article
from accounting.stock_serializers import ArticleSerializer

tags = ["articles"]

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
        operation_summary="Lister les articles",
        operation_description="Retourne la liste complète des articles.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
@method_decorator(
    name="retrieve",
    decorator=swagger_auto_schema(
        operation_summary="Détails d'un article",
        operation_description="Retourne les détails d'un article par son ID.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
@method_decorator(
    name="create",
    decorator=swagger_auto_schema(
        operation_summary="Créer un article",
        operation_description="Permet de créer un nouvel article de stock.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
@method_decorator(
    name="update",
    decorator=swagger_auto_schema(
        operation_summary="Mettre à jour un article",
        operation_description="Met à jour un article existant.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
@method_decorator(
    name="destroy",
    decorator=swagger_auto_schema(
        operation_summary="Supprimer un article",
        operation_description="Supprime un article du catalogue.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
class ArticleViewSet(ModelViewSet):
    queryset = Article.objects.all().order_by('name')
    serializer_class = ArticleSerializer
    permission_classes = [IsAuthenticated, AccountingStaffPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["category", "article_type", "is_perishable"]
    search_fields = ["code", "name", "description"]
