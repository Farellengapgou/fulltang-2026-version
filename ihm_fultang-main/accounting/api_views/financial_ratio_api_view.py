from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounting.models_financier import FinancialRatio
from accounting.serializers import FinancialRatioSerializer


class FinancialRatioViewSet(viewsets.ModelViewSet):
    queryset = FinancialRatio.objects.all()
    serializer_class = FinancialRatioSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['ratio_type']
    search_fields = ['ratio_name']
    ordering_fields = ['-calculation_date', 'ratio_name']

    @action(detail=False, methods=['post'])
    def calculate(self, request):
        # Implement ratio calculation logic
        pass