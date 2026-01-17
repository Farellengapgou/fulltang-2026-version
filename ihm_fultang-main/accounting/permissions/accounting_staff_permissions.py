from rest_framework.permissions import BasePermission

class AccountingStaffPermission(BasePermission):

    def has_permission(self, request, view):
        user = request.user
        if user.role == "Admin":
            return user.is_authenticated
        action = getattr(view, 'action', None)
        
        if action in ["destroy"]:
            return user.is_authenticated and (user.role == "Admin" or user.role == "Accountant" or user.role == "MaterialAccountant")
        elif action in ["list", "create", "retrieve", "update", "partial_update"]:
            return user.is_authenticated and (user.userType == "Accountant" or user.role == "Cashier" or user.role == "MaterialAccountant")
        elif request.method in ["GET", "POST", "PUT", "PATCH"]:
            return user.is_authenticated and (user.userType == "Accountant" or user.role == "Cashier" or user.role == "MaterialAccountant")
        return False