"""
Django management command to populate accounting data for testing
Usage: python manage.py populate_accounting
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from datetime import date, timedelta
import random

from accounting.models_financier import (
    ChartOfAccounts, Journal, JournalEntry, JournalEntryLine,
    Customer, Supplier, AccountingPeriod, BudgetExercise,
    Budget, BudgetLine, BankAccount, FinancialOperation,
    Account
)

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate accounting database with OHADA chart of accounts and sample data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before populating',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing data...'))
            self.clear_data()

        self.stdout.write(self.style.SUCCESS('Starting data population...'))
        
        # Get or create admin user
        self.user = User.objects.filter(is_superuser=True).first()
        if not self.user:
            self.stdout.write(self.style.ERROR('No superuser found. Please create one first.'))
            return

        # Create data
        self.create_chart_of_accounts()
        self.create_journals()
        self.create_payment_methods()
        self.create_accounting_periods()
        self.create_customers()
        self.create_suppliers()
        self.create_bank_accounts()
        self.create_budget()
        self.create_journal_entries()

        self.stdout.write(self.style.SUCCESS('✅ Data population completed successfully!'))

    def clear_data(self):
        """Clear existing accounting data"""
        JournalEntryLine.objects.all().delete()
        JournalEntry.objects.all().delete()
        BudgetLine.objects.all().delete()
        Budget.objects.all().delete()
        Customer.objects.all().delete()
        Supplier.objects.all().delete()
        BankAccount.objects.all().delete()
        Journal.objects.all().delete()
        AccountingPeriod.objects.all().delete()
        BudgetExercise.objects.all().delete()
        ChartOfAccounts.objects.all().delete()

    def create_chart_of_accounts(self):
        """Create OHADA chart of accounts"""
        self.stdout.write('Creating chart of accounts...')
        
        accounts_data = [
            # Classe 1: Capitaux
            ('101000', 'Capital social', '1', 'EQUITY'),
            ('106000', 'Réserves', '1', 'EQUITY'),
            ('110000', 'Report à nouveau', '1', 'EQUITY'),
            ('120000', 'Résultat de l\'exercice', '1', 'EQUITY'),
            ('16', 'Emprunts et dettes assimilées', '1', 'LIABILITY'),
            
            # Classe 2: Immobilisations
            ('211000', 'Terrains', '2', 'ASSET'),
            ('212000', 'Agencements et aménagements de terrains', '2', 'ASSET'),
            ('213000', 'Constructions', '2', 'ASSET'),
            ('218000', 'Autres installations et agencements', '2', 'ASSET'),
            ('221000', 'Matériel et outillage', '2', 'ASSET'),
            ('224000', 'Mobilier', '2', 'ASSET'),
            ('225000', 'Matériel informatique', '2', 'ASSET'),
            ('228000', 'Autres immobilisations corporelles', '2', 'ASSET'),
            ('245000', 'Titres de participation', '2', 'ASSET'),
            ('281000', 'Amortissements des immobilisations incorporelles', '2', 'LIABILITY'),
            ('283000', 'Amortissements des constructions', '2', 'LIABILITY'),
            ('284000', 'Amortissements du matériel', '2', 'LIABILITY'),
            
            # Classe 3: Stocks
            ('31', 'Marchandises', '3', 'ASSET'),
            ('32', 'Matières premières et fournitures', '3', 'ASSET'),
            ('33', 'Autres approvisionnements', '3', 'ASSET'),
            ('37', 'Stock de produits', '3', 'ASSET'),
            ('391000', 'Dépréciation des stocks de marchandises', '3', 'LIABILITY'),
            
            # Classe 4: Tiers
            ('401000', 'Fournisseurs', '4', 'LIABILITY'),
            ('404000', 'Fournisseurs d\'immobilisations', '4', 'LIABILITY'),
            ('408000', 'Fournisseurs - Factures non parvenues', '4', 'LIABILITY'),
            ('411000', 'Clients', '4', 'ASSET'),
            ('416000', 'Clients douteux', '4', 'ASSET'),
            ('418000', 'Clients - Produits à recevoir', '4', 'ASSET'),
            ('421000', 'Personnel - Rémunérations dues', '4', 'LIABILITY'),
            ('422000', 'Personnel - Œuvres sociales', '4', 'LIABILITY'),
            ('431000', 'Sécurité sociale', '4', 'LIABILITY'),
            ('441000', 'État - Impôts sur les bénéfices', '4', 'LIABILITY'),
            ('442000', 'État - Autres impôts et taxes', '4', 'LIABILITY'),
            ('443000', 'État - TVA facturée', '4', 'LIABILITY'),
            ('445000', 'État - TVA récupérable', '4', 'ASSET'),
            ('447000', 'État - Autres charges à payer', '4', 'LIABILITY'),
            ('455000', 'Associés - Comptes courants', '4', 'LIABILITY'),
            ('491000', 'Dépréciation des comptes clients', '4', 'LIABILITY'),
            
            # Classe 5: Trésorerie
            ('512000', 'Banque', '5', 'ASSET'),
            ('514000', 'Chèques postaux', '5', 'ASSET'),
            ('521000', 'Caisse', '5', 'ASSET'),
            ('531000', 'Valeurs à encaisser', '5', 'ASSET'),
            ('540000', 'Régies d\'avances', '5', 'ASSET'),
            
            # Classe 6: Charges
            ('601000', 'Achats de marchandises', '6', 'EXPENSE'),
            ('602000', 'Achats de matières premières', '6', 'EXPENSE'),
            ('604000', 'Achats de fournitures', '6', 'EXPENSE'),
            ('605000', 'Autres achats', '6', 'EXPENSE'),
            ('611000', 'Transports', '6', 'EXPENSE'),
            ('613000', 'Locations', '6', 'EXPENSE'),
            ('614000', 'Charges locatives', '6', 'EXPENSE'),
            ('615000', 'Entretien et réparations', '6', 'EXPENSE'),
            ('616000', 'Primes d\'assurance', '6', 'EXPENSE'),
            ('618000', 'Documentation', '6', 'EXPENSE'),
            ('621000', 'Personnel extérieur', '6', 'EXPENSE'),
            ('622000', 'Rémunérations d\'intermédiaires', '6', 'EXPENSE'),
            ('624000', 'Transports de biens', '6', 'EXPENSE'),
            ('625000', 'Déplacements', '6', 'EXPENSE'),
            ('626000', 'Frais postaux', '6', 'EXPENSE'),
            ('627000', 'Services bancaires', '6', 'EXPENSE'),
            ('631000', 'Impôts et taxes', '6', 'EXPENSE'),
            ('641000', 'Rémunérations du personnel', '6', 'EXPENSE'),
            ('645000', 'Charges sociales', '6', 'EXPENSE'),
            ('681000', 'Dotations aux amortissements', '6', 'EXPENSE'),
            
            # Classe 7: Produits
            ('701000', 'Ventes de marchandises', '7', 'REVENUE'),
            ('701100', 'Ventes de médicaments', '7', 'REVENUE'),
            ('701200', 'Ventes de consommables médicaux', '7', 'REVENUE'),
            ('702000', 'Ventes de produits finis', '7', 'REVENUE'),
            ('706000', 'Prestations de services', '7', 'REVENUE'),
            ('706100', 'Prestations - Consultations', '7', 'REVENUE'),
            ('706200', 'Prestations - Laboratoire', '7', 'REVENUE'),
            ('706300', 'Prestations - Imagerie médicale', '7', 'REVENUE'),
            ('706400', 'Prestations - Hospitalisation', '7', 'REVENUE'),
            ('706500', 'Prestations - Nursing et soins', '7', 'REVENUE'),
            ('707000', 'Produits accessoires', '7', 'REVENUE'),
            ('754000', 'Produits des cessions courantes', '7', 'REVENUE'),
            ('758000', 'Produits divers', '7', 'REVENUE'),
            ('771000', 'Intérêts de prêts', '7', 'REVENUE'),
            ('773000', 'Escomptes obtenus', '7', 'REVENUE'),
        ]

        for code, label, account_class, account_type in accounts_data:
            ChartOfAccounts.objects.get_or_create(
                code=code,
                defaults={
                    'label': label,
                    'account_class': account_class,
                    'account_type': account_type,
                    'is_active': True,
                }
            )
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(accounts_data)} accounts'))

    def create_journals(self):
        """Create accounting journals"""
        self.stdout.write('Creating journals...')
        
        journals_data = [
            ('VTE', 'Journal des ventes', 'SALES'),
            ('ACH', 'Journal des achats', 'PURCHASES'),
            ('BQ', 'Journal de banque', 'BANK'),
            ('CAI', 'Journal de caisse', 'CASH'),
            ('OD', 'Opérations diverses', 'MISC'),
        ]

        for code, name, journal_type in journals_data:
            Journal.objects.get_or_create(
                code=code,
                defaults={'name': name, 'journal_type': journal_type}
            )
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(journals_data)} journals'))
    
    def create_payment_methods(self):
        """Create payment methods for cashier"""
        self.stdout.write('Creating payment methods...')
        
        # Get or create default account for payment methods
        default_account, _ = Account.objects.get_or_create(
            number=1,
            defaults={
                'libelle': 'Compte par défaut',
                'status': 'debit'
            }
        )
        
        payment_methods_data = [
            ('CASH', 'Espèces'),
            ('MOMO', 'Mobile Money (MTN)'),
            ('OM', 'Orange Money'),
            ('CHEQUE', 'Chèque'),
            ('CARTE BANCAIRE', 'Carte Bancaire'),
            ('VIREMENT BANCAIRE', 'Virement Bancaire'),
        ]
        
        count = 0
        for name, description in payment_methods_data:
            _, created = FinancialOperation.objects.get_or_create(
                name=name,
                defaults={'account': default_account}
            )
            if created:
                count += 1
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {count} payment methods'))

    def create_accounting_periods(self):
        """Create accounting periods for 2025-2026"""
        self.stdout.write('Creating accounting periods...')
        
        count = 0
        for year in [2025, 2026]:
            for month in range(1, 13):
                # Calculate start and end dates
                start_date = date(year, month, 1)
                if month == 12:
                    end_date = date(year + 1, 1, 1) - timedelta(days=1)
                else:
                    end_date = date(year, month + 1, 1) - timedelta(days=1)
                
                period, created = AccountingPeriod.objects.get_or_create(
                    year=year,
                    month=month,
                    defaults={
                        'start_date': start_date,
                        'end_date': end_date,
                        'state': 'CLOSED' if year == 2025 and month < 12 else 'OPEN'
                    }
                )
                if created:
                    count += 1
                
                # Create corresponding budget exercise
                BudgetExercise.objects.get_or_create(
                    start=timezone.make_aware(timezone.datetime.combine(start_date, timezone.datetime.min.time())),
                    end=timezone.make_aware(timezone.datetime.combine(end_date, timezone.datetime.max.time()))
                )
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {count} accounting periods'))

    def create_customers(self):
        """Create sample customers"""
        self.stdout.write('Creating customers...')
        
        # Get class 4 account for customers
        customer_account = ChartOfAccounts.objects.filter(code='411000').first()
        if not customer_account:
            self.stdout.write(self.style.WARNING('Customer account 411000 not found, skipping customers'))
            return
        
        customers_data = [
            ('CLT-001', 'Hôpital Central', 'CORPORATE'),
            ('CLT-002', 'Clinique des Anges', 'CORPORATE'),
            ('CLT-003', 'Assurance SAHAM', 'INSURANCE'),
            ('CLT-004', 'Mutuelle des Fonctionnaires', 'INSURANCE'),
            ('CLT-005', 'Ministère de la Santé', 'GOVERNMENT'),
            ('CLT-006', 'MGEN', 'INSURANCE'),
            ('CLT-007', 'ASCOMA', 'INSURANCE'),
            ('CLT-008', 'GRAS SAVOYE', 'INSURANCE'),
        ]
        
        # Add 50 individual patients
        individual_patients = [
            'Jean Dupont', 'Marie Ngo', 'Paul Biya II', 'Alice Mbia', 'Robert Kotto',
            'Samba Diallo', 'Fatima Toure', 'Isabelle Ebongue', 'Samuel Eto’o Jr', 'Martine Abena',
            'Lucas Njoh', 'Hélène Batock', 'Cédric Fofana', 'Aissatou Sow', 'Moussa Traoré',
            'Koffi Ndri', 'Yolande Eyenga', 'Patrick Mboma', 'Françoise Ateba', 'Guy Zogo',
            'Béatrice Ndoumbe', 'Thierry Manga', 'Chantal Biya III', 'Emilien Tataw', 'Blaise Njocke',
            'Esther Mahe', 'David Kouam', 'Nicole Tiani', 'Simplice Fotso', 'Rosine Kamga',
            'Ousmane Sy', 'Aminata Keita', 'Bakary Koné', 'Sékou Condé', 'Mariam Coulibaly',
            'Djibril Cissé', 'Salif Keita', 'Angélique Kidjo', 'Manu Dibango', 'Richard Bona',
            'Charlotte Dipanda', 'Daphne Njie', 'Stanley Enow', 'Locko Samba', 'Tenor Ebanflang',
            'Blanche Bailly', 'Salatiel Liveniba', 'Mr Leo', 'Magasco Tohnain', 'Rinyu Mary'
        ]
        
        for i, name in enumerate(individual_patients):
            customers_data.append((f'PAT-{i+1:03d}', name, 'INDIVIDUAL'))

        for code, name, customer_type in customers_data:
            Customer.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'customer_type': customer_type,
                    'account': customer_account,
                    'phone': f'+237 6{random.randint(70000000, 99999999)}',
                    'email': f'{code.lower()}@example.cm',
                    'payment_terms': random.choice([0, 30, 60]),
                    'credit_limit': Decimal(random.randint(100000, 5000000)),
                    'created_by': self.user,
                }
            )
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(customers_data)} customers'))

    def create_suppliers(self):
        """Create sample suppliers"""
        self.stdout.write('Creating suppliers...')
        
        # Get class 4 account for suppliers
        supplier_account = ChartOfAccounts.objects.filter(code='401000').first()
        if not supplier_account:
            self.stdout.write(self.style.WARNING('Supplier account 401000 not found, skipping suppliers'))
            return
        
        suppliers_data = [
            ('FRN-001', 'Laboratoires Pfizer', 'PHARMA'),
            ('FRN-002', 'Sanofi Cameroun', 'PHARMA'),
            ('FRN-003', 'Équipements Médicaux SA', 'EQUIPMENT'),
            ('FRN-004', 'Fournitures Hospitalières', 'SUPPLIER'),
            ('FRN-005', 'Services de Nettoyage Pro', 'SERVICE'),
        ]

        for code, name, supplier_type in suppliers_data:
            Supplier.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'supplier_type': supplier_type,
                    'account': supplier_account,
                    'phone': f'+237 6{random.randint(70000000, 99999999)}',
                    'email': f'{code.lower()}@example.cm',
                    'payment_terms': random.choice([30, 60, 90]),
                    'credit_limit': Decimal(random.randint(500000, 10000000)),
                    'created_by': self.user,
                }
            )
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(suppliers_data)} suppliers'))

    def create_bank_accounts(self):
        """Create sample bank accounts"""
        self.stdout.write('Creating bank accounts...')
        
        bank_account_chart = ChartOfAccounts.objects.filter(code='512000').first()
        if not bank_account_chart:
            self.stdout.write(self.style.WARNING('Bank account 512000 not found, skipping bank accounts'))
            return
        
        banks_data = [
            ('Afriland First Bank', '10001234567890'),
            ('Ecobank Cameroun', '20002345678901'),
        ]

        for bank_name, account_number in banks_data:
            BankAccount.objects.get_or_create(
                account_number=account_number,
                defaults={
                    'account': bank_account_chart,
                    'bank_name': bank_name,
                    'balance_amount': Decimal(random.randint(1000000, 50000000)),
                    'balance_date': date.today(),
                }
            )
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(banks_data)} bank accounts'))

    def create_budget(self):
        """Create sample budget"""
        self.stdout.write('Creating budget...')
        
        budget, created = Budget.objects.get_or_create(
            name='Budget 2026',
            fiscal_year=2026,
            defaults={
                'budget_type': 'ANNUAL',
                'start_date': date(2026, 1, 1),
                'end_date': date(2026, 12, 31),
                'is_active': True,
                'created_by': self.user,
            }
        )
        
        if created:
            # Add budget lines for main expense accounts
            expense_accounts = ChartOfAccounts.objects.filter(account_class='6')[:5]
            for account in expense_accounts:
                monthly_amount = Decimal(random.randint(100000, 1000000))
                BudgetLine.objects.create(
                    budget=budget,
                    account=account,
                    january=monthly_amount,
                    february=monthly_amount,
                    march=monthly_amount,
                    april=monthly_amount,
                    may=monthly_amount,
                    june=monthly_amount,
                    july=monthly_amount,
                    august=monthly_amount,
                    september=monthly_amount,
                    october=monthly_amount,
                    november=monthly_amount,
                    december=monthly_amount,
                )
            
            self.stdout.write(self.style.SUCCESS('✓ Created budget with lines'))

    def create_journal_entries(self):
        """Create sample journal entries"""
        self.stdout.write('Creating journal entries...')
        
        # Get necessary accounts
        sales_account = ChartOfAccounts.objects.filter(code='706000').first()
        bank_account = ChartOfAccounts.objects.filter(code='512000').first()
        customer_account = ChartOfAccounts.objects.filter(code='411000').first()
        
        if not all([sales_account, bank_account, customer_account]):
            self.stdout.write(self.style.WARNING('Required accounts not found, skipping journal entries'))
            return
        
        # Get journals
        sales_journal = Journal.objects.filter(code='VTE').first()
        bank_journal = Journal.objects.filter(code='BQ').first()
        
        if not all([sales_journal, bank_journal]):
            self.stdout.write(self.style.WARNING('Required journals not found, skipping journal entries'))
            return
        
        # Get specific medical revenue accounts
        rev_consult = ChartOfAccounts.objects.filter(code='706100').first()
        rev_lab = ChartOfAccounts.objects.filter(code='706200').first()
        rev_imaging = ChartOfAccounts.objects.filter(code='706300').first()
        rev_hosp = ChartOfAccounts.objects.filter(code='706400').first()
        rev_pharma = ChartOfAccounts.objects.filter(code='701100').first()
        
        # Fallback to main revenue if specific not found
        rev_consult = rev_consult or sales_account
        rev_lab = rev_lab or sales_account
        rev_imaging = rev_imaging or sales_account
        rev_hosp = rev_hosp or sales_account
        rev_pharma = rev_pharma or sales_account

        # Create 100 sample entries for Jan and Feb 2026
        count = 0
        periods = [
            (date(2026, 1, 1), date(2026, 1, 31)),
            (date(2026, 2, 1), date(2026, 2, 28))
        ]
        
        for period_start, period_end in periods:
            for i in range(50):
                entry_date = period_start + timedelta(days=random.randint(0, (period_end - period_start).days))
                amount = Decimal(random.randint(5000, 150000))
                
                # Pick a random revenue type
                rev_type = random.choice([
                    (rev_consult, 'Consultation médicale'),
                    (rev_lab, 'Analyses de laboratoire'),
                    (rev_imaging, 'Imagerie médicale (Radio/Echo)'),
                    (rev_hosp, 'Frais d\'hospitalisation'),
                    (rev_pharma, 'Vente de médicaments')
                ])
                
                # Pick a random customer
                customer_obj = Customer.objects.order_by('?').first()
                customer_obj_name = customer_obj.name if customer_obj else 'Patient Anonyme'
                
                # Create sales entry
                entry = JournalEntry.objects.create(
                    entry_date=entry_date,
                    journal=sales_journal,
                    description=f'{rev_type[1]} - Patient: {customer_obj_name} - Réf: {random.randint(1000, 9999)}',
                    created_by=self.user,
                )
                
                # Debit customer (411)
                JournalEntryLine.objects.create(
                    journal_entry=entry,
                    sequence=1,
                    account=customer_account,
                    label=f'Client: {customer_obj_name}',
                    debit_amount=amount,
                    credit_amount=0,
                )
                
                # Credit revenue (7xx)
                JournalEntryLine.objects.create(
                    journal_entry=entry,
                    sequence=2,
                    account=rev_type[0],
                    label=rev_type[1],
                    debit_amount=0,
                    credit_amount=amount,
                )
                
                entry.update_totals()
                entry.post(self.user)
                
                # For 70% of entries, create bank/cash payment entry
                if random.random() < 0.7:
                    pay_date = entry_date + timedelta(days=random.randint(0, 5))
                    cash_journal = Journal.objects.filter(code='CAI').first()
                    pay_journal = random.choice([bank_journal, cash_journal or bank_journal])
                    
                    cash_acc = ChartOfAccounts.objects.filter(code='521000').first()
                    pay_acc = bank_account if pay_journal.code == 'BQ' else (cash_acc or bank_account)
                    
                    pay_entry = JournalEntry.objects.create(
                        entry_date=pay_date,
                        journal=pay_journal,
                        description=f'Règlement {rev_type[1]} - {customer_obj_name}',
                        created_by=self.user,
                    )
                    
                    # Debit Cash/Bank (5xx)
                    JournalEntryLine.objects.create(
                        journal_entry=pay_entry,
                        sequence=1,
                        account=pay_acc,
                        label=f'Encaissement {pay_journal.name}',
                        debit_amount=amount,
                        credit_amount=0,
                    )
                    
                    # Credit Customer (411)
                    JournalEntryLine.objects.create(
                        journal_entry=pay_entry,
                        sequence=2,
                        account=customer_account,
                        label=f'Règlement Client {customer_obj_name}',
                        debit_amount=0,
                        credit_amount=amount,
                    )
                    
                    pay_entry.update_totals()
                    pay_entry.post(self.user)
                
                count += 1
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {count} journal entries'))
