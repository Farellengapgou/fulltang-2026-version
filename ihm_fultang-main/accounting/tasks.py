from django.utils import timezone
from accounting.models import BudgetExercise, Account, AccountState
from datetime import datetime, timedelta
from celery import shared_task
from accounting.services.accounting_service import AccountingService
from accounting.models import AccountingPeriod


class AccountingTasks:
    """Tâches automatiques de comptabilité"""

    @staticmethod
    def monthly_depreciation():
        """Calcule les amortissements mensuels"""
        today = timezone.now().date()
        last_day_of_month = today.replace(day=1) + timedelta(days=32)
        last_day_of_month = last_day_of_month.replace(day=1) - timedelta(days=1)

        if today == last_day_of_month:
            AccountingService.create_depreciation_entries(today)

    @staticmethod
    def vat_calculation_reminder():
        """Rappel pour déclaration TVA"""
        today = timezone.now().date()
        if today.day == 10:  # Rappel le 10 de chaque mois
            # Envoyer notification aux comptables
            pass

    @staticmethod
    def period_close_reminder():
        """Rappel pour clôture mensuelle"""
        today = timezone.now().date()
        if today.day == 5:  # Rappel le 5 de chaque mois
            # Vérifier si la période précédente est clôturée
            last_month = today.replace(day=1) - timedelta(days=1)
            try:
                period = AccountingPeriod.objects.get(
                    year=last_month.year,
                    month=last_month.month
                )
                if period.state == 'OPEN':
                    # Envoyer alerte
                    pass
            except AccountingPeriod.DoesNotExist:
                # Créer la période automatiquement
                AccountingPeriod.objects.create(
                    year=last_month.year,
                    month=last_month.month
                )

@shared_task
def new_budget_exercise():
    print("Executing scheduled task now...")

    # Obtenir l'année en cours
    current_year = timezone.now().year

    # Vérifier s'il existe déjà un exercice budgétaire pour l'année en cours
    existing_exercise = BudgetExercise.objects.filter(start__year=current_year).exists()

    if existing_exercise:
        print(f"Budget exercise for {current_year} already exists. Skipping creation.")
        return  # Sortir de la fonction sans créer un nouvel exercice

    # Calculer les dates de début et de fin de l'exercice budgétaire
    start_date = timezone.now().replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    end_date = start_date.replace(month=12, day=31, hour=23, minute=59, second=59, microsecond=999)

    # Créer le nouvel exercice budgétaire
    budget_exercise = BudgetExercise.objects.create(
        start=start_date,
        end=end_date
    )

    # Parcourir tous les comptes existants et créer un AccountState pour chacun
    accounts = Account.objects.all()
    for account in accounts:
        AccountState.objects.create(
            amount=0,  # Initialiser le solde réel à 0
            budgetExercise=budget_exercise,
            account=account
        )

    print(f"New budget exercise created: {budget_exercise.id}")

    # This function will be executed at the scheduled time