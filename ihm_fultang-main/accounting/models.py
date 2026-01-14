from django.conf import settings
from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import transaction
from decimal import Decimal
from datetime import datetime, timedelta


class BudgetExercise(models.Model):
    start = models.DateTimeField(default=timezone.now)
    end = models.DateTimeField()


class Account(models.Model):
    STATUS_TYPE = [
        ("credit", "credit"),
        ("debit", "debit"),
        ("creance", "creance")
    ]
    
    number = models.IntegerField(default=0)
    libelle = models.CharField(max_length=255)
    status = models.CharField(max_length=255, choices=STATUS_TYPE, null=True)
    
    def clean(self):
        if self.libelle and self.libelle[0] in ['4', '5'] and not self.status:
            raise ValidationError("Status cannot be null if the first digit of libelle is 4 or 5")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    

class AccountState(models.Model):
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    budgetExercise = models.ForeignKey('BudgetExercise', on_delete=models.CASCADE)
    account = models.ForeignKey('Account', on_delete=models.CASCADE)


class FinancialOperation(models.Model):
    name = models.CharField(max_length=255)

    account = models.ForeignKey('Account', on_delete=models.CASCADE)

class Facture(models.Model):
    montant = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    type = models.CharField(max_length=255)

    financialOperation = models.ForeignKey('FinancialOperation', on_delete=models.CASCADE)



#################################### Nouveau ###################################################
# Plan comptable
class ChartOfAccounts(models.Model):
    ACCOUNT_CLASSES = [
        ('1', 'Comptes de capitaux'),
        ('2', 'Comptes immobilisations'),
        ('3', 'Comptes de stocks'),
        ('4', 'Comptes de tiers'),
        ('5', 'Comptes de trésorerie'),
        ('6', 'Comptes de charges'),
        ('7', 'Comptes de produits'),
        ('8', 'Comptes spéciaux'),
    ]
    
    ACCOUNT_TYPES = [
        ('ASSET', 'Actif'),
        ('LIABILITY', 'Passif'),
        ('EQUITY', 'Capitaux propres'),
        ('REVENUE', 'Produit'),
        ('EXPENSE', 'Charge'),
    ]
    
    code = models.CharField(max_length=10, unique=True)
    label = models.CharField(max_length=255)
    account_class = models.CharField(max_length=1, choices=ACCOUNT_CLASSES)
    account_type = models.CharField(max_length=10, choices=ACCOUNT_TYPES)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='sub_accounts')
    is_active = models.BooleanField(default=True)
    is_detailed = models.BooleanField(default=True)  # True si le compte peut recevoir une écriture (Auxiliaire)
    is_collective = models.BooleanField(default=False) # True pour les comptes de regroupement (ex: 411)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Compte comptable"
        ordering = ['code']
    
    def __str__(self):
        return f"{self.code} - {self.label}"


    def get_balance(self, start_date=None, end_date=None):
        """Calcule le solde du compte sur une période en utilisant AccountPeriodBalance si possible"""
        # 1. Utilisation prioritaire des soldes matérialisés pour performance (O(1) vs O(N))
        if end_date:
            period = AccountingPeriod.objects.filter(year=end_date.year, month=end_date.month).first()
            if period and period.state in ['CLOSED', 'LOCKED']:
                balance = AccountPeriodBalance.objects.filter(account=self, period=period).first()
                if balance:
                    # Pour simplifier, on retourne le solde de clôture si on demande précisément la fin d'un mois clôturé
                    if self.account_class in ['2', '3', '5', '6']:
                        return balance.closing_debit - balance.closing_credit
                    else:
                        return balance.closing_credit - balance.closing_debit

        # 2. Fallback dynamique optimisé pour les périodes ouvertes
        entries = JournalEntryLine.objects.filter(account=self, journal_entry__state='POSTED')
        if start_date:
            entries = entries.filter(journal_entry__entry_date__gte=start_date)
        if end_date:
            entries = entries.filter(journal_entry__entry_date__lte=end_date)
        
        totals = entries.aggregate(
            debit=models.Sum('debit_amount'),
            credit=models.Sum('credit_amount')
        )
        total_debit = totals['debit'] or Decimal('0')
        total_credit = totals['credit'] or Decimal('0')
        
        if self.account_class in ['2', '3', '5', '6']:
            return total_debit - total_credit
        else:
            return total_credit - total_debit

    @property
    def normal_side(self):
        """Retourne le sens normal du compte (DEBIT/CREDIT)"""
        if self.account_class in ['2', '3', '5', '6']:
            return 'DEBIT'
        return 'CREDIT'


