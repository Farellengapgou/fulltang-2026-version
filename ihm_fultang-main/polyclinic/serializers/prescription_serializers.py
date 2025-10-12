from rest_framework import serializers
from polyclinic.models import Prescription, PrescriptionDrug
from polyclinic.serializers.prescription_drug_serializers import PrescriptionDrugSerializer, PrescriptionDrugCreateSerializer
from rest_framework.exceptions import ValidationError

class PrescriptionSerializer(serializers.ModelSerializer):
    prescriptionDrug = serializers.SerializerMethodField()
    class Meta:
        model = Prescription
        fields = ["id", "addDate", "note", "idPatient", "idConsultation", "idMedicalStaff", "prescriptionDrug"]

    def get_prescriptionDrug(self, obj):
        prescriptions_drug = PrescriptionDrug.objects.filter(prescription=obj)
        return PrescriptionDrugSerializer(prescriptions_drug, many=True).data


class PrescriptionCreateSerializer(serializers.ModelSerializer):
    prescription_drugs = PrescriptionDrugCreateSerializer(many=True, required=False)

    class Meta:
        model = Prescription
        exclude = ['id', 'addDate']

    def create(self, validated_data):
        if 'idConsultation' not in validated_data:
            raise ValidationError({"details": "la consultation est requise"})

        if not validated_data.get('prescription_drugs'):
            raise serializers.ValidationError({"detail": "prescription drugs is required"})

        prescription_drugs = validated_data['prescription_drugs']
        prescription = Prescription.objects.create(
            note=validated_data.pop('note', None),
            idPatient=validated_data['idPatient'],
            idConsultation=validated_data['idConsultation'],
            idMedicalStaff=validated_data['idMedicalStaff']
        )
        for item in prescription_drugs:
            PrescriptionDrug.objects.create(prescription=prescription, **item)

        return prescription
