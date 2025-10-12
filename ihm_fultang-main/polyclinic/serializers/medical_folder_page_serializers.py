from rest_framework import serializers
from polyclinic.models import MedicalFolderPage, Prescription, ExamRequest, Consultation, ExamResult
from polyclinic.serializers.exam_request_serializers import ExamRequestSerializer
from polyclinic.serializers.exam_result_serializers import ExamResultSerializer
from polyclinic.serializers.parameters_serializers import ParametersSerializer, ParametersCreateSerializer
from django.utils.timezone import now
from datetime import timedelta
from rest_framework.exceptions import ValidationError

from polyclinic.serializers.prescription_serializers import PrescriptionSerializer


class MedicalFolderPageSerializer(serializers.ModelSerializer):
    parameters = ParametersSerializer(required=False, many=False)
    prescriptions = serializers.SerializerMethodField()
    examRequests = serializers.SerializerMethodField()
    examResults = serializers.SerializerMethodField()


    class Meta:
        model = MedicalFolderPage
        fields = ["id", "pageNumber", "addDate", "nurseNote", "doctorNote", "diagnostic", "idMedicalFolder", "idMedicalStaff",
                  "parameters", "prescriptions", "examRequests", "examResults"]

    def get_prescriptions(self, obj):
        # Récupérer toutes les prescriptions associées à cette page
        conultation = Consultation.objects.filter(idMedicalFolderPage=obj).first()
        if conultation:
            prescriptions = Prescription.objects.filter(idConsultation=conultation)
            return PrescriptionSerializer(prescriptions, many=True).data
        else:
            return []

    def get_examRequests(self, obj):
        # Récupérer toutes les demandes d'examen associées à cette page
        conultation = Consultation.objects.filter(idMedicalFolderPage=obj).first()
        if conultation:
            exam_requests = ExamRequest.objects.filter(idConsultation=conultation)
            return ExamRequestSerializer(exam_requests, many=True).data
        else:
            return []

    def get_examResults(self, obj):
        return ExamResultSerializer(ExamResult.objects.filter(idMedicalFolderPage=obj), many=True).data

class MedicalFolderPageCreateSerializer(serializers.ModelSerializer):
    parameters = ParametersCreateSerializer(required=False)
    pageNumber = serializers.IntegerField(required=False)

    class Meta:
        model = MedicalFolderPage
        exclude = ['id']

    def create(self, validated_data):

        medical_folder = self.validated_data.get('idMedicalFolder')
        medical_staff = self.validated_data.get('idMedicalStaff')
        pageNumber = self.validated_data.get('pageNumber')
        automatic_creation = self.validated_data.pop('automaticCreation', False)

        if not medical_folder:
            raise ValidationError({"details": "Le dossier médical (idMedicalFolder) est requis."})

        if not pageNumber:
            raise ValidationError({"details": "La numero de la page est requis"})

        # 2 semaines en arrière
        two_weeks_ago = now() - timedelta(weeks=2)

        # Compter le nombre de pages créées pour ce dossier médical par l'infirmière dans les 2 dernières semaines
        recent_pages_count = MedicalFolderPage.objects.filter(
            idMedicalFolder=medical_folder,
            idMedicalStaff=medical_staff,
            addDate__gte=two_weeks_ago
        ).count()

        if recent_pages_count >= 2 and not automatic_creation:
            raise ValidationError(
                {"details": "Vous ne pouvez créer que 2 pages médicales pour ce dossier médical toutes les 2 semaines."}
            )
        else:
            return MedicalFolderPage.objects.create(idMedicalFolder=medical_folder, pageNumber=pageNumber, idMedicalStaff=medical_staff)

