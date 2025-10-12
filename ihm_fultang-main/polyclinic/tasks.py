from django.utils.timezone import now
from accounting.models import BudgetExercise, Account, AccountState
from datetime import datetime, timedelta
from celery import shared_task
from polyclinic.models import Consultation


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
