# filepath: /home/pangui/Desktop/fulltang-2026-version/ihm_fultang-main/accounting/models_financier.py

from django.conf import settings
from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import transaction
from decimal import Decimal
from datetime import datetime, timedelta
from django.contrib.auth.models import User


# ============ MODELS EXISTANTS (À GARDER) ============
class BudgetExercise(models.Model):
    start = models.DateTimeField(default=timezone.now)
    end = models.DateTimeField(default=timezone.now)


class Account(models.Model):
    STATUS_TYPE = [
        ("credit", "credit"),
        ("debit", "debit"),
        ("creance", "creance")
    ]
    
    number = models.IntegerField(default=0)
    libelle = models.CharField(max_length=255, default='', blank=True)
    status = models.CharField(max_length=255, choices=STATUS_TYPE, null=True)
    
    def clean(self):
        if self.libelle and self.libelle[0] in ['4', '5'] and not self.status:
            raise ValidationError("Status cannot be null if the first digit of libelle is 4 or 5")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    

class AccountState(models.Model):
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    budgetExercise = models.ForeignKey('BudgetExercise', on_delete=models.CASCADE, default=1)
    account = models.ForeignKey('Account', on_delete=models.CASCADE, default=1)


class FinancialOperation(models.Model):
    name = models.CharField(max_length=255, default='')
    account = models.ForeignKey('Account', on_delete=models.CASCADE, default=1)


class Facture(models.Model):
    montant = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    type = models.CharField(max_length=255, default='')
    financialOperation = models.ForeignKey('FinancialOperation', on_delete=models.CASCADE, default=1)


# ============ NOUVEAUX MODELS (VERSION OPTIMISÉE) ============

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
    account_class = models.CharField(max_length=1, choices=ACCOUNT_CLASSES, default='1')
    account_type = models.CharField(max_length=10, choices=ACCOUNT_TYPES, default='ASSET')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='sub_accounts')
    is_active = models.BooleanField(default=True)
    is_detailed = models.BooleanField(default=True)
    is_collective = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Compte comptable"
        ordering = ['code']
    
    def __str__(self):
        return f"{self.code} - {self.label}"

    def get_balance(self, start_date=None, end_date=None):
        """Calcule le solde du compte"""
        if end_date:
            period = AccountingPeriod.objects.filter(year=end_date.year, month=end_date.month).first()
            if period and period.state in ['CLOSED', 'LOCKED']:
                balance = AccountPeriodBalance.objects.filter(account=self, period=period).first()
                if balance:
                    if self.account_class in ['2', '3', '5', '6']:
                        return balance.closing_debit - balance.closing_credit
                    else:
                        return balance.closing_credit - balance.closing_debit

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
        """Retourne le sens normal du compte"""
        if self.account_class in ['2', '3', '5', '6']:
            return 'DEBIT'
        return 'CREDIT'


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
    
    # Métadonnées - CORRIGER ICI
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # ✅ CORRECTION 1
        on_delete=models.CASCADE
    )
    
    class Meta:
        verbose_name = "Fournisseur"
        ordering = ['name']
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    def get_balance(self):
        if self.account:
            return self.account.get_balance()
        return 0


