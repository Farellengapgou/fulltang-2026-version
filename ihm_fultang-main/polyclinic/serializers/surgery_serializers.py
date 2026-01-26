from rest_framework import serializers

from polyclinic.models import Surgery


class SurgerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Surgery
        fields = [
            'id',
            'created_at',
            'scheduled_at',
            'note',
            'is_active',
            'reminder_sent',
            'idPatient',
            'idMedicalStaff',
        ]
