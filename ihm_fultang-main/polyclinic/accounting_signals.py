"""
Django signals for automatic accounting integration
Creates journal entries automatically when bills are paid
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from decimal import Decimal
from datetime import date

from polyclinic.models import Bill, BillItem
from accounting.models_financier import (
    JournalEntry, JournalEntryLine, Journal,
    ChartOfAccounts, AccountingPeriod, BudgetExercise
)


@receiver(post_save, sender=Bill)
def create_bill_accounting_entry(sender, instance, created, **kwargs):
    """
    Automatically create accounting entry when a bill is created/updated
    """
    # Only create entry if bill is not yet accounted and has amount
    if instance.isAccounted or instance.amount <= 0:
        return
    
    try:
        # Get or create accounting period for current month
        today = date.today()
        period, _ = AccountingPeriod.objects.get_or_create(
            year=today.year,
            month=today.month,
            defaults={
                'start_date': date(today.year, today.month, 1),
                'state': 'OPEN'
            }
        )
        
        # Get or create budget exercise
        BudgetExercise.objects.get_or_create(
            start=period.start_date if period.start_date else date(today.year, today.month, 1),
            defaults={
                'end': date(today.year, 12, 31)
            }
        )
        
        # Get necessary accounts
        cash_account = ChartOfAccounts.objects.filter(code='521000').first()  # Caisse
        bank_account = ChartOfAccounts.objects.filter(code='512000').first()  # Banque
        revenue_account = ChartOfAccounts.objects.filter(code='706000').first()  # Prestations de services
        
        if not all([cash_account, revenue_account]):
            print(f"⚠️  Required accounts not found for bill {instance.billCode}")
            return
        
        # Get sales journal
        sales_journal = Journal.objects.filter(code='VTE').first()
        if not sales_journal:
            sales_journal = Journal.objects.filter(journal_type='SALES').first()
        
        if not sales_journal:
            print(f"⚠️  Sales journal not found for bill {instance.billCode}")
            return
        
        # Create journal entry
        entry = JournalEntry.objects.create(
            entry_date=today,
            journal=sales_journal,
            description=f"Paiement facture {instance.billCode} - Patient: {instance.patient.firstName if instance.patient else 'N/A'}",
            reference=instance.billCode,
            created_by=instance.operator,
        )
        
        # Debit: Cash/Bank (we receive money)
        debit_account = bank_account if bank_account else cash_account
        JournalEntryLine.objects.create(
            journal_entry=entry,
            sequence=1,
            account=debit_account,
            label=f"Encaissement facture {instance.billCode}",
            debit_amount=Decimal(str(instance.amount)),
            credit_amount=Decimal('0'),
        )
        
        # Credit: Revenue (we earn money)
        JournalEntryLine.objects.create(
            journal_entry=entry,
            sequence=2,
            account=revenue_account,
            label=f"Prestations de services - {instance.billCode}",
            debit_amount=Decimal('0'),
            credit_amount=Decimal(str(instance.amount)),
        )
        
        # Update totals and post entry
        entry.update_totals()
        entry.post(instance.operator)
        
        # Mark bill as accounted
        instance.isAccounted = True
        instance.save(update_fields=['isAccounted'])
        
        print(f"✅ Accounting entry created for bill {instance.billCode}: {instance.amount} FCFA")
        
    except Exception as e:
        print(f"❌ Error creating accounting entry for bill {instance.billCode}: {str(e)}")
        # Don't raise exception to avoid blocking bill creation
        pass


@receiver(post_save, sender=BillItem)
def update_bill_amount(sender, instance, created, **kwargs):
    """
    Update bill total amount when bill items are added/modified
    """
    if instance.bill:
        # Calculate total from all bill items
        total = sum(item.total for item in instance.bill.billitem_set.all())
        if instance.bill.amount != total:
            instance.bill.amount = total
            instance.bill.save(update_fields=['amount'])
