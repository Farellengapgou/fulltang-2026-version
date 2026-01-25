from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from accounting.models_financier import AnalyticAccount
from accounting.serializers import AnalyticAccountSerializer


class AnalyticAccountViewSet(viewsets.ModelViewSet):
    queryset = AnalyticAccount.objects.all()
    serializer_class = AnalyticAccountSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['is_active']
    search_fields = ['code', 'name']
    ordering_fields = ['code', 'name']