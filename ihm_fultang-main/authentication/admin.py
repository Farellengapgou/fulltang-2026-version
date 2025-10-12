from django.contrib import admin
from .models import MedicalStaff

# Register your models here.
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import MedicalStaff

@admin.register(MedicalStaff)
class MedicalStaffAdmin(UserAdmin):
    list_display = ('username', 'email', 'userType', 'role', 'is_active', 'is_superuser')
    list_filter = ('userType', 'role', 'is_active', 'is_superuser')
    search_fields = ('username', 'email', 'role')
    ordering = ('username',)

    fieldsets = (
        (_('Informations personnelles'), {'fields': ('username', 'email', 'password')}),
        (_('Informations professionnelles'), {'fields': ('userType', 'role', 'phoneNumber', 'cniNumber')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Dates importantes'), {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (_('Création utilisateur'), {
            'classes': ('wide',),
            'fields': (
            'username', 'email', 'password1', 'password2', 'userType', 'role', 'is_active', 'is_staff', 'is_superuser'),
        }),
    )