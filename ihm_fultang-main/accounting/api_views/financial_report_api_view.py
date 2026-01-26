from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from decimal import Decimal
from datetime import date, datetime

from accounting.models_financier import ChartOfAccounts, JournalEntry, AccountingPeriod
from accounting.serializers import ChartOfAccountsSerializer


class FinancialReportViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def balance_sheet(self, request):
        """Bilan comptable"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            start_date = datetime.fromisoformat(start_date).date()
        if end_date:
            end_date = datetime.fromisoformat(end_date).date()

        assets = ChartOfAccounts.objects.filter(account_type='ASSET')
        liabilities = ChartOfAccounts.objects.filter(account_type='LIABILITY')
        equity = ChartOfAccounts.objects.filter(account_type='EQUITY')

        return Response({
            'assets': [
                {
                    'id': a.id,
                    'code': a.code,
                    'label': a.label,
                    'balance': float(a.get_balance(start_date, end_date))
                }
                for a in assets
            ],
            'liabilities': [
                {
                    'id': l.id,
                    'code': l.code,
                    'label': l.label,
                    'balance': float(l.get_balance(start_date, end_date))
                }
                for l in liabilities
            ],
            'equity': [
                {
                    'id': e.id,
                    'code': e.code,
                    'label': e.label,
                    'balance': float(e.get_balance(start_date, end_date))
                }
                for e in equity
            ]
        })

    @action(detail=False, methods=['get'])
    def income_statement(self, request):
        """Compte de résultat"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            start_date = datetime.fromisoformat(start_date).date()
        if end_date:
            end_date = datetime.fromisoformat(end_date).date()

        revenues = ChartOfAccounts.objects.filter(account_type='REVENUE')
        expenses = ChartOfAccounts.objects.filter(account_type='EXPENSE')

        total_revenue = sum(r.get_balance(start_date, end_date) for r in revenues)
        total_expense = sum(e.get_balance(start_date, end_date) for e in expenses)
        net_income = total_revenue - total_expense

        return Response({
            'revenues': [
                {
                    'id': r.id,
                    'code': r.code,
                    'label': r.label,
                    'balance': float(r.get_balance(start_date, end_date))
                }
                for r in revenues
            ],
            'expenses': [
                {
                    'id': e.id,
                    'code': e.code,
                    'label': e.label,
                    'balance': float(e.get_balance(start_date, end_date))
                }
                for e in expenses
            ],
            'net_income': float(net_income),
            'total_revenue': float(total_revenue),
            'total_expense': float(total_expense)
        })

    @action(detail=False, methods=['get'])
    def trial_balance(self, request):
        """Balance de vérification"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            start_date = datetime.fromisoformat(start_date).date()
        if end_date:
            end_date = datetime.fromisoformat(end_date).date()

        accounts = ChartOfAccounts.objects.filter(is_active=True)
        total_debit = Decimal('0')
        total_credit = Decimal('0')

        accounts_data = []
        for account in accounts:
            balance = account.get_balance(start_date, end_date)
            
            if balance >= 0:
                total_debit += balance
                accounts_data.append({
                    'id': account.id,
                    'code': account.code,
                    'label': account.label,
                    'debit': float(balance),
                    'credit': 0
                })
            else:
                total_credit += abs(balance)
                accounts_data.append({
                    'id': account.id,
                    'code': account.code,
                    'label': account.label,
                    'debit': 0,
                    'credit': float(abs(balance))
                })

        return Response({
            'accounts': accounts_data,
            'total_debit': float(total_debit),
            'total_credit': float(total_credit),
            'is_balanced': abs(total_debit - total_credit) < Decimal('0.01')
        })