# Journaux comptables
class Journal(models.Model):
    JOURNAL_TYPES = [
        ('SALES', 'Journal des ventes'),
        ('PURCHASES', 'Journal des achats'),
        ('BANK', 'Journal de banque'),
        ('CASH', 'Journal de caisse'),
        ('GENERAL', 'Journal général'),
        ('MISC', 'Opérations diverses'),
    ]
    
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    journal_type = models.CharField(max_length=15, choices=JOURNAL_TYPES)
    default_debit_account = models.ForeignKey(
        'ChartOfAccounts', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='default_debit_journals'
    )
    default_credit_account = models.ForeignKey(
        'ChartOfAccounts', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='default_credit_journals'
    )
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.code} - {self.name}"


# Écritures comptables
class JournalEntry(models.Model):
    ENTRY_STATES = [
        ('DRAFT', 'Brouillon'),
        ('POSTED', 'Validée'),
        ('CANCELLED', 'Annulée'),
    ]
    
    entry_number = models.CharField(max_length=20, unique=True)
    entry_date = models.DateField()
    journal = models.ForeignKey('Journal', on_delete=models.CASCADE)
    reference = models.CharField(max_length=100, blank=True)
    description = models.TextField()
    state = models.CharField(max_length=10, choices=ENTRY_STATES, default='DRAFT')
    total_debit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_credit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Pièce justificative (Voucher)
    voucher_number = models.CharField(max_length=50, unique=True, null=True, blank=True)
    
    # Historique de modification
    is_reversed = models.BooleanField(default=False)
    reversal_of = models.OneToOneField('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='reversed_by')
    
    # Relations
    created_by = models.ForeignKey("authentication.MedicalStaff", on_delete=models.CASCADE, related_name='created_entries')
    validated_by = models.ForeignKey("authentication.MedicalStaff", on_delete=models.SET_NULL, null=True, blank=True, related_name='validated_entries')

    created_at = models.DateTimeField(auto_now_add=True)
    validated_at = models.DateTimeField(null=True, blank=True)

    bill = models.ForeignKey('polyclinic.Bill', on_delete=models.SET_NULL, null=True, blank=True)
    consultation = models.ForeignKey('polyclinic.Consultation', on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        verbose_name = "Écriture comptable"
        constraints = [
            models.CheckConstraint(
                check=models.Q(state='DRAFT') | models.Q(total_debit=models.F('total_credit')),
                name='posted_entry_must_be_balanced'
            )
        ]
        ordering = ['-entry_date', '-created_at']
    
    def __str__(self):
        return f"{self.entry_number} - {self.description}"
    
    def save(self, *args, **kwargs):
        # 1. Empêcher la modification d'une écriture validée (POSTED)
        if self.pk:
            old_self = JournalEntry.objects.get(pk=self.pk)
            if old_self.state == 'POSTED':
                # On autorise seulement le changement vers CANCELLED si nécessaire, 
                # mais la règle d'or dit de ne jamais supprimer/modifier.
                # Ici on bloque tout sauf si on est en train de la passer en POSTED pour la première fois.
                if self.state == 'POSTED' and old_self.state == 'POSTED':
                    raise ValidationError("Une écriture validée ne peut plus être modifiée. Utilisez la contre-passation.")

        # 2. Vérifier si la période est ouverte
        self.check_period_is_open()

        if not self.entry_number:
            self.entry_number = self.generate_entry_number()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        if self.state == 'POSTED':
            raise ValidationError("Une écriture validée ne peut jamais être supprimée. Utilisez la contre-passation.")
        super().delete(*args, **kwargs)

    def check_period_is_open(self):
        """Vérifie que la date de l'écriture tombe dans une période ouverte"""
        period = AccountingPeriod.objects.filter(
            year=self.entry_date.year, 
            month=self.entry_date.month
        ).first()
        
        if not period:
            # Si la période n'existe pas, on considère qu'on ne peut pas poster
            # Alternative: Créer la période automatiquement si configuré
            raise ValidationError(f"Aucune période comptable définie pour {self.entry_date.month}/{self.entry_date.year}")
        
        if period.state != 'OPEN':
            raise ValidationError(f"La période {period} est {period.get_state_display()}. Écriture non autorisée.")

    def update_totals(self, commit=True):
        """Calcule les totaux à partir des lignes. commit=False pour éviter double save."""
        lines = self.lines.all()
        self.total_debit = sum(line.debit_amount for line in lines)
        self.total_credit = sum(line.credit_amount for line in lines)
        if commit:
            super().save() # Utilise super().save() pour éviter le check_period_is_open si déjà validé
    @property
    def is_balanced(self):
        """Vérifie l'équilibrage de l'écriture"""
        return self.total_debit == self.total_credit

    def post(self, validated_by):
        """Valide l'écriture (Règle d'or: irréversible après ceci)"""
        # Séparation des rôles
        if self.created_by == validated_by:
            raise ValidationError("Le créateur de l'écriture ne peut pas la valider lui-même.")

        # Recalculer les totaux AVANT de vérifier l'équilibre
        self.update_totals(commit=False)

        if not self.is_balanced():
            raise ValidationError(f"L'écriture n'est pas équilibrée (Débit: {self.total_debit}, Crédit: {self.total_credit})")
        
        # Générer le numéro de pièce si absent
        if not self.voucher_number:
            self.voucher_number = self.generate_voucher_number()

        self.state = 'POSTED'
        self.validated_by = validated_by
        self.validated_at = timezone.now()
        # Un seul save() ici
        super().save()

        # Matérialisation des soldes pour performance
        self.update_period_balances()

    def update_period_balances(self):
        """Met à jour AccountPeriodBalance pour chaque ligne de l'écriture"""
        period = AccountingPeriod.objects.filter(
            year=self.entry_date.year, 
            month=self.entry_date.month
        ).first()
        
        if not period: return

        for line in self.lines.all():
            balance, _ = AccountPeriodBalance.objects.get_or_create(
                account=line.account,
                period=period
            )
            balance.debit_movement += line.debit_amount
            balance.credit_movement += line.credit_amount
            # Les soldes d'ouverture et clôture seront recalculés lors de la clôture officielle
            balance.save()

    def generate_voucher_number(self):
        """Numérotation chronologique inaltérable des pièces. 
        Garantit l'absence de trous de séquence."""
        prefix = f"V_{self.journal.code}_{self.entry_date.year}_"
        # Utilisation de select_for_update pour éviter les race conditions sur le numéro
        with transaction.atomic():
            last_v = JournalEntry.objects.filter(
                voucher_number__startswith=prefix
            ).select_for_update().order_by('-voucher_number').first()
            
            if last_v and last_v.voucher_number:
                try:
                    num = int(last_v.voucher_number.split('_')[-1]) + 1
                except ValueError:
                    num = 1
            else:
                num = 1
            return f"{prefix}{num:05d}"

    def reverse(self, user, description=None):
        """Contre-passation de l'écriture"""
        if self.state != 'POSTED':
            raise ValidationError("Seule une écriture validée peut être contre-passée.")
        
        if self.is_reversed:
            raise ValidationError("Cette écriture a déjà été contre-passée.")

        # Création de l'écriture inverse
        reversal_entry = JournalEntry.objects.create(
            journal=self.journal,
            entry_date=timezone.now().date(),
            description=description or f"Contre-passation de {self.entry_number}: {self.description}",
            created_by=user,
            reversal_of=self,
            reference=self.entry_number
        )

        for line in self.lines.all():
            JournalEntryLine.objects.create(
                journal_entry=reversal_entry,
                sequence=line.sequence,
                account=line.account,
                label=f"Reverse: {line.label}",
                debit_amount=line.credit_amount, # Inversion
                credit_amount=line.debit_amount  # Inversion
            )
        
        reversal_entry.update_totals()
        reversal_entry.post(user)
        
        self.is_reversed = True
        self.save()
        return reversal_entry

    
    
    # Supprimé car redondant avec update_totals(commit=True)
    # def update_totals(self):
    #     ...


# Lignes d'écritures
class JournalEntryLine(models.Model):
    journal_entry = models.ForeignKey('JournalEntry', on_delete=models.CASCADE, related_name='lines')
    sequence = models.PositiveIntegerField()
    account = models.ForeignKey('ChartOfAccounts', on_delete=models.CASCADE)
    label = models.CharField(max_length=255)
    debit_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    credit_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Références optionnelles
    partner_supplier = models.ForeignKey('Supplier', on_delete=models.SET_NULL, null=True, blank=True)
    partner_customer = models.ForeignKey('Customer', on_delete=models.SET_NULL, null=True, blank=True)
    analytic_account = models.ForeignKey('AnalyticAccount', on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        verbose_name = "Ligne d'écriture"
        ordering = ['journal_entry', 'sequence']
    
    def __str__(self):
        return f"{self.account.code} - {self.label}"
    
    def clean(self):
        """Validation métier"""
        if self.debit_amount and self.credit_amount:
            raise models.ValidationError("Une ligne ne peut pas être à la fois débit et crédit")
        if not self.debit_amount and not self.credit_amount:
            raise models.ValidationError("Une ligne doit avoir un montant débit ou crédit")

    def delete(self, *args, **kwargs):
        if self.journal_entry.state == 'POSTED':
            raise ValidationError("Impossible de supprimer une ligne d'une écriture validée.")
        super().delete(*args, **kwargs)

    def save(self, *args, **kwargs):
        if self.journal_entry.state == 'POSTED':
            raise ValidationError("Impossible de modifier une ligne d'une écriture validée.")
        super().save(*args, **kwargs)

# Fournisseurs
class Supplier(models.Model):
    SUPPLIER_TYPES = [
        ('PHARMA', 'Laboratoire pharmaceutique'),
        ('EQUIPMENT', 'Équipementier médical'),
        ('SERVICE', 'Prestataire de service'),
        ('SUPPLIER', 'Fournisseur général'),
    ]
    
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    supplier_type = models.CharField(max_length=15, choices=SUPPLIER_TYPES)
    
    # Coordonnées
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    
    # Informations commerciales
    payment_terms = models.PositiveIntegerField(default=30, help_text="Délai de paiement en jours")
    credit_limit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    discount_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Informations légales
    tax_id = models.CharField(max_length=50, blank=True, verbose_name="Numéro fiscal")
    trade_register = models.CharField(max_length=50, blank=True, verbose_name="RCCM")
    
    # Relations
    account = models.ForeignKey(
        'ChartOfAccounts', 
        on_delete=models.SET_NULL, 
        null=True,
        help_text="Compte comptable fournisseur"
    )
    
    # Métadonnées
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey("authentication.MedicalStaff", on_delete=models.CASCADE)
    
    class Meta:
        verbose_name = "Fournisseur"
        ordering = ['name']
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    def get_balance(self):
        """Retourne le solde fournisseur"""
        if self.account:
            return self.account.get_balance()
        return 0
    
    def get_orders_total(self, year=None):
        """Retourne le CA annuel avec ce fournisseur"""
        entries = JournalEntryLine.objects.filter(
            partner_supplier=self,
            account__account_type='EXPENSE'
        )
        if year:
            entries = entries.filter(journal_entry__entry_date__year=year)
        
        return entries.aggregate(
            total=models.Sum('debit_amount')
        )['total'] or 0


# Clients (Classe 41)
class Customer(models.Model):
    CUSTOMER_TYPES = [
        ('INDIVIDUAL', 'Particulier'),
        ('CORPORATE', 'Entreprise'),
        ('INSURANCE', 'Assurance/Mutuelle'),
        ('GOVERNMENT', 'Organisme Public'),
    ]
    
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    customer_type = models.CharField(max_length=15, choices=CUSTOMER_TYPES, default='INDIVIDUAL')
    
    # Coordonnées
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    
    # Informations financières
    payment_terms = models.PositiveIntegerField(default=0, help_text="Délai de paiement en jours")
    credit_limit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Relations
    account = models.ForeignKey(
        'ChartOfAccounts', 
        on_delete=models.PROTECT,
        help_text="Compte 411 correspondant"
    )
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey("authentication.MedicalStaff", on_delete=models.CASCADE)
    
    class Meta:
        verbose_name = "Client"
        ordering = ['name']
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    def get_balance(self):
        """Solde du client"""
        return self.account.get_balance()


# Immobilisations
class Asset(models.Model):
    ASSET_CATEGORIES = [
        ('BUILDING', 'Bâtiment'),
        ('MEDICAL_EQUIPMENT', 'Équipement médical'),
        ('IT_EQUIPMENT', 'Matériel informatique'),
        ('FURNITURE', 'Mobilier'),
        ('VEHICLE', 'Véhicule'),
    ]
    
    DEPRECIATION_METHODS = [
        ('LINEAR', 'Linéaire'),
        ('DECLINING', 'Dégressif'),
        ('UNITS', 'Unités œuvre'),
    ]
    
    asset_number = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=ASSET_CATEGORIES)
    description = models.TextField(blank=True)
    
    # Valeurs
    acquisition_cost = models.DecimalField(max_digits=15, decimal_places=2)
    acquisition_date = models.DateField()
    useful_life_years = models.PositiveIntegerField()
    salvage_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Amortissement
    depreciation_method = models.CharField(max_length=10, choices=DEPRECIATION_METHODS, default='LINEAR')
    depreciation_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Comptes comptables
    asset_account = models.ForeignKey(
        'ChartOfAccounts', 
        on_delete=models.CASCADE,
        related_name='assets'
    )
    depreciation_account = models.ForeignKey(
        'ChartOfAccounts', 
        on_delete=models.CASCADE,
        related_name='asset_depreciations'
    )
    expense_account = models.ForeignKey(
        'ChartOfAccounts', 
        on_delete=models.CASCADE,
        related_name='depreciation_expenses'
    )
    
    # Localisation et responsable
    location = models.CharField(max_length=255, blank=True)
    department = models.ForeignKey('polyclinic.Department', on_delete=models.SET_NULL, null=True)
    responsible = models.ForeignKey(
        "authentication.MedicalStaff", 
        on_delete=models.SET_NULL, 
        null=True
    )
    
    # État
    is_active = models.BooleanField(default=True)
    disposal_date = models.DateField(null=True, blank=True)
    disposal_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        "authentication.MedicalStaff", 
        on_delete=models.CASCADE,
        related_name='created_assets'
    )
    
    class Meta:
        verbose_name = "Immobilisation"
        ordering = ['asset_number']
    
    def __str__(self):
        return f"{self.asset_number} - {self.name}"
    
    def calculate_annual_depreciation(self):
        """Calcule l'amortissement annuel"""
        if self.depreciation_method == 'LINEAR':
            return (self.acquisition_cost - self.salvage_value) / self.useful_life_years
        # Autres méthodes à implémenter
        return 0
    
    def get_accumulated_depreciation(self, as_of_date=None):
        """Retourne les amortissements cumulés"""
        if not as_of_date:
            as_of_date = timezone.now().date()
        
        # Calcul basé sur les écritures d'amortissement
        entries = JournalEntryLine.objects.filter(
            account=self.depreciation_account,
            journal_entry__entry_date__lte=as_of_date,
            journal_entry__state='POSTED'
        )
        return entries.aggregate(
            total=models.Sum('credit_amount')
        )['total'] or 0
    
    def get_net_book_value(self, as_of_date=None):
        """Retourne la valeur nette comptable"""
        accumulated = self.get_accumulated_depreciation(as_of_date)
        return self.acquisition_cost - accumulated


# Comptabilité analytique
class AnalyticAccount(models.Model):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    #department = models.ForeignKey('polyclinic.Department', on_delete=models.SET_NULL, null=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Compte analytique"
        ordering = ['code']
    
    def __str__(self):
        return f"{self.code} - {self.name}"


# Budget
class Budget(models.Model):
    BUDGET_TYPES = [
        ('ANNUAL', 'Budget annuel'),
        ('QUARTERLY', 'Budget trimestriel'),
        ('MONTHLY', 'Budget mensuel'),
    ]
    
    name = models.CharField(max_length=255)
    budget_type = models.CharField(max_length=15, choices=BUDGET_TYPES)
    fiscal_year = models.PositiveIntegerField()
    start_date = models.DateField()
    end_date = models.DateField()
    
    is_active = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=False)
    approved_by = models.ForeignKey(
        "authentication.MedicalStaff", 
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='approved_budgets'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    
    created_by = models.ForeignKey(
        "authentication.MedicalStaff", 
        on_delete=models.CASCADE,
        related_name='created_budgets'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Budget"
        unique_together = ['fiscal_year', 'budget_type']
    
    def __str__(self):
        return f"Budget {self.fiscal_year} - {self.name}"


class BudgetLine(models.Model):
    budget = models.ForeignKey('Budget', on_delete=models.CASCADE, related_name='lines')
    account = models.ForeignKey('ChartOfAccounts', on_delete=models.CASCADE)
    analytic_account = models.ForeignKey('AnalyticAccount', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Montants budgétés par période
    january = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    february = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    march = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    april = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    may = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    june = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    july = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    august = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    september = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    october = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    november = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    december = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    notes = models.TextField(blank=True)
    
    class Meta:
        verbose_name = "Ligne budgétaire"
        unique_together = ['budget', 'account', 'analytic_account']
    
    def get_annual_total(self):
        """Retourne le total annuel budgété"""
        return sum([
            self.january, self.february, self.march, self.april,
            self.may, self.june, self.july, self.august,
            self.september, self.october, self.november, self.december
        ])
    
    def get_monthly_amount(self, month):
        """Retourne le montant budgété pour un mois donné"""
        month_fields = {
            1: self.january, 2: self.february, 3: self.march, 4: self.april,
            5: self.may, 6: self.june, 7: self.july, 8: self.august,
            9: self.september, 10: self.october, 11: self.november, 12: self.december
        }
        return month_fields.get(month, 0)


# Clôtures comptables
class AccountingPeriod(models.Model):
    PERIOD_STATES = [
        ('OPEN', 'Ouvert'),
        ('CLOSED', 'Clôturé'),
        ('LOCKED', 'Verrouillé'),
    ]
    
    year = models.PositiveIntegerField()
    month = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)])
    state = models.CharField(max_length=10, choices=PERIOD_STATES, default='OPEN')
    
    closed_by = models.ForeignKey(
        "authentication.MedicalStaff", 
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='closed_periods'
    )
    closed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Période comptable"
        unique_together = ['year', 'month']
        ordering = ['-year', '-month']
    
    def __str__(self):
        return f"{self.month:02d}/{self.year}"
    
    def can_post_entries(self):
        """Vérifie si on peut passer des écritures sur cette période"""
        return self.state == 'OPEN'
    
    def close_period(self, user):
        """Clôture la période"""
        if self.state != 'OPEN':
            raise ValueError("Seule une période ouverte peut être clôturée")
        
        self.state = 'CLOSED'
        self.closed_by = user
        self.closed_at = timezone.now()
        self.save()


