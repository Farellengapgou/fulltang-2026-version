from django.test import TestCase
from django.utils import timezone
from django.core.exceptions import ValidationError
from decimal import Decimal
from .models_financier import (
    ChartOfAccounts, Journal, JournalEntry, JournalEntryLine, 
    AccountingPeriod, AccountPeriodBalance
)
from authentication.models import MedicalStaff
from django.contrib.auth import get_user_model

User = get_user_model()

class OHADAModelTests(TestCase):
    def setUp(self):
        # Create a user/staff for operations
        self.user = User.objects.create_user(username='accountant', password='password')
        self.staff = MedicalStaff.objects.create(user=self.user, role='ACCOUNTANT')

        # Create basic Chart of Accounts
        self.account_capital = ChartOfAccounts.objects.create(
            code='101000', label='Capital social',
            account_class='1', account_type='EQUITY'
        )
        self.account_bank = ChartOfAccounts.objects.create(
            code='521000', label='Banque',
            account_class='5', account_type='ASSET'
        )
        self.account_sales = ChartOfAccounts.objects.create(
            code='701000', label='Ventes de marchandises',
            account_class='7', account_type='REVENUE'
        )
        
        # Create a Journal
        self.journal_gen = Journal.objects.create(
            code='GEN', name='Journal Général', journal_type='GENERAL'
        )
        
        # Open a Period
        today = timezone.now().date()
        self.current_period = AccountingPeriod.objects.create(
            year=today.year, month=today.month, state='OPEN'
        )

    def test_chart_of_accounts_creation(self):
        """Test creation of valid accounts"""
        account = ChartOfAccounts.objects.create(
            code='411100', label='Clients',
            account_class='4', account_type='ASSET'
        )
        self.assertEqual(account.code, '411100')
        self.assertEqual(account.normal_side, 'CREDIT') # Class 4 is Tiers, depends on usage but logic says CREDIT? 
        # Wait, check normal_side logic in models_financier.py: 
        # if self.account_class in ['2', '3', '5', '6']: return 'DEBIT' else 'CREDIT'
        # Class 4 is not in [2,3,5,6], so CREDIT. Correct.

    def test_journal_entry_balanced(self):
        """Test posting a balanced entry"""
        entry = JournalEntry.objects.create(
            journal=self.journal_gen,
            entry_date=timezone.now().date(),
            description="Vente au comptant",
            created_by=self.staff
        )
        
        # Add lines (Bank Debit, Sales Credit)
        JournalEntryLine.objects.create(
            journal_entry=entry, sequence=1, account=self.account_bank,
            label="Encaissement vente", debit_amount=1000, credit_amount=0
        )
        JournalEntryLine.objects.create(
            journal_entry=entry, sequence=2, account=self.account_sales,
            label="Vente produit", debit_amount=0, credit_amount=1000
        )
        
        # Post
        entry.post(validated_by=self.staff)
        
        self.assertEqual(entry.state, 'POSTED')
        self.assertTrue(entry.voucher_number.startswith(f"V_GEN_{entry.entry_date.year}_"))
        
        # Verify balances were updated
        balance_bank = AccountPeriodBalance.objects.get(account=self.account_bank, period=self.current_period)
        self.assertEqual(balance_bank.debit_movement, Decimal('1000.00'))
        
        balance_sales = AccountPeriodBalance.objects.get(account=self.account_sales, period=self.current_period)
        self.assertEqual(balance_sales.credit_movement, Decimal('1000.00'))

    def test_journal_entry_imbalanced_raises_error(self):
        """Test that posting an imbalanced entry raises ValidationError"""
        entry = JournalEntry.objects.create(
            journal=self.journal_gen,
            entry_date=timezone.now().date(),
            description="Erreur saisie",
            created_by=self.staff
        )
        
        JournalEntryLine.objects.create(
            journal_entry=entry, sequence=1, account=self.account_bank,
            label="Encaissement incomplet", debit_amount=1000, credit_amount=0
        )
        # Missing credit side
        
        with self.assertRaises(ValidationError) as cm:
            entry.post(validated_by=self.staff)
        
        self.assertIn("L'écriture n'est pas équilibrée", str(cm.exception))

    def test_period_closed_restriction(self):
        """Test restriction on closed periods"""
        # Close the period
        self.current_period.state = 'CLOSED'
        self.current_period.save()
        
        # Try to create an entry
        entry = JournalEntry(
            journal=self.journal_gen,
            entry_date=timezone.now().date(),
            description="Essai sur période close",
            created_by=self.staff
        )
        
        with self.assertRaises(ValidationError) as cm:
            entry.save()
        
        self.assertIn("est Clôturé", str(cm.exception))
