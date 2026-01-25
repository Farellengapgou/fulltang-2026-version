from rest_framework.routers import DefaultRouter
from django.urls import path

# =============================================================================
# ======================= FINANCIAL ACCOUNTING ================================
# =============================================================================
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

# =============================================================================
# ======================= MATERIAL ACCOUNTING =================================
# =============================================================================
from accounting.api_views.stock_api_views.movements_api_view import StockMovementViewSet
from accounting.api_views.stock_api_views.receipts_api_view import GoodsReceiptNoteViewSet
from accounting.api_views.stock_api_views.issues_api_view import GoodsIssueNoteViewSet
from accounting.api_views.stock_api_views.inventories_api_view import InventoryViewSet
from accounting.api_views.stock_api_views.transfers_api_view import TransferNoteViewSet
from accounting.api_views.stock_api_views.category_api_view import CategoryViewSet
from accounting.api_views.stock_api_views.family_api_view import FamilyViewSet
from accounting.api_views.stock_api_views.depot_api_view import DepotViewSet
from accounting.api_views.stock_api_views.supplier_api_view import SupplierViewSet
from accounting.api_views.stock_api_views.stocklevels_api_view import StockLevelViewSet
from accounting.api_views.stock_api_views.article_api_view import ArticleViewSet
from accounting.api_views.stock_api_views.batch_api_view import BatchViewSet
from accounting.api_views.stock_api_views.dashboard_api_view import MaterialDashboardAPIView
from accounting.api_views.stock_api_views.reports_api_view import *

# =============================================================================
# Configuration du routeur principal
# =============================================================================
financial_router = DefaultRouter()
material_router = DefaultRouter()

# =============================================================================
# ======================= FINANCIAL ACCOUNTING ================================
# =============================================================================
financial_router.register(r'account-state', AccountStateViewSet, basename='account-state')
financial_router.register(r'budget-exercise', BudgetExerciseViewSet, basename='budget-exercise')
financial_router.register(r'account', AccountViewSet, basename='account')
financial_router.register(r'facture', FactureViewSet, basename='facture')
financial_router.register(r'financial-operation', FinancialOperationViewSet, basename='financial-operation')
financial_router.register(r'chart-of-accounts', ChartOfAccountsViewSet, basename='chartofaccounts')
financial_router.register(r'journals', JournalViewSet, basename='journal')
financial_router.register(r'journal-entries', JournalEntryViewSet, basename='journalentry')
financial_router.register(r'suppliers', SupplierViewSet, basename='supplier')
financial_router.register(r'customers', CustomerViewSet, basename='customer')
financial_router.register(r'fixed-assets', FixedAssetViewSet, basename='fixedasset')
financial_router.register(r'inventory', InventoryViewSet, basename='inventory')
financial_router.register(r'payroll', PayrollViewSet, basename='payroll')
financial_router.register(r'vat', VATViewSet, basename='vat')
financial_router.register(r'budgets', BudgetViewSet, basename='budget')
financial_router.register(r'bank-reconciliation', BankReconciliationViewSet, basename='bankreconciliation')
financial_router.register(r'periods', AccountingPeriodViewSet, basename='period')
financial_router.register(r'bank-accounts', BankAccountViewSet, basename='bankaccount')
financial_router.register(r'analytic-accounts', AnalyticAccountViewSet, basename='analyticaccount')
financial_router.register(r'financial-ratios', FinancialRatioViewSet, basename='financialratio')
financial_router.register(r'accounting-operations', AccountingOperationViewSet, basename='accountingoperation')
financial_router.register(r'tax-rates', TaxRateViewSet, basename='taxrate')
financial_router.register(r'tax-declarations', TaxDeclarationViewSet, basename='taxdeclaration')
financial_router.register(r'reports', FinancialReportViewSet, basename='financialreports')

# =============================================================================
# ======================= MATERIAL ACCOUNTING =================================
# =============================================================================
material_router.register(r"movements", StockMovementViewSet, basename="stock-movements")
material_router.register(r"receipts", GoodsReceiptNoteViewSet, basename="goods-receipts")
material_router.register(r"issues", GoodsIssueNoteViewSet, basename="goods-issues")
material_router.register(r"inventories", InventoryViewSet, basename="inventories")
material_router.register(r"transfers", TransferNoteViewSet, basename="transfers")
material_router.register(r'articles', ArticleViewSet, basename='material-articles')
material_router.register(r'categories', CategoryViewSet, basename='material-categories')
material_router.register(r'families', FamilyViewSet, basename='material-families')
material_router.register(r'warehouses', DepotViewSet, basename='material-warehouses')
material_router.register(r'suppliers', SupplierViewSet, basename='material-suppliers')
material_router.register(r'stock-levels', StockLevelViewSet, basename='material-stock-levels')
material_router.register(r'batches', BatchViewSet, basename='material-batches')

# =============================================================================
# ========================== URL PATTERNS =====================================
# =============================================================================
material_urlpatterns = [
    # Dashboard
    path('dashboard/overview/', MaterialDashboardAPIView.as_view(), name='material-dashboard-overview'),
    
    # Stocks
    path('report/stock-status/', StockStatusReportAPI.as_view(), name='stock-status-report'),
    path('report/stock-valuation/', StockValuationReportAPI.as_view(), name='stock-valuation-report'),
    path('report/stock-aging/', StockAgingReportAPI.as_view(), name='stock-aging-report'),

    # Mouvements
    path('report/movements-summary/', MovementsSummaryReportAPI.as_view()),
    path('report/consumption-analysis/', ConsumptionAnalysisReportAPI.as_view()),
    path('report/rotation-rate/', RotationRateReportAPI.as_view()),
    path('report/stock-card/', StockCardReportAPI.as_view()),
    path('report/perpetual-inventory/', PerpetualInventoryReportAPI.as_view()),

    # Achats
    path('report/purchases-by-supplier/', PurchasesBySupplierReportAPI.as_view()),
    path('report/purchases-by-category/', PurchasesByCategoryReportAPI.as_view()),
    path('report/purchases-by-period/', PurchasesByPeriodReportAPI.as_view()),

    # Inventaires
    path('report/inventory-variances/', InventoryVariancesReportAPI.as_view()),
    path('report/inventory-history/', InventoryHistoryReportAPI.as_view()),

    # Péremption
    path('report/expiry-alerts/', ExpiryAlertsReportAPI.as_view()),
    path('report/expired-products/', ExpiredProductsReportAPI.as_view()),

    # Alertes
    path('report/low-stock-alerts/', LowStockAlertsReportAPI.as_view()),
    path('report/out-of-stock-alerts/', OutOfStockAlertsReportAPI.as_view()),

    # Exports
    path('report/export/excel/', ExportExcelReportAPI.as_view()),
    path('report/export/pdf/', ExportPDFReportAPI.as_view()),
    path('report/export/csv/', ExportCSVReportAPI.as_view()),
]
material_urlpatterns += material_router.urls

urlpatterns = [
    path('statistics/', AccountingStatsAPI.as_view(), name='account-statistics'),
    path('invoice/total', InvoiceTotalAPI.as_view(), name='invoice-total'),
]
urlpatterns += financial_router.urls