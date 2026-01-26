from django.core.management.base import BaseCommand
from accounting.services.seeding import AccountingSetup

class Command(BaseCommand):
    help = 'Initialise les données de base pour la comptabilité'

    def handle(self, *args, **options):
        self.stdout.write('Création du plan comptable OHADA...')
        AccountingSetup.create_ohada_chart_of_accounts()
        
        self.stdout.write('Création des journaux par défaut...')
        AccountingSetup.create_default_journals()
        
        self.stdout.write('Création des taux de TVA...')
        AccountingSetup.create_default_tax_rates()
        
        self.stdout.write(self.style.SUCCESS('Initialisation terminée avec succès'))
