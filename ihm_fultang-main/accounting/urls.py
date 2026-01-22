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
from accounting.api_views.financial_report_api_view import FinancialReportViewSet
from accounting.api_views.supplier_api_view import SupplierViewSet
from accounting.api_views.customer_api_view import CustomerViewSet
from accounting.api_views.asset_api_view import FixedAssetViewSet
from accounting.api_views.inventory_api_view import InventoryViewSet
from accounting.api_views.payroll_api_view import PayrollViewSet
from accounting.api_views.vat_api_view import VATViewSet
from accounting.api_views.budget_api_view import BudgetViewSet
from accounting.api_views.bank_reconciliation_api_view import BankReconciliationViewSet
from accounting.api_views.accounting_period_api_view import AccountingPeriodViewSet
from accounting.api_views.bank_account_api_view import BankAccountViewSet
from accounting.api_views.analytic_account_api_view import AnalyticAccountViewSet
from accounting.api_views.financial_ratio_api_view import FinancialRatioViewSet
from accounting.api_views.accounting_operation_api_view import AccountingOperationViewSet
from accounting.api_views.tax_rate_api_view import TaxRateViewSet
from accounting.api_views.tax_declaration_api_view import TaxDeclarationViewSet

router = DefaultRouter()

router.register(r'account-state', AccountStateViewSet, basename='account-state')
router.register(r'budget-exercise', BudgetExerciseViewSet, basename='budget-exercise')
router.register(r'account', AccountViewSet, basename='account')
router.register(r'facture', FactureViewSet, basename='facture')
router.register(r'financial-operation', FinancialOperationViewSet, basename='financial-operation')
router.register(r'chart-of-accounts', ChartOfAccountsViewSet, basename='chartofaccounts')
router.register(r'journals', JournalViewSet, basename='journal')
router.register(r'journal-entries', JournalEntryViewSet, basename='journalentry')
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'fixed-assets', FixedAssetViewSet, basename='fixedasset')
router.register(r'inventory', InventoryViewSet, basename='inventory')
router.register(r'payroll', PayrollViewSet, basename='payroll')
router.register(r'vat', VATViewSet, basename='vat')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'bank-reconciliation', BankReconciliationViewSet, basename='bankreconciliation')
router.register(r'periods', AccountingPeriodViewSet, basename='period')
router.register(r'bank-accounts', BankAccountViewSet, basename='bankaccount')
router.register(r'analytic-accounts', AnalyticAccountViewSet, basename='analyticaccount')
router.register(r'financial-ratios', FinancialRatioViewSet, basename='financialratio')
router.register(r'accounting-operations', AccountingOperationViewSet, basename='accountingoperation')
router.register(r'tax-rates', TaxRateViewSet, basename='taxrate')
router.register(r'tax-declarations', TaxDeclarationViewSet, basename='taxdeclaration')
router.register(r'reports', FinancialReportViewSet, basename='financialreports')

urlpatterns = [
    path('statistics/', AccountingStatsAPI.as_view(), name='account-statistics'),
    path('invoice/total', InvoiceTotalAPI.as_view(), name='invoice-total'),
]
urlpatterns += router.urls