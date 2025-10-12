from rest_framework import permissions


class ConsultationPermissions(permissions.BasePermission):
    def has_permission(self, request, view):
        print(f"permission check {request.user.role}")
        user = request.user
        if view.action in ["destroy"]:
            return user.is_authenticated and user.role == "Admin"
        elif view.action in ["list", "retrieve", "update", "partial_update"]:
            return user.is_authenticated and (user.role in ["Admin", "Receptionist", "Nurse", "Doctor", "Cashier"])
        elif view.action == "create":
            return user.is_authenticated and user.role in ["Admin", "Nurse", "Receptionist"]
        elif request.method in ["GET", "POST", "PUT", "PATCH"]:
            return user.is_authenticated and user.role in ["Admin", "Nurse", "Doctor", "Receptionist", "Cashier"]
        return False