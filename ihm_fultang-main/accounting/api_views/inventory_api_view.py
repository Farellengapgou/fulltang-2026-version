from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounting.models_financier import Inventory
from accounting.serializers import InventorySerializer


class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['is_active', 'inventory_type']
    search_fields = ['inventory_number', 'name']
    ordering_fields = ['inventory_number', 'created_at']

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        low_stock_items = Inventory.objects.filter(
            quantity__lte=models.F('reorder_level'),
            is_active=True
        )
        serializer = self.get_serializer(low_stock_items, many=True)
        return Response(serializer.data)