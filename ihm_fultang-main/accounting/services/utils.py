class FinancialReports:
    """Générateur de rapports financiers"""

    @staticmethod
    def generate_balance_sheet(as_of_date):
        """Génère un bilan comptable"""
        balance_sheet = {
            'assets': {},
            'liabilities': {},
            'equity': {}
        }

        # Actifs (classes 1-5)
        asset_accounts = ChartOfAccounts.objects.filter(
            account_class__in=['1', '2', '3', '4', '5'],
            is_detailed=True
        )

        for account in asset_accounts:
            balance = account.get_balance(end_date=as_of_date)
            if balance != 0:
                if account.account_class in ['1', '2']:
                    balance_sheet['assets'][account.code] = {
                        'label': account.label,
                        'balance': balance
                    }
                elif account.account_class in ['3', '4', '5']:
                    balance_sheet['assets'][account.code] = {
                        'label': account.label,
                        'balance': balance
                    }

                # Passifs et capitaux propres
                liability_accounts = ChartOfAccounts.objects.filter(
                    account_class__in=['1', '4'],
                    account_type__in=['LIABILITY', 'EQUITY'],
                    is_detailed=True
                )

                for account in liability_accounts:
                    balance = account.get_balance(end_date=as_of_date)
                    if balance != 0:
                        if account.account_type == 'LIABILITY':
                            balance_sheet['liabilities'][account.code] = {
                                'label': account.label,
                                'balance': balance
                            }
                        else:
                            balance_sheet['equity'][account.code] = {
                                'label': account.label,
                                'balance': balance
                            }

                return balance_sheet

    @staticmethod
    def generate_income_statement(start_date, end_date):
        """Génère un compte de résultat"""
        income_statement = {
            'revenues': {},
            'expenses': {},
            'net_income': 0
        }

        # Produits (classe 7)
        revenue_accounts = ChartOfAccounts.objects.filter(
            account_class='7',
            is_detailed=True
        )

        total_revenues = 0
        for account in revenue_accounts:
            balance = account.get_balance(start_date, end_date)
            if balance != 0:
                income_statement['revenues'][account.code] = {
                    'label': account.label,
                    'amount': balance
                }
                total_revenues += balance

        # Charges (classe 6)
        expense_accounts = ChartOfAccounts.objects.filter(
            account_class='6',
            is_detailed=True
        )

        total_expenses = 0
        for account in expense_accounts:
            balance = account.get_balance(start_date, end_date)
            if balance != 0:
                income_statement['expenses'][account.code] = {
                    'label': account.label,
                    'amount': balance
                }
                total_expenses += balance

        income_statement['net_income'] = total_revenues - total_expenses
        return income_statement