# Clients
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
    
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    
    payment_terms = models.PositiveIntegerField(default=0)
    credit_limit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    account = models.ForeignKey(
        'ChartOfAccounts', 
        on_delete=models.PROTECT,
        help_text="Compte 411 correspondant"
    )
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # ✅ CORRECTION 2
        on_delete=models.CASCADE
    )
    
    class Meta:
        verbose_name = "Client"
        ordering = ['name']
    
    def __str__(self):
        return f"{self.code} - {self.name}"


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
    
    voucher_number = models.CharField(max_length=50, unique=True, null=True, blank=True)
    
    is_reversed = models.BooleanField(default=False)
    reversal_of = models.OneToOneField('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='reversed_by')
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # ✅ CORRECTION 3
        on_delete=models.CASCADE, 
        related_name='created_entries'
    )
    validated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # ✅ CORRECTION 4
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='validated_entries'
    )

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
        if self.pk:
            old_self = JournalEntry.objects.get(pk=self.pk)
            if old_self.state == 'POSTED':
                if self.state == 'POSTED' and old_self.state == 'POSTED':
                    raise ValidationError("Une écriture validée ne peut plus être modifiée.")

        self.check_period_is_open()

        if not self.entry_number:
            self.entry_number = self.generate_entry_number()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        if self.state == 'POSTED':
            raise ValidationError("Une écriture validée ne peut jamais être supprimée.")
        super().delete(*args, **kwargs)

    def check_period_is_open(self):
        period = AccountingPeriod.objects.filter(
            year=self.entry_date.year, 
            month=self.entry_date.month
        ).first()
        
        if not period:
            raise ValidationError(f"Aucune période comptable définie pour {self.entry_date.month}/{self.entry_date.year}")
        
        if period.state != 'OPEN':
            raise ValidationError(f"La période {period} est {period.get_state_display()}.")

    def update_totals(self, commit=True):
        lines = self.lines.all()
        self.total_debit = sum(line.debit_amount for line in lines)
        self.total_credit = sum(line.credit_amount for line in lines)
        if commit:
            super().save()

    @property
    def is_balanced(self):
        return self.total_debit == self.total_credit

    def post(self, validated_by):
        if self.created_by == validated_by:
            raise ValidationError("Le créateur ne peut pas valider sa propre écriture.")

        self.update_totals(commit=False)

        if not self.is_balanced():
            raise ValidationError(f"L'écriture n'est pas équilibrée")
        
        if not self.voucher_number:
            self.voucher_number = self.generate_voucher_number()

        self.state = 'POSTED'
        self.validated_by = validated_by
        self.validated_at = timezone.now()
        super().save()
        self.update_period_balances()

    def update_period_balances(self):
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
            balance.save()

    def generate_voucher_number(self):
        prefix = f"V_{self.journal.code}_{self.entry_date.year}_"
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

    def generate_entry_number(self):
        """Génère un numéro d'écriture unique"""
        count = JournalEntry.objects.count() + 1
        return f"JE_{self.entry_date.year}_{count:05d}"

    def reverse(self, user, description=None):
        if self.state != 'POSTED':
            raise ValidationError("Seule une écriture validée peut être contre-passée.")
        
        if self.is_reversed:
            raise ValidationError("Cette écriture a déjà été contre-passée.")

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
                debit_amount=line.credit_amount,
                credit_amount=line.debit_amount
            )
        
        reversal_entry.update_totals()
        reversal_entry.post(user)
        
        self.is_reversed = True
        self.save()
        return reversal_entry


