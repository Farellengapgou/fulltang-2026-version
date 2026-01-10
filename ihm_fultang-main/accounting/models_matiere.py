from django.conf import settings
from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from datetime import datetime, timedelta

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

# ==========================
# CLASSE ABSTRAITE : TIER
# ==========================
class Tier(models.Model):
    """
    Représente un tiers comptable (fournisseur, client, partenaire, etc.)
    """

    code = models.CharField(
        max_length=20,
        unique=True,
        help_text="Code unique du tiers (ex: FOURN-001)"
    )

    name = models.CharField(
        max_length=255,
        help_text="Nom ou raison sociale du tiers"
    )

    # Coordonnées
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)

    # Lien comptable (OHADA)
    account = models.ForeignKey(
        'ChartOfAccounts',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Compte comptable OHADA associé au tiers"
    )

    # Statut
    is_active = models.BooleanField(default=True)

    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        "authentication.MedicalStaff",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    class Meta:
        abstract = True

    def __str__(self):
        return f"{self.code} - {self.name}"

    def get_balance(self):
        """
        Retourne le solde comptable du tiers via son compte OHADA
        """
        if self.account:
            return self.account.get_balance()
        return 0


# ==========================
# CLASSE CONCRÈTE : SUPPLIER
# ==========================
class Supplier(Tier):
    """
    Fournisseur de biens ou services
    """

    SUPPLIER_TYPES = [
        ('PHARMA', 'Laboratoire pharmaceutique'),
        ('EQUIPMENT', 'Équipementier médical'),
        ('SERVICE', 'Prestataire de service'),
        ('GENERAL', 'Fournisseur général'),
    ]

    supplier_type = models.CharField(
        max_length=15,
        choices=SUPPLIER_TYPES,
        default='GENERAL'
    )

    # Informations légales
    tax_id = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="Numéro fiscal"
    )

    trade_register = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="RCCM"
    )

    # Conditions commerciales
    payment_terms = models.PositiveIntegerField(
        default=30,
        help_text="Délai de paiement en jours"
    )

    credit_limit = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )

    discount_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text="Taux de remise (%)"
    )

    # Capacités de livraison (matière)
    allowed_article_categories = models.ManyToManyField(
        'ArticleCategory',
        blank=True,
        help_text="Catégories d’articles que ce fournisseur peut livrer"
    )

    class Meta:
        verbose_name = "Fournisseur"
        verbose_name_plural = "Fournisseurs"
        ordering = ['name']

    def can_supply_category(self, category):
        """
        Vérifie si le fournisseur peut livrer une catégorie donnée
        """
        return self.allowed_article_categories.filter(id=category.id).exists()