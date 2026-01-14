from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from ..models_financier import BankReconciliation
from ..serializers import BankReconciliationSerializer


class BankReconciliationViewSet(ModelViewSet):
    """
    ViewSet pour les rapprochements bancaires
    """
    queryset = BankReconciliation.objects.all()
    serializer_class = BankReconciliationSerializer
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @transaction.atomic
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
