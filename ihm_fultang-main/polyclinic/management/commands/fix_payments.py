from django.core.management.base import BaseCommand
from polyclinic.models import Consultation

class Command(BaseCommand):
    help = 'Fixes invalid payment statuses for consultations'

    def handle(self, *args, **options):
        # Fetch all unpaid consultations
        unpaid_consultations = Consultation.objects.filter(paymentStatus='Invalid')
        
        count = unpaid_consultations.count()
        self.stdout.write(f"--- Found {count} unpaid (Invalid) consultations ---")
        
        if count == 0:
            self.stdout.write(self.style.SUCCESS("No unpaid consultations found. Everything looks good!"))
            return

        for consult in unpaid_consultations:
            patient_name = f"{consult.idPatient.firstName} {consult.idPatient.lastName}"
            
            giver = consult.idMedicalStaffGiver
            doctor_name = "Unknown"
            if giver:
                fn = getattr(giver, 'firstName', getattr(giver, 'first_name', ''))
                ln = getattr(giver, 'lastName', getattr(giver, 'last_name', ''))
                doctor_name = f"{fn} {ln}"
                
            date_str = consult.consultationDate.strftime("%Y-%m-%d %H:%M:%S")
            
            self.stdout.write(f"Paying consultation: [ID: {consult.id}]")
            self.stdout.write(f"  Patient: {patient_name}")
            self.stdout.write(f"  Doctor : {doctor_name}")
            self.stdout.write(f"  Date   : {date_str}")
            
            # Update status
            consult.paymentStatus = 'Valid'
            consult.save()
            self.stdout.write("  -> Status updated to 'Valid' (Paid)")
            self.stdout.write("-" * 30)

        self.stdout.write(self.style.SUCCESS("--- Completed. All consultations are now marked as Paid. ---"))