# Lignes d'écritures
class JournalEntryLine(models.Model):
    journal_entry = models.ForeignKey('JournalEntry', on_delete=models.CASCADE, related_name='lines')
    sequence = models.PositiveIntegerField()
    account = models.ForeignKey('ChartOfAccounts', on_delete=models.CASCADE)
    label = models.CharField(max_length=255)
    debit_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    credit_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Relations optionnelles - ✅ CORRECTION 5
    partner_supplier = models.ForeignKey(
        'Supplier', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    partner_customer = models.ForeignKey(
        'Customer', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    analytic_account = models.ForeignKey('AnalyticAccount', on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        verbose_name = "Ligne d'écriture"
        ordering = ['journal_entry', 'sequence']
    
    def __str__(self):
        return f"{self.account.code} - {self.label}"
    
    def clean(self):
        if self.debit_amount and self.credit_amount:
            raise ValidationError("Une ligne ne peut pas être à la fois débit et crédit")
        if not self.debit_amount and not self.credit_amount:
            raise ValidationError("Une ligne doit avoir un montant débit ou crédit")

    def delete(self, *args, **kwargs):
        if self.journal_entry.state == 'POSTED':
            raise ValidationError("Impossible de supprimer une ligne d'une écriture validée.")
        super().delete(*args, **kwargs)

    def save(self, *args, **kwargs):
        if self.journal_entry.state == 'POSTED':
            raise ValidationError("Impossible de modifier une ligne d'une écriture validée.")
        super().save(*args, **kwargs)

# Inventaire/Stock
class Inventory(models.Model):
    """Gestion des stocks et inventaires"""
    INVENTORY_TYPES = [
        ('PHARMA', 'Produits pharmaceutiques'),
        ('MEDICAL', 'Équipement médical'),
        ('SUPPLIES', 'Fournitures'),
        ('OTHER', 'Autres'),
    ]
    
    inventory_number = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    inventory_type = models.CharField(max_length=15, choices=INVENTORY_TYPES)
    
    quantity = models.PositiveIntegerField(default=0)
    unit_cost = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    reorder_level = models.PositiveIntegerField(default=10)
    reorder_quantity = models.PositiveIntegerField(default=50)
    
    stock_account = models.ForeignKey(
        'ChartOfAccounts',
        on_delete=models.CASCADE,
        related_name='inventory_items'
    )
    
    supplier = models.ForeignKey('Supplier', on_delete=models.SET_NULL, null=True, blank=True)
    
    location = models.CharField(max_length=255, blank=True)
    expiration_date = models.DateField(null=True, blank=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    
    class Meta:
        verbose_name = "Inventaire"
        ordering = ['inventory_number']
    
    def __str__(self):
        return f"{self.inventory_number} - {self.name}"
    
    def save(self, *args, **kwargs):
        self.total_value = self.quantity * self.unit_cost
        super().save(*args, **kwargs)


# Paie/Salaires
class Payroll(models.Model):
    """Gestion de la paie"""
    PAYROLL_PERIODS = [
        ('WEEKLY', 'Hebdomadaire'),
        ('BIWEEKLY', 'Bi-hebdomadaire'),
        ('MONTHLY', 'Mensuel'),
    ]
    
    payroll_number = models.CharField(max_length=20, unique=True)
    payroll_period = models.CharField(max_length=15, choices=PAYROLL_PERIODS, default='MONTHLY')
    period_start = models.DateField()
    period_end = models.DateField()
    
    total_gross_salary = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_deductions = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_net_salary = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_employer_contributions = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('DRAFT', 'Brouillon'),
            ('APPROVED', 'Approuvée'),
            ('PAID', 'Payée'),
        ],
        default='DRAFT'
    )
    
    salary_expense_account = models.ForeignKey(
        'ChartOfAccounts',
        on_delete=models.CASCADE,
        related_name='payroll_expenses',
        default=1
    )
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_payrolls'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Feuille de paie"
        ordering = ['-period_end']
    
    def __str__(self):
        return f"{self.payroll_number} - {self.period_start} to {self.period_end}"


class PayrollLine(models.Model):
    """Lignes de paie par employé"""
    payroll = models.ForeignKey('Payroll', on_delete=models.CASCADE, related_name='lines')
    employee = models.ForeignKey('authentication.MedicalStaff', on_delete=models.CASCADE, null=True, blank=True)
    
    gross_salary = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Déductions
    tax_deduction = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    social_security = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    health_insurance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    other_deductions = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    total_deductions = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    net_salary = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Cotisations patronales
    employer_contributions = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    class Meta:
        verbose_name = "Ligne de paie"
        unique_together = ['payroll', 'employee']
    
    def save(self, *args, **kwargs):
        self.total_deductions = (
            self.tax_deduction + 
            self.social_security + 
            self.health_insurance + 
            self.other_deductions
        )
        self.net_salary = self.gross_salary - self.total_deductions
        super().save(*args, **kwargs)


# TVA/Taxes sur Valeur Ajoutée
class VAT(models.Model):
    """Gestion de la TVA"""
    VAT_TYPES = [
        ('COLLECTED', 'TVA collectée'),
        ('DEDUCTIBLE', 'TVA déductible'),
    ]
    
    vat_number = models.CharField(max_length=20, unique=True)
    vat_type = models.CharField(max_length=15, choices=VAT_TYPES)
    
    period_month = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)])
    period_year = models.PositiveIntegerField()
    
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    related_operation = models.ForeignKey('JournalEntry', on_delete=models.SET_NULL, null=True, blank=True)
    
    journal_entry = models.ForeignKey(
        'JournalEntry',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='vat_entries'
    )
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'En attente'),
            ('DECLARED', 'Déclarée'),
            ('PAID', 'Payée'),
        ],
        default='PENDING'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    
    class Meta:
        verbose_name = "TVA"
        unique_together = ['period_month', 'period_year', 'vat_type']
    
    def __str__(self):
        return f"{self.vat_number} - {self.vat_type} ({self.period_month:02d}/{self.period_year})"

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
    
    acquisition_cost = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    acquisition_date = models.DateField(default='2026-01-01')
    useful_life_years = models.PositiveIntegerField(default=5)
    salvage_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    depreciation_method = models.CharField(max_length=10, choices=DEPRECIATION_METHODS, default='LINEAR')
    depreciation_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    asset_account = models.ForeignKey(
        'ChartOfAccounts', 
        on_delete=models.CASCADE,
        related_name='assets',
        default=1
    )
    depreciation_account = models.ForeignKey(
        'ChartOfAccounts', 
        on_delete=models.CASCADE,
        related_name='asset_depreciations',
        default=1
    )
    expense_account = models.ForeignKey(
        'ChartOfAccounts', 
        on_delete=models.CASCADE,
        related_name='depreciation_expenses',
        default=1
    )
    
    location = models.CharField(max_length=255, blank=True)
    department = models.ForeignKey('polyclinic.Department', on_delete=models.SET_NULL, null=True)
    responsible = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # ✅ CORRECTION 6
        on_delete=models.SET_NULL, 
        null=True
    )
    
    is_active = models.BooleanField(default=True)
    disposal_date = models.DateField(null=True, blank=True)
    disposal_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # ✅ CORRECTION 7
        on_delete=models.CASCADE,
        related_name='created_assets'
    )
    
    class Meta:
        verbose_name = "Immobilisation"
        ordering = ['asset_number']
    
    def __str__(self):
        return f"{self.asset_number} - {self.name}"
    
    def calculate_annual_depreciation(self):
        if self.depreciation_method == 'LINEAR':
            return (self.acquisition_cost - self.salvage_value) / self.useful_life_years
        return 0
    
    def get_accumulated_depreciation(self, as_of_date=None):
        if not as_of_date:
            as_of_date = timezone.now().date()
        
        entries = JournalEntryLine.objects.filter(
            account=self.depreciation_account,
            journal_entry__entry_date__lte=as_of_date,
            journal_entry__state='POSTED'
        )
        return entries.aggregate(
            total=models.Sum('credit_amount')
        )['total'] or 0
    
    def get_net_book_value(self, as_of_date=None):
        accumulated = self.get_accumulated_depreciation(as_of_date)
        return self.acquisition_cost - accumulated


