from rest_framework.routers import DefaultRouter
from django.urls import path

from accounting.api_views.account_state_api_view import AccountStateViewSet
from accounting.api_views.accounting_stats import AccountingStatsAPI
from accounting.api_views.buget_exercise_api_view import BudgetExerciseViewSet
from accounting.api_views.account_api_view import AccountViewSet
from accounting.api_views.facture_api_view import FactureViewSet
from accounting.api_views.financial_operation_api_view import FinancialOperationViewSet
from accounting.api_views.chart_of_account_api_view import ChartOfAccountsViewSet
from accounting.api_views.journal_api_view import JournalViewSet
from accounting.api_views.journal_entry_api_view import JournalEntryViewSet
from accounting.api_views.invoice_total_api_view import InvoiceTotalAPI


# Configuration du routeur principal
router = DefaultRouter()


router = DefaultRouter()
router.register(r'acccount-state', AccountStateViewSet, basename='account-state')
router.register('budget-exercise', BudgetExerciseViewSet, basename='budget-exercise')
router.register(r'account', AccountViewSet, basename='account')
router.register(r'facture', FactureViewSet, basename='facture')
router.register(r'financial-operation', FinancialOperationViewSet, basename='financial-operation')


from accounting.api_views.financial_report_api_view import FinancialReportViewSet


# New Imports
from accounting.api_views.supplier_api_view import SupplierViewSet
from accounting.api_views.asset_api_view import FixedAssetViewSet
from accounting.api_views.inventory_api_view import InventoryViewSet
from accounting.api_views.payroll_api_view import PayrollViewSet
from accounting.api_views.vat_api_view import VATViewSet
from accounting.api_views.budget_api_view import BudgetViewSet
from accounting.api_views.bank_reconciliation_api_view import BankReconciliationViewSet

router.register(r'chart-of-accounts', ChartOfAccountsViewSet, basename='chartofaccounts')
router.register(r'journals', JournalViewSet, basename='journal')
router.register(r'journal-entries', JournalEntryViewSet, basename='journalentry')
router.register(r'reports', FinancialReportViewSet, basename='financial-reports')

# New ViewSets
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'fixed-assets', FixedAssetViewSet, basename='fixedasset')
router.register(r'inventory', InventoryViewSet, basename='inventory')
router.register(r'payroll', PayrollViewSet, basename='payroll')
router.register(r'vat', VATViewSet, basename='vat')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'bank-reconciliation', BankReconciliationViewSet, basename='bankreconciliation')

urlpatterns = [
    path('statistics/', AccountingStatsAPI.as_view(), name='account-statistics'),
]
urlpatterns += router.urls
urlpatterns += [path('invoice/total', InvoiceTotalAPI.as_view(), name='invoice-total')]