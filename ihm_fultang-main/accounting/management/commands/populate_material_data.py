from django.core.management.base import BaseCommand
from django.db import transaction
from accounting.stock_models import (
    StockSupplier, Category, Family, Article, 
    StockChartOfAccounts, Depot
)
from authentication.models import MedicalStaff

class Command(BaseCommand):
    help = 'Populates the database with demonstration data for Material Accounting (Cameroon Context)'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting data population...")

        with transaction.atomic():
            # 0. Get Admin User
            admin_user = MedicalStaff.objects.filter(user__is_superuser=True).first()
            if not admin_user:
                admin_user = MedicalStaff.objects.first()
            
            if not admin_user:
                self.stdout.write(self.style.ERROR("No MedicalStaff found. Please create a user first."))
                return

            self.stdout.write(f"Using user: {admin_user}")

            # 1. Ensure Basic Accounts Exist (Simplified for Demo)
            # Stock Accounts (Class 3)
            acc_311, _ = StockChartOfAccounts.objects.get_or_create(code='311', defaults={'label': 'Marchandises', 'account_class': '3', 'account_type': 'ASSET'})
            
            # Expense Accounts (Class 6)
            acc_601, _ = StockChartOfAccounts.objects.get_or_create(code='601', defaults={'label': 'Achats de marchandises', 'account_class': '6', 'account_type': 'EXPENSE'})
            
            # Revenue Accounts (Class 7)
            acc_701, _ = StockChartOfAccounts.objects.get_or_create(code='701', defaults={'label': 'Ventes de marchandises', 'account_class': '7', 'account_type': 'REVENUE'})

            # Supplier Account (Class 401)
            acc_401, _ = StockChartOfAccounts.objects.get_or_create(code='4011', defaults={'label': 'Fournisseurs', 'account_class': '4', 'account_type': 'LIABILITY'})

            # 2. Create Suppliers
            suppliers_data = [
                {"name": "LABOREX Cameroun", "type": "PHARMA", "address": "Douala, Zone Portuaire", "phone": "233 42 11 11", "email": "contact@laborex.cm"},
                {"name": "UCAPHARM", "type": "PHARMA", "address": "Yaoundé, Mvan", "phone": "222 22 33 44", "email": "info@ucapharm.cm"},
                {"name": "CAMEROUN SANTÉ", "type": "EQUIPMENT", "address": "Douala, Akwa", "phone": "233 44 55 66", "email": "sales@camsante.cm"},
                {"name": "LANACOME", "type": "SERVICE", "address": "Yaoundé, Melen", "phone": "222 22 00 00", "email": "labo@lanacome.cm"},
                {"name": "PROMEPHARM", "type": "PHARMA", "address": "Bafoussam", "phone": "233 44 11 11", "email": "contact@promepharm.cm"},
            ]

            supplier_map = {}
            for s_data in suppliers_data:
                # Generate a code based on name (e.g., LABOREX -> SUP-LAB)
                code = f"SUP-{s_data['name'][:3].upper()}"
                supplier, created = StockSupplier.objects.get_or_create(
                    name=s_data['name'],
                    defaults={
                        'code': code,
                        'supplier_type': s_data['type'],
                        'address': s_data['address'],
                        'phone': s_data['phone'],
                        'email': s_data['email'],
                        'account': acc_401,
                        'created_by': admin_user
                    }
                )
                supplier_map[s_data['name']] = supplier
                if created:
                    self.stdout.write(self.style.SUCCESS(f"Created Supplier: {s_data['name']}"))

            # 3. Create Categories and Families
            categories_structure = [
                {
                    "name": "MÉDICAMENTS", "code": "MED", 
                    "families": ["Antibiotiques", "Antipaludéens", "Analgésiques", "Vitamines", "Cardiologie"]
                },
                {
                    "name": "CONSOMMABLES", "code": "CON", 
                    "families": ["Seringues", "Pansements", "Gants", "Perfuseurs"]
                },
                {
                    "name": "ÉQUIPEMENTS", "code": "EQU", 
                    "families": ["Diagnostic", "Mobilier", "Chirurgie"]
                },
                {
                    "name": "RÉACTIFS", "code": "REA", 
                    "families": ["Biochimie", "Hématologie"]
                },
                {
                    "name": "FOURNITURES", "code": "FOU", 
                    "families": ["Bureau", "Entretien"]
                },
            ]

            category_map = {}
            family_map = {}

            for cat_data in categories_structure:
                cat, _ = Category.objects.get_or_create(
                    code=cat_data["code"],
                    defaults={
                        "name": cat_data["name"],
                        "default_stock_account": acc_311,
                        "default_expense_account": acc_601
                    }
                )
                category_map[cat_data["name"]] = cat
                
                for fam_name in cat_data["families"]:
                    fam_code = f"{cat_data['code']}-{fam_name[:3].upper()}"
                    fam, _ = Family.objects.get_or_create(
                        name=fam_name,
                        category=cat,
                        defaults={
                            "code": fam_code
                        }
                    )
                    family_map[fam_name] = fam
            
            self.stdout.write(self.style.SUCCESS("Categories and Families created."))

            # 4. Create Articles
            # Helper for mapping types
            type_map = {
                "Médicament": "DRUG",
                "Consommable": "CONSUMABLE",
                "Équipement": "EQUIPMENT",
                "Réactif": "REAGENT",
                "Fourniture": "SUPPLY"
            }
            unit_map = {
                "Boîte": "BOX",
                "Unité": "UNIT",
                "Ampoule": "VIAL",
                "Litre": "LITER"
            }

            articles_data = [
                # Médicaments
                {"name": "Amoxicilline 500mg Bte/10", "family": "Antibiotiques", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 1500, "code": "AMOX500"},
                {"name": "Ciprofloxacine 500mg Bte/10", "family": "Antibiotiques", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 2500, "code": "CIPRO500"},
                {"name": "Coartem 20/120 (Adulte)", "family": "Antipaludéens", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 3000, "code": "COARTEM"},
                {"name": "Paracétamol 500mg Bte/20", "family": "Analgésiques", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 500, "code": "PARA500"},
                {"name": "Vitamine C 1000mg inj.", "family": "Vitamines", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Ampoule", "price": 200, "code": "VITC1000"},
                # Consommables
                {"name": "Seringue 5ml + Aiguille", "family": "Seringues", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Unité", "price": 100, "code": "SER5ML"},
                {"name": "Bande Gaze 10cm", "family": "Pansements", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Unité", "price": 300, "code": "GAZE10"},
                {"name": "Gants Latex M Bte/100", "family": "Gants", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Boîte", "price": 3500, "code": "GANTM"},
                {"name": "Perfuseur simple", "family": "Perfuseurs", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Unité", "price": 250, "code": "PERF01"},
                # Équipements
                {"name": "Tensiomètre Électronique", "family": "Diagnostic", "cat": "ÉQUIPEMENTS", "type": "Équipement", "unit": "Unité", "price": 25000, "code": "TENS01"},
                {"name": "Stéthoscope Double Pavillon", "family": "Diagnostic", "cat": "ÉQUIPEMENTS", "type": "Équipement", "unit": "Unité", "price": 15000, "code": "STETH01"},
                # Réactifs
                {"name": "Glucotest 50 Bandelettes", "family": "Biochimie", "cat": "RÉACTIFS", "type": "Réactif", "unit": "Boîte", "price": 12000, "code": "GLUCO50"},
                {"name": "Diluant Hématologie 20L", "family": "Hématologie", "cat": "RÉACTIFS", "type": "Réactif", "unit": "Litre", "price": 45000, "code": "DIL20L"},
                # Fournitures
                {"name": "Papier A4 Ramette", "family": "Bureau", "cat": "FOURNITURES", "type": "Fourniture", "unit": "Unité", "price": 3500, "code": "PAPA4"},
                {"name": "Eau de Javel 5L", "family": "Entretien", "cat": "FOURNITURES", "type": "Fourniture", "unit": "Litre", "price": 2000, "code": "JAVEL5"},
            ]

            for item in articles_data:
                cat = category_map.get(item["cat"])
                fam = family_map.get(item["family"])
                
                Article.objects.get_or_create(
                    code=item["code"],
                    defaults={
                        "name": item["name"],
                        "category": cat,
                        "family": fam,
                        "article_type": type_map.get(item["type"], "SUPPLY"),
                        "unit": unit_map.get(item["unit"], "UNIT"),
                        "weighted_average_price": item["price"], # Initial PMP
                        "selling_price": item["price"] * 1.3, # Margin 30% arbitrary
                        "stock_account": acc_311,
                        "purchase_account": acc_601,
                        "sales_account": acc_701,
                        "created_by": admin_user,
                        "requires_batch": item["type"] in ["Médicament", "Réactif"] # Auto-logic
                    }
                )
                self.stdout.write(self.style.SUCCESS(f"Created Article: {item['name']}"))

            self.stdout.write(self.style.SUCCESS('Successfully populated Material Accounting data!'))
