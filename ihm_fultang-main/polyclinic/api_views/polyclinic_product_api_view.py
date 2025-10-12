from rest_framework.viewsets import ModelViewSet
from polyclinic.models import PolyclinicProduct, PolyclinicProductCategory
from polyclinic.serializers.polyclinic_product_serializer import PolyclinicProductSerializer, PolyclinicProductCreateSerializer
from polyclinic.pagination import CustomPagination
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.decorators import method_decorator
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from django.utils.timezone import now, timedelta

tags = ["polyclinic-product"]
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
        operation_summary="Lister les objets",
        operation_description=(
            "Cette route retourne une liste paginée de tous les objets du modèle. "
            "L'authentification est requise pour accéder à cette ressource."
        ),
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
@method_decorator(
    name="retrieve",
    decorator=swagger_auto_schema(
        operation_summary="Récupérer un objet",
        operation_description=(
            "Cette route retourne les détails d'un objet spécifique en fonction de son ID. "
            "L'authentification est requise pour accéder à cette ressource."
        ),
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
@method_decorator(
    name="create",
    decorator=swagger_auto_schema(
        operation_summary="Créer un nouvel objet",
        operation_description=(
            "Cette route permet de créer un nouvel objet. "
            "Les données doivent être envoyées dans le corps de la requête. "
            "L'authentification est requise pour accéder à cette ressource."
        ),
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
@method_decorator(
    name="update",
    decorator=swagger_auto_schema(
        operation_summary="Mettre à jour un objet",
        operation_description=(
            "Cette route permet de mettre à jour complètement un objet existant en fonction de son ID. "
            "Les données doivent être envoyées dans le corps de la requête. "
            "L'authentification est requise pour accéder à cette ressource."
        ),
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
@method_decorator(
    name="partial_update",
    decorator=swagger_auto_schema(
        operation_summary="Mise à jour partielle d'un objet",
        operation_description=(
            "Cette route permet de mettre à jour partiellement un objet existant en fonction de son ID. "
            "Les données doivent être envoyées dans le corps de la requête. "
            "L'authentification est requise pour accéder à cette ressource."
        ),
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
@method_decorator(
    name="destroy",
    decorator=swagger_auto_schema(
        operation_summary="Supprimer un objet",
        operation_description=(
            "Cette route permet de supprimer un objet existant en fonction de son ID. "
            "L'authentification est requise pour accéder à cette ressource."
        ),
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
class PolyclinicProductViewSet(ModelViewSet):

    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination

    def get_queryset(self):
        queryset = PolyclinicProduct.objects.all()
        return queryset

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"] or self.request.method in ["POST", "PUT", "PATCH"]:
            return PolyclinicProductCreateSerializer
        else:
            return PolyclinicProductSerializer

    def perform_create(self, serializer):
        if 'id' in serializer.validated_data:
            serializer.validated_data.pop('id')
        serializer.save()

    def perform_update(self, serializer):
        if 'id' in serializer.validated_data:
            serializer.validated_data.pop('id')
        serializer.save()

    @swagger_auto_schema(
        operation_description="Pour obtenir tous les produits d'une catégories dont on passe l'id",
        responses={
            204: openapi.Response(description="Liste des produits obtenu avec succès"),
            403: openapi.Response(description="Token invalide ou expiré"),
            404: openapi.Response(description="Catégorie non trouvé"),
            400: openapi.Response(description="Bad request"),
        },
        manual_parameters=[
            openapi.Parameter('id', openapi.IN_PATH, description="ID de la catégorie",
                              type=openapi.TYPE_INTEGER, required=True),
            auth_header_param
        ],
        tags=tags
    )
    @action(detail=False, methods=['get'], url_path='category/(?P<category_id>\d+)')
    def products_by_category(self, request, category_id=None):
        try:
            category = PolyclinicProductCategory.objects.get(id=category_id)
            subcategories = category.get_descendants(include_self=True)
            products = PolyclinicProduct.objects.filter(category__in=subcategories)
            serializer = self.get_serializer(products, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except PolyclinicProductCategory.DoesNotExist:
            return Response({'details': 'Catégorie non trouvée'}, status=status.HTTP_404_NOT_FOUND)