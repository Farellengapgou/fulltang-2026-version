import os
import django
from django.utils import timezone
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fultang.settings')
django.setup()

from accounting.models import Account, FinancialOperation, BudgetExercise, AccountState
from polyclinic.models import Consultation, Patient, Prescription, PrescriptionDrug, PolyclinicProduct, PolyclinicProductCategory
from authentication.models import MedicalStaff

def seed():
    print("Seeding data for Pharmacy...")

    # 1. Ensure BudgetExercise
    if BudgetExercise.objects.count() == 0:
        budget = BudgetExercise.objects.create(
            start=timezone.now(),
            end=timezone.now() + timedelta(days=365)
        )
        print(f"Created BudgetExercise: {budget}")
    else:
        budget = BudgetExercise.objects.first()
        print(f"Using existing BudgetExercise: {budget}")

    # 2. Ensure Account
    account, created = Account.objects.get_or_create(
        number=701,
        libelle="Ventes de médicaments",
        status="credit"
    )
    if created: print(f"Created Account: {account}")

    # 3. Ensure AccountState
    AccountState.objects.get_or_create(
        account=account,
        budgetExercise=budget,
        defaults={'balance': 0}
    )

    # 4. Ensure FinancialOperation
    op, created = FinancialOperation.objects.get_or_create(
        name="Vente Pharmacie",
        account=account
    )
    if created: print(f"Created FinancialOperation: {op}")

    # 5. Ensure Product Category
    cat, created = PolyclinicProductCategory.objects.get_or_create(
        name="Médicaments",
        active=True
    )

    # 6. Ensure Products
    products_data = [
        {"name": "Paracetamol 500mg", "price": 500, "current_stock": 100, "is_medication": True},
        {"name": "Amoxicilline 1g", "price": 2500, "current_stock": 50, "is_medication": True},
        {"name": "Vitamin C", "price": 1000, "current_stock": 200, "is_medication": True},
    ]
    for p_data in products_data:
        p, created = PolyclinicProduct.objects.get_or_create(
            name=p_data["name"],
            category=cat,
            defaults={
                "price": p_data["price"],
                "current_stock": p_data["current_stock"],
                "is_medication": p_data["is_medication"],
                "status": "Available"
            }
        )
        if created: print(f"Created Product: {p}")

    # 7. Create a Prescription for an existing Consultation
    consultation = Consultation.objects.first()
    if consultation and Prescription.objects.count() == 0:
        pharmacist = MedicalStaff.objects.filter(role="Pharmacist").first()
        doctor = consultation.idMedicalStaffGiver
        prescription = Prescription.objects.create(
            note="Prescription de test",
            idPatient=consultation.idPatient,
            idConsultation=consultation,
            idMedicalStaff=doctor
        )
        # Add drugs to prescription
        prod = PolyclinicProduct.objects.first()
        PrescriptionDrug.objects.create(
            prescription=prescription,
            medicament=prod,
            quantity=2,
            dosage="1 matin, 1 soir",
            instructions="Pendant les repas",
            duration="5 jours"
        )
        print(f"Created Prescription: {prescription} for patient {consultation.idPatient}")

    print("Seeding complete!")

if __name__ == "__main__":
    seed()
