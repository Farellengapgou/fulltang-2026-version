from django.utils import timezone
from decimal import Decimal
from accounting.models import ChartOfAccounts, Journal, TaxRate

class AccountingSetup:
    """Configuration initiale du module comptabilité"""

    @staticmethod
    def create_ohada_chart_of_accounts():
        """Crée le plan comptable OHADA de base"""
        accounts = [
            # Classe 1 - Capitaux
            ('101', 'Capital', '1', 'EQUITY'),
            ('106', 'Réserves', '1', 'EQUITY'),
            ('110', 'Report à nouveau', '1', 'EQUITY'),
            ('120', 'Résultat de l\'exercice', '1', 'EQUITY'),
            ('161', 'Emprunts et dettes assimilées', '1', 'LIABILITY'),

            # Classe 2 - Immobilisations
            ('211', 'Terrains', '2', 'ASSET'),
            ('213', 'Constructions', '2', 'ASSET'),
            ('215', 'Installations techniques', '2', 'ASSET'),
            ('218', 'Autres immobilisations corporelles', '2', 'ASSET'),
            ('281', 'Amortissements des immobilisations corporelles', '2', 'ASSET'),

            # Classe 3 - Stocks
            ('311', 'Marchandises', '3', 'ASSET'),
            ('321', 'Matières premières', '3', 'ASSET'),
            ('326', 'Emballages', '3', 'ASSET'),

            # Classe 4 - Comptes de tiers
            ('401', 'Fournisseurs', '4', 'LIABILITY'),
            ('411', 'Clients', '4', 'ASSET'),
            ('421', 'Personnel', '4', 'LIABILITY'),
            ('431', 'Sécurité sociale', '4', 'LIABILITY'),
            ('445', 'État', '4', 'LIABILITY'),
            # Classe 5 - Comptes de trésorerie
            ('512', 'Banques', '5', 'ASSET'),
            ('531', 'Caisses', '5', 'ASSET'),

            # Classe 6 - Comptes de charges
            ('601', 'Achats de marchandises', '6', 'EXPENSE'),
            ('605', 'Autres achats', '6', 'EXPENSE'),
            ('641', 'Rémunérations du personnel', '6', 'EXPENSE'),
            ('645', 'Charges de sécurité sociale', '6', 'EXPENSE'),
            ('681', 'Dotations aux amortissements', '6', 'EXPENSE'),

            # Classe 7 - Comptes de produits
            ('701', 'Ventes de marchandises', '7', 'REVENUE'),
            ('706', 'Prestations de services', '7', 'REVENUE'),
            ('708', 'Produits des activités annexes', '7', 'REVENUE'),
        ]

        for code, label, account_class, account_type in accounts:
            ChartOfAccounts.objects.get_or_create(
                code=code,
                defaults={
                    'label': label,
                    'account_class': account_class,
                    'account_type': account_type,
                    'is_active': True,
                    'is_detailed': True
                }
            )

        @staticmethod
        def create_default_journals():
            """Crée les journaux comptables de base"""
            journals = [
                ('VTE', 'Journal des ventes', 'SALES'),
                ('ACH', 'Journal des achats', 'PURCHASES'),
                ('BQ', 'Journal de banque', 'BANK'),
                ('CAI', 'Journal de caisse', 'CASH'),
                ('OD', 'Opérations diverses', 'MISC'),
            ]

            for code, name, journal_type in journals:
                Journal.objects.get_or_create(
                    code=code,
                    defaults={
                        'name': name,
                        'journal_type': journal_type,
                        'is_active': True
                    }
                )

    @staticmethod
    def create_default_tax_rates():
        """Crée les taux de TVA camerounais"""
        # Récupérer les comptes TVA
        try:
            vat_collected = ChartOfAccounts.objects.get(code='4434')
            vat_paid = ChartOfAccounts.objects.get(code='4451')

            TaxRate.objects.get_or_create(
                name='TVA Cameroun',
                defaults={
                    'tax_type': 'VAT',
                    'rate': Decimal('0.1925'),  # 19.25%
                    'is_active': True,
                    'start_date': timezone.now().date(),
                    'collected_account': vat_collected,
                    'paid_account': vat_paid
                }
            )
        except ChartOfAccounts.DoesNotExist:
            # Créer d'abord les comptes TVA
            vat_collected = ChartOfAccounts.objects.create(
                code='4434',
                label='TVA collectée',
                account_class='4',
                account_type='LIABILITY'
            )
            vat_paid = ChartOfAccounts.objects.create(
                code='4451',
                label='TVA déductible',
                account_class='4',
                account_type='ASSET'
            )

            TaxRate.objects.get_or_create(
                name='TVA Cameroun',
                defaults={
                    'tax_type': 'VAT',
                    'rate': Decimal('0.1925'),
                    'is_active': True,
                    'start_date': timezone.now().date(),
                    'collected_account': vat_collected,
                    'paid_account': vat_paid
                }
            )