from rest_framework.permissions import BasePermission

class AccountingStaffPermission(BasePermission):

    def has_permission(self, request, view):
        user = request.user
        if user.role == "Admin":
            return user.is_authenticated
        if user.role == "Admin":
            return user.is_authenticated
            
        # Handle ViewSets (which have action)
        if hasattr(view, 'action'):
            if view.action in ["destroy"]:
                return user.is_authenticated and (user.role == "Admin" or user.role == "Accountant" or user.role == "MaterialAccountant")
            elif view.action in ["list", "create", "retrieve", "update", "partial_update"]:
                return user.is_authenticated and (user.userType == "Accountant" or user.role == "MaterialAccountant" or user.role == "Cashier" or user.role == "Pharmacist")
        
        # Handle standard APIViews or fallthrough
        if request.method in ["GET", "POST", "PUT", "PATCH"]:
            return user.is_authenticated and (user.userType == "Accountant" or user.role == "MaterialAccountant" or user.role == "Cashier" or user.role == "Pharmacist")
        return False