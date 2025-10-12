from rest_framework import serializers
from polyclinic.models import Hospitalisation

class HospitalisationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospitalisation
        fields = '__all__'