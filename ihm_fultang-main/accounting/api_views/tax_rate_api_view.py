from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from accounting.models_financier import TaxRate
from accounting.serializers import TaxRateSerializer


class TaxRateViewSet(viewsets.ModelViewSet):
    queryset = TaxRate.objects.all()
    serializer_class = TaxRateSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['tax_type', 'is_active']
    search_fields = ['name']
    ordering_fields = ['name', 'rate']