# Modèle pour performances (Soldes par période)
class AccountPeriodBalance(models.Model):
    account = models.ForeignKey('ChartOfAccounts', on_delete=models.CASCADE)
    period = models.ForeignKey('AccountingPeriod', on_delete=models.CASCADE)
    
    opening_debit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    opening_credit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    debit_movement = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    credit_movement = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    closing_debit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    closing_credit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['account', 'period']
        verbose_name = "Solde mensuel par compte"


# Extensions du modèle Bill existant
class AccountingOperation(models.Model):
    """Lien entre opérations médicales et comptabilité"""
    OPERATION_TYPES = [
        ('CONSULTATION', 'Consultation'),
        ('HOSPITALIZATION', 'Hospitalisation'),
        ('PRESCRIPTION', 'Prescription'),
        ('EXAM', 'Examen'),
        ('SURGERY', 'Chirurgie'),
    ]
    
    operation_type = models.CharField(max_length=20, choices=OPERATION_TYPES)
    operation_id = models.PositiveIntegerField()  # ID de l'opération source
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Relation comptable
    journal_entry = models.ForeignKey('JournalEntry', on_delete=models.SET_NULL, null=True)
    bill = models.ForeignKey('polyclinic.Bill', on_delete=models.CASCADE)
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey("authentication.MedicalStaff", on_delete=models.CASCADE)
    
    class Meta:
        verbose_name = "Opération comptable"
    
    def __str__(self):
        return f"{self.operation_type} - {self.amount} FCFA"


