from django.core.management.base import BaseCommand
from faker import Faker
import random
from datetime import timedelta
from django.utils.timezone import now
from polyclinic.models import PolyclinicProductCategory, PolyclinicProduct

fake = Faker()

class Command(BaseCommand):
    help = "Seed database with realistic products for hospital management."

    def create_products(self, category, products):
        for _ in range(20):
            product_name = random.choice(products)
            price = round(random.uniform(1000, 20000), 2)
            stock = random.randint(10, 100)
            min_stock = random.randint(5, 20)
            expiry_date = now() + timedelta(days=random.randint(30, 730))

            PolyclinicProduct.objects.create(
                category=category,
                name=product_name,
                description=fake.text(max_nb_chars=200),
                price=price,
                current_stock=stock,
                min_stock_level=min_stock,
                status="Available",
                requires_prescription=(category.name == "Médicaments"),
                expiry_date=expiry_date,
                is_medication=(category.name == "Médicaments"),
                dosage=fake.random_element(
                    ["500mg", "250mg", "1g", None]) if category.name == "Médicaments" else None,
                form=fake.random_element(
                    ["comprimé", "gélule", "sirop", "pommade", None]) if category.name == "Médicaments" else None
            )

            self.stdout.write(self.style.SUCCESS(f"Created product: {product_name} in {category.name}"))

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting database seeding...")

        # Create main categories
        pharmaceutique = PolyclinicProductCategory.objects.get_or_create(name="Pharmaceutique")[0]
        laboratoire = PolyclinicProductCategory.objects.get_or_create(name="Laboratoire")[0]

        # Create subcategories
        subcategories = {
            "Médicaments": [
                "Doliprane", "Ibuprofène", "Amoxicilline", "Ciprofloxacine", "Paracétamol",
                "Oméprazole", "Metformine", "Losartan", "Amlodipine", "Atorvastatine"
            ],
            "Cosmétiques": [
                "Crème hydratante", "Sérum anti-âge", "Lotion apaisante", "Baume à lèvres", "Gel douche pH neutre"
            ],
            "Nutrition": [
                "Complément en fer", "Oméga 3", "Vitamine D", "Protéine végétale", "Mélatonine"
            ],
            "Matériel médical": [
                "Stéthoscope", "Tensiomètre", "Thermomètre", "Oxymètre de pouls", "Glucomètre"
            ],
            "Hygiène": [
                "Gel hydroalcoolique", "Savon antiseptique", "Lingettes désinfectantes", "Shampoing médicalisé", "Bain de bouche antiseptique"
            ]
        }

        lab_products = {
            "Réactifs de test": [
                "Bandelettes urinaires", "Test de glycémie", "Réactifs PCR", "Kit de test VIH", "Solution de coloration Gram"
            ],
            "Équipements de laboratoire": [
                "Microscope", "Pipettes", "Centrifugeuse", "Éprouvettes", "Lame de microscope"
            ]
        }

        for subcat_name, products in subcategories.items():
            subcat = PolyclinicProductCategory.objects.get_or_create(name=subcat_name, parent=pharmaceutique)[0]
            self.create_products(subcat, products)

        for subcat_name, products in lab_products.items():
            subcat = PolyclinicProductCategory.objects.get_or_create(name=subcat_name, parent=laboratoire)[0]
            self.create_products(subcat, products)

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))