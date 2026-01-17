from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings

from .models import Consultation, Patient, PatientAccess, Surgery
from polyclinic.services.emails_manager import EmailManager
from polyclinic.services.notification_service import create_notification

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


@receiver(post_save, sender=PatientAccess)
def patient_access_notification(sender, instance, created, **kwargs):
    if not created:
        return
    recipient = instance.idMedicalStaff
    if recipient.role != "Doctor":
        return
    notification = create_notification(
        recipient=recipient,
        event_type="PATIENT_CREATED",
        priority="GREEN",
        message="Nouvelle consultation ajoutée pour un patient.",
        data={"patient_id": instance.idPatient_id},
    )
    if settings.EMAIL_NOTIFICATIONS_ENABLED:
        EmailManager.send_staff_action_notification(
            recipient,
            {
                "type": "Nouveau patient",
                "description": "Un nouveau patient vient d'être ajouté à votre liste.",
                "link": "",
            },
        )


@receiver(post_save, sender=Surgery)
def surgery_notification(sender, instance, created, **kwargs):
    if not created:
        return
    recipient = instance.idMedicalStaff
    message = (
        "Vous devez être présent pour une chirurgie prévue le "
        f"{instance.scheduled_at.strftime('%d/%m/%Y à %H:%M')}."
    )
    create_notification(
        recipient=recipient,
        event_type="SURGERY_SCHEDULED",
        priority="YELLOW",
        message=message,
        scheduled_for=instance.scheduled_at,
        data={"surgery_id": instance.id, "patient_id": instance.idPatient_id},
    )
    if settings.EMAIL_NOTIFICATIONS_ENABLED:
        EmailManager.send_staff_action_notification(
            recipient,
            {
                "type": "Chirurgie programmée",
                "description": "Une chirurgie a été programmée.",
                "link": "",
            },
        )
