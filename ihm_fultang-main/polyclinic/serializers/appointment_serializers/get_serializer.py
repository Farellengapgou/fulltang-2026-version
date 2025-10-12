from rest_framework.exceptions import ValidationError
from rest_framework import serializers
from polyclinic.models import Appointment
from polyclinic.serializers.patient_serializers import PatientSerializer


class AppointmentSerializer(serializers.ModelSerializer):
    idPatient = PatientSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = '__all__'
