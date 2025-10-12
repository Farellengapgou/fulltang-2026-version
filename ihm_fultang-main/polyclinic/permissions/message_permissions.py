from rest_framework.permissions import BasePermission

class MessagePermission(BasePermission):

    def has_permission(self, request, view):
        user = request.user
        if view.action in ["destroy"]:
            return user.is_authenticated and user.role == "Admin"
        elif view.action in ["list", "create", "retrieve", "update", "partial_update"]:
            return user.is_authenticated and (user.role == "Admin" or user.role == "Receptionist")
        return False

    def has_object_permission(self, request, view, obj):
        user = request.user
        # Autoriser un utilisateur avec le rôle 'Admin' pour toutes les actions
        if user.role == "Admin":
            return True
        elif user.role == "Receptionist" and view.action != "destroy":
            return True
        # Autoriser un utilisateur à accéder uniquement à ses propres messages
        elif view.action in ["retrieve", "update", "partial_update"]:
            return obj.idMedicalStaff == user
        return False