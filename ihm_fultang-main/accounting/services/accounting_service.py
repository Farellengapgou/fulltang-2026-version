from django.db import models, transaction
from django.utils import timezone
from django.db.models import Sum, Q
from ..models import ChartOfAccounts, JournalEntry, JournalEntryLine, Journal, Asset, AccountingPeriod, Customer, AccountPeriodBalance
from decimal import Decimal

# Modèles de services pour intégration
class AccountingService:
    """Service pour opérations comptables automatiques"""
    
    @staticmethod
    @transaction.atomic
    def create_consultation_entry(consultation):
        """Crée l'écriture comptable pour une consultation"""
        journal = Journal.objects.get(code='VTE')  # Journal des ventes
        
        entry = JournalEntry.objects.create(
            journal=journal,
            entry_date=consultation.consultationDate.date(),
            description=f"Consultation {consultation.idPatient} - {consultation.idMedicalStaffGiver}",
            consultation=consultation,
            created_by=consultation.idMedicalStaffSender
        )
        
        # Ligne débit client
        client_account = consultation.patient.customer.account
        JournalEntryLine.objects.create(
            journal_entry=entry,
            sequence=1,
            account=client_account,
            label=f"Consultation {consultation.idPatient}",
            debit_amount=consultation.consultationPrice,
            partner_customer=consultation.patient.customer
        )
        
        # Ligne crédit produit
        revenue_account = ChartOfAccounts.objects.get(code='7011')
        JournalEntryLine.objects.create(
            journal_entry=entry,
            sequence=2,
            account=revenue_account,
            label=f"Consultation {consultation.idPatient}",
            credit_amount=consultation.consultationPrice
        )

        entry.update_totals(commit=False)
        entry.post(validated_by=consultation.idMedicalStaffSender)
        return entry
    
    @staticmethod
    @transaction.atomic
    def create_customer_entry(bill, customer):
        """Crée l'écriture pour une facture client"""
        journal = Journal.objects.get(code='VTE')
        
        entry = JournalEntry.objects.create(
            journal=journal,
            entry_date=bill.createdAt.date(),
            description=f"Facture {bill.billCode} - {customer.name}",
            bill=bill,
            created_by=bill.operator
        )
        
        # Débit Client (411)
        JournalEntryLine.objects.create(
            journal_entry=entry,
            sequence=1,
            account=customer.account,
            label=f"Facture {bill.billCode}",
            debit_amount=bill.amountTotal,
            partner_customer=customer
        )
        
        # Crédit Ventes (701)
        revenue_account = ChartOfAccounts.objects.get(code='7011')
        JournalEntryLine.objects.create(
            journal_entry=entry,
            sequence=2,
            account=revenue_account,
            label=f"Vente {bill.billCode}",
            credit_amount=bill.amountTotal
        )

        entry.update_totals(commit=False)
        entry.post(validated_by=bill.operator)
        return entry

    @staticmethod
    @transaction.atomic
    def create_payment_entry(bill, payment_amount, payment_method='CASH'):
        """Crée l'écriture d'encaissement"""
        journal = Journal.objects.get(code='CAI' if payment_method == 'CASH' else 'BQ')
        
        entry = JournalEntry.objects.create(
            journal=journal,
            entry_date=timezone.now().date(),
            description=f"Encaissement facture {bill.billCode}",
            bill=bill,
            created_by=bill.operator
        )
        
        # Ligne débit trésorerie
        cash_account = ChartOfAccounts.objects.get(
            code='5711' if payment_method == 'CASH' else '5121'
        )
        JournalEntryLine.objects.create(
            journal_entry=entry,
            sequence=1,
            account=cash_account,
            label=f"Encaissement {bill.billCode}",
            debit_amount=payment_amount
        )
        
        # Ligne crédit client
        client_account = bill.customer.account
        JournalEntryLine.objects.create(
            journal_entry=entry,
            sequence=2,
            account=client_account,
            label=f"Encaissement {bill.billCode}",
            credit_amount=payment_amount,
            partner_customer=bill.customer
        )

        entry.update_totals(commit=False)
        entry.post(validated_by=bill.operator)
        return entry
    
    @staticmethod
    @transaction.atomic
    def create_supplier_invoice_entry(supplier, invoice_amount, vat_amount=0):
        """Crée l'écriture pour facture fournisseur"""
        journal = Journal.objects.get(code='ACH')  # Journal des achats
        
        entry = JournalEntry.objects.create(
            journal=journal,
            entry_date=timezone.now().date(),
            description=f"Facture {supplier.name}",
            created_by=supplier.created_by
        )
        
        # Ligne débit charge
        expense_account = ChartOfAccounts.objects.get(code='6031')  # Achats médicaments
        JournalEntryLine.objects.create(
            journal_entry=entry,
            sequence=1,
            account=expense_account,
            label=f"Achat {supplier.name}",
            debit_amount=invoice_amount,
            partner_supplier=supplier
        )
        
        # Ligne débit TVA si applicable
        if vat_amount > 0:
            vat_account = ChartOfAccounts.objects.get(code='4451')
            JournalEntryLine.objects.create(
                journal_entry=entry,
                sequence=2,
                account=vat_account,
                label="TVA déductible",
                debit_amount=vat_amount
            )
        
        # Ligne crédit fournisseur
        JournalEntryLine.objects.create(
            journal_entry=entry,
            sequence=3,
            account=supplier.account,
            label=f"Facture {supplier.name}",
            credit_amount=invoice_amount + vat_amount,
            partner_supplier=supplier
        )
        
        entry.update_totals(commit=False)
        entry.post(validated_by=supplier.created_by)
        return entry

    @staticmethod
    @transaction.atomic
    def create_depreciation_entries(period_date):
        """Crée les écritures d'amortissement mensuelles"""
        entries_created = []
        
        for asset in Asset.objects.filter(is_active=True):
            monthly_depreciation = asset.calculate_annual_depreciation() / 12
            
            if monthly_depreciation > 0:
                journal = Journal.objects.get(code='OD')
                
                entry = JournalEntry.objects.create(
                    journal=journal,
                    entry_date=period_date,
                    description=f"Amortissement {asset.name}",
                    created_by=asset.created_by
                )
                
                # Ligne débit charge
                JournalEntryLine.objects.create(
                    journal_entry=entry,
                    sequence=1,
                    account=asset.expense_account,
                    label=f"Dotation amortissement {asset.name}",
                    debit_amount=monthly_depreciation
                )
                
                # Ligne crédit amortissement cumulé
                JournalEntryLine.objects.create(
                    journal_entry=entry,
                    sequence=2,
                    account=asset.depreciation_account,
                    label=f"Amortissement {asset.name}",
                    credit_amount=monthly_depreciation
                )
                
                entry.update_totals(commit=False)
                entry.post(validated_by=asset.created_by)
                entries_created.append(entry)

        return entries_created

    @staticmethod
    def get_grand_livre(start_date, end_date, account_code=None, page=1, page_size=100):
        """Génère le Grand Livre avec pagination et numéro de pièce"""
        accounts = ChartOfAccounts.objects.filter(is_detailed=True)
        if account_code:
            accounts = accounts.filter(code__startswith=account_code)
        
        result = []
        for account in accounts:
            lines_query = JournalEntryLine.objects.filter(
                account=account,
                journal_entry__entry_date__gte=start_date,
                journal_entry__entry_date__lte=end_date,
                journal_entry__state='POSTED'
            ).select_related('journal_entry').order_by('journal_entry__entry_date', 'journal_entry__voucher_number')
            
            total_lines = lines_query.count()
            if total_lines > 0:
                # Pagination logic
                start = (page - 1) * page_size
                end = start + page_size
                lines = lines_query[start:end]

                # Solde initial
                initial_lines = JournalEntryLine.objects.filter(
                    account=account,
                    journal_entry__entry_date__lt=start_date,
                    journal_entry__state='POSTED'
                )
                totals_init = initial_lines.aggregate(d=Sum('debit_amount'), c=Sum('credit_amount'))
                init_debit = totals_init['d'] or Decimal('0')
                init_credit = totals_init['c'] or Decimal('0')
                
                # Correction OHADA : Le signe du solde initial dépend de la classe
                if account.account_class in ['2', '3', '5', '6']:
                    initial_balance = init_debit - init_credit
                else:
                    initial_balance = init_credit - init_debit

                result.append({
                    'account': account,
                    'initial_balance': initial_balance,
                    'lines': [{
                        'date': l.journal_entry.entry_date,
                        'voucher': l.journal_entry.voucher_number,
                        'label': l.label,
                        'debit': l.debit_amount,
                        'credit': l.credit_amount
                    } for l in lines],
                    'total_debit': lines_query.aggregate(Sum('debit_amount'))['debit_amount__sum'] or Decimal('0'),
                    'total_credit': lines_query.aggregate(Sum('credit_amount'))['credit_amount__sum'] or Decimal('0'),
                })
        return result

    @staticmethod
    def get_balance(start_date, end_date):
        """Génère la balance des comptes (6 colonnes OHADA)"""
        accounts = ChartOfAccounts.objects.all().order_by('code')
        balance_data = []
        
        for account in accounts:
            # On utilise get_balance() qui est maintenant optimisé via AccountPeriodBalance
            # Mais pour la balance à 6 colonnes, on a besoin du détail Débit/Crédit
            
            # Ouverture
            open_lines = JournalEntryLine.objects.filter(
                account=account, journal_entry__entry_date__lt=start_date, journal_entry__state='POSTED'
            )
            open_debit = open_lines.aggregate(Sum('debit_amount'))['debit_amount__sum'] or Decimal('0')
            open_credit = open_lines.aggregate(Sum('credit_amount'))['credit_amount__sum'] or Decimal('0')
            
            # Mouvements
            move_lines = JournalEntryLine.objects.filter(
                account=account, journal_entry__entry_date__range=[start_date, end_date], journal_entry__state='POSTED'
            )
            move_debit = move_lines.aggregate(Sum('debit_amount'))['debit_amount__sum'] or Decimal('0')
            move_credit = move_lines.aggregate(Sum('credit_amount'))['credit_amount__sum'] or Decimal('0')
            
            total_debit = open_debit + move_debit
            total_credit = open_credit + move_credit
            
            final_debit = Decimal('0')
            final_credit = Decimal('0')
            if total_debit > total_credit:
                final_debit = total_debit - total_credit
            else:
                final_credit = total_credit - total_debit
                
            if open_debit or open_credit or move_debit or move_credit:
                balance_data.append({
                    'code': account.code,
                    'label': account.label,
                    'opening': {'debit': open_debit, 'credit': open_credit},
                    'movements': {'debit': move_debit, 'credit': move_credit},
                    'final': {'debit': final_debit, 'credit': final_credit}
                })
        
        return balance_data

    @staticmethod
    def get_income_statement(start_date, end_date):
        """Génère le compte de résultat (Produits - Charges)"""
        expenses = ChartOfAccounts.objects.filter(code__startswith='6')
        revenues = ChartOfAccounts.objects.filter(code__startswith='7')
        
        total_expenses = Decimal('0')
        expense_details = []
        for acc in expenses:
            # Correction OHADA : Pour classe 6, solde = débit - crédit
            lines = JournalEntryLine.objects.filter(account=acc, journal_entry__entry_date__range=[start_date, end_date], journal_entry__state='POSTED')
            totals = lines.aggregate(d=Sum('debit_amount'), c=Sum('credit_amount'))
            balance = (totals['d'] or Decimal('0')) - (totals['c'] or Decimal('0'))
            if balance != 0:
                total_expenses += balance
                expense_details.append({'account': acc, 'amount': balance})
                
        total_revenues = Decimal('0')
        revenue_details = []
        for acc in revenues:
            # Correction OHADA : Pour classe 7, solde = crédit - débit
            lines = JournalEntryLine.objects.filter(account=acc, journal_entry__entry_date__range=[start_date, end_date], journal_entry__state='POSTED')
            totals = lines.aggregate(d=Sum('debit_amount'), c=Sum('credit_amount'))
            balance = (totals['c'] or Decimal('0')) - (totals['d'] or Decimal('0'))
            if balance != 0:
                total_revenues += balance
                revenue_details.append({'account': acc, 'amount': balance})
                
        return {
            'revenues': revenue_details,
            'total_revenues': total_revenues,
            'expenses': expense_details,
            'total_expenses': total_expenses,
            'net_income': total_revenues - total_expenses
        }

    @staticmethod
    def get_balance_sheet(as_of_date):
        """Génère le bilan SYSCOHADA (Actif / Passif)"""
        accounts = ChartOfAccounts.objects.filter(code__regex=r'^[12345]')
        assets = []
        liabilities = []
        equity = []
        
        total_assets = Decimal('0')
        total_liabilities = Decimal('0')
        total_equity = Decimal('0')
        
        for acc in accounts:
            lines = JournalEntryLine.objects.filter(account=acc, journal_entry__entry_date__lte=as_of_date, journal_entry__state='POSTED')
            totals = lines.aggregate(d=Sum('debit_amount'), c=Sum('credit_amount'))
            db = totals['d'] or Decimal('0')
            cr = totals['c'] or Decimal('0')
            
            if db == 0 and cr == 0: continue
            
            # Règle OHADA correcte : Classe + Sens
            if acc.account_class in ['2', '3']:
                # Actif pur
                assets.append({'account': acc, 'amount': db - cr})
                total_assets += (db - cr)
            elif acc.account_class == '1':
                # Passif pur (Equity)
                equity.append({'account': acc, 'amount': cr - db})
                total_equity += (cr - db)
            elif acc.account_class == '4':
                # Tiers (Sens dépendant)
                if db >= cr:
                    assets.append({'account': acc, 'amount': db - cr})
                    total_assets += (db - cr)
                else:
                    liabilities.append({'account': acc, 'amount': cr - db})
                    total_liabilities += (cr - db)
            elif acc.account_class == '5':
                # Trésorerie (Sens dépendant)
                if db >= cr:
                    assets.append({'account': acc, 'amount': db - cr})
                    total_assets += (db - cr)
                else:
                    liabilities.append({'account': acc, 'amount': cr - db})
                    total_liabilities += (cr - db)

        return {
            'assets': assets,
            'total_assets': total_assets,
            'liabilities': liabilities,
            'total_liabilities': total_liabilities,
            'equity': equity,
            'total_equity': total_equity,
            'is_balanced': total_assets == (total_liabilities + total_equity)
        }

    @staticmethod
    def get_general_ledger(account, start_date, end_date):
        """Service métier explicite pour le Grand Livre d'un compte"""
        return JournalEntryLine.objects.filter(
            account=account,
            journal_entry__state='POSTED',
            journal_entry__entry_date__range=[start_date, end_date]
        ).select_related('journal_entry').order_by('journal_entry__entry_date', 'journal_entry__voucher_number')

    @staticmethod
    @transaction.atomic
    def perform_annual_closing(year, user):
        """Clôture annuelle OHADA - Passage par compte 12 obligatoire"""
        journal_od = Journal.objects.get(code='OD')
        
        income_data = AccountingService.get_income_statement(
            start_date=timezone.datetime(year, 1, 1).date(),
            end_date=timezone.datetime(year, 12, 31).date()
        )
        net_income = income_data['net_income']
        
        closing_entry = JournalEntry.objects.create(
            journal=journal_od,
            entry_date=timezone.datetime(year, 12, 31).date(),
            description=f"Clôture annuelle {year} - Résultat de l'exercice (Compte 12)",
            created_by=user
        )
        
        # Correction OHADA : On utilise toujours le compte 121 (Bénéfice) ou 129 (Perte)
        result_account_code = '121' if net_income >= 0 else '129'
        result_account = ChartOfAccounts.objects.get(code=result_account_code)
        
        seq = 1
        # Vider les Produits (Débit 7)
        for rev in income_data['revenues']:
            JournalEntryLine.objects.create(
                journal_entry=closing_entry, sequence=seq, account=rev['account'],
                label=f"Solde compte {rev['account'].code}", debit_amount=rev['amount']
            )
            seq += 1
            
        # Vider les Charges (Crédit 6)
        for exp in income_data['expenses']:
            JournalEntryLine.objects.create(
                journal_entry=closing_entry, sequence=seq, account=exp['account'],
                label=f"Solde compte {exp['account'].code}", credit_amount=exp['amount']
            )
            seq += 1
            
        # Résultat
        if net_income >= 0:
            JournalEntryLine.objects.create(
                journal_entry=closing_entry, sequence=seq, account=result_account,
                label=f"Bénéfice net {year}", credit_amount=net_income
            )
        else:
            JournalEntryLine.objects.create(
                journal_entry=closing_entry, sequence=seq, account=result_account,
                label=f"Perte nette {year}", debit_amount=abs(net_income)
            )
            
        closing_entry.update_totals(commit=False)
        closing_entry.post(user)
        
        # Verrouillage définitif
        AccountingPeriod.objects.filter(year=year).update(state='LOCKED')
        
        # 4. Report à Nouveau (RAN) - OPTIMISÉ via AccountPeriodBalance
        opening_journal = Journal.objects.get(code='RAN')
        opening_date = timezone.datetime(year + 1, 1, 1).date()
        
        opening_entry = JournalEntry.objects.create(
            journal=opening_journal, entry_date=opening_date,
            description=f"RAN - Ouverture exercice {year + 1}", created_by=user
        )
        
        # Correction BAN : Utiliser les soldes matérialisés de la dernière période (Décembre)
        last_period = AccountingPeriod.objects.get(year=year, month=12)
        balances = AccountPeriodBalance.objects.filter(period=last_period, account__account_class__in=['1','2','3','4','5'])
        
        seq = 1
        for bal in balances:
            # Recalculer le solde final clôturé
            d = bal.opening_debit + bal.debit_movement
            c = bal.opening_credit + bal.credit_movement
            
            if d > c:
                JournalEntryLine.objects.create(
                    journal_entry=opening_entry, sequence=seq, account=bal.account,
                    label=f"RAN {year}", debit_amount=d - c
                )
                seq += 1
            elif c > d:
                JournalEntryLine.objects.create(
                    journal_entry=opening_entry, sequence=seq, account=bal.account,
                    label=f"RAN {year}", credit_amount=c - d
                )
                seq += 1
        
        opening_entry.update_totals(commit=False)
        opening_entry.post(user)
        
        return closing_entry