# TVA et fiscalité
class TaxRate(models.Model):
    """Taux de TVA et autres taxes"""
    TAX_TYPES = [
        ('VAT', 'TVA'),
        ('WITHHOLDING', 'Retenue à la source'),
        ('EXCISE', 'Accise'),
    ]
    
    name = models.CharField(max_length=100)
    tax_type = models.CharField(max_length=15, choices=TAX_TYPES)
    rate = models.DecimalField(max_digits=5, decimal_places=4)  # Ex: 0.1925 pour 19.25%
    is_active = models.BooleanField(default=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    
    # Comptes comptables associés
    collected_account = models.ForeignKey(
        'ChartOfAccounts', 
        on_delete=models.CASCADE,
        related_name='collected_taxes',
        help_text="Compte TVA collectée"
    )
    paid_account = models.ForeignKey(
        'ChartOfAccounts', 
        on_delete=models.CASCADE,
        related_name='paid_taxes',
        help_text="Compte TVA déductible"
    )
    
    class Meta:
        verbose_name = "Taux de taxe"
    
    def __str__(self):
        return f"{self.name} - {self.rate*100}%"


class TaxDeclaration(models.Model):
    """Déclarations fiscales"""
    DECLARATION_TYPES = [
        ('VAT_MONTHLY', 'TVA mensuelle'),
        ('VAT_QUARTERLY', 'TVA trimestrielle'),
        ('INCOME_TAX', 'Impôt sur les bénéfices'),
        ('PAYROLL_TAX', 'Charges sociales'),
    ]
    
    DECLARATION_STATUS = [
        ('DRAFT', 'Brouillon'),
        ('SUBMITTED', 'Soumise'),
        ('PAID', 'Payée'),
        ('LATE', 'En retard'),
    ]
    
    declaration_type = models.CharField(max_length=20, choices=DECLARATION_TYPES)
    period_year = models.PositiveIntegerField()
    period_month = models.PositiveIntegerField(null=True, blank=True)
    period_quarter = models.PositiveIntegerField(null=True, blank=True)
    
    # Montants
    tax_base = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    penalties = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Dates
    due_date = models.DateField()
    submission_date = models.DateField(null=True, blank=True)
    payment_date = models.DateField(null=True, blank=True)
    
    status = models.CharField(max_length=15, choices=DECLARATION_STATUS, default='DRAFT')
    
    # Relations
    journal_entry = models.ForeignKey('JournalEntry', on_delete=models.SET_NULL, null=True, blank=True)
    created_by = models.ForeignKey("authentication.MedicalStaff", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Déclaration fiscale"
        unique_together = ['declaration_type', 'period_year', 'period_month', 'period_quarter']
    
    def __str__(self):
        period = f"{self.period_month:02d}/{self.period_year}" if self.period_month else f"Q{self.period_quarter}/{self.period_year}"
        return f"{self.get_declaration_type_display()} - {period}"
    
    def calculate_penalties(self):
        """Calcule les pénalités de retard"""
        if self.submission_date and self.submission_date > self.due_date:
            days_late = (self.submission_date - self.due_date).days
            penalty_rate = Decimal('0.10')  # 10% de pénalité
            monthly_rate = Decimal('0.015')  # 1.5% par mois de retard
            
            base_penalty = self.tax_amount * penalty_rate
            monthly_penalties = self.tax_amount * monthly_rate * (days_late // 30)
            
            return base_penalty + monthly_penalties
        return Decimal('0')


# Rapprochements bancaires
class BankAccount(models.Model):
    """Comptes bancaires"""
    account = models.OneToOneField('ChartOfAccounts', on_delete=models.CASCADE)
    bank_name = models.CharField(max_length=100)
    account_number = models.CharField(max_length=50)
    iban = models.CharField(max_length=34, blank=True)
    swift_code = models.CharField(max_length=11, blank=True)
    
    # Soldes
    balance_date = models.DateField()
    balance_amount = models.DecimalField(max_digits=15, decimal_places=2)
    
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Compte bancaire"
    
    def __str__(self):
        return f"{self.bank_name} - {self.account_number}"


class BankReconciliation(models.Model):
    """Rapprochements bancaires"""
    bank_account = models.ForeignKey('BankAccount', on_delete=models.CASCADE)
    reconciliation_date = models.DateField()
    statement_balance = models.DecimalField(max_digits=15, decimal_places=2)
    book_balance = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Écarts
    outstanding_checks = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    deposits_in_transit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    bank_charges = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    is_reconciled = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    
    created_by = models.ForeignKey("authentication.MedicalStaff", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Rapprochement bancaire"
        unique_together = ['bank_account', 'reconciliation_date']
    
    def calculate_adjusted_balance(self):
        """Calcule le solde ajusté"""
        return (self.statement_balance - self.outstanding_checks + 
                self.deposits_in_transit - self.bank_charges)
    
    def check_reconciliation(self):
        """Vérifie si le rapprochement est correct"""
        adjusted_balance = self.calculate_adjusted_balance()
        return abs(adjusted_balance - self.book_balance) < Decimal('0.01')


# Analyses et reporting
class FinancialRatio(models.Model):
    """Ratios financiers calculés"""
    RATIO_TYPES = [
        ('LIQUIDITY', 'Liquidité'),
        ('PROFITABILITY', 'Rentabilité'),
        ('EFFICIENCY', 'Efficacité'),
        ('LEVERAGE', 'Endettement'),
    ]
    
    period_year = models.PositiveIntegerField()
    period_month = models.PositiveIntegerField()
    ratio_type = models.CharField(max_length=15, choices=RATIO_TYPES)
    ratio_name = models.CharField(max_length=100)
    ratio_value = models.DecimalField(max_digits=10, decimal_places=4)
    
    # Métadonnées
    calculation_date = models.DateTimeField(auto_now_add=True)
    calculated_by = models.ForeignKey("authentication.MedicalStaff", on_delete=models.CASCADE)
    
    class Meta:
        verbose_name = "Ratio financier"
        unique_together = ['period_year', 'period_month', 'ratio_name']
    
    def __str__(self):
        return f"{self.ratio_name} - {self.period_month:02d}/{self.period_year}: {self.ratio_value}"

        
