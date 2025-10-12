from rest_framework import serializers
from polyclinic.models import PrescriptionDrug
from polyclinic.serializers.polyclinic_product_serializer import PolyclinicProductSerializer


class PrescriptionDrugSerializer(serializers.ModelSerializer):
    medicament = PolyclinicProductSerializer(read_only=True)
    class Meta:
        model = PrescriptionDrug
        fields = '__all__'


class PrescriptionDrugCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrescriptionDrug
        exclude = ['id', 'prescription']

