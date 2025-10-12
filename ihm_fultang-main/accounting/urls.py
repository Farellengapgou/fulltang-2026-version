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


# Configuration du routeur principal
router = DefaultRouter()


router = DefaultRouter()
router.register(r'acccount-state', AccountStateViewSet, basename='account-state')
router.register('budget-exercise', BudgetExerciseViewSet, basename='budget-exercise')
router.register(r'account', AccountViewSet, basename='account')
router.register(r'facture', FactureViewSet, basename='facture')
router.register(r'financial-operation', FinancialOperationViewSet, basename='financial-operation')


# Nouveau
router.register(r'chart-of-accounts', ChartOfAccountsViewSet, basename='chartofaccounts')
router.register(r'journals', JournalViewSet, basename='journal')
router.register(r'journal-entries', JournalEntryViewSet, basename='journalentry')

urlpatterns = [path('statistics/', AccountingStatsAPI.as_view(), name='account-statistics'),]
urlpatterns += router.urls