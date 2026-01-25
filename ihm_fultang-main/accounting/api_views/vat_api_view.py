from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounting.models_financier import VAT
from accounting.serializers import VATSerializer


class VATViewSet(viewsets.ModelViewSet):
    queryset = VAT.objects.all()
    serializer_class = VATSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['vat_type', 'status']
    search_fields = ['vat_number']
    ordering_fields = ['-period_year', '-period_month']

    @action(detail=True, methods=['post'])
    def declare(self, request, pk=None):
        vat = self.get_object()
        vat.status = 'DECLARED'
        vat.save()
        return Response(self.get_serializer(vat).data)