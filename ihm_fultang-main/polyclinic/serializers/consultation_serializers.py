from rest_framework import serializers
from polyclinic.models import Consultation, ConsultationType, PatientAccess, MedicalFolderPage, TYPEDOCTOR, Appointment
from authentication.models import MedicalStaff
from polyclinic.serializers.appointment_serializers.get_serializer import AppointmentSerializer
from polyclinic.serializers.medical_folder_page_serializers import MedicalFolderPageSerializer
from authentication.serializers.medical_staff_serializers import MedicalStaffSerializer
from polyclinic.serializers.patient_serializers import PatientSerializer
from rest_framework.exceptions import ValidationError
from django.utils.timezone import now, timedelta

class ConsultationSerializer(serializers.ModelSerializer):
    idMedicalFolderPage = MedicalFolderPageSerializer(read_only=True)
    idPatient = PatientSerializer(read_only=True)
    idMedicalStaffSender = MedicalStaffSerializer(read_only=True)
    idMedicalStaffGiver = MedicalStaffSerializer(read_only=True)
    appointments = serializers.SerializerMethodField()
    class Meta:
        model = Consultation
        fields = '__all__'


    def get_appointments(self, obj):
        return AppointmentSerializer(Appointment.objects.filter(idConsultation=obj), many=True).data

class ConsultationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consultation
        exclude = ['consultationPrice', 'idConsultationType']

    def create(self, validated_data):
        try:
            # avant de sauvegarder la consultation on met à jour la page en question en BD avec les notes
            medical_folder_page = MedicalFolderPage.objects.get(id=validated_data['idMedicalFolderPage'].id)
            medical_folder_page.nurseNote = validated_data['consultationReason']
            medical_folder_page.save()
            # on donne les acces au medecin
            medical_staff = validated_data['idMedicalStaffGiver']
            if medical_staff.role not in ["Doctor"] + TYPEDOCTOR:
                raise ValidationError({"details": "le medical staff giver doit être un docteur"})
            patient_access = PatientAccess.objects.filter(idPatient=validated_data['idPatient'])
            patient_access = patient_access.filter(idMedicalStaff=medical_staff).first()
            if patient_access:
                patient_access.access = True  #### il faut penser à gerer les problèmes du delai d'un acces
                patient_access.save()
            else:
                PatientAccess.objects.create(idPatient=validated_data['idPatient'], idMedicalStaff=medical_staff,
                                                              access=True, lostAt=now() + timedelta(weeks=2))

            # place à la consultation elle même
            medical_staff_giver = validated_data['idMedicalStaffGiver']
            medical_staff_sender = validated_data.pop('idMedicalStaffSender')
            consultation_type = ConsultationType.objects.filter(typeDoctor=medical_staff_giver.role).first()
            if consultation_type:
                consultation = Consultation.objects.create(idMedicalStaffSender=medical_staff_sender, **validated_data)
                if consultation_type.price > 0:
                    consultation.consultationPrice = consultation_type.price
                    consultation.idConsultationType = consultation_type.id
                    consultation.save()
                return consultation
            else:
                consultation = Consultation.objects.create(idMedicalStaffSender=medical_staff_sender, **validated_data)
                return consultation
        except MedicalStaff.DoesNotExist:
            raise ValidationError({"detail": "Vous devez donnez votre id en idMedicalStaffSender"})
        except MedicalFolderPage.DoesNotExist:
            raise ValidationError({"details": "La page dont l'id est fourni n'existe pas"})


    def update(self, instance, validated_data):
        if 'state' in validated_data:
            if validated_data.get('state') != "Pending" and instance.paymentStatus == "Invalid":
                raise ValidationError({"details": "on ne peut pas changer l'etat d'une consultation non payé"})
        return super().update(instance, validated_data)



