from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounting.models_financier import TaxDeclaration
from accounting.serializers import TaxDeclarationSerializer


class TaxDeclarationViewSet(viewsets.ModelViewSet):
    queryset = TaxDeclaration.objects.all()
    serializer_class = TaxDeclarationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['declaration_type', 'status']
    search_fields = ['declaration_type']
    ordering_fields = ['-period_year', '-period_month']

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        declaration = self.get_object()
        from datetime import date
        declaration.status = 'SUBMITTED'
        declaration.submission_date = date.today()
        declaration.save()
        return Response(self.get_serializer(declaration).data)

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        declaration = self.get_object()
        from datetime import date
        declaration.status = 'PAID'
        declaration.payment_date = date.today()
        declaration.save()
        return Response(self.get_serializer(declaration).data)