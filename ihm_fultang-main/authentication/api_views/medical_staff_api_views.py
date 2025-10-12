from rest_framework.viewsets import ModelViewSet
from rest_framework.viewsets import ViewSet

from authentication.models import MedicalStaff, ROLES, ROLES_ACCOUNTING
from polyclinic.permissions.medical_staff_permissions import MedicalStaffPermission
from authentication.serializers.medical_staff_serializers import MedicalStaffSerializer, MedicalStaffCreateSerializer
from polyclinic.pagination import CustomPagination
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.decorators import method_decorator
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from django.http import JsonResponse

tags = ["medical-staff"]
active_param = openapi.Parameter(
    'active',
    openapi.IN_QUERY,
    description="Filtrer les MedicalStaff par leur état actif. Valeurs possibles : true, false.",
    type=openapi.TYPE_STRING,
    enum=["true", "false"],  # Limite les valeurs possibles
)

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
        manual_parameters=[auth_header_param, active_param],
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
class MedicalStaffViewSet(ModelViewSet):

    permission_classes = [IsAuthenticated, MedicalStaffPermission]
    pagination_class = CustomPagination

    def get_queryset(self):
        # Récupérer le paramètre `active` depuis l'URL
        active_param = self.request.query_params.get('active')

        # Base queryset
        queryset = MedicalStaff.objects.all()

        # Filtrer si `active` est présent dans les paramètres
        if active_param is not None:
            if active_param.lower() == 'true':  # Afficher seulement les MedicalStaff actifs
                queryset = queryset.filter(is_active=True)
            elif active_param.lower() == 'false':  # Afficher seulement les MedicalStaff inactifs
                queryset = queryset.filter(is_active=False)

        return queryset


    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return MedicalStaffCreateSerializer
        else:
            return MedicalStaffSerializer

    def perform_create(self, serializer):
        if 'id' in serializer.validated_data:
            serializer.validated_data.pop('id')
        serializer.save()

    def perform_update(self, serializer):
        if 'id' in serializer.validated_data:
            serializer.validated_data.pop('id')
        serializer.save()

    @swagger_auto_schema(
        operation_description="Renvoie la liste de tous les médécins",
        responses={
            200: openapi.Response(description="Liste de tous les m2édécins", schema=openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_OBJECT, properties={
                'id': openapi.Schema(type=openapi.TYPE_INTEGER, description="ID du docteur"),
                'first_name': openapi.Schema(type=openapi.TYPE_STRING, description="Prénom du docteur"),
                'last_name': openapi.Schema(type=openapi.TYPE_STRING, description="Nom du docteur"),
                'role': openapi.Schema(type=openapi.TYPE_STRING, description="Rôle du docteur")
            },
        tags=tags
        )))})
    @action(methods=['get'], detail=False, url_path='all-doctors', permission_classes=[MedicalStaffPermission])
    def all_doctors(self, request):
        self.pagination_class = None
        doctors = MedicalStaff.objects.filter(role__in=['Doctor', 'Specialist', 'Ophtalmologist', 'Dentist'])
        doctors_list = list(doctors.values('id', 'first_name', 'last_name', 'role'))
        return JsonResponse(doctors_list, safe=False)

    @swagger_auto_schema(
        operation_description="Permet de compter les medical staff par categorie",
        responses={
            200: openapi.Response(description="Nombre de roles et de medical staff")
        },
        tags=tags
    )
    @action(methods=['get'], detail=False, url_path='count', permission_classes=[AllowAny])
    def number_of_role(self, request):
        query = MedicalStaff.objects.all()
        data = {}
        data['medical_staff_count'] = query.count()
        query = query.filter(is_active=True)
        data['medical_staff_active_count'] = query.count()
        data['medical'] = query.filter(userType="Medical").count()
        data['accountant'] = query.filter(userType="Accountant").count()

        for role in ROLES + ROLES_ACCOUNTING:
            data[role[0]] = query.filter(role=role[0]).count()

        return Response(data, status=status.HTTP_200_OK)


