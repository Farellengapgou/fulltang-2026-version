from django.core.management.base import BaseCommand
from django.db import transaction
from accounting.stock_models import (
    StockSupplier, Category, Family, Article, 
    Depot
)
from accounting.models_financier import ChartOfAccounts
from authentication.models import MedicalStaff
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Populates the database with demonstration data for Material Accounting (Cameroon Context)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force deletion of existing data',
        )

    def handle(self, *args, **kwargs):
        force = kwargs.get('force', False)
        
        self.stdout.write("Starting data population...")

        with transaction.atomic():
            

            # SUPPRIMER TOUTES LES DONNÉES EXISTANTES
            if force:
                self.stdout.write(self.style.WARNING("Deleting all existing data..."))
                
                # Supprimer dans l'ordre inverse des dépendances
                Article.objects.all().delete()
                Family.objects.all().delete()
                Category.objects.all().delete()
                Depot.objects.all().delete()
                StockSupplier.objects.all().delete()
                # On ne supprime pas forcément ChartOfAccounts ici car c'est partagé
                
                self.stdout.write(self.style.SUCCESS("All existing data deleted."))

            # 0. Get Admin User
            # MedicalStaff semble être le modèle utilisateur lui-même dans ce projet
            admin_user = MedicalStaff.objects.filter(is_superuser=True).first()
            if not admin_user:
                self.stdout.write(self.style.ERROR("No superuser found. Please create a superuser first."))
                return
            
            self.stdout.write(f"Using user: {admin_user}")

            # 1. Ensure Basic Accounts Exist (Simplified for Demo)
            # ChartOfAccounts (from models_financier)
            acc_311, _ = ChartOfAccounts.objects.get_or_create(
                code='311', 
                defaults={
                    'label': 'Marchandises', 
                    'account_class': '3', 
                    'account_type': 'ASSET'
                }
            )
            
            # Expense Accounts (Class 6)
            acc_601, _ = ChartOfAccounts.objects.get_or_create(
                code='601', 
                defaults={
                    'label': 'Achats de marchandises', 
                    'account_class': '6', 
                    'account_type': 'EXPENSE'
                }
            )
            
            # Revenue Accounts (Class 7)
            acc_701, _ = ChartOfAccounts.objects.get_or_create(
                code='701', 
                defaults={
                    'label': 'Ventes de marchandises', 
                    'account_class': '7', 
                    'account_type': 'REVENUE'
                }
            )

            # Supplier Account (Class 401)
            acc_401, _ = ChartOfAccounts.objects.get_or_create(
                code='4011', 
                defaults={
                    'label': 'Fournisseurs', 
                    'account_class': '4', 
                    'account_type': 'LIABILITY'
                }
            )

            # 2. Create Depots (Entrepôts)
            self.stdout.write("Creating depots...")
            depots_data = [
                {"code": "DPT-01", "name": "Pharmacie Principale", "type": "PHARMACY"},
                {"code": "DPT-02", "name": "Bloc Opératoire", "type": "SURGERY"},
                {"code": "DPT-03", "name": "Laboratoire", "type": "LAB"},
                {"code": "DPT-04", "name": "Urgences", "type": "EMERGENCY"},
                {"code": "DPT-05", "name": "Magasin Central", "type": "WAREHOUSE"},
            ]
            
            depot_map = {}
            for depot_data in depots_data:
                depot, created = Depot.objects.get_or_create(
                    code=depot_data["code"],
                    defaults={
                        'name': depot_data["name"],
                        'depot_type': depot_data["type"],
                        'manager': admin_user,
                        'is_active': True
                    }
                )
                depot_map[depot_data["code"]] = depot
                if created:
                    self.stdout.write(self.style.SUCCESS(f"Created Depot: {depot_data['name']}"))

            # 3. Create Suppliers
            self.stdout.write("Creating suppliers...")
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
                    code=code,
                    defaults={
                        'name': s_data['name'],
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

            # 4. Create Categories and Families
            self.stdout.write("Creating categories and families...")
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
                self.stdout.write(self.style.SUCCESS(f"Created Category: {cat_data['name']}"))
                
                for fam_name in cat_data["families"]:
                    # Utiliser le nom complet pour éviter les collisions (ex: Antibiotiques vs Antipaludéens)
                    fam_code = f"{cat_data['code']}-{fam_name.upper().replace(' ', '_')}"
                    fam, _ = Family.objects.get_or_create(
                        name=fam_name,
                        category=cat,
                        defaults={
                            "code": fam_code
                        }
                    )
                    family_map[fam_name] = fam
                    self.stdout.write(self.style.SUCCESS(f"  └── Family: {fam_name}"))
            
            self.stdout.write(self.style.SUCCESS("Categories and Families created."))

            # 5. Create Articles
            self.stdout.write("Creating articles...")
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
                # ========== MÉDICAMENTS (50 articles) ==========
                # Antibiotiques (10)
                {"name": "Amoxicilline 500mg Bte/10", "family": "Antibiotiques", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 1500, "code": "AMOX500"},
                {"name": "Ciprofloxacine 500mg Bte/10", "family": "Antibiotiques", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 2500, "code": "CIPRO500"},
                {"name": "Azithromycine 250mg Bte/6", "family": "Antibiotiques", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 3500, "code": "AZIT250"},
                {"name": "Métronidazole 500mg Bte/20", "family": "Antibiotiques", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 1800, "code": "METRO500"},
                {"name": "Ceftriaxone 1g inj Bte/10", "family": "Antibiotiques", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 8000, "code": "CEFT1G"},
                {"name": "Doxycycline 100mg Bte/10", "family": "Antibiotiques", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 2000, "code": "DOXY100"},
                {"name": "Amoxicilline+Acide Clavulanique 1g Bte/12", "family": "Antibiotiques", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 4500, "code": "AUGM1G"},
                {"name": "Gentamicine 80mg/2ml inj Bte/10", "family": "Antibiotiques", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 3000, "code": "GENT80"},
                {"name": "Clarithromycine 500mg Bte/14", "family": "Antibiotiques", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 5500, "code": "CLAR500"},
                {"name": "Cotrimoxazole 480mg Bte/20", "family": "Antibiotiques", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 1200, "code": "COTRI480"},
                
                # Antipaludéens (8)
                {"name": "Coartem 20/120 (Adulte)", "family": "Antipaludéens", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 3000, "code": "COARTEM"},
                {"name": "Artesunate 60mg inj Bte/6", "family": "Antipaludéens", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 12000, "code": "ARTES60"},
                {"name": "Quinine 300mg Bte/20", "family": "Antipaludéens", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 2500, "code": "QUIN300"},
                {"name": "Artémether+Luméfantrine Enfant Bte/6", "family": "Antipaludéens", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 2000, "code": "COART-E"},
                {"name": "Chloroquine 100mg Bte/20", "family": "Antipaludéens", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 800, "code": "CHLORO100"},
                {"name": "Méfloquine 250mg Bte/8", "family": "Antipaludéens", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 6000, "code": "MEFLO250"},
                {"name": "Primaquine 15mg Bte/14", "family": "Antipaludéens", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 3500, "code": "PRIMA15"},
                {"name": "Artésunate+Amodiaquine Bte/6", "family": "Antipaludéens", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 4000, "code": "ARTAMO"},
                
                # Analgésiques (12)
                {"name": "Paracétamol 500mg Bte/20", "family": "Analgésiques", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 500, "code": "PARA500"},
                {"name": "Paracétamol 1000mg Bte/8", "family": "Analgésiques", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 800, "code": "PARA1000"},
                {"name": "Ibuprofène 400mg Bte/20", "family": "Analgésiques", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 1500, "code": "IBU400"},
                {"name": "Diclofénac 50mg Bte/20", "family": "Analgésiques", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 1800, "code": "DICLO50"},
                {"name": "Tramadol 50mg Bte/20", "family": "Analgésiques", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 3500, "code": "TRAM50"},
                {"name": "Morphine 10mg/ml inj Amp/10", "family": "Analgésiques", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Ampoule", "price": 8000, "code": "MORPH10"},
                {"name": "Aspirine 500mg Bte/20", "family": "Analgésiques", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 600, "code": "ASP500"},
                {"name": "Kétoprofène 100mg Bte/12", "family": "Analgésiques", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 2500, "code": "KETO100"},
                {"name": "Piroxicam 20mg Bte/10", "family": "Analgésiques", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 2000, "code": "PIROX20"},
                {"name": "Paracétamol+Codéine Bte/16", "family": "Analgésiques", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 2800, "code": "PARACOD"},
                {"name": "Naproxène 500mg Bte/20", "family": "Analgésiques", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 2200, "code": "NAPRO500"},
                {"name": "Méloxicam 15mg Bte/10", "family": "Analgésiques", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 3000, "code": "MELOX15"},
                
                # Vitamines (10)
                {"name": "Vitamine C 1000mg inj.", "family": "Vitamines", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Ampoule", "price": 200, "code": "VITC1000"},
                {"name": "Vitamine B Complex inj Amp/10", "family": "Vitamines", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Ampoule", "price": 2500, "code": "VITBCOMP"},
                {"name": "Vitamine D3 200000UI Amp/1", "family": "Vitamines", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Ampoule", "price": 1500, "code": "VITD3"},
                {"name": "Acide Folique 5mg Bte/30", "family": "Vitamines", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 800, "code": "FOLIC5"},
                {"name": "Fer+Acide Folique Bte/30", "family": "Vitamines", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 1200, "code": "FERFOL"},
                {"name": "Calcium+Vitamine D3 Bte/30", "family": "Vitamines", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 3500, "code": "CALVITD"},
                {"name": "Multivitamines Sirop 200ml", "family": "Vitamines", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Unité", "price": 2500, "code": "MULTIVIT"},
                {"name": "Vitamine A 200000UI Caps/1", "family": "Vitamines", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Unité", "price": 500, "code": "VITA200"},
                {"name": "Zinc 20mg Bte/30", "family": "Vitamines", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 1500, "code": "ZINC20"},
                {"name": "Magnésium 300mg Bte/30", "family": "Vitamines", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 2000, "code": "MAG300"},
                
                # Cardiologie (10)
                {"name": "Amlodipine 5mg Bte/30", "family": "Cardiologie", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 2500, "code": "AMLO5"},
                {"name": "Enalapril 10mg Bte/30", "family": "Cardiologie", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 2000, "code": "ENAL10"},
                {"name": "Atenolol 50mg Bte/30", "family": "Cardiologie", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 1800, "code": "ATEN50"},
                {"name": "Furosémide 40mg Bte/30", "family": "Cardiologie", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 1500, "code": "FURO40"},
                {"name": "Digoxine 0.25mg Bte/30", "family": "Cardiologie", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 2200, "code": "DIGO025"},
                {"name": "Aspirine Cardio 100mg Bte/30", "family": "Cardiologie", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 1200, "code": "ASPCARD"},
                {"name": "Losartan 50mg Bte/30", "family": "Cardiologie", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 3000, "code": "LOSAR50"},
                {"name": "Bisoprolol 5mg Bte/30", "family": "Cardiologie", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 2800, "code": "BISO5"},
                {"name": "Spironolactone 25mg Bte/30", "family": "Cardiologie", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 2500, "code": "SPIRO25"},
                {"name": "Clopidogrel 75mg Bte/30", "family": "Cardiologie", "cat": "MÉDICAMENTS", "type": "Médicament", "unit": "Boîte", "price": 8000, "code": "CLOPI75"},
                
                # ========== CONSOMMABLES (30 articles) ==========
                # Seringues (8)
                {"name": "Seringue 5ml + Aiguille", "family": "Seringues", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Unité", "price": 100, "code": "SER5ML"},
                {"name": "Seringue 10ml + Aiguille", "family": "Seringues", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Unité", "price": 150, "code": "SER10ML"},
                {"name": "Seringue 20ml + Aiguille", "family": "Seringues", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Unité", "price": 200, "code": "SER20ML"},
                {"name": "Seringue 2ml + Aiguille", "family": "Seringues", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Unité", "price": 80, "code": "SER2ML"},
                {"name": "Seringue Insuline 1ml", "family": "Seringues", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Unité", "price": 120, "code": "SERINSU"},
                {"name": "Aiguille IM 21G Bte/100", "family": "Seringues", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Boîte", "price": 3000, "code": "AIG21G"},
                {"name": "Aiguille IV 18G Bte/100", "family": "Seringues", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Boîte", "price": 3500, "code": "AIG18G"},
                {"name": "Cathéter IV 20G Bte/50", "family": "Seringues", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Boîte", "price": 8000, "code": "CATH20G"},
                
                # Pansements (8)
                {"name": "Bande Gaze 10cm", "family": "Pansements", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Unité", "price": 300, "code": "GAZE10"},
                {"name": "Compresse Stérile 10x10 Bte/100", "family": "Pansements", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Boîte", "price": 2500, "code": "COMP10"},
                {"name": "Sparadrap 5cm x 5m", "family": "Pansements", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Unité", "price": 500, "code": "SPAR5"},
                {"name": "Pansement Adhésif Bte/100", "family": "Pansements", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Boîte", "price": 3000, "code": "PANSADH"},
                {"name": "Coton Hydrophile 500g", "family": "Pansements", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Unité", "price": 2000, "code": "COT500"},
                {"name": "Bande Élastique 10cm", "family": "Pansements", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Unité", "price": 800, "code": "BANDELAS"},
                {"name": "Pansement Hydrocolloïde 10x10", "family": "Pansements", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Unité", "price": 1500, "code": "PANHYD"},
                {"name": "Tulle Gras Bte/10", "family": "Pansements", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Boîte", "price": 3500, "code": "TULLE10"},
                
                # Gants (6)
                {"name": "Gants Latex M Bte/100", "family": "Gants", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Boîte", "price": 3500, "code": "GANTM"},
                {"name": "Gants Latex L Bte/100", "family": "Gants", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Boîte", "price": 3500, "code": "GANTL"},
                {"name": "Gants Latex S Bte/100", "family": "Gants", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Boîte", "price": 3500, "code": "GANTS"},
                {"name": "Gants Stériles Chirurgicaux Paire", "family": "Gants", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Unité", "price": 500, "code": "GANTCHIR"},
                {"name": "Gants Nitrile M Bte/100", "family": "Gants", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Boîte", "price": 5000, "code": "GNITRM"},
                {"name": "Gants Vinyle M Bte/100", "family": "Gants", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Boîte", "price": 2500, "code": "GVINM"},
                
                # Perfuseurs (8)
                {"name": "Perfuseur simple", "family": "Perfuseurs", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Unité", "price": 250, "code": "PERF01"},
                {"name": "Perfuseur avec régulateur", "family": "Perfuseurs", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Unité", "price": 350, "code": "PERFREG"},
                {"name": "Sérum Physiologique 500ml", "family": "Perfuseurs", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Unité", "price": 800, "code": "SERPHY500"},
                {"name": "Sérum Glucosé 5% 500ml", "family": "Perfuseurs", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Unité", "price": 900, "code": "SERGLUC5"},
                {"name": "Ringer Lactate 500ml", "family": "Perfuseurs", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Unité", "price": 1000, "code": "RINGLAC"},
                {"name": "Tubulure de Transfusion", "family": "Perfuseurs", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Unité", "price": 500, "code": "TUBTRANS"},
                {"name": "Poche de Sang Vide", "family": "Perfuseurs", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Unité", "price": 1500, "code": "POCHSANG"},
                {"name": "Set de Perfusion Pédiatrique", "family": "Perfuseurs", "cat": "CONSOMMABLES", "type": "Consommable", "unit": "Unité", "price": 400, "code": "PERFPED"},
                
                # ========== ÉQUIPEMENTS (12 articles) ==========
                # Diagnostic (6)
                {"name": "Tensiomètre Électronique", "family": "Diagnostic", "cat": "ÉQUIPEMENTS", "type": "Équipement", "unit": "Unité", "price": 25000, "code": "TENS01"},
                {"name": "Stéthoscope Double Pavillon", "family": "Diagnostic", "cat": "ÉQUIPEMENTS", "type": "Équipement", "unit": "Unité", "price": 15000, "code": "STETH01"},
                {"name": "Thermomètre Digital", "family": "Diagnostic", "cat": "ÉQUIPEMENTS", "type": "Équipement", "unit": "Unité", "price": 3000, "code": "THERM01"},
                {"name": "Oxymètre de Pouls", "family": "Diagnostic", "cat": "ÉQUIPEMENTS", "type": "Équipement", "unit": "Unité", "price": 18000, "code": "OXY01"},
                {"name": "Otoscope", "family": "Diagnostic", "cat": "ÉQUIPEMENTS", "type": "Équipement", "unit": "Unité", "price": 35000, "code": "OTO01"},
                {"name": "Glucomètre + 50 Bandelettes", "family": "Diagnostic", "cat": "ÉQUIPEMENTS", "type": "Équipement", "unit": "Unité", "price": 12000, "code": "GLUCO01"},
                
                # Mobilier (3)
                {"name": "Lit d'Examen Médical", "family": "Mobilier", "cat": "ÉQUIPEMENTS", "type": "Équipement", "unit": "Unité", "price": 150000, "code": "LITEXAM"},
                {"name": "Chariot de Soins", "family": "Mobilier", "cat": "ÉQUIPEMENTS", "type": "Équipement", "unit": "Unité", "price": 45000, "code": "CHARSOIN"},
                {"name": "Fauteuil Roulant", "family": "Mobilier", "cat": "ÉQUIPEMENTS", "type": "Équipement", "unit": "Unité", "price": 80000, "code": "FAUTROUL"},
                
                # Chirurgie (3)
                {"name": "Set de Suture Complet", "family": "Chirurgie", "cat": "ÉQUIPEMENTS", "type": "Équipement", "unit": "Unité", "price": 25000, "code": "SETSUT"},
                {"name": "Pince Kocher 14cm", "family": "Chirurgie", "cat": "ÉQUIPEMENTS", "type": "Équipement", "unit": "Unité", "price": 8000, "code": "PINKOCH"},
                {"name": "Ciseaux Chirurgicaux 15cm", "family": "Chirurgie", "cat": "ÉQUIPEMENTS", "type": "Équipement", "unit": "Unité", "price": 12000, "code": "CISCHIR"},
                
                # ========== RÉACTIFS (10 articles) ==========
                # Biochimie (5)
                {"name": "Glucotest 50 Bandelettes", "family": "Biochimie", "cat": "RÉACTIFS", "type": "Réactif", "unit": "Boîte", "price": 12000, "code": "GLUCO50"},
                {"name": "Bandelettes Urinaires Bte/100", "family": "Biochimie", "cat": "RÉACTIFS", "type": "Réactif", "unit": "Boîte", "price": 15000, "code": "BANDURIN"},
                {"name": "Réactif Glycémie 500 Tests", "family": "Biochimie", "cat": "RÉACTIFS", "type": "Réactif", "unit": "Boîte", "price": 45000, "code": "REAGLYC"},
                {"name": "Réactif Créatinine 200 Tests", "family": "Biochimie", "cat": "RÉACTIFS", "type": "Réactif", "unit": "Boîte", "price": 35000, "code": "REACREAT"},
                {"name": "Réactif Transaminases 100 Tests", "family": "Biochimie", "cat": "RÉACTIFS", "type": "Réactif", "unit": "Boîte", "price": 40000, "code": "REATRANS"},
                
                # Hématologie (5)
                {"name": "Diluant Hématologie 20L", "family": "Hématologie", "cat": "RÉACTIFS", "type": "Réactif", "unit": "Litre", "price": 45000, "code": "DIL20L"},
                {"name": "Tubes EDTA Bte/100", "family": "Hématologie", "cat": "RÉACTIFS", "type": "Réactif", "unit": "Boîte", "price": 8000, "code": "TUBEDTA"},
                {"name": "Tubes Secs Bte/100", "family": "Hématologie", "cat": "RÉACTIFS", "type": "Réactif", "unit": "Boîte", "price": 7000, "code": "TUBSEC"},
                {"name": "Lames Microscope Bte/50", "family": "Hématologie", "cat": "RÉACTIFS", "type": "Réactif", "unit": "Boîte", "price": 3000, "code": "LAMMICRO"},
                {"name": "Colorant MGG 500ml", "family": "Hématologie", "cat": "RÉACTIFS", "type": "Réactif", "unit": "Unité", "price": 18000, "code": "COLMGG"},
                
                # ========== FOURNITURES (8 articles) ==========
                # Bureau (5)
                {"name": "Papier A4 Ramette", "family": "Bureau", "cat": "FOURNITURES", "type": "Fourniture", "unit": "Unité", "price": 3500, "code": "PAPA4"},
                {"name": "Stylos Bic Bte/50", "family": "Bureau", "cat": "FOURNITURES", "type": "Fourniture", "unit": "Boîte", "price": 5000, "code": "STYBIC"},
                {"name": "Classeurs A4 Lot/10", "family": "Bureau", "cat": "FOURNITURES", "type": "Fourniture", "unit": "Unité", "price": 8000, "code": "CLASSA4"},
                {"name": "Registres 200 Pages", "family": "Bureau", "cat": "FOURNITURES", "type": "Fourniture", "unit": "Unité", "price": 2500, "code": "REG200"},
                {"name": "Agrafeuse + Agrafes", "family": "Bureau", "cat": "FOURNITURES", "type": "Fourniture", "unit": "Unité", "price": 1500, "code": "AGRAF"},
                
                # Entretien (3)
                {"name": "Eau de Javel 5L", "family": "Entretien", "cat": "FOURNITURES", "type": "Fourniture", "unit": "Litre", "price": 2000, "code": "JAVEL5"},
                {"name": "Désinfectant Sol 5L", "family": "Entretien", "cat": "FOURNITURES", "type": "Fourniture", "unit": "Litre", "price": 8000, "code": "DESINSOL"},
                {"name": "Savon Liquide 5L", "family": "Entretien", "cat": "FOURNITURES", "type": "Fourniture", "unit": "Litre", "price": 6000, "code": "SAVLIQ5"},
            ]

            for item in articles_data:
                cat = category_map.get(item["cat"])
                fam = family_map.get(item["family"])
                
                article, created = Article.objects.get_or_create(
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
                if created:
                    self.stdout.write(self.style.SUCCESS(f"Created Article: {item['name']}"))

            self.stdout.write(self.style.SUCCESS('✅ Successfully populated Material Accounting data!'))
            self.stdout.write(self.style.SUCCESS('📦 Created:'))
            self.stdout.write(self.style.SUCCESS(f'  • Depots: {len(depot_map)}'))
            self.stdout.write(self.style.SUCCESS(f'  • Suppliers: {len(supplier_map)}'))
            self.stdout.write(self.style.SUCCESS(f'  • Categories: {len(category_map)}'))
            self.stdout.write(self.style.SUCCESS(f'  • Families: {len(family_map)}'))
            self.stdout.write(self.style.SUCCESS(f'  • Articles: {len(articles_data)}'))