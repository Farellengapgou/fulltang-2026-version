from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Patient, Consultation
from polyclinic.services.emails_manager import EmailManager
from django.urls import reverse
from django.conf import settings

@receiver(post_save, sender=Patient)
def send_account_creation_email(sender, instance, created, **kwargs):
    if created:
        EmailManager.send_patient_registered(instance)

@receiver(post_save, sender=Consultation)
def action_consultation_email(sender, instance, created, **kwargs):
    if created:
        # Notification au médecin
        action_details = {
            'type': 'Nouvelle consultation',
            'description': f"Patient : {instance.idPatient.lastName}",
            'link': f"/consultations/{instance.id}"
        }
        EmailManager.send_staff_action_notification(
            instance.idMedicalStaffGiver,
            action_details
        )

        # Notification au patient
        patient_action_details = {
            'type': 'Consultation programmée',
            'description': f"Médecin : Dr {instance.idMedicalStaffGiver.username}",
            'link': f"/patients/{instance.idPatient.id}/consultations"
        }
        EmailManager.send_patient_action_notification(
            instance.idPatient,
            patient_action_details,
            instance.idMedicalStaffSender
        )

