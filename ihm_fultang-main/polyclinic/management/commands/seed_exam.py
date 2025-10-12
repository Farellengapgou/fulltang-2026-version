from faker import Faker
from django.core.management.base import BaseCommand
import random
from datetime import datetime, timedelta
fake = Faker()
from polyclinic.models import Exam


class Command(BaseCommand):
    help = "Remplit la table Exam avec des données factices."

    def handle(self, *args, **kwargs):
        # Liste prédéfinie de 20 examens avec leurs descriptions
        exams_data = [
            {"name": "Blood Test", "description": "Complete blood count to check for infections, anemia, and other conditions."},
            {"name": "X-Ray", "description": "Imaging of bones to detect fractures or abnormalities."},
            {"name": "MRI Scan", "description": "Detailed imaging of soft tissues, organs, and bones using magnetic fields."},
            {"name": "CT Scan", "description": "Cross-sectional imaging for detailed views of internal structures."},
            {"name": "Ultrasound", "description": "Imaging using sound waves to visualize organs and tissues."},
            {"name": "Electrocardiogram", "description": "Records the electrical activity of the heart to detect heart conditions."},
            {"name": "Colonoscopy", "description": "Examination of the colon to detect polyps or cancer."},
            {"name": "Mammogram", "description": "Breast cancer screening using X-ray imaging."},
            {"name": "Endoscopy", "description": "Examination of the digestive tract using a flexible tube with a camera."},
            {"name": "Biopsy", "description": "Tissue sample analysis to diagnose diseases like cancer."},
            {"name": "Blood Sugar Test", "description": "Measures the level of glucose in the blood to diagnose diabetes."},
            {"name": "Thyroid Function Test", "description": "Checks how well the thyroid gland is working."},
            {"name": "Liver Function Test", "description": "Assesses the health of the liver by measuring enzymes and proteins."},
            {"name": "Kidney Function Test", "description": "Evaluates how well the kidneys are filtering waste from the blood."},
            {"name": "Pap Smear", "description": "Screening test for cervical cancer."},
            {"name": "Bone Density Test", "description": "Measures bone strength and risk of fractures."},
            {"name": "Allergy Test", "description": "Identifies allergens causing allergic reactions."},
            {"name": "Pulmonary Function Test", "description": "Assesses lung function and capacity."},
            {"name": "Stress Test", "description": "Evaluates heart function under physical stress."},
            {"name": "Genetic Testing", "description": "Analyzes DNA to identify genetic disorders or risks."},
        ]

        # Parcourir la liste des examens et les créer dans la base de données
        for exam_data in exams_data:
            exam_name = exam_data["name"]
            exam_description = exam_data["description"]
            exam_cost = random.randint(5000, 100000)  # Prix aléatoire entre 5000 et 100000

            # Créer un examen
            exam = Exam.objects.create(
                examName=exam_name,
                examCost=exam_cost,
                examDescription=exam_description,
            )
            self.stdout.write(self.style.SUCCESS(f"Examen créé: {exam.examName} (Coût: {exam.examCost} FCFA, Description: {exam.examDescription})"))

        self.stdout.write(self.style.SUCCESS("La table Exam a été remplie avec succès !"))