from rest_framework.permissions import BasePermission
from polyclinic.models import PatientAccess

class PatientPermission(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if view.action in ["destroy"]:
            return user.is_authenticated and user.role == "Admin"
        elif view.action in ["list", "retrieve", "update", "partial_update"]:
            return user.is_authenticated and (user.role == "Receptionist" or user.role == "Admin" or user.role == "Nurse")
        elif view.action in ["create"]:
            return user.is_authenticated and (user.role == "Admin" or user.role == "Receptionist")
        elif request.method in ["GET", "POST", "PUT", "PATCH"]:
            return user.is_authenticated
        return False

    def has_object_permission(self, request, view, obj):
        print(f"permission check {request.user.role}")
        user = request.user
        # Autoriser un utilisateur avec le rôle 'Admin' pour toutes les actions
        if user.role == "Admin":
            return True
        elif user.role == "Receptionist" and view.action != "destroy":
            return True
        elif user.role == "Nurse" and view.action not in ["destroy", "create"]:
            return True
        elif view.action in ["list", "retrieve", "update", "partial_update"] or request.method in ["GET", "POST", "PUT", "PATCH"]:
            return PatientAccess.objects.filter(
                    idPatient=obj,
                    idMedicalStaff=user,
                    access=True
                ).exists()
        elif user.role == "Nurse" and view.action not in ["create", "destroy"]:
            return True
        return False