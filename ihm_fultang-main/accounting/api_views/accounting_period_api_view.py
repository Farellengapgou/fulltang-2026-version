from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounting.models_financier import AccountingPeriod
from accounting.serializers import AccountingPeriodSerializer


class AccountingPeriodViewSet(viewsets.ModelViewSet):
    queryset = AccountingPeriod.objects.all()
    serializer_class = AccountingPeriodSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['year', 'month', 'state']
    ordering = ['-year', '-month']

    @action(detail=False, methods=['get'])
    def current_period(self, request):
        from datetime import datetime
        now = datetime.now()
        period = AccountingPeriod.objects.filter(
            year=now.year, 
            month=now.month
        ).first()
        
        if not period:
            period = AccountingPeriod.objects.create(
                year=now.year,
                month=now.month
            )
        
        serializer = self.get_serializer(period)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def close_period(self, request, pk=None):
        period = self.get_object()
        try:
            period.close_period(request.user)
            serializer = self.get_serializer(period)
            return Response(serializer.data)
        except ValueError as e:
            return Response({'error': str(e)}, status=400)
    
    @action(detail=True, methods=['post'])
    def open_period(self, request, pk=None):
        """Reopen a closed accounting period"""
        period = self.get_object()
        if period.state == 'LOCKED':
            return Response({'error': 'Cannot reopen a locked period'}, status=400)
        
        period.state = 'OPEN'
        period.save()
        serializer = self.get_serializer(period)
        return Response(serializer.data)