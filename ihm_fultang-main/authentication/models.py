from django.contrib.auth.models import AbstractUser
from authentication.managers import CustomManager
from django.db import models
from django.core.exceptions import ValidationError

SEXE = [
    ('Male', 'Male'),
    ('Female', 'Female'),
]

USER_TYPE = [
    ('Medical', 'Medical'),
    ('Accountant', 'Accountant'),
]

ROLES = [
    ('NoRole', 'NoRole'),
    ('Doctor', 'Doctor'),
    ('Receptionist', 'Receptionist'),
    ('Admin', 'Admin'),
    ('Nurse', 'Nurse'),
    ('Labtech', 'Labtech'),
    ('HRM', 'HRM'),
    ('Pharmacist', 'Pharmacist'),
    ('Cashier', 'Cashier')
]

ROLES_ACCOUNTING = [
    ('NoRole', 'NoRole'),
    ('Accountant', 'Accountant'),
    ('Auditor', 'Auditor'),
    ('FinanceManager', 'FinanceManager'),
]


ACCESS_LEVELS = [
    ('Executive', 'Executive'),
    ('Lead', 'Lead'),
    ('Staff', 'Staff'),
]

TYPEDOCTOR = [
    ('Specialist', 'Specialist'),
    ('Ophtalmologist', 'Ophtalmologist'),
    ('Dentist', 'Dentist'),
]

# cette classe définie notre classe d'utilsateur par défaut
class MedicalStaff(AbstractUser):
    cniNumber = models.CharField(max_length=255, blank=True, default="")
    gender = models.CharField(max_length=50, choices=SEXE, default='Male', blank=True)
    phoneNumber = models.CharField(max_length=255, blank=True, default=" ")
    birthDate = models.DateField(blank=True, null=True, default="1982-01-01")
    address = models.CharField(max_length=255, blank=True, default="Yaounde - damas")
    userType = models.CharField(max_length=255, choices=USER_TYPE, default='Medical', null=False)
    role = models.CharField(max_length=20, choices=ROLES+ROLES_ACCOUNTING, default='NoRole')
    accessLevel = models.CharField(max_length=20, choices=ACCESS_LEVELS, default='Staff', null=False)

    objects = CustomManager()

    def save(self, *args, **kwargs):

        # Vérification de la correspondance entre userType et rôle
        medical_roles = [role[0] for role in ROLES]
        accounting_roles = [role[0] for role in ROLES_ACCOUNTING]

        if self.userType == "Medical" and self.role not in medical_roles:
            raise ValidationError(f"Le rôle '{self.role}' n'est pas autorisé pour le type d'utilisateur 'Medical'.")

        if self.userType == "Accountant" and self.role not in accounting_roles:
            raise ValidationError(f"Le rôle '{self.role}' n'est pas autorisé pour le type d'utilisateur 'Accountant'.")

        if self.pk:
            original_password = MedicalStaff.objects.get(pk=self.pk).password
            if self.password != original_password:  # Check if password has been updated
                self.set_password(self.password)
        else:
            # New instance
            self.set_password(self.password)

        if self.is_superuser:
            self.accessLevel = "Executive"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username
