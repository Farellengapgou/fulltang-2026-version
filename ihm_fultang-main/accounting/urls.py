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

# =============================================================================
# COMPTABILITÉ MATIÈRE - Imports
# =============================================================================
from accounting.api_views.stock_api_views.movements_api_view import StockMovementViewSet
from accounting.api_views.stock_api_views.receipts_api_view import GoodsReceiptNoteViewSet
from accounting.api_views.stock_api_views.issues_api_view import GoodsIssueNoteViewSet
from accounting.api_views.stock_api_views.inventories_api_view import InventoryViewSet
from accounting.api_views.stock_api_views.transfers_api_view import TransferNoteViewSet


# =============================================================================
# Configuration du routeur principal
# =============================================================================
router = DefaultRouter()
material_router = DefaultRouter()

# Comptabilité générale
router.register(r"acccount-state", AccountStateViewSet, basename="account-state")
router.register("budget-exercise", BudgetExerciseViewSet, basename="budget-exercise")
router.register(r"account", AccountViewSet, basename="account")
router.register(r"facture", FactureViewSet, basename="facture")
router.register(r"financial-operation", FinancialOperationViewSet, basename="financial-operation")
router.register(r"chart-of-accounts", ChartOfAccountsViewSet, basename="chartofaccounts")
router.register(r"journals", JournalViewSet, basename="journal")
router.register(r"journal-entries", JournalEntryViewSet, basename="journalentry")

# Comptabilité matière
material_router.register(r"movements", StockMovementViewSet, basename="stock-movements")
material_router.register(r"receipts", GoodsReceiptNoteViewSet, basename="goods-receipts")
material_router.register(r"issues", GoodsIssueNoteViewSet, basename="goods-issues")
material_router.register(r"inventories", InventoryViewSet, basename="inventories")
material_router.register(r"transfers", TransferNoteViewSet, basename="transfers")


# =============================================================================
# URL Patterns
# =============================================================================
urlpatterns = [
    path("statistics/", AccountingStatsAPI.as_view(), name="account-statistics"),
    path("invoice/total", InvoiceTotalAPI.as_view(), name="invoice-total"),
]

# Ajouter toutes les routes du router
urlpatterns += router.urls