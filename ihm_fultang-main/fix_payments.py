from polyclinic.models import Consultation

def fix_payments():
    # Fetch all unpaid consultations
    unpaid_consultations = Consultation.objects.filter(paymentStatus='Invalid')
    
    count = unpaid_consultations.count()
    print(f"--- Found {count} unpaid (Invalid) consultations ---")
    
    if count == 0:
        print("No unpaid consultations found. Everything looks good!")
        return

    for consult in unpaid_consultations:
        patient_name = f"{consult.idPatient.firstName} {consult.idPatient.lastName}"
        
        # MedicalStaff likely uses snake_case for names if it inherits from AbstractUser, or check attributes
        giver = consult.idMedicalStaffGiver
        doctor_name = "Unknown"
        if giver:
            # Try to get name safely
            fn = getattr(giver, 'firstName', getattr(giver, 'first_name', ''))
            ln = getattr(giver, 'lastName', getattr(giver, 'last_name', ''))
            doctor_name = f"{fn} {ln}"
            
        date_str = consult.consultationDate.strftime("%Y-%m-%d %H:%M:%S")
        
        print(f"Paying consultation: [ID: {consult.id}]")
        print(f"  Patient: {patient_name}")
        print(f"  Doctor : {doctor_name}")
        print(f"  Date   : {date_str}")
        
        # Update status
        consult.paymentStatus = 'Valid'
        consult.save()
        print("  -> Status updated to 'Valid' (Paid)")
        print("-" * 30)

    print("--- Completed. All consultations are now marked as Paid. ---")

fix_payments()
