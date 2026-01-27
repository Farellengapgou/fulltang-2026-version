from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings

from .models import MedicalStaff, PasswordResetToken
from polyclinic.services.emails_manager import EmailManager

@receiver(post_save, sender=MedicalStaff)
def send_account_creation_email(sender, instance, created, **kwargs):
    if not created:
        return
    
    # Création du token
    token = PasswordResetToken.objects.create(user=instance)

    # Lien FRONTEND (aucun reverse ici)
    reset_link = (
        f"{settings.FRONTEND_URL_1}"
        f"{settings.FRONTEND_RESET_PASSWORD_PATH}"
        f"?token={token.token}"
    )

    EmailManager.send_staff_account_created(instance, reset_link)