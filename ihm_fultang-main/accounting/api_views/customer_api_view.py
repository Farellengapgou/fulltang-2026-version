from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounting.models_financier import Customer
from accounting.serializers import CustomerSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['is_active', 'customer_type']
    search_fields = ['code', 'name', 'email']
    ordering_fields = ['name', 'created_at']

    @action(detail=False, methods=['get'])
    def active_customers(self, request):
        customers = Customer.objects.filter(is_active=True)
        serializer = self.get_serializer(customers, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def balance(self, request, pk=None):
        customer = self.get_object()
        return Response({
            'id': customer.id,
            'code': customer.code,
            'name': customer.name,
            'balance': customer.account.get_balance() if customer.account else 0
        })