# Comptabilité analytique
class AnalyticAccount(models.Model):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Compte analytique"
        ordering = ['code']
    
    def __str__(self):
        return f"{self.code} - {self.name}"


# Budget - ✅ UNE SEULE DÉFINITION
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
        settings.AUTH_USER_MODEL,  # ✅ CORRECTION 8
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='approved_budgets'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # ✅ CORRECTION 9
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
        return sum([
            self.january, self.february, self.march, self.april,
            self.may, self.june, self.july, self.august,
            self.september, self.october, self.november, self.december
        ])
    
    def get_monthly_amount(self, month):
        month_fields = {
            1: self.january, 2: self.february, 3: self.march, 4: self.april,
            5: self.may, 6: self.june, 7: self.july, 8: self.august,
            9: self.september, 10: self.october, 11: self.november, 12: self.december
        }
        return month_fields.get(month, 0)


# Périodes comptables
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
        settings.AUTH_USER_MODEL,  # ✅ CORRECTION 10
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
        return self.state == 'OPEN'
    
    def close_period(self, user):
        if self.state != 'OPEN':
            raise ValueError("Seule une période ouverte peut être clôturée")
        
        self.state = 'CLOSED'
        self.closed_by = user
        self.closed_at = timezone.now()
        self.save()


# Soldes par période
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


# Opérations comptables liées aux factures médicales
class AccountingOperation(models.Model):
    OPERATION_TYPES = [
        ('CONSULTATION', 'Consultation'),
        ('HOSPITALIZATION', 'Hospitalisation'),
        ('PRESCRIPTION', 'Prescription'),
        ('EXAM', 'Examen'),
        ('SURGERY', 'Chirurgie'),
    ]
    
    operation_type = models.CharField(max_length=20, choices=OPERATION_TYPES)
    operation_id = models.PositiveIntegerField()
    amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    journal_entry = models.ForeignKey('JournalEntry', on_delete=models.SET_NULL, null=True)
    bill = models.ForeignKey('polyclinic.Bill', on_delete=models.CASCADE)
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # ✅ CORRECTION 11
        on_delete=models.CASCADE
    )
    
    class Meta:
        verbose_name = "Opération comptable"
    
    def __str__(self):
        return f"{self.operation_type} - {self.amount} FCFA"


