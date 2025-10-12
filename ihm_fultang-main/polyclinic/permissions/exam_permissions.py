from rest_framework import permissions

class ExamPermissions(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if view.action in ["list", "retrieve"]:
            return user.is_authenticated
        elif view.action in ["update", "partial_update", "create", "destroy"]:
            return user.is_authenticated and (user.role in ["Admin"])
        elif request.method in ["GET", "POST", "PUT", "PATCH"]:
            return user.is_authenticated
        return False