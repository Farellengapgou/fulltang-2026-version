from rest_framework.viewsets import ModelViewSet
from authentication.models import MedicalStaff
from polyclinic.models import ExamRequest
from polyclinic.permissions.exam_permissions import ExamPermissions
from polyclinic.permissions.exam_request_permissions import ExamRequestPermissions
from polyclinic.serializers.exam_request_serializers import ExamRequestSerializer, ExamRequestCreateSerializer, \
    ExamRequestCreateManySerializer
from polyclinic.pagination import CustomPagination
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.decorators import method_decorator
from rest_framework.permissions import IsAuthenticated
from django.db import transaction

tags = ["exam-request"]
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
        tags=tags
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
        tags=tags
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
        tags=tags
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
        tags=tags
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
        tags=tags
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
        tags=tags
    )
)
class ExamRequestViewSet(ModelViewSet):

    permission_classes = [IsAuthenticated, ExamRequestPermissions]
    #permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination

    def get_queryset(self):
        queryset = ExamRequest.objects.all()
        return queryset

    def get_serializer_class(self):
        if self.action in ["create"]:
            return ExamRequestCreateManySerializer
        elif self.action in ["partial_update", "update"]:
            return ExamRequestCreateSerializer
        return ExamRequestSerializer

    @transaction.atomic
    def perform_create(self, serializer):
        if 'id' in serializer.validated_data:
            serializer.validated_data.pop('id')
        serializer.save()

    def perform_update(self, serializer):
        if 'id' in serializer.validated_data:
            serializer.validated_data.pop('id')
        serializer.save()

    
    @swagger_auto_schema(
        operation_description="Permet de lister les demandes d'examens d'un docteur",
        responses={
            200: openapi.Response(description="Liste des demandes d'examens du docteur",
                                  schema=ExamRequestSerializer(many=True)),
            404: openapi.Response(description="Docteur inexistant"),
            400: openapi.Response(description="Bad request"),
        },
        manual_parameters=[
            openapi.Parameter('id', openapi.IN_PATH, description="ID dU medical staff concerné",
                              type=openapi.TYPE_INTEGER, required=True),
            auth_header_param
        ],
        tags=tags
    )
    @action(
        detail=False,
        methods=["get"],
        url_path="doctor/(?P<id>[^/.]+)",
        permission_classes=[IsAuthenticated, ExamRequestPermissions]
    )
    def my_exam_requests(self, request, id=None):
        try:
            medical_staff = MedicalStaff.objects.get(id=id)
            if medical_staff.role not in ["Doctor", "Specialist", "Ophthalmologist", "Dentist"]:
                return Response({"details": "le medical staff specifie n'est pas un docteur"},
                                status.HTTP_404_NOT_FOUND)
            # Récupérer les demandes d'examens effectuées par ce docteur
            queryset = ExamRequest.objects.filter(idMedicalStaffGiver=medical_staff)

            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = ExamRequestSerializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            # Sérialiser les demandes d'examens
            serializer = ExamRequestSerializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except MedicalStaff.DoesNotExist:
            return Response({"details": "le docteur spécifé n'existe pas"}, status=status.HTTP_404_NOT_FOUND)
        
    @swagger_auto_schema(
        operation_description="Permet de compter les demandes d'examens d'un docteur",
        responses={
            200: openapi.Response(description="Nombre de demandes d'examens du docteur",
                                  schema=openapi.Schema(
                                        type=openapi.TYPE_OBJECT,
                                        properties={
                                        "count": openapi.Schema(type=openapi.TYPE_INTEGER)
                                    }
            )),
            404: openapi.Response(description="Docteur inexistant"),
            400: openapi.Response(description="Bad request"),
        },
        manual_parameters=[
            openapi.Parameter('id', openapi.IN_PATH, description="ID dU medical staff concerné",
                              type=openapi.TYPE_INTEGER, required=True),
            auth_header_param
        ],
        tags=tags
    )
    @action(
        detail=False,
        methods=["get"],
        url_path="doctor/(?P<id>[^/.]+)/count",
        permission_classes=[IsAuthenticated, ExamRequestPermissions]
    )
    def my_exam_requests_count(self, request, id=None):
        try:
            medical_staff = MedicalStaff.objects.get(id=id)

            if medical_staff.role not in [
                "Doctor", "Specialist", "Ophthalmologist", "Dentist"
            ]:
                return Response(
                    {"details": "le medical staff spécifié n'est pas un docteur"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            count = ExamRequest.objects.filter(
                idMedicalStaff=medical_staff
            ).count()

            return Response(
                {"count": count},
                status=status.HTTP_200_OK
            )

        except MedicalStaff.DoesNotExist:
            return Response(
                {"details": "le docteur spécifié n'existe pas"},
                status=status.HTTP_404_NOT_FOUND
            )


