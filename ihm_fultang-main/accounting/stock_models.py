from django.db import models, transaction
from django.apps import apps
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from datetime import datetime, timedelta


#################################### NOUVEAU (Comptabilité Avancée) ############################
# Plan comptable
class StockChartOfAccounts(models.Model):
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
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='stock_sub_accounts')
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
            AccountingPeriod = apps.get_model('accounting', 'AccountingPeriod')
            period = AccountingPeriod.objects.filter(year=end_date.year, month=end_date.month).first()
            if period and period.state in ['CLOSED', 'LOCKED']:
                balance = StockAccountPeriodBalance.objects.filter(account=self, period=period).first()
                if balance:
                    # Pour simplifier, on retourne le solde de clôture si on demande précisément la fin d'un mois clôturé
                    if self.account_class in ['2', '3', '5', '6']:
                        return balance.closing_debit - balance.closing_credit
                    else:
                        return balance.closing_credit - balance.closing_debit

        # 2. Fallback dynamique optimisé pour les périodes ouvertes
        entries = StockJournalEntryLine.objects.filter(account=self, journal_entry__state='POSTED')
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
class StockJournal(models.Model):
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
        related_name='stock_default_debit_journals'
    )
    default_credit_account = models.ForeignKey(
        'ChartOfAccounts', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='stock_default_credit_journals'
    )
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.code} - {self.name}"


