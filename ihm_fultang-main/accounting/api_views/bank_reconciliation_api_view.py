from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounting.models_financier import BankReconciliation
from accounting.serializers import BankReconciliationSerializer


class BankReconciliationViewSet(viewsets.ModelViewSet):
    queryset = BankReconciliation.objects.all()
    serializer_class = BankReconciliationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['is_reconciled']
    search_fields = ['bank_account__bank_name']
    ordering_fields = ['-reconciliation_date']

    @action(detail=True, methods=['post'])
    def reconcile(self, request, pk=None):
        reconciliation = self.get_object()
        is_reconciled = reconciliation.check_reconciliation()
        reconciliation.is_reconciled = is_reconciled
        reconciliation.save()
        return Response({
            'is_reconciled': is_reconciled,
            'adjusted_balance': float(reconciliation.calculate_adjusted_balance()),
            'book_balance': float(reconciliation.book_balance)
        })