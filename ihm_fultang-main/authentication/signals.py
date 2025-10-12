from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import MedicalStaff
from polyclinic.services.emails_manager import EmailManager
from django.urls import reverse
from django.conf import settings

@receiver(post_save, sender=MedicalStaff)
def send_account_creation_email(sender, instance, created, **kwargs):
    if created:
        reset_link = f"{settings.FRONTEND_URL}/{reverse('password_reset')}"
        EmailManager.send_staff_account_created(instance, reset_link)