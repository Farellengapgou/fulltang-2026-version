from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from accounting.models_financier import AccountingOperation
from accounting.serializers import AccountingOperationSerializer


class AccountingOperationViewSet(viewsets.ModelViewSet):
    queryset = AccountingOperation.objects.all()
    serializer_class = AccountingOperationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['operation_type']
    search_fields = ['operation_type']
    ordering_fields = ['-created_at']