# Écritures comptables
class StockJournalEntry(models.Model):
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
    reversal_of = models.OneToOneField('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='stock_reversed_by')
    
    # Relations
    created_by = models.ForeignKey("authentication.MedicalStaff", on_delete=models.CASCADE, related_name='stock_created_entries')
    validated_by = models.ForeignKey("authentication.MedicalStaff", on_delete=models.SET_NULL, null=True, blank=True, related_name='stock_validated_entries')

    created_at = models.DateTimeField(auto_now_add=True)
    validated_at = models.DateTimeField(null=True, blank=True)

    bill = models.ForeignKey('polyclinic.Bill', on_delete=models.SET_NULL, null=True, blank=True)
    consultation = models.ForeignKey('polyclinic.Consultation', on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        verbose_name = "Écriture comptable"
        constraints = [
            models.CheckConstraint(
                check=models.Q(state='DRAFT') | models.Q(total_debit=models.F('total_credit')),
                name='stock_posted_entry_must_be_balanced'
            )
        ]
        ordering = ['-entry_date', '-created_at']
    
    def __str__(self):
        return f"{self.entry_number} - {self.description}"
    
    def generate_entry_number(self):
        """Génère un numéro d'écriture chronologique par journal"""
        # Format: CODE_JOURNAL-AAAA-MM-XXXXX
        year = self.entry_date.year
        month = self.entry_date.month
        prefix = f"{self.journal.code}-{year}-{month:02d}-"
        
        with transaction.atomic():
            last_entry = StockJournalEntry.objects.filter(
                entry_number__startswith=prefix
            ).select_for_update().order_by('-entry_number').first()
            
            if last_entry:
                try:
                    last_num = int(last_entry.entry_number.split('-')[-1])
                    new_num = last_num + 1
                except ValueError:
                    new_num = 1
            else:
                new_num = 1
                
        return f"{prefix}{new_num:05d}"

    def save(self, *args, **kwargs):
        # 1. Empêcher la modification d'une écriture validée (POSTED)
        if self.pk:
            old_self = StockJournalEntry.objects.get(pk=self.pk)
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
        AccountingPeriod = apps.get_model('accounting', 'AccountingPeriod')
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
        # if self.created_by == validated_by:
        #    raise ValidationError("Le créateur de l'écriture ne peut pas la valider lui-même.")

        # Recalculer les totaux AVANT de vérifier l'équilibre
        self.update_totals(commit=False)

        if not self.is_balanced:
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
        """Met à jour AccountPeriodBalance for each line of the entry"""
        AccountingPeriod = apps.get_model('accounting', 'AccountingPeriod')
        period = AccountingPeriod.objects.filter(
            year=self.entry_date.year, 
            month=self.entry_date.month
        ).first()
        
        if not period: return

        for line in self.lines.all():
            balance, _ = StockAccountPeriodBalance.objects.get_or_create(
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
            last_v = StockJournalEntry.objects.filter(
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
        reversal_entry = StockJournalEntry.objects.create(
            journal=self.journal,
            entry_date=timezone.now().date(),
            description=description or f"Contre-passation de {self.entry_number}: {self.description}",
            created_by=user,
            reversal_of=self,
            reference=self.entry_number
        )

        for line in self.lines.all():
            StockJournalEntryLine.objects.create(
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


# Lignes d'écritures
class StockJournalEntryLine(models.Model):
    journal_entry = models.ForeignKey('JournalEntry', on_delete=models.CASCADE, related_name='stock_lines')
    sequence = models.PositiveIntegerField()
    account = models.ForeignKey('ChartOfAccounts', on_delete=models.CASCADE)
    label = models.CharField(max_length=255)
    debit_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    credit_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Références optionnelles
    # Références optionnelles
    partner_supplier = models.ForeignKey('StockSupplier', on_delete=models.SET_NULL, null=True, blank=True)
    partner_customer = models.ForeignKey('StockCustomer', on_delete=models.SET_NULL, null=True, blank=True)
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
class StockSupplier(models.Model):
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
        entries = StockJournalEntryLine.objects.filter(
            partner_supplier=self,
            account__account_type='EXPENSE'
        )
        if year:
            entries = entries.filter(journal_entry__entry_date__year=year)
        
        return entries.aggregate(
            total=models.Sum('debit_amount')
        )['total'] or 0


# Clients (Classe 41)
class StockCustomer(models.Model):
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
class StockAsset(models.Model):
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
        related_name='stock_assets'
    )
    depreciation_account = models.ForeignKey(
        'ChartOfAccounts', 
        on_delete=models.CASCADE,
        related_name='stock_asset_depreciations'
    )
    expense_account = models.ForeignKey(
        'ChartOfAccounts', 
        on_delete=models.CASCADE,
        related_name='stock_depreciation_expenses'
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
        related_name='stock_created_assets'
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
        entries = StockJournalEntryLine.objects.filter(
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
class StockAnalyticAccount(models.Model):
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
class StockBudget(models.Model):
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
        related_name='stock_approved_budgets'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    
    created_by = models.ForeignKey(
        "authentication.MedicalStaff", 
        on_delete=models.CASCADE,
        related_name='stock_created_budgets'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Budget"
        unique_together = ['fiscal_year', 'budget_type']
    
    def __str__(self):
        return f"Budget {self.fiscal_year} - {self.name}"


class StockBudgetLine(models.Model):
    budget = models.ForeignKey('Budget', on_delete=models.CASCADE, related_name='stock_lines')
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
class StockAccountingPeriod(models.Model):
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
        related_name='stock_closed_periods'
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
class StockAccountPeriodBalance(models.Model):
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
class StockAccountingOperation(models.Model):
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
class StockTaxRate(models.Model):
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
        related_name='stock_collected_taxes',
        help_text="Compte TVA collectée"
    )
    paid_account = models.ForeignKey(
        'ChartOfAccounts', 
        on_delete=models.CASCADE,
        related_name='stock_paid_taxes',
        help_text="Compte TVA déductible"
    )
    
    class Meta:
        verbose_name = "Taux de taxe"
    
    def __str__(self):
        return f"{self.name} - {self.rate*100}%"


class StockTaxDeclaration(models.Model):
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
class StockBankAccount(models.Model):
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


class StockBankReconciliation(models.Model):
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
class StockFinancialRatio(models.Model):
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

# ==================== CATALOGUES ====================

class Category(models.Model):
    """Catégories d'articles"""
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # Comptes comptables par défaut
    default_stock_account = models.ForeignKey(
        'accounting.ChartOfAccounts',
        on_delete=models.SET_NULL,
        null=True,
        related_name='category_stock_accounts',
        help_text="Compte stock classe 3 par défaut"
    )
    default_expense_account = models.ForeignKey(
        'accounting.ChartOfAccounts',
        on_delete=models.SET_NULL,
        null=True,
        related_name='category_expense_accounts',
        help_text="Compte charge classe 6 par défaut"
    )
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Catégorie"
        verbose_name_plural = "Catégories"
        ordering = ['code']
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class Family(models.Model):
    """Familles d'articles (sous-catégories)"""
    category = models.ForeignKey('Category', on_delete=models.CASCADE, related_name='families')
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Famille"
        verbose_name_plural = "Familles"
        ordering = ['category', 'code']
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class Article(models.Model):
    """Articles (médicaments, consommables, équipements)"""
    ARTICLE_TYPES = [
        ('DRUG', 'Médicament'),
        ('CONSUMABLE', 'Consommable médical'),
        ('EQUIPMENT', 'Équipement'),
        ('REAGENT', 'Réactif laboratoire'),
        ('SUPPLY', 'Fourniture'),
    ]
    
    UNIT_TYPES = [
        ('UNIT', 'Unité'),
        ('BOX', 'Boîte'),
        ('BOTTLE', 'Flacon'),
        ('VIAL', 'Ampoule'),
        ('BAG', 'Sachet'),
        ('KG', 'Kilogramme'),
        ('LITER', 'Litre'),
        ('METER', 'Mètre'),
    ]
    
    # Identification
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # Classification
    article_type = models.CharField(max_length=20, choices=ARTICLE_TYPES)
    category = models.ForeignKey('Category', on_delete=models.PROTECT)
    family = models.ForeignKey('Family', on_delete=models.PROTECT)
    
    # Unité et conditionnement
    unit = models.CharField(max_length=20, choices=UNIT_TYPES)
    units_per_package = models.PositiveIntegerField(default=1, help_text="Nombre d'unités par conditionnement")
    
    # Gestion péremption
    is_perishable = models.BooleanField(default=False)
    shelf_life_days = models.PositiveIntegerField(
        null=True, 
        blank=True,
        help_text="Durée de validité en jours"
    )
    
    # Gestion stock
    minimum_stock = models.DecimalField(
        max_digits=15, 
        decimal_places=3, 
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Seuil d'alerte"
    )
    safety_stock = models.DecimalField(
        max_digits=15, 
        decimal_places=3, 
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Stock de sécurité"
    )
    reorder_quantity = models.DecimalField(
        max_digits=15,
        decimal_places=3,
        default=0,
        help_text="Quantité de réapprovisionnement"
    )
    
    # Valorisation (PMP - obligatoire OHADA)
    weighted_average_price = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        help_text="Prix Moyen Pondéré (PMP)"
    )
    last_purchase_price = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )
    
    # Prix de vente (pour calculs marge)
    selling_price = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        help_text="Prix de vente unitaire"
    )
    
    # Comptes comptables OHADA
    stock_account = models.ForeignKey(
        'accounting.ChartOfAccounts',
        on_delete=models.PROTECT,
        related_name='article_stocks',
        help_text="Compte classe 3 (ex: 331x)"
    )
    purchase_account = models.ForeignKey(
        'accounting.ChartOfAccounts',
        on_delete=models.PROTECT,
        related_name='article_purchases',
        help_text="Compte classe 6 (ex: 603x)"
    )
    sales_account = models.ForeignKey(
        'accounting.ChartOfAccounts',
        on_delete=models.PROTECT,
        related_name='article_sales',
        null=True,
        blank=True,
        help_text="Compte classe 7 (ex: 701x)"
    )
    
    # Fournisseur principal
    preferred_supplier = models.ForeignKey(
        'StockSupplier',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='preferred_articles'
    )
    
    # État et traçabilité
    is_active = models.BooleanField(default=True)
    requires_batch = models.BooleanField(default=True, help_text="Gestion par lots obligatoire")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        "authentication.MedicalStaff",
        on_delete=models.SET_NULL,
        null=True
    )
    
    class Meta:
        verbose_name = "Article"
        ordering = ['code']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['category', 'family']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    def get_total_stock(self):
        """Retourne le stock total tous dépôts confondus"""
        from django.db.models import Sum
        total = self.stocks.aggregate(
            total=Sum('physical_quantity')
        )['total']
        return total or Decimal('0')
    
    def get_available_stock(self):
        """Stock disponible (physique - réservé)"""
        from django.db.models import Sum
        stocks = self.stocks.aggregate(
            physical=Sum('physical_quantity'),
            reserved=Sum('reserved_quantity')
        )
        physical = stocks['physical'] or Decimal('0')
        reserved = stocks['reserved'] or Decimal('0')
        return physical - reserved
    
    def is_below_minimum(self):
        """Vérifie si en dessous du seuil d'alerte"""
        return self.get_available_stock() < self.minimum_stock
    
    def recalculate_pmp(self, new_quantity, new_unit_price):
        """
        Recalcule le PMP après une entrée (méthode OHADA)
        PMP = (Valeur stock ancien + Valeur entrée) / (Qté ancienne + Qté entrée)
        """
        current_stock = self.get_total_stock()
        current_value = current_stock * self.weighted_average_price
        new_value = new_quantity * new_unit_price
        
        total_quantity = current_stock + new_quantity
        
        if total_quantity > 0:
            new_pmp = (current_value + new_value) / total_quantity
            self.weighted_average_price = new_pmp
            self.last_purchase_price = new_unit_price
            self.save(update_fields=['weighted_average_price', 'last_purchase_price', 'updated_at'])
            
            return new_pmp
        return self.weighted_average_price
    
    def get_stock_value(self):
        """Valorisation du stock total au PMP"""
        return self.get_total_stock() * self.weighted_average_price


# ==================== DÉPÔTS ====================

class Depot(models.Model):
    """Dépôts/Magasins de stockage"""
    DEPOT_TYPES = [
        ('PHARMACY', 'Pharmacie'),
        ('CENTRAL', 'Magasin central'),
        ('OPERATING_ROOM', 'Bloc opératoire'),
        ('LABORATORY', 'Laboratoire'),
        ('EMERGENCY', 'Urgences'),
        ('WARD', 'Service hospitalisation'),
    ]
    
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    depot_type = models.CharField(max_length=20, choices=DEPOT_TYPES)
    
    # Localisation
    location = models.CharField(max_length=255, blank=True)
    department = models.ForeignKey(
        'polyclinic.Department',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Responsable
    manager = models.ForeignKey(
        "authentication.MedicalStaff",
        on_delete=models.SET_NULL,
        null=True,
        related_name='managed_depots'
    )
    
    # Configuration
    is_active = models.BooleanField(default=True)
    allows_negative_stock = models.BooleanField(
        default=False,
        help_text="Autorise les stocks négatifs (déconseillé)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        "authentication.MedicalStaff",
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_depots'
    )
    
    class Meta:
        verbose_name = "Dépôt"
        ordering = ['code']
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    def get_total_value(self):
        """Valorisation totale du dépôt"""
        from django.db.models import Sum, F
        value = self.stocks.aggregate(
            total=Sum(F('physical_quantity') * F('article__weighted_average_price'))
        )['total']
        return value or Decimal('0')


class Stock(models.Model):
    """État du stock par article et dépôt"""
    article = models.ForeignKey('Article', on_delete=models.CASCADE, related_name='stocks')
    depot = models.ForeignKey('Depot', on_delete=models.CASCADE, related_name='stocks')
    
    # Quantités
    physical_quantity = models.DecimalField(
        max_digits=15,
        decimal_places=3,
        default=0,
        help_text="Quantité physique réelle"
    )
    theoretical_quantity = models.DecimalField(
        max_digits=15,
        decimal_places=3,
        default=0,
        help_text="Quantité théorique (comptable)"
    )
    reserved_quantity = models.DecimalField(
        max_digits=15,
        decimal_places=3,
        default=0,
        help_text="Quantité réservée (commandes en cours)"
    )
    
    # Valorisation
    stock_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        help_text="Valeur du stock (quantité × PMP)"
    )
    
    # Suivi
    last_inventory_date = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Stock"
        unique_together = ['article', 'depot']
        indexes = [
            models.Index(fields=['article', 'depot']),
            models.Index(fields=['depot']),
        ]
    
    def __str__(self):
        return f"{self.article.code} @ {self.depot.code}: {self.physical_quantity}"
    
    @property
    def available_quantity(self):
        """Quantité disponible"""
        return self.physical_quantity - self.reserved_quantity
    
    def update_value(self):
        """Met à jour la valorisation"""
        self.stock_value = self.physical_quantity * self.article.weighted_average_price
        self.save(update_fields=['stock_value', 'physical_quantity', 'theoretical_quantity', 'reserved_quantity', 'updated_at'])
    
    def can_issue(self, quantity):
        """Vérifie si on peut sortir une quantité"""
        if self.depot.allows_negative_stock:
            return True
        return self.available_quantity >= quantity


# ==================== LOTS ====================

class Batch(models.Model):
    """Lots de fabrication/réception"""
    article = models.ForeignKey('Article', on_delete=models.CASCADE, related_name='batches')
    supplier = models.ForeignKey(
        'StockSupplier',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Identification
    batch_number = models.CharField(max_length=100)
    internal_reference = models.CharField(max_length=50, unique=True, blank=True)
    
    # Dates
    manufacturing_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    reception_date = models.DateField()
    
    # Quantités
    initial_quantity = models.DecimalField(max_digits=15, decimal_places=3)
    remaining_quantity = models.DecimalField(max_digits=15, decimal_places=3)
    
    # Prix
    unit_cost = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Coût unitaire d'achat"
    )
    
    # État
    is_blocked = models.BooleanField(default=False)
    blocking_reason = models.CharField(max_length=255, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        "authentication.MedicalStaff",
        on_delete=models.SET_NULL,
        null=True
    )
    
    class Meta:
        verbose_name = "Lot"
        unique_together = ['article', 'batch_number', 'supplier']
        ordering = ['expiry_date', 'reception_date']
        indexes = [
            models.Index(fields=['article', 'expiry_date']),
            models.Index(fields=['is_blocked']),
        ]
    
    def __str__(self):
        return f"Lot {self.batch_number} - {self.article.code}"
    
    def save(self, *args, **kwargs):
        if not self.internal_reference:
            self.internal_reference = self.generate_internal_reference()
        super().save(*args, **kwargs)
    
    def generate_internal_reference(self):
        """Génère une référence interne unique"""
        prefix = f"LOT{timezone.now().strftime('%Y%m')}"
        last = Batch.objects.filter(
            internal_reference__startswith=prefix
        ).order_by('-internal_reference').first()
        
        if last:
            last_num = int(last.internal_reference[-5:])
            new_num = last_num + 1
        else:
            new_num = 1
        
        return f"{prefix}{new_num:05d}"
    
    def is_expired(self):
        """Vérifie si le lot est périmé"""
        if not self.expiry_date:
            return False
        return timezone.now().date() > self.expiry_date
    
    def days_until_expiry(self):
        """Jours avant péremption"""
        if not self.expiry_date:
            return None
        delta = self.expiry_date - timezone.now().date()
        return delta.days
    
    def is_near_expiry(self, warning_days=180):
        """Vérifie si proche de la péremption"""
        days = self.days_until_expiry()
        return days is not None and 0 < days <= warning_days


# ==================== MOUVEMENTS DE STOCK ====================

class StockMovement(models.Model):
    """Mouvements de stock (traçabilité complète)"""
    MOVEMENT_TYPES = [
        ('IN', 'Entrée'),
        ('OUT', 'Sortie'),
        ('TRANSFER', 'Transfert'),
        ('ADJUSTMENT', 'Ajustement'),
        ('RETURN', 'Retour'),
    ]
    
    MOVEMENT_REASONS = [
        ('PURCHASE', 'Achat'),
        ('SALE', 'Vente'),
        ('CONSUMPTION', 'Consommation'),
        ('TRANSFER', 'Transfert'),
        ('INVENTORY', 'Inventaire'),
        ('EXPIRY', 'Péremption'),
        ('DAMAGE', 'Casse/Perte'),
        ('RETURN_SUPPLIER', 'Retour fournisseur'),
        ('RETURN_PATIENT', 'Retour patient'),
        ('INITIAL', 'Stock initial'),
    ]
    
    MOVEMENT_STATUS = [
        ('DRAFT', 'Brouillon'),
        ('CONFIRMED', 'Confirmé'),
        ('POSTED', 'Comptabilisé'),
        ('CANCELLED', 'Annulé'),
    ]
    
    # Numérotation
    movement_number = models.CharField(max_length=30, unique=True)
    
    # Type et nature
    movement_type = models.CharField(max_length=15, choices=MOVEMENT_TYPES)
    movement_reason = models.CharField(max_length=20, choices=MOVEMENT_REASONS)
    
    # Article et lots
    article = models.ForeignKey('Article', on_delete=models.PROTECT)
    batch = models.ForeignKey('Batch', on_delete=models.PROTECT, null=True, blank=True)
    
    # Dépôts
    source_depot = models.ForeignKey(
        'Depot',
        on_delete=models.PROTECT,
        related_name='outgoing_movements',
        null=True,
        blank=True
    )
    destination_depot = models.ForeignKey(
        'Depot',
        on_delete=models.PROTECT,
        related_name='incoming_movements',
        null=True,
        blank=True
    )
    
    # Quantités et valorisation
    quantity = models.DecimalField(max_digits=15, decimal_places=3)
    unit_price = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Prix unitaire (PMP pour sorties, coût pour entrées)"
    )
    total_value = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Dates
    operation_date = models.DateTimeField(default=timezone.now)
    accounting_date = models.DateField(null=True, blank=True)
    
    # Références
    reference_document = models.CharField(max_length=100, blank=True)
    document_type = models.CharField(max_length=50, blank=True)
    
    # Comptabilité
    journal_entry = models.ForeignKey(
        'accounting.JournalEntry',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # État et traçabilité
    status = models.CharField(max_length=15, choices=MOVEMENT_STATUS, default='DRAFT')
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        "authentication.MedicalStaff",
        on_delete=models.PROTECT
    )
    validated_by = models.ForeignKey(
        "authentication.MedicalStaff",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='validated_movements'
    )
    validated_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Mouvement de stock"
        ordering = ['-operation_date', '-created_at']
        indexes = [
            models.Index(fields=['article', 'operation_date']),
            models.Index(fields=['source_depot', 'operation_date']),
            models.Index(fields=['destination_depot', 'operation_date']),
            models.Index(fields=['movement_type', 'status']),
            models.Index(fields=['batch']),
            models.Index(fields=['reference_document']),
        ]
    
    def __str__(self):
        return f"{self.movement_number} - {self.article.code}"
    
    def save(self, *args, **kwargs):
        # Générer le numéro de mouvement si absent
        if not self.movement_number:
            self.movement_number = self.generate_movement_number()
        
        # Calculer la valeur totale
        self.total_value = self.quantity * self.unit_price
        
        # Date comptable = date d'opération si non spécifiée
        if not self.accounting_date:
            self.accounting_date = self.operation_date.date()
        
        super().save(*args, **kwargs)
    
    def generate_movement_number(self):
        """Génère un numéro de mouvement unique"""
        today = timezone.now()
        prefix = f"MV{today.strftime('%Y%m')}"
        last = StockMovement.objects.filter(
            movement_number__startswith=prefix
        ).order_by('-movement_number').first()
        
        if last:
            last_num = int(last.movement_number[-5:])
            new_num = last_num + 1
        else:
            new_num = 1
        
        return f"{prefix}{new_num:05d}"
    
    def clean(self):
        """Validation métier"""
        from django.core.exceptions import ValidationError
        
        # Vérifier cohérence dépôts selon type
        if self.movement_type == 'IN' and not self.destination_depot:
            raise ValidationError("Une entrée doit avoir un dépôt de destination")
        
        if self.movement_type == 'OUT' and not self.source_depot:
            raise ValidationError("Une sortie doit avoir un dépôt source")
        
        if self.movement_type == 'TRANSFER':
            if not self.source_depot or not self.destination_depot:
                raise ValidationError("Un transfert doit avoir un dépôt source ET destination")
            if self.source_depot == self.destination_depot:
                raise ValidationError("Les dépôts source et destination doivent être différents")
        
        # Quantité positive
        if self.quantity <= 0:
            raise ValidationError("La quantité doit être positive")
    
    def can_cancel(self):
        """Vérifie si le mouvement peut être annulé"""
        return self.status in ['DRAFT', 'CONFIRMED']
    
    def cancel(self, user, reason=""):
        """Annule le mouvement et inverse les stocks si confirmé"""
        if not self.can_cancel():
            raise ValidationError("Ce mouvement ne peut pas être annulé")
        
        # Si confirmé, inverser les mouvements de stock
        if self.status == 'CONFIRMED':
            if self.movement_type == 'IN':
                stock = Stock.objects.get(article=self.article, depot=self.destination_depot)
                stock.physical_quantity -= self.quantity
                stock.theoretical_quantity -= self.quantity
                stock.update_value()
            
            elif self.movement_type == 'OUT':
                stock = Stock.objects.get(article=self.article, depot=self.source_depot)
                stock.physical_quantity += self.quantity
                stock.theoretical_quantity += self.quantity
                stock.update_value()
                
                # Remettre la quantité dans le lot
                if self.batch:
                    self.batch.remaining_quantity += self.quantity
                    self.batch.save()
        
        # Annuler l'écriture comptable si existe
        if self.journal_entry:
            self.journal_entry.state = 'CANCELLED'
            self.journal_entry.save()
        
        self.status = 'CANCELLED'
        self.notes += f"\n[Annulé le {timezone.now()} par {user}] {reason}"
        self.save()

# Suite de stock_models.py - BONS D'ENTRÉE/SORTIE ET INVENTAIRES

# ==================== BONS D'ENTRÉE ====================

class GoodsReceiptNote(models.Model):
    """Bons d'entrée (réception marchandises)"""
    RECEIPT_TYPES = [
        ('PURCHASE', 'Achat'),
        ('TRANSFER_IN', 'Transfert entrant'),
        ('RETURN', 'Retour'),
        ('ADJUSTMENT', 'Ajustement'),
        ('INITIAL', 'Stock initial'),
    ]
    
    RECEIPT_STATUS = [
        ('DRAFT', 'Brouillon'),
        ('CONFIRMED', 'Confirmé'),
        ('POSTED', 'Comptabilisé'),
        ('CANCELLED', 'Annulé'),
    ]
    
    # Numérotation
    receipt_number = models.CharField(max_length=30, unique=True)
    
    # Type et dates
    receipt_type = models.CharField(max_length=15, choices=RECEIPT_TYPES)
    receipt_date = models.DateField()
    document_date = models.DateField(help_text="Date du document fournisseur")
    
    # Destination
    depot = models.ForeignKey('Depot', on_delete=models.PROTECT)
    
    # Fournisseur (si achat)
    supplier = models.ForeignKey(
        'StockSupplier',
        on_delete=models.PROTECT,
        null=True,
        blank=True
    )
    
    # Références
    supplier_invoice = models.CharField(max_length=100, blank=True, help_text="N° facture fournisseur")
    delivery_note = models.CharField(max_length=100, blank=True, help_text="N° bon de livraison")
    purchase_order = models.CharField(max_length=100, blank=True, help_text="N° commande")
    
    # Montants
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Comptabilité
    journal_entry = models.ForeignKey(
        'accounting.JournalEntry',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # État et traçabilité
    status = models.CharField(max_length=15, choices=RECEIPT_STATUS, default='DRAFT')
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        "authentication.MedicalStaff",
        on_delete=models.PROTECT,
        related_name='created_receipts'
    )
    
    received_by = models.ForeignKey(
        "authentication.MedicalStaff",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='received_goods'
    )
    
    validated_by = models.ForeignKey(
        "authentication.MedicalStaff",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='validated_receipts'
    )
    validated_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Bon d'entrée"
        ordering = ['-receipt_date', '-created_at']
        indexes = [
            models.Index(fields=['receipt_number']),
            models.Index(fields=['depot', 'receipt_date']),
            models.Index(fields=['supplier']),
        ]
    
    def __str__(self):
        return f"{self.receipt_number} - {self.depot.code}"
    
    def save(self, *args, **kwargs):
        if not self.receipt_number:
            self.receipt_number = self.generate_receipt_number()
        super().save(*args, **kwargs)
    
    def generate_receipt_number(self):
        """Génère un numéro de bon d'entrée"""
        today = timezone.now()
        prefix = f"BE{today.strftime('%Y%m')}"
        last = GoodsReceiptNote.objects.filter(
            receipt_number__startswith=prefix
        ).order_by('-receipt_number').first()
        
        if last:
            last_num = int(last.receipt_number[-5:])
            new_num = last_num + 1
        else:
            new_num = 1
        
        return f"{prefix}{new_num:05d}"
    
    def update_totals(self):
        """Calcule les totaux depuis les lignes"""
        from django.db.models import Sum
        totals = self.lines.aggregate(
            subtotal=Sum('line_amount'),
            total=Sum('line_amount')
        )
        self.subtotal = totals['subtotal'] or Decimal('0')
        self.total_amount = totals['total'] or Decimal('0')
        self.save(update_fields=['subtotal', 'total_amount'])
    
    def confirm(self, user):
        """Confirme le bon d'entrée et met à jour les stocks"""
        if self.status != 'DRAFT':
            raise ValidationError("Seul un bon en brouillon peut être confirmé")
        
        # Pour chaque ligne, créer un lot et un mouvement
        for line in self.lines.all():
            # Créer ou mettre à jour le lot
            if line.article.requires_batch:
                batch, created = Batch.objects.get_or_create(
                    article=line.article,
                    batch_number=line.batch_number,
                    supplier=self.supplier,
                    defaults={
                        'manufacturing_date': line.manufacturing_date,
                        'expiry_date': line.expiry_date,
                        'reception_date': self.receipt_date,
                        'initial_quantity': line.quantity_received,
                        'remaining_quantity': line.quantity_received,
                        'unit_cost': line.unit_price,
                        'created_by': user
                    }
                )
                if not created:
                    batch.initial_quantity += line.quantity_received
                    batch.remaining_quantity += line.quantity_received
                    # Mettre à jour la date d'expiration si fournie et plus récente/différente? 
                    # On garde la première par sécurité ou on met à jour.
                    if line.expiry_date:
                        batch.expiry_date = line.expiry_date
                    batch.save()
            else:
                batch = None
            
            # Créer le mouvement de stock
            movement = StockMovement.objects.create(
                movement_type='IN',
                movement_reason='PURCHASE' if self.receipt_type == 'PURCHASE' else 'TRANSFER',
                article=line.article,
                batch=batch,
                destination_depot=self.depot,
                quantity=line.quantity_received,
                unit_price=line.unit_price,
                total_value=line.line_amount,
                operation_date=timezone.now(),
                reference_document=self.receipt_number,
                document_type='GOODS_RECEIPT',
                status='CONFIRMED',
                created_by=user
            )
            
            # Recalculer le PMP (AVANT la mise à jour du stock pour avoir la "current_quantity" correcte)
            line.article.recalculate_pmp(line.quantity_received, line.unit_price)
        
            # Mettre à jour le stock
            stock, created = Stock.objects.get_or_create(
                article=line.article,
                depot=self.depot,
                defaults={'physical_quantity': 0, 'theoretical_quantity': 0}
            )
            stock.physical_quantity += line.quantity_received
            stock.theoretical_quantity += line.quantity_received
            stock.update_value()
            
        # Mettre à jour le statut
        self.status = 'CONFIRMED'
        self.validated_by = user
        self.validated_at = timezone.now()
        self.save()
    
    def post_to_accounting(self):
        """Génère l'écriture comptable OHADA"""
        if self.status != 'CONFIRMED':
            raise ValidationError("Le bon doit être confirmé avant comptabilisation")
        
        # Écriture type achat OHADA:
        # Débit 33xx - Stock (ou 38xx - Achats stockés)
        # Crédit 401x - Fournisseur
        
        # Les modèles JournalEntry, JournalEntryLine et Journal sont déjà définis plus haut
        
        # Récupérer le journal d'achats (Modèle Journal financier)
        Journal = apps.get_model('accounting', 'Journal')
        journal = Journal.objects.get(journal_type='PURCHASES')
        
        # Récupérer les modèles d'entrée journal (Modèles financiers)
        JournalEntry = apps.get_model('accounting', 'JournalEntry')
        JournalEntryLine = apps.get_model('accounting', 'JournalEntryLine')
        
        # Créer l'écriture
        entry = JournalEntry.objects.create(
            journal=journal,
            entry_date=self.receipt_date,
            reference=self.receipt_number,
            description=f"Réception {self.supplier.name if self.supplier else 'N/A'} - {self.receipt_number}",
            state='DRAFT',
            created_by=self.created_by # Utiliser le créateur du bon
        )
        
        # Pour chaque ligne, créer les lignes d'écriture
        sequence = 1
        for line in self.lines.all():
            # Débit stock
            JournalEntryLine.objects.create(
                journal_entry=entry,
                sequence=sequence,
                account=line.article.stock_account,
                label=f"Stock {line.article.name}",
                debit_amount=line.line_amount,
                credit_amount=0
            )
            sequence += 1
        
        # Crédit fournisseur (total)
        if not self.supplier or not self.supplier.account:
            raise ValidationError(f"Le fournisseur {self.supplier.name} n'a pas de compte comptable associé (ex: 401). Veuillez le configurer dans la fiche fournisseur.")

        JournalEntryLine.objects.create(
            journal_entry=entry,
            sequence=sequence,
            account=self.supplier.account,
            label=f"Fournisseur {self.supplier.name}",
            debit_amount=0,
            credit_amount=self.total_amount
        )
        
        # Mettre à jour les totaux et valider
        entry.update_totals()
        entry.post(self.validated_by)
        
        # Lier l'écriture au bon
        self.journal_entry = entry
        self.status = 'POSTED'
        self.save()


class GoodsReceiptLine(models.Model):
    """Lignes de bon d'entrée"""
    receipt = models.ForeignKey('GoodsReceiptNote', on_delete=models.CASCADE, related_name='lines')
    sequence = models.PositiveIntegerField()
    
    # Article
    article = models.ForeignKey('Article', on_delete=models.PROTECT)
    
    # Lot
    batch_number = models.CharField(max_length=100)
    manufacturing_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    
    # Quantités
    quantity_ordered = models.DecimalField(
        max_digits=15,
        decimal_places=3,
        default=0,
        help_text="Quantité commandée"
    )
    quantity_received = models.DecimalField(
        max_digits=15,
        decimal_places=3,
        help_text="Quantité réellement reçue"
    )
    
    # Prix
    unit_price = models.DecimalField(max_digits=15, decimal_places=2)
    discount_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    line_amount = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Notes
    notes = models.TextField(blank=True)
    
    class Meta:
        verbose_name = "Ligne bon d'entrée"
        ordering = ['receipt', 'sequence']
        unique_together = ['receipt', 'sequence']
    
    def __str__(self):
        return f"{self.receipt.receipt_number} - L{self.sequence}"
    
    def save(self, *args, **kwargs):
        # Calculer le montant
        discount_rate = Decimal(str(self.discount_rate)) if self.discount_rate else Decimal('0')
        discounted_price = self.unit_price * (1 - discount_rate / 100)
        self.line_amount = self.quantity_received * discounted_price
        super().save(*args, **kwargs)
        # Mettre à jour le total du bon
        self.receipt.update_totals()


# ==================== BONS DE SORTIE ====================

class GoodsIssueNote(models.Model):
    """Bons de sortie"""
    ISSUE_TYPES = [
        ('SALE', 'Vente'),
        ('CONSUMPTION', 'Consommation service'),
        ('TRANSFER_OUT', 'Transfert sortant'),
        ('DAMAGE', 'Casse/Perte'),
        ('EXPIRY', 'Péremption'),
        ('RETURN', 'Retour fournisseur'),
    ]
    
    STATUS_CHOICES = [
        ('DRAFT', 'Brouillon'),
        ('VALIDATED', 'Validé (Réservé)'),
        ('CONFIRMED', 'Confirmé (Déduit)'),
        ('POSTED', 'Comptabilisé'),
        ('CANCELLED', 'Annulé'),
    ]
    
    # Numérotation
    issue_number = models.CharField(max_length=30, unique=True)
    
    # Type et dates
    issue_type = models.CharField(max_length=15, choices=ISSUE_TYPES)
    issue_date = models.DateField()
    
    # Source
    depot = models.ForeignKey('Depot', on_delete=models.PROTECT)
    
    # Destination (selon type)
    department = models.ForeignKey(
        'polyclinic.Department',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Service destinataire"
    )
    patient = models.ForeignKey(
        'polyclinic.Patient',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Patient (si vente/prescription)"
    )
    prescription = models.ForeignKey(
        'polyclinic.Prescription',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Montants
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Comptabilité
    journal_entry = models.ForeignKey(
        'accounting.JournalEntry',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # État
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='DRAFT')
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        "authentication.MedicalStaff",
        on_delete=models.PROTECT,
        related_name='created_issues'
    )
    
    issued_by = models.ForeignKey(
        "authentication.MedicalStaff",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='issued_goods'
    )
    
    validated_by = models.ForeignKey(
        "authentication.MedicalStaff",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='validated_issues'
    )
    validated_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Bon de sortie"
        ordering = ['-issue_date', '-created_at']
        indexes = [
            models.Index(fields=['issue_number']),
            models.Index(fields=['depot', 'issue_date']),
        ]
    
    def __str__(self):
        return f"{self.issue_number} - {self.depot.code}"
    
    def save(self, *args, **kwargs):
        if not self.issue_number:
            self.issue_number = self.generate_issue_number()
        super().save(*args, **kwargs)
    
    def generate_issue_number(self):
        """Génère un numéro de bon de sortie"""
        today = timezone.now()
        prefix = f"BS{today.strftime('%Y%m')}"
        last = GoodsIssueNote.objects.filter(
            issue_number__startswith=prefix
        ).order_by('-issue_number').first()
        
        if last:
            last_num = int(last.issue_number[-5:])
            new_num = last_num + 1
        else:
            new_num = 1
        
        return f"{prefix}{new_num:05d}"
    
    def update_total(self):
        """Met à jour le montant total du bon"""
        from django.db.models import Sum
        self.total_amount = self.lines.aggregate(total=Sum('line_amount'))['total'] or 0
        self.save(update_fields=['total_amount'])

    def validate(self, user):
        """Valide le bon de sortie et réserve la quantité dans le stock"""
        if self.status != 'DRAFT':
            raise ValidationError("Seul un bon en brouillon peut être validé")
        
        from django.db.models import Sum
        
        for line in self.lines.all():
            # Vérifier la disponibilité (Physique - Réservé)
            stock, created = Stock.objects.get_or_create(
                article=line.article, 
                depot=self.depot,
                defaults={'physical_quantity': 0, 'theoretical_quantity': 0, 'reserved_quantity': 0}
            )
            # Re-fetch with lock to be safe during reservation
            if not created:
                stock = Stock.objects.select_for_update().get(id=stock.id)
            
            if stock.available_quantity < line.quantity:
                raise ValidationError(f"Stock insuffisant (Disponible: {stock.available_quantity}, Demandé: {line.quantity})")
            
            # Réserver
            stock.reserved_quantity += line.quantity
            stock.save(update_fields=['reserved_quantity', 'updated_at'])
            
            # Fixer le prix prévisionnel (PMP actuel)
            line.unit_price = line.article.weighted_average_price
            line.line_amount = line.quantity * line.unit_price
            line.save()
            
        self.status = 'VALIDATED'
        self.update_total()
        self.save()

    def confirm(self, user):
        """Confirme la sortie physique : réduit physique et libère réservé"""
        if self.status != 'VALIDATED':
            raise ValidationError("Le bon doit être validé/réservé avant confirmation")
        
        for line in self.lines.all():
            if line.article.requires_batch:
                # 1. Déduire des lots par FEFO
                remaining_to_deduct = line.quantity
                batches = Batch.objects.filter(
                    article=line.article,
                    remaining_quantity__gt=0,
                    is_blocked=False
                ).order_by('expiry_date', 'reception_date')
                
                for batch in batches:
                    if remaining_to_deduct <= 0:
                        break
                        
                    deduction = min(batch.remaining_quantity, remaining_to_deduct)
                    
                    StockMovement.objects.create(
                        movement_type='OUT',
                        movement_reason=self.issue_type,
                        article=line.article,
                        batch=batch,
                        source_depot=self.depot,
                        quantity=deduction,
                        unit_price=line.unit_price,
                        total_value=deduction * line.unit_price,
                        operation_date=timezone.now(),
                        reference_document=self.issue_number,
                        document_type='GOODS_ISSUE',
                        status='CONFIRMED',
                        created_by=user
                    )
                    
                    batch.remaining_quantity -= deduction
                    batch.save()
                    remaining_to_deduct -= deduction
                
                if remaining_to_deduct > 0:
                    raise ValidationError(f"Stock insuffisant dans les lots pour {line.article.name} (Manquant: {remaining_to_deduct}). Vérifiez l'état des lots.")
            else:
                # Pas de gestion par lots : Créer un mouvement sans lot
                StockMovement.objects.create(
                    movement_type='OUT',
                    movement_reason=self.issue_type,
                    article=line.article,
                    batch=None,
                    source_depot=self.depot,
                    quantity=line.quantity,
                    unit_price=line.unit_price,
                    total_value=line.line_amount,
                    operation_date=timezone.now(),
                    reference_document=self.issue_number,
                    document_type='GOODS_ISSUE',
                    status='CONFIRMED',
                    created_by=user
                )

            # 2. Mettre à jour le stock global
            stock = Stock.objects.select_for_update().get(article=line.article, depot=self.depot)
            stock.physical_quantity -= line.quantity
            stock.theoretical_quantity -= line.quantity
            stock.reserved_quantity -= line.quantity # Libération de la réservation
            stock.update_value()
        
        self.status = 'CONFIRMED'
        self.validated_by = user
        self.validated_at = timezone.now()
        self.save()
    
    def generate_journal_entry(self, user):
        """Génère l'écriture comptable pour la sortie de stock (Valorisation PMP)"""
        if self.status != 'CONFIRMED':
            raise ValidationError("Le bon doit être confirmé avant comptabilisation")
            
        # Les modèles sont déjà définis plus haut
        
        # 1. Identifier le journal (STK ou Divers) - Modèle financier
        Journal = apps.get_model('accounting', 'Journal')
        journal = Journal.objects.filter(code='STK').first() or Journal.objects.filter(journal_type='MISC').first()
        if not journal:
            raise ValidationError("Journal de stock (STK) ou Opérations Diverses (MISC) non trouvé dans la comptabilité financière")
            
        # 2. Créer l'entête de l'écriture (Modèle financier)
        JournalEntry = apps.get_model('accounting', 'JournalEntry')
        JournalEntryLine = apps.get_model('accounting', 'JournalEntryLine')
        
        entry = JournalEntry.objects.create(
            journal=journal,
            entry_date=self.issue_date,
            description=f"Sortie de stock {self.issue_number} - {self.get_issue_type_display()}",
            reference=self.issue_number,
            created_by=self.created_by,
            state='DRAFT'
        )
        
        # 3. Lignes d'écriture (OHADA)
        total_value = sum(line.line_amount for line in self.lines.all())
        
        # Débit : Compte de charges (6031 Variation de stock) - Modèle financier
        ChartOfAccounts = apps.get_model('accounting', 'ChartOfAccounts')
        acc_603 = ChartOfAccounts.objects.filter(code='6031').first() or ChartOfAccounts.objects.filter(code__startswith='603').first()
        if not acc_603:
            raise ValidationError("Compte de variation de stock (603) non trouvé dans le plan comptable financier")

        JournalEntryLine.objects.create(
            journal_entry=entry,
            sequence=1,
            account=acc_603,
            label=f"Variation de stock - {self.issue_number}",
            debit_amount=total_value,
            credit_amount=0
        )
        
        # Crédit : Compte de stock (31 ou 37)
        # On utilise le compte de stock de l'article si défini, sinon un compte 3111 par défaut
        for i, line in enumerate(self.lines.all()):
             acc_stock = line.article.stock_account or ChartOfAccounts.objects.filter(code='3111').first() or ChartOfAccounts.objects.filter(code__startswith='311').first()
             if not acc_stock:
                 raise ValidationError(f"Compte de stock pour {line.article.name} non trouvé")
             
             JournalEntryLine.objects.create(
                journal_entry=entry,
                sequence=i+2,
                account=acc_stock,
                label=f"Sortie {line.article.name} - {self.issue_number}",
                debit_amount=0,
                credit_amount=line.line_amount
            )
        
        entry.update_totals()
        entry.post(user)
        
        self.journal_entry = entry
        self.status = 'POSTED'
        self.save()
        return entry


class GoodsIssueLine(models.Model):
    """Lignes de bon de sortie"""
    issue = models.ForeignKey('GoodsIssueNote', on_delete=models.CASCADE, related_name='lines')
    sequence = models.PositiveIntegerField()
    
    article = models.ForeignKey('Article', on_delete=models.PROTECT)
    batch = models.ForeignKey('Batch', on_delete=models.PROTECT, null=True, blank=True)
    
    quantity = models.DecimalField(max_digits=15, decimal_places=3)
    unit_price = models.DecimalField(max_digits=15, decimal_places=2, default=0, help_text="PMP au moment de la sortie")
    line_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    notes = models.TextField(blank=True)
    
    class Meta:
        verbose_name = "Ligne bon de sortie"
        ordering = ['issue', 'sequence']
        unique_together = ['issue', 'sequence']
    
    def save(self, *args, **kwargs):
        # Initialiser le prix avec le PMP actuel si non défini (Brouillon)
        if self.unit_price == 0 and self.article:
            self.unit_price = self.article.weighted_average_price
            
        self.line_amount = self.quantity * self.unit_price
        super().save(*args, **kwargs)
        # Mettre à jour le total du bon
        self.issue.update_total()


# ==================== TRANSFERTS INTER-DEPOTS ====================


class TransferNote(models.Model):
    """Transferts inter-dépôts (suivi séparé)."""
    TRANSFER_STATUS = [
        ('DRAFT', 'Brouillon'),
        ('SENT', 'Envoyé'),
        ('RECEIVED', 'Reçu'),
        ('CANCELLED', 'Annulé'),
    ]

    transfer_number = models.CharField(max_length=30, unique=True)
    source_depot = models.ForeignKey('Depot', on_delete=models.PROTECT, related_name='outgoing_transfers')
    destination_depot = models.ForeignKey('Depot', on_delete=models.PROTECT, related_name='incoming_transfers')
    planned_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=TRANSFER_STATUS, default='DRAFT')

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        "authentication.MedicalStaff",
        on_delete=models.PROTECT,
        related_name='created_transfers'
    )

    class Meta:
        verbose_name = 'Transfert'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.transfer_number} {self.source_depot.code}→{self.destination_depot.code}"

    def save(self, *args, **kwargs):
        if not self.transfer_number:
            self.transfer_number = self.generate_transfer_number()
        super().save(*args, **kwargs)

    def generate_transfer_number(self):
        from django.utils import timezone
        today = timezone.now()
        prefix = f"TR{today.strftime('%Y%m')}"
        last = TransferNote.objects.filter(transfer_number__startswith=prefix).order_by('-transfer_number').first()
        if last:
            last_num = int(last.transfer_number[-5:])
            new_num = last_num + 1
        else:
            new_num = 1
        return f"{prefix}{new_num:05d}"


