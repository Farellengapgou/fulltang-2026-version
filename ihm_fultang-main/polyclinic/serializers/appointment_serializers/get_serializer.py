from rest_framework.exceptions import ValidationError
from rest_framework import serializers
from polyclinic.models import Appointment
from polyclinic.serializers.patient_serializers import PatientSerializer
from authentication.serializers.medical_staff_serializers import MedicalStaffSerializer


class AppointmentSerializer(serializers.ModelSerializer):
    idPatient = PatientSerializer(read_only=True)
    idMedicalStaff = MedicalStaffSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = '__all__'
