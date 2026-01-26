from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounting.models_financier import Budget, BudgetLine
from accounting.serializers import BudgetSerializer, BudgetLineSerializer


class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['is_active', 'is_approved', 'fiscal_year']
    search_fields = ['name']
    ordering_fields = ['-fiscal_year', 'name']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        budget = self.get_object()
        budget.is_approved = True
        budget.approved_by = request.user
        from django.utils import timezone
        budget.approved_at = timezone.now()
        budget.save()
        return Response(self.get_serializer(budget).data)

    @action(detail=True, methods=['get'])
    def lines(self, request, pk=None):
        budget = self.get_object()
        lines = BudgetLine.objects.filter(budget=budget)
        serializer = BudgetLineSerializer(lines, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def create_line(self, request, pk=None):
        budget = self.get_object()
        serializer = BudgetLineSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(budget=budget)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)