class TransferLine(models.Model):
    transfer = models.ForeignKey('TransferNote', on_delete=models.CASCADE, related_name='lines')
    sequence = models.PositiveIntegerField()
    article = models.ForeignKey('Article', on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=15, decimal_places=3)

    class Meta:
        verbose_name = 'Ligne transfert'
        ordering = ['transfer', 'sequence']
        unique_together = ['transfer', 'sequence']

    def __str__(self):
        return f"{self.transfer.transfer_number} - L{self.sequence} {self.article.code} x {self.quantity}"


# ==================== INVENTAIRES ====================

class StockInventory(models.Model):
    """Sessions d'inventaire"""
    INVENTORY_TYPES = [
        ('ANNUAL', 'Annuel'),
        ('PERIODIC', 'Périodique'),
        ('ROTATING', 'Tournant'),
        ('EXCEPTIONAL', 'Exceptionnel'),
    ]
    
    INVENTORY_STATUS = [
        ('PLANNED', 'Planifié'),
        ('IN_PROGRESS', 'En cours'),
        ('COMPLETED', 'Terminé'),
        ('VALIDATED', 'Validé'),
        ('POSTED', 'Comptabilisé'),
        ('CANCELLED', 'Annulé'),
    ]
    
    inventory_number = models.CharField(max_length=30, unique=True)
    inventory_type = models.CharField(max_length=15, choices=INVENTORY_TYPES)
    inventory_date = models.DateField()
    
    depot = models.ForeignKey('Depot', on_delete=models.PROTECT)
    
    # Période d'inventaire
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    
    # État
    status = models.CharField(max_length=15, choices=INVENTORY_STATUS, default='PLANNED')
    notes = models.TextField(blank=True)
    
    # Responsables
    manager = models.ForeignKey(
        "authentication.MedicalStaff",
        on_delete=models.PROTECT,
        related_name='stock_managed_inventories'
    )
    validated_by = models.ForeignKey(
        "authentication.MedicalStaff",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stock_validated_inventories'
    )
    validated_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        "authentication.MedicalStaff",
        on_delete=models.PROTECT,
        related_name='stock_created_inventories'
    )
    
    class Meta:
        verbose_name = "Inventaire"
        verbose_name_plural = "Inventaires"
        ordering = ['-inventory_date']
    
    def __str__(self):
        return f"{self.inventory_number} - {self.depot.code}"
    
    def save(self, *args, **kwargs):
        if not self.inventory_number:
            self.inventory_number = self.generate_inventory_number()
        super().save(*args, **kwargs)
    
    def generate_inventory_number(self):
        prefix = f"INV{timezone.now().strftime('%Y%m')}"
        last = StockInventory.objects.filter(
            inventory_number__startswith=prefix
        ).order_by('-inventory_number').first()
        
        if last:
            new_num = int(last.inventory_number[-5:]) + 1
        else:
            new_num = 1
        
        return f"{prefix}{new_num:05d}"
    
    def initialize_lines(self):
        """Initialise les lignes d'inventaire avec stock théorique"""
        stocks = Stock.objects.filter(depot=self.depot, physical_quantity__gt=0)
        
        for stock in stocks:
            for batch in stock.article.batches.filter(remaining_quantity__gt=0):
                StockInventoryLine.objects.create(
                    inventory=self,
                    article=stock.article,
                    batch=batch,
                    theoretical_quantity=batch.remaining_quantity,
                    physical_quantity=0  # À saisir
                )
    
    def validate_and_adjust(self, user):
        """Valide l'inventaire et génère les ajustements"""
        if self.status != 'COMPLETED':
            raise ValidationError("L'inventaire doit être terminé")
        
        for line in self.lines.all():
            if line.variance != 0:
                # Créer mouvement d'ajustement
                StockMovement.objects.create(
                    movement_type='ADJUSTMENT',
                    movement_reason='INVENTORY',
                    article=line.article,
                    batch=line.batch,
                    source_depot=self.depot if line.variance < 0 else None,
                    destination_depot=self.depot if line.variance > 0 else None,
                    quantity=abs(line.variance),
                    unit_price=line.article.weighted_average_price,
                    total_value=line.variance_value,
                    reference_document=self.inventory_number,
                    status='CONFIRMED',
                    created_by=user
                )
                
                # Ajuster le stock
                stock = Stock.objects.get(article=line.article, depot=self.depot)
                stock.physical_quantity = line.physical_quantity
                stock.theoretical_quantity = line.physical_quantity
                stock.last_inventory_date = timezone.now()
                stock.update_value()
        
        self.status = 'VALIDATED'
        self.validated_by = user
        self.validated_at = timezone.now()
        self.save()

    @property
    def variance_value(self):
        """Valeur totale des écarts (surplus - manques) sur cet inventaire"""
        return sum(line.variance_value for line in self.lines.all())


class StockInventoryLine(models.Model):
    """Lignes de comptage inventaire"""
    inventory = models.ForeignKey('StockInventory', on_delete=models.CASCADE, related_name='lines')
    article = models.ForeignKey('Article', on_delete=models.PROTECT)
    batch = models.ForeignKey('Batch', on_delete=models.PROTECT, null=True, blank=True)
    
    # Quantités
    theoretical_quantity = models.DecimalField(max_digits=15, decimal_places=3)
    physical_quantity = models.DecimalField(max_digits=15, decimal_places=3, default=0)
    
    # Notes
    notes = models.TextField(blank=True)
    counted_by = models.ForeignKey(
        "authentication.MedicalStaff",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    counted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Ligne d'inventaire"
        unique_together = ['inventory', 'article', 'batch']
    
    @property
    def variance(self):
        """Écart (physique - théorique)"""
        return self.physical_quantity - self.theoretical_quantity
    
    @property
    def variance_value(self):
        """Valeur de l'écart"""
        return self.variance * self.article.weighted_average_price