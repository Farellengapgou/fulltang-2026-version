from rest_framework import serializers
from polyclinic.models import ConsultationType

class ConsultationTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultationType
        fields = '__all__'