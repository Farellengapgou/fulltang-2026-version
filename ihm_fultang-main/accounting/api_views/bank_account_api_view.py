from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounting.models_financier import BankAccount
from accounting.serializers import BankAccountSerializer


class BankAccountViewSet(viewsets.ModelViewSet):
    queryset = BankAccount.objects.all()
    serializer_class = BankAccountSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['is_active']
    search_fields = ['bank_name', 'account_number']
    ordering_fields = ['bank_name']

    @action(detail=False, methods=['get'])
    def active_accounts(self, request):
        accounts = BankAccount.objects.filter(is_active=True)
        serializer = self.get_serializer(accounts, many=True)
        return Response(serializer.data)