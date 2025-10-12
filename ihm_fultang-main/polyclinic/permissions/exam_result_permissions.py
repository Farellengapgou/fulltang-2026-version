from rest_framework import permissions


class ExamResultPermissions(permissions.BasePermission):
    def has_permission(self, request, view):
        print(f"permission check {request.user.role}")
        user = request.user
        if view.action in ["destroy"]:
            return user.is_authenticated and user.role == "Admin"
        elif view.action in ["list", "retrieve", "update", "partial_update", "create"]:
            return user.is_authenticated and (user.role in ["Admin", "Receptionist", "Nurse", "Cashier", "Accountant", "Pharmacist", "Labtech"])
        elif request.method in ["GET", "POST", "PUT", "PATCH"]:
            return user.is_authenticated
        return False