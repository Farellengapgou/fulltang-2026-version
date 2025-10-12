from rest_framework import serializers
from authentication.models import MedicalStaff


class MedicalStaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalStaff
        exclude = ['password']
        #fields = ['id', 'first_name', 'last_name']

    """
    def validate(self, attrs):
        if self.instance is None and 'id' in attrs:  # L'objet est en création
            raise serializers.ValidationError("L'ID ne peut pas être défini manuellement.")
        return attrs
    """

class MedicalStaffCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)  # Ne pas inclure le mot de passe dans la réponse
    userType = serializers.ChoiceField(required=True, choices=["Medical", "Accountant"])

    class Meta:
        model = MedicalStaff
        exclude = ['id', 'is_superuser', 'groups', 'user_permissions', 'date_joined', 'last_login']

