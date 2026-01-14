from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounting.permissions.accounting_staff_permissions import AccountingStaffPermission
from accounting.services.financial_report_service import FinancialReportService
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class FinancialReportViewSet(ViewSet):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]
    
    @swagger_auto_schema(
        operation_summary="Get Balance Sheet (Bilan)",
        responses={200: openapi.Response("Balance Sheet Data")}
    )
    @action(detail=False, methods=['get'], url_path='balance-sheet')
    def balance_sheet(self, request):
        data = FinancialReportService.get_balance_sheet_data()
        return Response(data)

    @swagger_auto_schema(
        operation_summary="Get Income Statement (Compte de Résultat)",
        responses={200: openapi.Response("Income Statement Data")}
    )
    @action(detail=False, methods=['get'], url_path='income-statement')
    def income_statement(self, request):
        data = FinancialReportService.get_income_statement_data()
        return Response(data)