# Taux de taxes
class TaxRate(models.Model):
    TAX_TYPES = [
        ('VAT', 'TVA'),
        ('WITHHOLDING', 'Retenue à la source'),
        ('EXCISE', 'Accise'),
    ]
    
    name = models.CharField(max_length=100)
    tax_type = models.CharField(max_length=15, choices=TAX_TYPES)
    rate = models.DecimalField(max_digits=5, decimal_places=4)
    is_active = models.BooleanField(default=True)
    start_date = models.DateField(default='2026-01-01')
    end_date = models.DateField(null=True, blank=True)
    
    collected_account = models.ForeignKey(
        'ChartOfAccounts', 
        on_delete=models.CASCADE,
        related_name='collected_taxes',
        default=1
    )
    paid_account = models.ForeignKey(
        'ChartOfAccounts', 
        on_delete=models.CASCADE,
        related_name='paid_taxes',
        default=1
    )
    
    class Meta:
        verbose_name = "Taux de taxe"
    
    def __str__(self):
        return f"{self.name} - {self.rate*100}%"


# Déclarations fiscales
class TaxDeclaration(models.Model):
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
    
    tax_base = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    penalties = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    due_date = models.DateField()
    submission_date = models.DateField(null=True, blank=True)
    payment_date = models.DateField(null=True, blank=True)
    
    status = models.CharField(max_length=15, choices=DECLARATION_STATUS, default='DRAFT')
    
    journal_entry = models.ForeignKey('JournalEntry', on_delete=models.SET_NULL, null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # ✅ CORRECTION 12
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Déclaration fiscale"
        unique_together = ['declaration_type', 'period_year', 'period_month', 'period_quarter']
    
    def __str__(self):
        period = f"{self.period_month:02d}/{self.period_year}" if self.period_month else f"Q{self.period_quarter}/{self.period_year}"
        return f"{self.get_declaration_type_display()} - {period}"
    
    def calculate_penalties(self):
        if self.submission_date and self.submission_date > self.due_date:
            days_late = (self.submission_date - self.due_date).days
            penalty_rate = Decimal('0.10')
            monthly_rate = Decimal('0.015')
            
            base_penalty = self.tax_amount * penalty_rate
            monthly_penalties = self.tax_amount * monthly_rate * (days_late // 30)
            
            return base_penalty + monthly_penalties
        return Decimal('0')


# Comptes bancaires
class BankAccount(models.Model):
    account = models.OneToOneField('ChartOfAccounts', on_delete=models.CASCADE, default=1)
    bank_name = models.CharField(max_length=100, default='')
    account_number = models.CharField(max_length=50, default='')
    iban = models.CharField(max_length=34, blank=True)
    swift_code = models.CharField(max_length=11, blank=True)
    
    balance_date = models.DateField(default='2026-01-01')
    balance_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Compte bancaire"
    
    def __str__(self):
        return f"{self.bank_name} - {self.account_number}"


# Rapprochements bancaires - ✅ UNE SEULE DÉFINITION
class BankReconciliation(models.Model):
    bank_account = models.ForeignKey('BankAccount', on_delete=models.CASCADE)
    reconciliation_date = models.DateField()
    statement_balance = models.DecimalField(max_digits=15, decimal_places=2)
    book_balance = models.DecimalField(max_digits=15, decimal_places=2)
    
    outstanding_checks = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    deposits_in_transit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    bank_charges = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    is_reconciled = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # ✅ CORRECTION 13
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Rapprochement bancaire"
        unique_together = ['bank_account', 'reconciliation_date']
    
    def calculate_adjusted_balance(self):
        return (self.statement_balance - self.outstanding_checks + 
                self.deposits_in_transit - self.bank_charges)
    
    def check_reconciliation(self):
        adjusted_balance = self.calculate_adjusted_balance()
        return abs(adjusted_balance - self.book_balance) < Decimal('0.01')


# Ratios financiers
class FinancialRatio(models.Model):
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
    
    calculation_date = models.DateTimeField(auto_now_add=True)
    calculated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # ✅ CORRECTION 14
        on_delete=models.CASCADE
    )
    
    class Meta:
        verbose_name = "Ratio financier"
        unique_together = ['period_year', 'period_month', 'ratio_name']
    
    def __str__(self):
        return f"{self.ratio_name} - {self.period_month:02d}/{self.period_year}: {self.ratio_value}"
    
FixedAsset = Asset