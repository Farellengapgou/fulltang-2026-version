from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils import timezone
from accounting.models import BudgetExercise, Account, AccountState, FinancialOperation
from accounting.permissions.accounting_staff_permissions import AccountingStaffPermission
from rest_framework.permissions import IsAuthenticated
from polyclinic.models import Bill


class AccountingStatsAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]
    @swagger_auto_schema(
        operation_description="Obtenir les statistiques comptables globales",
        manual_parameters=[
            openapi.Parameter(
                'start_date',
                openapi.IN_QUERY,
                description="Date de début (format YYYY-MM-DD)",
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_DATE
            ),
            openapi.Parameter(
                'end_date',
                openapi.IN_QUERY,
                description="Date de fin (format YYYY-MM-DD)",
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_DATE
            ),
            openapi.Parameter(
                'budget_exercise_id',
                openapi.IN_QUERY,
                description="ID de l'exercice budgétaire",
                type=openapi.TYPE_INTEGER
            )
        ],
        responses={
            200: openapi.Response(
                description="Statistiques comptables",
                examples={
                    "application/json": {
                        "budget_exercises": 5,
                        "accounts": {
                            "total": 12,
                            "by_status": {
                                "credit": 4,
                                "debit": 5,
                                "creance": 3
                            }
                        },
                        "account_states": {
                            "total": 45,
                            "by_exercise": {
                                "1": 10,
                                "2": 15,
                                "3": 20
                            }
                        },
                        "financial_operations": {
                            "total": 100,
                            "by_account": {
                                "1": 20,
                                "2": 30,
                                "3": 50
                            }
                        },
                        "bills": {
                            "total": 200,
                            "accounted": 150,
                            "not_accounted": 50,
                            "by_date_range": 30
                        }
                    }
                }
            ),
            400: openapi.Response(description="Paramètres invalides"),
            404: openapi.Response(description="Exercice budgétaire non trouvé")
        },
        tags=['accounting']
    )
    def get(self, request):
        # Récupération des paramètres
        start_date = self.parse_date(request.query_params.get('start_date'))
        end_date = self.parse_date(request.query_params.get('end_date'))
        budget_exercise_id = request.query_params.get('budget_exercise_id')

        # Validation de l'exercice budgétaire
        budget_exercise = None
        if budget_exercise_id:
            try:
                budget_exercise = BudgetExercise.objects.get(id=budget_exercise_id)
            except BudgetExercise.DoesNotExist:
                return Response(
                    {"error": "Exercice budgétaire non trouvé"},
                    status=status.HTTP_404_NOT_FOUND
                )

        # Calcul des statistiques
        stats = {
            "budget_exercises": self.get_budget_exercises_stats(),
            "accounts": self.get_accounts_stats(),
            "account_states": self.get_account_states_stats(budget_exercise),
            "financial_operations": self.get_financial_operations_stats(),
            "bills": self.get_bills_stats(start_date, end_date)
        }

        return Response(stats)

    def parse_date(self, date_str):
        if date_str:
            try:
                return timezone.datetime.strptime(date_str, "%Y-%m-%d").date()
            except (ValueError, TypeError):
                pass
        return None

    def get_budget_exercises_stats(self):
        return BudgetExercise.objects.count()

    def get_accounts_stats(self):
        return {
            "total": Account.objects.count(),
            "by_status": {
                status: Account.objects.filter(status=status).count()
                for status in dict(Account.STATUS_TYPE)
            }
        }

    def get_account_states_stats(self, budget_exercise):
        qs = AccountState.objects.all()
        if budget_exercise:
            qs = qs.filter(budgetExercise=budget_exercise)

        return {
            "total": qs.count(),
            "by_exercise": {
                str(ex.id): qs.filter(budgetExercise=ex).count()
                for ex in BudgetExercise.objects.all()
            }
        }

    def get_financial_operations_stats(self):
        return {
            "total": FinancialOperation.objects.count(),
            "by_account": {
                str(account.id): FinancialOperation.objects.filter(account=account).count()
                for account in Account.objects.all()
            }
        }

    def get_bills_stats(self, start_date, end_date):
        qs = Bill.objects.all()
        date_qs = qs

        if start_date and end_date:
            date_qs = qs.filter(date__date__range=(start_date, end_date))
        elif start_date:
            date_qs = qs.filter(date__date__gte=start_date)
        elif end_date:
            date_qs = qs.filter(date__date__lte=end_date)

        return {
            "total": qs.count(),
            "accounted": qs.filter(isAccounted=True).count(),
            "not_accounted": qs.filter(isAccounted=False).count(),
            "by_date_range": date_qs.count()
        }