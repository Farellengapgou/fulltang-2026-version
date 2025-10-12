from django.contrib.auth.base_user import BaseUserManager
from django.utils import timezone
from django.apps import apps



class CustomManager(BaseUserManager):

    def _create_user(self, username, email, password, **extra_fields):
        """
        Create and save a user with the given username, email, and password.
        """
        if not username:
            raise ValueError('The given username must be set')

        if not email:
            raise ValueError('MedicalStaff must have an email address')

        """
        if not role:
            raise ValueError('MedicalStaff must have a role')

        if not cniNumber:
            raise ValueError('MedicalStaff must have a cniNumber')

        if not gender:
            raise ValueError('MedicalStaff must have a gender')
        """

        email = self.normalize_email(email)
        # Lookup the real model class from the global app registry so this
        # manager method can be used in migrations. This is fine because
        # managers are by definition working on the real model.
        GlobalUserModel = apps.get_model(self.model._meta.app_label, self.model._meta.object_name)
        username = GlobalUserModel.normalize_username(username)
        print(username)
        now = timezone.now()

        user = self.model(
            email=email,
            username=username,
            password=password,  # le mot de passe est Hashé dans la methode save du model
            date_joined=now,
            **extra_fields
        )
        user.save(using=self._db)
        return user


    def create_user(self, username, email, password, **extra_fields):
        #extra_fields.setdefault('is_staff', False)
        #extra_fields.setdefault('is_superuser', False)
        #extra_fields.setdefault('is_active', True)
        return self._create_user(username, email, password, **extra_fields)


    def create_superuser(self, username, email, password, **extra_fields):
        """
        Create and save a SuperUser with the given email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        # Ajouter des valeurs par défaut pour userType et role si elles ne sont pas fournies
        extra_fields.setdefault('userType', 'Medical')
        extra_fields.setdefault('role', 'Admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(username, email, password, **extra_fields)