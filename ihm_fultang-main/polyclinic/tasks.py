from django.conf import settings
from django.utils.timezone import now
from accounting.models import BudgetExercise, Account, AccountState
from datetime import datetime, timedelta
from celery import shared_task
from polyclinic.models import Consultation, Surgery
from polyclinic.services.emails_manager import EmailManager
from polyclinic.services.notification_service import create_notification


@shared_task
def update_consultations_status():
    print("Executing scheduled task now...")

    # on recupère toutes les conultations dont la date de creation dépasse deux semaines
    # 2 semaines en arrière
    two_weeks_ago = now() - timedelta(weeks=2)
    consultations = Consultation.objects.filter(consultationDate__lte=two_weeks_ago)

    for consultation in consultations:
        consultation.state = 'Completed'
        consultation.save()
        print(f"Mise à jour de la consultation du patient: {consultation.idPatient}")


@shared_task
def notify_upcoming_surgeries():
    now_time = now()
    upcoming_cutoff = now_time + timedelta(minutes=15)
    surgeries = Surgery.objects.filter(
        scheduled_at__lte=upcoming_cutoff,
        scheduled_at__gte=now_time,
        reminder_sent=False,
        is_active=True,
    )
    for surgery in surgeries:
        recipient = surgery.idMedicalStaff
        message = "Vous devez être présent pour une chirurgie dans 15 minutes."
        create_notification(
            recipient=recipient,
            event_type="SURGERY_REMINDER",
            priority="RED",
            message=message,
            scheduled_for=surgery.scheduled_at,
            data={"surgery_id": surgery.id, "patient_id": surgery.idPatient_id},
        )
        if hasattr(recipient, "email") and recipient.email and EmailManager and settings.EMAIL_NOTIFICATIONS_ENABLED:
            EmailManager.send_staff_action_notification(
                recipient,
                {
                    "type": "Chirurgie imminente",
                    "description": "Vous avez une chirurgie dans 15 minutes.",
                    "link": "",
                },
            )
        surgery.reminder_sent = True
        surgery.save(update_fields=["reminder_sent"])
