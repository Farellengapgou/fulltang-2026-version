from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounting.permissions.accounting_staff_permissions import AccountingStaffPermission
from accounting.models import Facture


class InvoiceTotalAPI(APIView):
    """Endpoint alias pour /invoice/total renvoyant le nombre total de factures"""
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        return Response({"total": Facture.objects.count()})
