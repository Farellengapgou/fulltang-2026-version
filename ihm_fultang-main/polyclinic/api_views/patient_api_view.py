from rest_framework.viewsets import ModelViewSet
from rest_framework.exceptions import ValidationError

from polyclinic.models import Patient, PatientAccess, MedicalFolder, Consultation
from authentication.models import MedicalStaff
from polyclinic.permissions.patient_access_permissions import PatientAccessPermission
from polyclinic.permissions.patient_permissions import PatientPermission
from polyclinic.serializers.patient_access_serializers import PatientAccessSerializer
from polyclinic.serializers.patient_serializers import PatientSerializer, PatientCreateSerializer
from polyclinic.pagination import CustomPagination
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.decorators import method_decorator
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from django.utils.timezone import now, timedelta
from django.db import transaction

tags = ["patient"]
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
class PatientViewSet(ModelViewSet):

    permission_classes = [IsAuthenticated, PatientPermission]
    pagination_class = CustomPagination

    def get_queryset(self):
        """
        user = self.request.user
        if user.role=="Admin" or user.role=="Receptionist":
            return Patient.objects.all()

        return Patient.objects.filter(
            id__in=PatientAccess.objects.filter(
                idMedicalStaff=user,
                access=True
            ).values_list("idPatient", flat=True)
        )
        """
        return Patient.objects.all()

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return PatientCreateSerializer
        else:
            return PatientSerializer

    @transaction.atomic
    def perform_create(self, serializer):
        user = self.request.user
        serializer.validated_data.pop('id', None)

        # Récupérer l'instance du MedicalStaff passé dans les données
        medical_staff = serializer.validated_data.get('idMedicalStaff')
        if not medical_staff:
            raise ValidationError({"idMedicalStaff": "Ce champ est requis."})

        # Vérifier que l'utilisateur connecté correspond à l'idMedicalStaff fourni
        if user.id != medical_staff.id:
            raise ValidationError({"detail": "Vous ne pouvez pas créer un patient pour un autre staff."})

        # Sauvegarder l'instance via le serializer
        serializer.save()


    def perform_update(self, serializer):
        if 'id' in serializer.validated_data:
            serializer.validated_data.pop('id')
        serializer.save()

    @swagger_auto_schema(
        operation_description="Permet de retirer l'access d'un staff à un patient",
        responses={
            204: openapi.Response(description="Acess au patient retiré"),
            208: openapi.Response(description="Accès au patient déjà retiré"),
            403: openapi.Response(description="Token invalide ou expiré"),
            404: openapi.Response(description="Access non existent"),
            400: openapi.Response(description="Bad request"),
        },
        manual_parameters=[
            openapi.Parameter('id', openapi.IN_PATH, description="ID dU medical staff concerné", type=openapi.TYPE_INTEGER, required=True),
            auth_header_param
        ],
        tags=tags
    )
    @action(methods=['post'], detail=True, url_path='remove-access/(?P<id>[^/.]+)', permission_classes=[PatientAccessPermission])
    def remove_access(self, request, id=None, *args, **kwargs):
        if id is None:
            return Response({'details': "l'id du médical staff est requis"},
                            status=status.HTTP_400_BAD_REQUEST, content_type='application/json')
        try:
            patient = self.get_object()
            medical_staff = MedicalStaff.objects.get(id=id)
            patient_access = PatientAccess.objects.filter(idPatient=patient)
            patient_access = patient_access.filter(idMedicalStaff=medical_staff).first()
            if patient_access.access:
                patient_access.access = False
                patient_access.lostAt = now()
                patient_access.save()
                serializer = PatientAccessSerializer(patient_access)
                return Response(serializer.data, status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({'details': "ce medical staff n'a déjà pas d'accès"}, status=status.HTTP_208_ALREADY_REPORTED,
                                content_type='application/json')
        except MedicalStaff.DoesNotExist:
            return Response({'details': 'MedicalStaff not found'}, status=status.HTTP_404_NOT_FOUND)
        except Patient.DoesNotExist:
            return Response({'details': 'Patient not found'}, status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(
        operation_description="Permet de donner l'access d'un staff à un patient",
        responses={
            201: openapi.Response(description="Acess au patient cree"),
            204: openapi.Response(description="Accces déjà existant"),
            403: openapi.Response(description="Token invalide ou expiré"),
            404: openapi.Response(description="Access non existent"),
            400: openapi.Response(description="Bad request"),
        },
        manual_parameters=[
            openapi.Parameter('id', openapi.IN_PATH, description="ID dU medical staff concerné",
                              type=openapi.TYPE_INTEGER, required=True),
            auth_header_param
        ],
        tags=tags
    )
    @action(methods=['post'], detail=True, url_path='add-access/(?P<id>[^/.]+)', permission_classes=[PatientAccessPermission])
    def add_access(self, request, id=None, *args, **kwargs):
        if id is None:
            return Response({'details': "id du medical staff est requis"},
                            status=status.HTTP_400_BAD_REQUEST, content_type='application/json')
        try:
            patient = self.get_object()
            medical_staff = MedicalStaff.objects.get(id=id)
            patient_access = PatientAccess.objects.filter(idPatient=patient)
            patient_access = patient_access.filter(idMedicalStaff=medical_staff).first()
            if patient_access:
                patient_access.access = True
                patient_access.save()
                serializer = PatientAccessSerializer(patient_access)
                return Response(serializer.data, status=status.HTTP_204_NO_CONTENT)
            else:
                patient_access = PatientAccess.objects.create(idPatient=patient, idMedicalStaff=medical_staff, access=True, lostAt=now() + timedelta(weeks=2))
                serializer = PatientAccessSerializer(patient_access)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        except MedicalStaff.DoesNotExist:
            return Response({'details': 'MedicalStaff not found'}, status=status.HTTP_404_NOT_FOUND)
        except Patient.DoesNotExist:
            return Response({'details': 'Patient not found'}, status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(
        operation_description="Permet de lister les patients d'un docteur",
        responses={
            200: openapi.Response(description=" Liste des patients du docteur",
                                  schema=PatientSerializer(many=True)),
            404: openapi.Response(description="Docteur inexistant existent"),
            400: openapi.Response(description="Bad request"),
        },
        manual_parameters=[
            openapi.Parameter('id', openapi.IN_PATH, description="ID dU medical staff concerné",
                              type=openapi.TYPE_INTEGER, required=True),
            auth_header_param
        ],
        tags=tags
    )
    @action(methods=["get"], detail=False, url_path='doctor/(?P<id>[^/.]+)',
            permission_classes=[PatientPermission])
    def patient_doctor(self, request, id=None):
        try:
            medical_staff = MedicalStaff.objects.get(id=id)
            if medical_staff.role != "Doctor":
                return Response({"details": "le medical staff specifie n'est pas un docteur"},
                                status.HTTP_404_NOT_FOUND)
            # Récupérer les consultations effectuées par ce docteur
            consultations = Consultation.objects.filter(idMedicalStaffGiver=medical_staff)
            # Extraire les patients uniques ayant une consultation avec ce docteur
            patient_ids = consultations.values_list('idPatient', flat=True).distinct()
            patients = Patient.objects.filter(id__in=patient_ids)

            # Sérialiser les patients
            serializer = PatientSerializer(patients, many=True)
            return Response(serializer.data, status.HTTP_200_OK)
        except MedicalStaff.DoesNotExist:
            return Response({"details": "le docteur spécifé n'existe pas"}, status.HTTP_404_NOT_FOUND)