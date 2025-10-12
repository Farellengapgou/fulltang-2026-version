from rest_framework.viewsets import ModelViewSet
from polyclinic.models import Appointment
from authentication.models import MedicalStaff
from polyclinic.permissions.appointment_permissions import AppointmentPermissions
from polyclinic.serializers.appointment_serializers.get_serializer import AppointmentSerializer
from polyclinic.serializers.appointment_serializers.create_serializer import AppointmentCreateSerializer
from polyclinic.serializers.appointment_serializers.update_serializer import AppointmentUpdateSerializer
from polyclinic.pagination import CustomPagination
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.decorators import method_decorator
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action

tags = ["appointment"]
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
class AppointmentViewSet(ModelViewSet):

    permission_classes = [IsAuthenticated, AppointmentPermissions]
    #permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination

    def get_queryset(self):
        queryset = Appointment.objects.all()
        return queryset

    def get_serializer_class(self):
        if self.action in ["create"] or self.request.method in ["POST"]:
            return AppointmentCreateSerializer
        elif self.action in ["update", "partial_update"] or self.request.method in ["PUT", "PATCH"]:
            return AppointmentUpdateSerializer
        else:
            return AppointmentSerializer

    def perform_create(self, serializer):
        if 'id' in serializer.validated_data:
            serializer.validated_data.pop('id')
        serializer.save()

    def perform_update(self, serializer):
        if 'id' in serializer.validated_data:
            serializer.validated_data.pop('id')
        serializer.save()

    @swagger_auto_schema(
        operation_description="Permet de lister les rendez-vous d'un docteur/ ou les historiques des rendez-vous d'un docteur",
        responses={
            200: openapi.Response(description=" Liste des rendez-vous du docteur",
                                  schema=AppointmentSerializer(many=True)),
            404: openapi.Response(description="Docteur inexistant existent"),
            400: openapi.Response(description="Bad request"),
        },
        manual_parameters=[
            openapi.Parameter('id', openapi.IN_PATH, description="ID dU medical staff concerné",
                              type=openapi.TYPE_INTEGER, required=True),
            openapi.Parameter(
                'history',
                openapi.IN_QUERY,
                description="Si `true`, retourne juste les rendez-vous du medecin qui ne sont plus à pending",
                type=openapi.TYPE_STRING,
                required=False
            ),
            auth_header_param
        ],
        tags=tags
    )
    @action(methods=["get"], detail=False, url_path='doctor/(?P<id>[^/.]+)', permission_classes=permission_classes)
    def consultation_doctor(self, request, id):
        try:
            self.pagination_class = None
            medical_staff = MedicalStaff.objects.get(id=id)
            if medical_staff.role != "Doctor":
                return Response({"details": "le medical staff specifie n'est pas un docteur"},
                                status.HTTP_400_BAD_REQUEST)
            queryset = Appointment.objects.filter(idMedicalStaff=medical_staff)
            history = self.request.query_params.get("history", "false")
            if history and history.lower() == "true":
                queryset = queryset.exclude(state="Pending")
                serializer = AppointmentSerializer(queryset, many=True)
                return Response(serializer.data, status.HTTP_200_OK)
            else:
                # queryset = queryset.filter(consultationDate__date=now().date()).filter(state="Pending")
                queryset = queryset.filter(state="Pending")
                serializer = AppointmentSerializer(queryset, many=True)
                return Response(serializer.data, status.HTTP_200_OK)
        except MedicalStaff.DoesNotExist:
            return Response({"details": "le docteur spécifé n'existe pas"}, status.HTTP_404_NOT_FOUND)