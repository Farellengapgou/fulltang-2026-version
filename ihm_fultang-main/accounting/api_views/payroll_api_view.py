from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounting.models_financier import Payroll
from accounting.serializers import PayrollSerializer


class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'payroll_period']
    search_fields = ['payroll_number']
    ordering_fields = ['-period_end', 'payroll_number']

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        payroll = self.get_object()
        payroll.status = 'APPROVED'
        payroll.save()
        return Response(self.get_serializer(payroll).data)

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        payroll = self.get_object()
        payroll.status = 'PAID'
        payroll.save()
        return Response(self.get_serializer(payroll).data)

    @action(detail=True, methods=['post'])
    def generate_payslips(self, request, pk=None):
        payroll = self.get_object()
        # Generate payslips logic
        return Response({'status': 'Payslips generated'})