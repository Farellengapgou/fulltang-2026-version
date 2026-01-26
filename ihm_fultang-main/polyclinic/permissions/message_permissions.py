from rest_framework.permissions import BasePermission

class MessagePermission(BasePermission):

    def has_permission(self, request, view):
        user = request.user
        if view.action in ["create"]:
            return user.is_authenticated and user.role == "Admin"
        elif view.action in ["list", "retrieve", "update", "partial_update", "destroy"]:
            return user.is_authenticated
        return False

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role == "Admin":
            return True
        if view.action in ["retrieve", "update", "partial_update", "destroy"]:
            return obj.idMedicalStaff == user
        return False
