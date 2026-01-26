from rest_framework import serializers
from authentication.models import MedicalStaff, ROLES, ROLES_ACCOUNTING


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

    def validate_username(self, value):
        qs = MedicalStaff.objects.filter(username=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(f"The username '{value}' is already taken. Please choose a different one.")
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long.")
        return value

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email address is required.")
        qs = MedicalStaff.objects.filter(email=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(f"The email '{value}' is already associated with another account.")
        return value

    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters long.")
        return value

    def validate_role(self, value):
        if value == 'NoRole':
            raise serializers.ValidationError("Please select a valid specialisation.")
        return value

    def validate_cniNumber(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("ID card number is required.")
        qs = MedicalStaff.objects.filter(cniNumber=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(f"The ID card number '{value}' is already registered.")
        return value

    def validate_phoneNumber(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Phone number is required.")
        return value

    def validate(self, attrs):
        user_type = attrs.get('userType')
        role = attrs.get('role')

        if user_type and role:
            medical_roles = [r[0] for r in ROLES]
            accounting_roles = [r[0] for r in ROLES_ACCOUNTING]

            if user_type == "Medical" and role not in medical_roles:
                raise serializers.ValidationError({
                    "role": f"The role '{role}' is not allowed for Medical staff type."
                })
            if user_type == "Accountant" and role not in accounting_roles:
                raise serializers.ValidationError({
                    "role": f"The role '{role}' is not allowed for Accountant staff type."
                })

        return attrs

