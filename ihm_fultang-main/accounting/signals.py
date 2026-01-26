"""
Django signals for accounting app
Automatically creates BudgetExercise when AccountingPeriod is created
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from datetime import date, timedelta
from django.utils import timezone

from accounting.models_financier import AccountingPeriod, BudgetExercise


@receiver(post_save, sender=AccountingPeriod)
def create_budget_exercise_for_period(sender, instance, created, **kwargs):
    """
    Automatically create or update BudgetExercise when AccountingPeriod is created/updated
    This ensures there's always a BudgetExercise for cashier payments
    """
    try:
        # Calculate start and end dates for the period
        if instance.start_date and instance.end_date:
            start = instance.start_date
            end = instance.end_date
        else:
            # Calculate from year and month if dates not set
            start = date(instance.year, instance.month, 1)
            # Calculate last day of month
            if instance.month == 12:
                end = date(instance.year + 1, 1, 1) - timedelta(days=1)
            else:
                end = date(instance.year, instance.month + 1, 1) - timedelta(days=1)
            
            # Update the period with calculated dates
            if not instance.start_date or not instance.end_date:
                instance.start_date = start
                instance.end_date = end
                instance.save(update_fields=['start_date', 'end_date'])
        
        # Convert to datetime for BudgetExercise
        start_datetime = timezone.make_aware(
            timezone.datetime.combine(start, timezone.datetime.min.time())
        )
        end_datetime = timezone.make_aware(
            timezone.datetime.combine(end, timezone.datetime.max.time())
        )
        
        # Check if BudgetExercise already exists for this period
        existing = BudgetExercise.objects.filter(
            start__date=start,
            end__date=end
        ).first()
        
        if not existing:
            # Create new BudgetExercise
            BudgetExercise.objects.create(
                start=start_datetime,
                end=end_datetime
            )
            print(f"✅ BudgetExercise created for period {instance.year}-{instance.month:02d}")
        else:
            print(f"ℹ️  BudgetExercise already exists for period {instance.year}-{instance.month:02d}")
            
    except Exception as e:
        print(f"⚠️  Error creating BudgetExercise for period {instance.year}-{instance.month:02d}: {str(e)}")
        # Don't raise exception to avoid blocking period creation
        pass