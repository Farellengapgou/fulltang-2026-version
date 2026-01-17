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

# =============================================================================
# ======================= MATERIAL ACCOUNTING =================================
# =============================================================================
from accounting.api_views.stock_api_views.movements_api_view import StockMovementViewSet
from accounting.api_views.stock_api_views.receipts_api_view import GoodsReceiptNoteViewSet
from accounting.api_views.stock_api_views.issues_api_view import GoodsIssueNoteViewSet
from accounting.api_views.stock_api_views.inventories_api_view import InventoryViewSet
from accounting.api_views.stock_api_views.transfers_api_view import TransferNoteViewSet
from accounting.api_views.stock_api_views.category_api_view import CategoryViewSet
from accounting.api_views.stock_api_views.depot_api_view import DepotViewSet
from accounting.api_views.stock_api_views.supplier_api_view import SupplierViewSet
from accounting.api_views.stock_api_views.stocklevels_api_view import StockLevelViewSet
from accounting.api_views.stock_api_views.batch_api_view import BatchViewSet
from accounting.api_views.stock_api_views.reports_api_view import *


# =============================================================================
# Configuration du routeur principal
# =============================================================================
financial_router = DefaultRouter()
material_router = DefaultRouter()

# =============================================================================
# ======================= FINANCIAL ACCOUNTING ================================
# =============================================================================
financial_router.register(r"acccount-state", AccountStateViewSet, basename="account-state")
financial_router.register("budget-exercise", BudgetExerciseViewSet, basename="budget-exercise")
financial_router.register(r"account", AccountViewSet, basename="account")
financial_router.register(r"facture", FactureViewSet, basename="facture")
financial_router.register(r"financial-operation", FinancialOperationViewSet, basename="financial-operation")
financial_router.register(r"chart-of-accounts", ChartOfAccountsViewSet, basename="chartofaccounts")
financial_router.register(r"journals", JournalViewSet, basename="journal")
financial_router.register(r"journal-entries", JournalEntryViewSet, basename="journalentry")

# =============================================================================
# ======================= MATERIAL ACCOUNTING =================================
# =============================================================================
material_urlpatterns = [
    # Stocks
    path('report/stock-status/', StockStatusReportAPI.as_view(), name='stock-status-report'),
    path('report/stock-valuation/', StockValuationReportAPI.as_view(), name='stock-valuation-report'),
    path('report/stock-aging/', StockAgingReportAPI.as_view(), name='stock-aging-report'),

    # Mouvements
    path('report/movements-summary/', MovementsSummaryReportAPI.as_view()),
    path('report/consumption-analysis/', ConsumptionAnalysisReportAPI.as_view()),
    path('report/rotation-rate/', RotationRateReportAPI.as_view()),

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
material_router.register(r"movements", StockMovementViewSet, basename="stock-movements")
material_router.register(r"receipts", GoodsReceiptNoteViewSet, basename="goods-receipts")
material_router.register(r"issues", GoodsIssueNoteViewSet, basename="goods-issues")
material_router.register(r"inventories", InventoryViewSet, basename="inventories")
material_router.register(r"transfers", TransferNoteViewSet, basename="transfers")
material_router.register(r'categories', CategoryViewSet, basename='material-categories')
material_router.register(r'warehouses', DepotViewSet, basename='material-warehouses')
material_router.register(r'suppliers', SupplierViewSet, basename='material-suppliers')
material_router.register(r'stock-levels', StockLevelViewSet, basename='material-stock-levels')
material_router.register(r'batches', BatchViewSet, basename='material-batches')

# =============================================================================
# ========================== URL PATTERNS =====================================
# =============================================================================
urlpatterns = [
    path("statistics/", AccountingStatsAPI.as_view(), name="account-statistics"),
    path("invoice/total", InvoiceTotalAPI.as_view(), name="invoice-total"),
]
urlpatterns += financial_router.urls
material_urlpatterns += material_router.urls
