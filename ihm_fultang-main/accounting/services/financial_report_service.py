from django.db.models import Sum
from accounting.models_financier import AccountState, ChartOfAccounts, JournalEntryLine

class FinancialReportService:
    
    @staticmethod
    def calculate_balance(prefixes):
        """Calculates balance for a list of account prefixes."""
        # Note: Ideally this should use AccountPeriodBalance for speed, 
        # but for now we aggregate from AccountState (which should be in sync) 
        # or ChartOfAccounts.get_balance() for real-time accuracy.
        
        balance = {"items": [], "total": 0}
        
        # Optimize: fetch all relevant accounts in one go
        accounts = ChartOfAccounts.objects.filter(code__regex=r'^(' + '|'.join(prefixes) + ')')
        
        # Group by prefix mapping to handle detailed accounts
        # For simplicity in this plan, we just iterate the prefixes asked
        
        total_amount = 0
        items = []
        
        for prefix in prefixes:
            # Get all accounts starting with this prefix
            prefix_accounts = accounts.filter(code__startswith=prefix)
            
            # Sum their balances
            prefix_total = 0
            for account in prefix_accounts:
                prefix_total += account.get_balance()
            
            # Only add if non-zero or if it's a major heading? 
            # For now, let's just return the aggregate for the prefix
            items.append({
                "accountNo": prefix,
                "label": FinancialReportService.get_account_label(prefix),
                "amount": float(prefix_total)
            })
            total_amount += float(prefix_total)
            
        balance["items"] = items
        balance["total"] = total_amount
        return balance

    @staticmethod
    def get_account_label(prefix):
        # This could be fetched from DB if a parent account exists, or use a static mapping
        # For dynamic purposes, let's try to find a matching account in DB
        account = ChartOfAccounts.objects.filter(code=prefix).first()
        if account:
            return account.label
        return ACCOUNTS_MAPPING.get(prefix, f"Unknown Account {prefix}")

    @staticmethod
    def get_balance_sheet_data(year=None):
        # Asset Prefixes (OHADA)
        # 2: Immobilisations
        immobilized_active = FinancialReportService.calculate_balance([str(i) for i in range(20, 29)])
        # 3: Socks, 4: Creances (Active)
        circulant_active = FinancialReportService.calculate_balance([str(i) for i in range(30, 49) if not str(i).startswith('40') and not str(i).startswith('42') and not str(i).startswith('43') and not str(i).startswith('44')]) 
        # Simplified logic for 4: usually 41 is active, 40 is passive.
        # Let's use strict ranges for MVP
        
        # Assets
        immobilized = FinancialReportService.calculate_balance([str(i) for i in range(20, 30)]) # Class 2
        stocks = FinancialReportService.calculate_balance([str(i) for i in range(30, 40)]) # Class 3
        receivables = FinancialReportService.calculate_balance(['41', '45', '46', '47']) # 41 Clients, etc.
        treasury_active = FinancialReportService.calculate_balance(['50', '51', '52', '53', '54', '57', '58']) # Class 5 Debit

        # Liabilities
        equity = FinancialReportService.calculate_balance(['10', '11', '12', '13', '14']) # Class 1 (partial)
        financial_debts = FinancialReportService.calculate_balance(['16', '17']) 
        payables = FinancialReportService.calculate_balance(['40', '42', '43', '44', '48', '49']) # Class 4 Credit
        treasury_passive = FinancialReportService.calculate_balance(['56']) # Class 5 Credit (Banque solde créditeur needs finer check, assuming 56 for overdrafts)

        total_active = immobilized['total'] + stocks['total'] + receivables['total'] + treasury_active['total']
        total_passive = equity['total'] + financial_debts['total'] + payables['total'] + treasury_passive['total']

        return {
            "data": [
                {"category": "IMMOBILIZED ACTIVE", "items": immobilized['items'], "total": immobilized['total']},
                {"category": "CIRCULANT ACTIVE", "items": stocks['items'] + receivables['items'], "total": stocks['total'] + receivables['total']},
                {"category": "ACTIVE TREASURY", "items": treasury_active['items'], "total": treasury_active['total']},
                {"category": "EQUITY", "items": equity['items'], "total": equity['total']},
                {"category": "FINANCIAL DEBT", "items": financial_debts['items'], "total": financial_debts['total']},
                {"category": "CIRCULANT PASSIVE", "items": payables['items'], "total": payables['total']},
                {"category": "PASSIVE TREASURY", "items": treasury_passive['items'], "total": treasury_passive['total']},
                {
                    "parameters": [
                        {"item": "Total Active", "value": total_active},
                        {"item": "Total Passive", "value": total_passive},
                        {"item": "Net Result", "value": total_active - (total_passive - equity['items'][-1]['amount'] if equity['items'] else 0)} # Approximation
                    ]
                }
            ]
        }

    @staticmethod
    def get_income_statement_data(year=None):
        # Expenses (Class 6)
        purchases = FinancialReportService.calculate_balance(['60'])
        transport = FinancialReportService.calculate_balance(['61'])
        services = FinancialReportService.calculate_balance(['62', '63'])
        personnel = FinancialReportService.calculate_balance(['66'])
        taxes = FinancialReportService.calculate_balance(['64'])
        financial_charges = FinancialReportService.calculate_balance(['67'])
        depreciation = FinancialReportService.calculate_balance(['68'])
        other_charges = FinancialReportService.calculate_balance(['65', '69'])
        
        all_charges = [purchases, transport, services, personnel, taxes, financial_charges, depreciation, other_charges]
        total_charges = sum(c['total'] for c in all_charges)
        charges_items = []
        for c in all_charges:
            charges_items.extend(c['items'])

        # Revenue (Class 7)
        sales = FinancialReportService.calculate_balance(['70'])
        subsidies = FinancialReportService.calculate_balance(['71'])
        other_products = FinancialReportService.calculate_balance(['72', '73', '74', '75'])
        financial_products = FinancialReportService.calculate_balance(['77'])
        
        all_products = [sales, subsidies, other_products, financial_products]
        total_products = sum(p['total'] for p in all_products)
        products_items = []
        for p in all_products:
            products_items.extend(p['items'])

        net_result = total_products - total_charges

        return {
            "data": [
                {"category": "CHARGES", "items": charges_items, "total": total_charges},
                {"category": "PRODUCTS", "items": products_items, "total": total_products},
                {
                    "parameters": [
                        {"item": "Total Charges", "value": total_charges},
                        {"item": "Total Products", "value": total_products},
                        {"item": "Net Result", "value": net_result}
                    ]
                }
            ]
        }

# Static mapping for labels if not found in DB
ACCOUNTS_MAPPING = {
    "10": "Capital",
    "11": "Réserves",
    "12": "Report à nouveau",
    "13": "Résultat net de l'exercice",
    "16": "Emprunts et dettes assimilées",
    "20": "Immobilisations incorporelles",
    "21": "Immobilisations corporelles",
    "24": "Matériel",
    "30": "Stocks de marchandises",
    "40": "Fournisseurs",
    "41": "Clients",
    "44": "État et collectivités publiques",
    "52": "Banque",
    "57": "Caisse",
    "60": "Achats",
    "66": "Charges de personnel",
    "70": "Ventes"
}
