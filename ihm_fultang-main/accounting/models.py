from django.conf import settings
from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
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
    balance = models.FloatField(default=0)

    budgetExercise = models.ForeignKey('BudgetExercise', on_delete=models.CASCADE)
    account = models.ForeignKey('Account', on_delete=models.CASCADE)


class FinancialOperation(models.Model):
    name = models.CharField(max_length=255)

    account = models.ForeignKey('Account', on_delete=models.CASCADE)

class Facture(models.Model):
    montant = models.FloatField(default=0)
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
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_detailed = models.BooleanField(default=True)  # True si le compte peut recevoir une écriutre
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Compte comptable"
        ordering = ['code']
    
    def __str__(self):
        return f"{self.code} - {self.label}"


    def get_balance(self, start_date=None, end_date=None):
        """Calcule le solde du compte sur une période"""
        entries = JournalEntryLine.objects.filter(account=self)
        if start_date:
            entries = entries.filter(journal_entry__entry_date__gte=start_date)
        if end_date:
            entries = entries.filter(journal_entry__entry_date__lte=end_date)
        
        total_debit = entries.aggregate(models.Sum('debit_amount'))['debit_amount__sum'] or 0
        total_credit = entries.aggregate(models.Sum('credit_amount'))['credit_amount__sum'] or 0
        
        if self.account_type in ['ASSET', 'EXPENSE']:
            return total_debit - total_credit
        else:
            return total_credit - total_debit


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
    
    # Relations
    created_by = models.ForeignKey("authentication.MedicalStaff", on_delete=models.CASCADE, related_name='created_entries')
    validated_by = models.ForeignKey("authentication.MedicalStaff", on_delete=models.SET_NULL, null=True, blank=True, related_name='validated_entries')

    created_at = models.DateTimeField(auto_now_add=True)
    validated_at = models.DateTimeField(null=True, blank=True)

    bill = models.ForeignKey('polyclinic.Bill', on_delete=models.SET_NULL, null=True, blank=True)
    consultation = models.ForeignKey('polyclinic.Consultation', on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        verbose_name = "Écriture comptable"
        ordering = ['-entry_date', '-created_at']
    
    def __str__(self):
        return f"{self.entry_number} - {self.description}"
    
    def save(self, *args, **kwargs):
        if not self.entry_number:
            self.entry_number = self.generate_entry_number()
        super().save(*args, **kwargs)
    
    def generate_entry_number(self):
        """Génère un numéro d'écriture automatique"""
        today = timezone.now()
        prefix = f"{self.journal.code}{today.strftime('%Y%m')}"
        last_entry = JournalEntry.objects.filter(
            entry_number__startswith=prefix
        ).order_by('-entry_number').first()
        
        if last_entry:
            last_number = int(last_entry.entry_number[-4:])
            new_number = last_number + 1
        else:
            new_number = 1
        
        return f"{prefix}{new_number:04d}"

    def is_balanced(self):
        """Vérifie l'équilibrage de l'écriture"""
        return self.total_debit == self.total_credit
    
    def post(self, validated_by):
        """Valide l'écriture"""
        if not self.is_balanced():
            raise ValueError("L'écriture n'est pas équilibrée")
        
        self.state = 'POSTED'
        self.validated_by = validated_by
        self.validated_at = timezone.now()
        self.save()
    
    def update_totals(self):
        """Met à jour les totaux à partir des lignes"""
        lines = self.lines.all()
        self.total_debit = sum(line.debit_amount for line in lines)
        self.total_credit = sum(line.credit_amount for line in lines)
        self.save()


# Lignes d'écritures
class JournalEntryLine(models.Model):
    journal_entry = models.ForeignKey('JournalEntry', on_delete=models.CASCADE, related_name='lines')
    sequence = models.PositiveIntegerField()
    account = models.ForeignKey('ChartOfAccounts', on_delete=models.CASCADE)
    label = models.CharField(max_length=255)
    debit_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    credit_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Références optionnelles
    partner = models.ForeignKey('Supplier', on_delete=models.SET_NULL, null=True, blank=True)
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
            partner=self,
            account__account_type='EXPENSE'
        )
        if year:
            entries = entries.filter(journal_entry__entry_date__year=year)
        
        return entries.aggregate(
            total=models.Sum('debit_amount')
        )['total'] or 0


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

        
