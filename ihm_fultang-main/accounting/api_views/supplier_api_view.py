from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounting.models_financier import Supplier
from accounting.serializers import SupplierSerializer


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['is_active', 'supplier_type']
    search_fields = ['code', 'name', 'email']
    ordering_fields = ['name', 'created_at']

    @action(detail=False, methods=['get'])
    def active_suppliers(self, request):
        suppliers = Supplier.objects.filter(is_active=True)
        serializer = self.get_serializer(suppliers, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def balance(self, request, pk=None):
        supplier = self.get_object()
        return Response({
            'id': supplier.id,
            'code': supplier.code,
            'name': supplier.name,
            'balance': supplier.get_balance()
        })