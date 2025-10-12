# Signaux pour automatisation
from django.db.models.signals import post_save
from django.dispatch import receiver
from accounting.services.accounting_service import AccountingService

"""
@receiver(post_save, sender='polyclinic.Consultation')
def create_consultation_accounting_entry(sender, instance, created, **kwargs):
    #Crée automatiquement l'écriture comptable lors d'une consultation
    if created and instance.state == 'Completed':
        AccountingService.create_consultation_entry(instance)
"""

@receiver(post_save, sender='polyclinic.Bill')
def create_bill_accounting_entry(sender, instance, created, **kwargs):
    """Crée automatiquement l'écriture comptable lors de la création d'une facture"""
    if created and not instance.isAccounted:
        # Marquer comme comptabilisé
        instance.isAccounted = True
        instance.save()