"""
Comptabilité Matière - 100% Matière (sans comptabilité financière)
===================================================================

Ce module gère UNIQUEMENT la comptabilité matière:
- Catégories et articles
- Dépôts et stocks
- Lots/Batches pour la traçabilité
- Mouvements de stock (entrées/sorties)
- Bons d'entrée et de sortie
- Inventaires physiques
- Valorisation au PMP (Prix Moyen Pondéré)

AUCUNE référence à la comptabilité financière (ChartOfAccounts, JournalEntry)
La comptabilité financière viendra lier les mouvements aux écritures comptables
via des signaux ou services dédiés.
"""

from django.db import models, transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from decimal import Decimal
from datetime import date
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType



# ============================================================================
# FONCTIONS UTILITAIRES
# ============================================================================

def calculate_new_pmp(current_qty, current_pmp, incoming_qty, incoming_price):
    """
    Calcule le nouveau PMP (Prix Moyen Pondéré) selon la méthode OHADA.
    PMP = (Valeur stock ancien + Valeur entrée) / (Qté ancienne + Qté entrée)
    """
    current_value = current_qty * current_pmp
    incoming_value = incoming_qty * incoming_price
    total_quantity = current_qty + incoming_qty
    
    if total_quantity > 0:
        return (current_value + incoming_value) / total_quantity
    return incoming_price if incoming_qty > 0 else current_pmp


# ============================================================================
# CATÉGORISATION DES ARTICLES
# ============================================================================

class ArticleCategory(models.Model):
    """
    Catégories d'articles pour la gestion matière.
    Les comptes comptables sont gérés par la comptabilité financière.
    """
    code = models.CharField(
        max_length=20,
        unique=True,
        help_text="Code de la catégorie (ex: MED, CONS, EQUIP)"
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # Codes comptables de référence (informatifs, pas de FK)
    default_stock_account_code = models.CharField(
        max_length=10,
        blank=True,
        help_text="Code compte stock classe 3 (ex: 311)"
    )
    default_variation_account_code = models.CharField(
        max_length=10,
        blank=True,
        help_text="Code compte variation classe 6 (ex: 6031)"
    )
    
    # Hiérarchie
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='subcategories'
    )
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Catégorie d'article"
        verbose_name_plural = "Catégories d'articles"
        ordering = ['code']
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    def get_full_path(self):
        """Retourne le chemin complet de la catégorie"""
        if self.parent:
            return f"{self.parent.get_full_path()} > {self.name}"
        return self.name


# ============================================================================
# DÉPÔTS / MAGASINS
# ============================================================================

class Warehouse(models.Model):
    """
    Dépôts/Magasins de stockage.
    """
    WAREHOUSE_TYPES = [
        ('CENTRAL', 'Magasin central'),
        ('PHARMACY', 'Pharmacie'),
        ('LABORATORY', 'Laboratoire'),
        ('OPERATING', 'Bloc opératoire'),
        ('EMERGENCY', 'Urgences'),
        ('WARD', 'Service/Unité'),
        ('TRANSIT', 'Dépôt de transit'),
    ]
    
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    warehouse_type = models.CharField(max_length=20, choices=WAREHOUSE_TYPES)
    
    # Localisation
    location = models.CharField(max_length=255, blank=True)
    department = models.ForeignKey(
        'polyclinic.Department',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Gestion
    manager = models.ForeignKey(
        'authentication.MedicalStaff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_warehouses'
    )
    
    # Code comptable de référence (informatif)
    stock_account_code = models.CharField(
        max_length=10,
        blank=True,
        help_text="Code compte stock spécifique (optionnel)"
    )
    
    # Configuration
    is_active = models.BooleanField(default=True)
    allow_negative_stock = models.BooleanField(
        default=False,
        help_text="Autoriser les stocks négatifs (déconseillé)"
    )
    is_main_warehouse = models.BooleanField(
        default=False,
        help_text="Dépôt principal pour les achats"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Dépôt"
        verbose_name_plural = "Dépôts"
        ordering = ['code']
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    def get_total_value(self):
        """Valorisation totale du dépôt au PMP"""
        from django.db.models import Sum, F
        result = self.stock_levels.aggregate(
            total=Sum(F('quantity') * F('unit_value'))
        )
        return result['total'] or Decimal('0')


# ============================================================================
# ÉTAT DE STOCK PAR DÉPÔT
# ============================================================================

class StockLevel(models.Model):
    """
    État du stock d'un article dans un dépôt donné.
    Permet le suivi multi-dépôts avec valorisation.
    """
    # Référence polymorphe à l'article
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        limit_choices_to={'model__in': ['polyclinicproduct', 'equipment', 'consumable']}
    )
    object_id = models.PositiveIntegerField()
    article = GenericForeignKey('content_type', 'object_id')
    
    warehouse = models.ForeignKey(
        'Warehouse',
        on_delete=models.CASCADE,
        related_name='stock_levels'
    )
    
    # Quantités
    quantity = models.DecimalField(
        max_digits=15,
        decimal_places=3,
        default=0,
        help_text="Quantité physique en stock"
    )
    reserved_quantity = models.DecimalField(
        max_digits=15,
        decimal_places=3,
        default=0,
        help_text="Quantité réservée (commandes en cours)"
    )
    
    # Valorisation
    unit_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        help_text="Valeur unitaire (PMP)"
    )
    total_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        help_text="Valeur totale du stock"
    )
    
    # Dernier inventaire
    last_inventory_date = models.DateField(null=True, blank=True)
    last_inventory_quantity = models.DecimalField(
        max_digits=15,
        decimal_places=3,
        null=True,
        blank=True
    )
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Niveau de stock"
        verbose_name_plural = "Niveaux de stock"
        unique_together = ['content_type', 'object_id', 'warehouse']
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['warehouse']),
        ]
    
    def __str__(self):
        return f"{self.content_type}:{self.object_id} @ {self.warehouse.code}: {self.quantity}"

    @property
    def available_quantity(self):
        """Quantité disponible (non réservée)"""
        return self.quantity - self.reserved_quantity
    
    def update_valuation(self, pmp):
        """Met à jour la valorisation avec le nouveau PMP"""
        self.unit_value = pmp
        self.total_value = self.quantity * pmp
        self.save(update_fields=['unit_value', 'total_value', 'updated_at'])
    
    def update_quantity_only(self):
        self.total_value = self.quantity * self.unit_value
        self.save(update_fields=['quantity', 'total_value', 'updated_at'])


    def can_issue(self, qty):
        """Vérifie si on peut sortir une quantité"""
        if self.warehouse.allow_negative_stock:
            return True
        return self.available_quantity >= qty


# ============================================================================
# LOTS / BATCHES
# ============================================================================

class StockBatch(models.Model):
    """
    Lot de stock pour la traçabilité.
    Chaque lot a une date de péremption et un fournisseur d'origine.
    Utilisé pour le FIFO/FEFO.
    """
    # Référence polymorphe à l'article
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        limit_choices_to={'model__in': ['polyclinicproduct', 'equipment', 'consumable']}
    )
    object_id = models.PositiveIntegerField()
    article = GenericForeignKey('content_type', 'object_id')
    
    warehouse = models.ForeignKey(
        'Warehouse',
        on_delete=models.CASCADE,
        related_name='batches'
    )
    
    # Identification du lot
    batch_number = models.CharField(
        max_length=100,
        help_text="Numéro de lot fournisseur"
    )
    internal_reference = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        help_text="Référence interne générée"
    )
    
    # Origine (référence au fournisseur matière)
    supplier = models.ForeignKey(
        'MaterialSupplier',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Dates
    manufacturing_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    reception_date = models.DateField()
    
    # Quantités
    initial_quantity = models.DecimalField(
        max_digits=15,
        decimal_places=3,
        validators=[MinValueValidator(Decimal('0.001'))]
    )
    remaining_quantity = models.DecimalField(
        max_digits=15,
        decimal_places=3,
        default=0
    )
    
    # Valorisation
    unit_cost = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Coût unitaire d'achat"
    )
    
    # État
    is_blocked = models.BooleanField(default=False)
    blocking_reason = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        'authentication.MedicalStaff',
        on_delete=models.SET_NULL,
        null=True
    )
    
    class Meta:
        verbose_name = "Lot de stock"
        verbose_name_plural = "Lots de stock"
        unique_together = ['content_type', 'object_id', 'warehouse', 'batch_number']
        ordering = ['expiry_date', 'reception_date']
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['expiry_date']),
            models.Index(fields=['is_active', 'is_blocked']),
        ]
    
    def __str__(self):
        return f"Lot {self.batch_number} - {self.content_type}:{self.object_id}"

    def save(self, *args, **kwargs):
        if not self.internal_reference:
            self.internal_reference = self._generate_internal_reference()
        if self.remaining_quantity is None:
            self.remaining_quantity = self.initial_quantity
        super().save(*args, **kwargs)
    
    def _generate_internal_reference(self):
        """Génère une référence interne unique"""
        prefix = f"LOT{timezone.now().strftime('%Y%m')}"
        last = StockBatch.objects.filter(
            internal_reference__startswith=prefix
        ).order_by('-internal_reference').first()
        
        if last and last.internal_reference:
            try:
                num = int(last.internal_reference[-5:]) + 1
            except ValueError:
                num = 1
        else:
            num = 1
        
        return f"{prefix}{num:05d}"
    
    @property
    def is_expired(self):
        """Vérifie si le lot est périmé"""
        if not self.expiry_date:
            return False
        return date.today() > self.expiry_date
    
    @property
    def days_until_expiry(self):
        """Jours avant péremption"""
        if not self.expiry_date:
            return None
        delta = self.expiry_date - date.today()
        return delta.days
    
    def is_near_expiry(self, warning_days=90):
        """Vérifie si proche de la péremption"""
        days = self.days_until_expiry
        return days is not None and 0 < days <= warning_days


# ============================================================================
# FOURNISSEURS (COMPTABILITÉ MATIÈRE UNIQUEMENT)
# ============================================================================

class Supplier(models.Model):
    """
    Fournisseurs de biens - Données matière uniquement.
    Le lien avec le compte comptable (401x) est géré par la compta financière.
    """
    SUPPLIER_TYPES = [
        ('PHARMA', 'Laboratoire pharmaceutique'),
        ('EQUIPMENT', 'Équipementier médical'),
        ('CONSUMABLE', 'Fournisseur consommables'),
        ('SERVICE', 'Prestataire de service'),
        ('GENERAL', 'Fournisseur général'),
    ]
    
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    supplier_type = models.CharField(
        max_length=15,
        choices=SUPPLIER_TYPES,
        default='GENERAL'
    )
    
    # Coordonnées
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default='Cameroun')
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    
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
        help_text="Taux de remise standard (%)"
    )
    
    # Catégories autorisées
    allowed_categories = models.ManyToManyField(
        'ArticleCategory',
        blank=True,
        help_text="Catégories d'articles fournis"
    )
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'authentication.MedicalStaff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    class Meta:
        verbose_name = "Fournisseur"
        verbose_name_plural = "Fournisseurs"
        ordering = ['name']
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    def can_supply_category(self, category):
        """Vérifie si le fournisseur peut fournir une catégorie"""
        if not self.allowed_categories.exists():
            return True
        return self.allowed_categories.filter(id=category.id).exists()
    
    def get_total_purchases(self, year=None):
        """Total des achats matière (valorisation)"""
        from django.db.models import Sum
        qs = StockMovement.objects.filter(
            supplier=self,
            movement_type='IN',
            state='VALIDATED'
        )
        if year:
            qs = qs.filter(movement_date__year=year)
        result = qs.aggregate(total=Sum('total_value'))
        return result['total'] or Decimal('0')


# ============================================================================
# MOUVEMENTS DE STOCK
# ============================================================================

class StockMovement(models.Model):
    """
    Mouvement de stock (entrée, sortie, transfert).
    Base pour la traçabilité. La comptabilisation financière est externe.
    """
    MOVEMENT_TYPES = [
        ('IN', 'Entrée'),
        ('OUT', 'Sortie'),
        ('TRANSFER', 'Transfert'),
        ('ADJUST', 'Ajustement inventaire'),
    ]
    
    MOVEMENT_REASONS = [
        # Entrées
        ('PURCHASE', 'Achat'),
        ('RETURN_PATIENT', 'Retour patient'),
        ('RETURN_SERVICE', 'Retour service'),
        ('DONATION', 'Don reçu'),
        ('INITIAL', 'Stock initial'),
        # Sorties
        ('CONSUMPTION', 'Consommation'),
        ('DISPENSATION', 'Délivrance'),
        ('LOSS', 'Perte/Casse'),
        ('EXPIRY', 'Péremption'),
        ('DONATION_OUT', 'Don effectué'),
        # Transferts
        ('TRANSFER', 'Transfert inter-dépôts'),
        # Ajustements
        ('INVENTORY_PLUS', 'Ajustement inventaire (+)'),
        ('INVENTORY_MINUS', 'Ajustement inventaire (-)'),
    ]
    
    MOVEMENT_STATES = [
        ('DRAFT', 'Brouillon'),
        ('VALIDATED', 'Validé'),
        ('CANCELLED', 'Annulé'),
    ]
    
    # Numérotation
    movement_number = models.CharField(max_length=30, unique=True)
    
    # Type et motif
    movement_type = models.CharField(max_length=10, choices=MOVEMENT_TYPES)
    movement_reason = models.CharField(max_length=20, choices=MOVEMENT_REASONS)
    
    # Article (référence polymorphe)
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        limit_choices_to={'model__in': ['polyclinicproduct', 'equipment', 'consumable']}
    )
    object_id = models.PositiveIntegerField()
    article = GenericForeignKey('content_type', 'object_id')
    
    # Lot (optionnel selon configuration article)
    batch = models.ForeignKey(
        'StockBatch',
        on_delete=models.PROTECT,
        null=True,
        blank=True
    )
    
    # Dépôts
    source_warehouse = models.ForeignKey(
        'Warehouse',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='outgoing_movements',
        help_text="Dépôt source (pour sorties/transferts)"
    )
    destination_warehouse = models.ForeignKey(
        'Warehouse',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='incoming_movements',
        help_text="Dépôt destination (pour entrées/transferts)"
    )
    
    # Quantité et valorisation
    quantity = models.DecimalField(
        max_digits=15,
        decimal_places=3,
        validators=[MinValueValidator(Decimal('0.001'))]
    )
    unit_price = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Prix unitaire (coût pour entrées, PMP pour sorties)"
    )
    total_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        editable=False,
        help_text="Valeur totale du mouvement"
    )
    
    # Dates
    movement_date = models.DateField(help_text="Date du mouvement (métier)")
    
    # Références externes
    document_type = models.CharField(max_length=50, blank=True)
    document_reference = models.CharField(max_length=100, blank=True)
    
    # Fournisseur (pour achats)
    supplier = models.ForeignKey(
        'MaterialSupplier',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Bénéficiaire (pour sorties)
    beneficiary_type = models.CharField(
        max_length=50,
        blank=True,
        help_text="Type: SERVICE, PATIENT, EXTERNE"
    )
    beneficiary_reference = models.CharField(
        max_length=100,
        blank=True,
        help_text="ID ou nom du bénéficiaire"
    )
    
    # Référence comptabilité financière (neutre - pas de FK)
    financial_entry_reference = models.CharField(
        max_length=100,
        blank=True,
        help_text="Référence de l'écriture comptable générée (rempli par la compta financière)"
    )
    is_posted_to_finance = models.BooleanField(
        default=False,
        help_text="Indique si comptabilisé dans la compta financière"
    )
    
    # État et workflow
    state = models.CharField(
        max_length=15,
        choices=MOVEMENT_STATES,
        default='DRAFT'
    )
    notes = models.TextField(blank=True)
    
    # Traçabilité
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'authentication.MedicalStaff',
        on_delete=models.PROTECT,
        related_name='created_stock_movements'
    )
    validated_by = models.ForeignKey(
        'authentication.MedicalStaff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='validated_stock_movements'
    )
    validated_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Mouvement de stock"
        verbose_name_plural = "Mouvements de stock"
        ordering = ['-movement_date', '-created_at']
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['movement_type', 'state']),
            models.Index(fields=['movement_date']),
            models.Index(fields=['source_warehouse']),
            models.Index(fields=['destination_warehouse']),
            models.Index(fields=['batch']),
            models.Index(fields=['is_posted_to_finance']),
        ]
    
    def __str__(self):
        return f"{self.movement_number} - {self.get_movement_type_display()}"
    
    def save(self, *args, **kwargs):
        if not self.movement_number:
            self.movement_number = self._generate_movement_number()
        self.total_value = self.quantity * self.unit_price
        super().save(*args, **kwargs)
    
    def _generate_movement_number(self):
        """Génère un numéro de mouvement unique"""
        prefix_map = {
            'IN': 'ENT',
            'OUT': 'SOR',
            'TRANSFER': 'TRF',
            'ADJUST': 'AJU',
        }
        prefix = prefix_map.get(self.movement_type, 'MVT')
        date_part = timezone.now().strftime('%Y%m')
        
        last = StockMovement.objects.filter(
            movement_number__startswith=f"{prefix}{date_part}"
        ).order_by('-movement_number').first()
        
        if last and last.movement_number:
            try:
                num = int(last.movement_number[-5:]) + 1
            except ValueError:
                num = 1
        else:
            num = 1
        
        return f"{prefix}{date_part}{num:05d}"
    
    def clean(self):
        """Validation métier"""
        if self.batch:
            if self.batch.content_type != self.content_type or self.batch.object_id != self.object_id:
                raise ValidationError("Le lot ne correspond pas à l'article")

        if self.movement_type == 'IN' and not self.destination_warehouse:
            raise ValidationError("Une entrée doit avoir un dépôt de destination")
        
        if self.movement_type == 'OUT' and not self.source_warehouse:
            raise ValidationError("Une sortie doit avoir un dépôt source")
        
        if self.movement_type == 'TRANSFER':
            if not self.source_warehouse or not self.destination_warehouse:
                raise ValidationError("Un transfert doit avoir source ET destination")
            if self.source_warehouse == self.destination_warehouse:
                raise ValidationError("Source et destination doivent être différents")


# ============================================================================
# BONS D'ENTRÉE
# ============================================================================

class GoodsReceipt(models.Model):
    """
    Bon d'entrée marchandises.
    Document regroupant plusieurs lignes d'entrée.
    """
    RECEIPT_TYPES = [
        ('PURCHASE', 'Achat'),
        ('RETURN', 'Retour'),
        ('DONATION', 'Don'),
        ('TRANSFER_IN', 'Transfert entrant'),
        ('INITIAL', 'Stock initial'),
    ]
    
    RECEIPT_STATES = [
        ('DRAFT', 'Brouillon'),
        ('VALIDATED', 'Validé'),
        ('CANCELLED', 'Annulé'),
    ]
    
    # Numérotation
    receipt_number = models.CharField(max_length=30, unique=True)
    
    # Type et dates
    receipt_type = models.CharField(max_length=15, choices=RECEIPT_TYPES)
    receipt_date = models.DateField()
    
    # Destination
    warehouse = models.ForeignKey(
        'Warehouse',
        on_delete=models.PROTECT
    )
    
    # Fournisseur
    supplier = models.ForeignKey(
        'MaterialSupplier',
        on_delete=models.PROTECT,
        null=True,
        blank=True
    )
    
    # Références documentaires
    supplier_invoice = models.CharField(
        max_length=100,
        blank=True,
        help_text="N° facture fournisseur"
    )
    delivery_note = models.CharField(
        max_length=100,
        blank=True,
        help_text="N° bon de livraison"
    )
    
    # Montants
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Référence comptabilité financière (neutre)
    financial_entry_reference = models.CharField(
        max_length=100,
        blank=True,
        help_text="Référence écriture comptable"
    )
    is_posted_to_finance = models.BooleanField(default=False)
    
    # État
    state = models.CharField(max_length=15, choices=RECEIPT_STATES, default='DRAFT')
    notes = models.TextField(blank=True)
    
    # Traçabilité
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        'authentication.MedicalStaff',
        on_delete=models.PROTECT,
        related_name='created_receipts'
    )
    validated_by = models.ForeignKey(
        'authentication.MedicalStaff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='validated_receipts'
    )
    validated_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Bon d'entrée"
        verbose_name_plural = "Bons d'entrée"
        ordering = ['-receipt_date', '-created_at']
    
    def __str__(self):
        return f"{self.receipt_number} - {self.warehouse.code}"
    
    def save(self, *args, **kwargs):
        if not self.receipt_number:
            self.receipt_number = self._generate_receipt_number()
        super().save(*args, **kwargs)
    
    def _generate_receipt_number(self):
        """Génère un numéro de bon d'entrée"""
        prefix = f"BE{timezone.now().strftime('%Y%m')}"
        last = GoodsReceipt.objects.filter(
            receipt_number__startswith=prefix
        ).order_by('-receipt_number').first()
        
        if last and last.receipt_number:
            try:
                num = int(last.receipt_number[-5:]) + 1
            except ValueError:
                num = 1
        else:
            num = 1
        
        return f"{prefix}{num:05d}"
    
    def update_totals(self):
        """Met à jour les totaux depuis les lignes"""
        from django.db.models import Sum
        totals = self.lines.aggregate(
            subtotal=Sum('total_value'),
            tax=Sum('tax_amount')
        )
        self.subtotal = totals['subtotal'] or Decimal('0')
        self.tax_amount = totals['tax'] or Decimal('0')
        self.total_amount = self.subtotal + self.tax_amount
        self.save(update_fields=['subtotal', 'tax_amount', 'total_amount'])

    @transaction.atomic
    def validate(self, user):
        """
        Valide le bon d'entrée :
        1. Crée les lots (StockBatch)
        2. Crée les mouvements (StockMovement)
        3. Met à jour les stocks (StockLevel)
        4. Recalcule les PMP
        """
        if self.state != 'DRAFT':
            raise ValidationError("Seul un brouillon peut être validé")
        
        for line in self.lines.all():
            # 1. Créer le lot
            batch = StockBatch.objects.create(
                content_type=line.content_type,
                object_id=line.object_id,
                warehouse=self.warehouse,
                batch_number=line.batch_number or f"AUTO-{timezone.now().strftime('%Y%m%d%H%M%S')}",
                expiry_date=line.expiry_date,
                reception_date=self.receipt_date,
                initial_quantity=line.quantity,
                remaining_quantity=line.quantity,
                unit_cost=line.unit_price,
                supplier=self.supplier,
                created_by=user
            )
            line.batch = batch
            line.save(update_fields=['batch'])
            
            # 2. Créer le mouvement
            movement = StockMovement.objects.create(
                content_type=line.content_type,
                object_id=line.object_id,
                movement_type='IN',
                movement_reason='PURCHASE',
                destination_warehouse=self.warehouse,
                batch=batch,
                quantity=line.quantity,
                unit_price=line.unit_price,
                movement_date=self.receipt_date,
                supplier=self.supplier,
                document_type='GOODS_RECEIPT',
                document_reference=self.receipt_number,
                state='VALIDATED',
                created_by=user,
                validated_by=user,
                validated_at=timezone.now()
            )
            line.stock_movement = movement
            line.save(update_fields=['stock_movement'])
            
            # 3. Mettre à jour le stock
            stock_level, created = StockLevel.objects.get_or_create(
                content_type=line.content_type,
                object_id=line.object_id,
                warehouse=self.warehouse,
                defaults={'quantity': 0, 'unit_value': 0, 'total_value': 0}
            )
            stock_level.quantity += line.quantity
            
            # 4. Recalculer le PMP
            new_pmp = calculate_new_pmp(
                current_qty=stock_level.quantity - line.quantity,
                current_pmp=stock_level.unit_value,
                incoming_qty=line.quantity,
                incoming_price=line.unit_price
            )
            
            # Mettre à jour la valorisation du stock
            stock_level.update_valuation(new_pmp)
        
        # Mettre à jour l'état
        self.state = 'VALIDATED'
        self.validated_by = user
        self.validated_at = timezone.now()
        self.save()


class GoodsReceiptLine(models.Model):
    """Ligne de bon d'entrée"""
    receipt = models.ForeignKey(
        'GoodsReceipt',
        on_delete=models.CASCADE,
        related_name='lines'
    )
    
    # Article
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        limit_choices_to={'model__in': ['polyclinicproduct', 'equipment', 'consumable']}
    )
    object_id = models.PositiveIntegerField()
    article = GenericForeignKey('content_type', 'object_id')

    # Lot
    batch_number = models.CharField(max_length=100, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    
    # Quantité et prix
    quantity = models.DecimalField(
        max_digits=15,
        decimal_places=3,
        validators=[MinValueValidator(Decimal('0.001'))]
    )
    unit_price = models.DecimalField(max_digits=15, decimal_places=2)
    total_value = models.DecimalField(max_digits=15, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Mouvement généré
    stock_movement = models.OneToOneField(
        'StockMovement',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Lot créé
    batch = models.ForeignKey(
        'StockBatch',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    class Meta:
        verbose_name = "Ligne de bon d'entrée"
        verbose_name_plural = "Lignes de bon d'entrée"
    
    def save(self, *args, **kwargs):
        self.total_value = self.quantity * self.unit_price
        super().save(*args, **kwargs)


# ============================================================================
# BONS DE SORTIE
# ============================================================================

class GoodsIssue(models.Model):
    """
    Bon de sortie marchandises.
    """
    ISSUE_TYPES = [
        ('CONSUMPTION', 'Consommation'),
        ('DISPENSATION', 'Délivrance patient'),
        ('SERVICE', 'Dotation service'),
        ('LOSS', 'Perte/Casse'),
        ('EXPIRY', 'Péremption'),
        ('TRANSFER_OUT', 'Transfert sortant'),
    ]
    
    ISSUE_STATES = [
        ('DRAFT', 'Brouillon'),
        ('VALIDATED', 'Validé'),
        ('CANCELLED', 'Annulé'),
    ]
    
    # Numérotation
    issue_number = models.CharField(max_length=30, unique=True)
    
    # Type et dates
    issue_type = models.CharField(max_length=15, choices=ISSUE_TYPES)
    issue_date = models.DateField()
    
    # Source
    warehouse = models.ForeignKey(
        'Warehouse',
        on_delete=models.PROTECT
    )
    
    # Bénéficiaire
    beneficiary_type = models.CharField(
        max_length=50,
        blank=True,
        help_text="SERVICE, PATIENT, EXTERNE"
    )
    beneficiary_reference = models.CharField(max_length=100, blank=True)
    
    # Montants
    total_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Référence comptabilité financière (neutre)
    financial_entry_reference = models.CharField(
        max_length=100,
        blank=True,
        help_text="Référence écriture comptable"
    )
    is_posted_to_finance = models.BooleanField(default=False)
    
    # État
    state = models.CharField(max_length=15, choices=ISSUE_STATES, default='DRAFT')
    reason = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    
    # Traçabilité
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        'authentication.MedicalStaff',
        on_delete=models.PROTECT,
        related_name='created_issues'
    )
    validated_by = models.ForeignKey(
        'authentication.MedicalStaff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='validated_issues'
    )
    validated_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Bon de sortie"
        verbose_name_plural = "Bons de sortie"
        ordering = ['-issue_date', '-created_at']
    
    def __str__(self):
        return f"{self.issue_number} - {self.warehouse.code}"
    
    def save(self, *args, **kwargs):
        if not self.issue_number:
            self.issue_number = self._generate_issue_number()
        super().save(*args, **kwargs)
    
    def _generate_issue_number(self):
        """Génère un numéro de bon de sortie"""
        prefix = f"BS{timezone.now().strftime('%Y%m')}"
        last = GoodsIssue.objects.filter(
            issue_number__startswith=prefix
        ).order_by('-issue_number').first()
        
        if last and last.issue_number:
            try:
                num = int(last.issue_number[-5:]) + 1
            except ValueError:
                num = 1
        else:
            num = 1
        
        return f"{prefix}{num:05d}"
    
    def update_total(self):
        """Met à jour le total depuis les lignes"""
        from django.db.models import Sum
        total = self.lines.aggregate(total=Sum('total_value'))
        self.total_value = total['total'] or Decimal('0')
        self.save(update_fields=['total_value'])

    
    
    @transaction.atomic
    def validate(self, user):
        """
        Valide le bon de sortie avec FEFO (First Expired First Out)
        """
        if self.state != 'DRAFT':
            raise ValidationError("Seul un brouillon peut être validé")
        
        for line in self.lines.all():
            batches = self.select_batches_fefo(
                line.content_type,
                line.object_id,
                line.quantity
            )

            stock_level = StockLevel.objects.select_for_update().get(
                content_type=line.content_type,
                object_id=line.object_id,
                warehouse=self.warehouse
            )

            if not self.warehouse.allow_negative_stock:
                if stock_level.quantity < line.quantity:
                    raise ValidationError(
                        f"Stock insuffisant pour {line.article}"
                    )

            # Sélectionner le lot selon FEFO
            if not batches:
                raise ValidationError("Stock insuffisant")
            
            article = line.article
            for batch, qty in batches:
                StockMovement.objects.create(
                    content_type=line.content_type,
                    object_id=line.object_id,
                    movement_type='OUT',
                    movement_reason=self.issue_type,
                    source_warehouse=self.warehouse,
                    batch=batch,
                    quantity=qty,
                    unit_price=stock_level.unit_value,
                    movement_date=self.issue_date,
                    document_type='GOODS_ISSUE',
                    document_reference=self.issue_number,
                    state='VALIDATED',
                    created_by=user,
                    validated_by=user,
                    validated_at=timezone.now()
                )

                batch.remaining_quantity -= qty
                if batch.remaining_quantity <= 0:
                    batch.is_active = False
                batch.save()
            
            # Mettre à jour le stock
            stock_level = StockLevel.objects.get(
                content_type=line.content_type,
                object_id=line.object_id,
                warehouse=self.warehouse
            )
            stock_level.quantity -= line.quantity
            stock_level.update_quantity_only()
        
        self.state = 'VALIDATED'
        self.validated_by = user
        self.validated_at = timezone.now()
        self.save()
    
    def select_batches_fefo(self, content_type, object_id, quantity_needed):
        """
        Sélectionne plusieurs lots selon FEFO jusqu'à couvrir la quantité demandée
        """
        batches = StockBatch.objects.filter(
            content_type=content_type,
            object_id=object_id,
            warehouse=self.warehouse,
            is_active=True,
            is_blocked=False,
            remaining_quantity__gt=0,
            ).filter(
                models.Q(expiry_date__isnull=True) |
                models.Q(expiry_date__gte=date.today())        
            ).order_by(
            models.Case(
                models.When(expiry_date__isnull=True, then=1),
                default=0
            ),
            'expiry_date',
            'reception_date'
        )

        selected = []
        remaining = quantity_needed

        for batch in batches:
            if remaining <= 0:
                break

            qty = min(batch.remaining_quantity, remaining)
            selected.append((batch, qty))
            remaining -= qty

        if remaining > 0:
            return None  # stock insuffisant

        return selected



class GoodsIssueLine(models.Model):
    """Ligne de bon de sortie"""
    issue = models.ForeignKey(
        'GoodsIssue',
        on_delete=models.CASCADE,
        related_name='lines'
    )
    
    # Article
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        limit_choices_to={'model__in': ['polyclinicproduct', 'equipment', 'consumable']}
    )
    object_id = models.PositiveIntegerField()
    article = GenericForeignKey('content_type', 'object_id')
    
    # Lot (pour FIFO/FEFO)
    batch = models.ForeignKey(
        'StockBatch',
        on_delete=models.PROTECT,
        null=True,
        blank=True
    )
    
    # Quantité et valorisation (au PMP)
    quantity = models.DecimalField(
        max_digits=15,
        decimal_places=3,
        validators=[MinValueValidator(Decimal('0.001'))]
    )
    unit_price = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="PMP au moment de la sortie"
    )
    total_value = models.DecimalField(max_digits=15, decimal_places=2)
    class Meta:
        verbose_name = "Ligne de bon de sortie"
        verbose_name_plural = "Lignes de bon de sortie"
    
    def save(self, *args, **kwargs):
        self.total_value = self.quantity * self.unit_price
        super().save(*args, **kwargs)


# ============================================================================
# INVENTAIRE PHYSIQUE
# ============================================================================

class PhysicalInventory(models.Model):
    """
    Session d'inventaire physique.
    Permet de comparer le stock théorique au stock réel.
    """
    INVENTORY_STATES = [
        ('DRAFT', 'En cours'),
        ('COUNTING', 'Comptage'),
        ('VALIDATED', 'Validé'),
        ('CANCELLED', 'Annulé'),
    ]
    
    # Identification
    inventory_number = models.CharField(max_length=30, unique=True)
    name = models.CharField(max_length=255)
    
    # Périmètre
    warehouse = models.ForeignKey(
        'Warehouse',
        on_delete=models.PROTECT
    )
    category = models.ForeignKey(
        'ArticleCategory',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Catégorie spécifique (ou toutes si vide)"
    )
    
    # Dates
    inventory_date = models.DateField()
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    
    # Résultats
    total_theoretical_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )
    total_counted_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )
    total_difference_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )
    
    # Référence comptabilité financière (neutre)
    financial_entry_reference = models.CharField(
        max_length=100,
        blank=True,
        help_text="Référence écriture de régularisation"
    )
    is_posted_to_finance = models.BooleanField(default=False)
    
    # État
    state = models.CharField(max_length=15, choices=INVENTORY_STATES, default='DRAFT')
    notes = models.TextField(blank=True)
    
    # Traçabilité
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        'authentication.MedicalStaff',
        on_delete=models.PROTECT,
        related_name='created_inventories'
    )
    validated_by = models.ForeignKey(
        'authentication.MedicalStaff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='validated_inventories'
    )
    validated_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Inventaire physique"
        verbose_name_plural = "Inventaires physiques"
        ordering = ['-inventory_date']
    
    def __str__(self):
        return f"{self.inventory_number} - {self.warehouse.code}"
    
    def save(self, *args, **kwargs):
        if not self.inventory_number:
            self.inventory_number = self._generate_inventory_number()
        super().save(*args, **kwargs)
    
    def _generate_inventory_number(self):
        """Génère un numéro d'inventaire"""
        prefix = f"INV{timezone.now().strftime('%Y%m')}"
        last = PhysicalInventory.objects.filter(
            inventory_number__startswith=prefix
        ).order_by('-inventory_number').first()
        
        if last and last.inventory_number:
            try:
                num = int(last.inventory_number[-5:]) + 1
            except ValueError:
                num = 1
        else:
            num = 1
        
        return f"{prefix}{num:05d}"
    
    def calculate_totals(self):
        """Calcule les totaux depuis les lignes"""
        from django.db.models import Sum
        
        totals = self.lines.aggregate(
            theoretical=Sum('theoretical_value'),
            counted=Sum('counted_value'),
            difference=Sum('difference_value')
        )
        
        self.total_theoretical_value = totals['theoretical'] or Decimal('0')
        self.total_counted_value = totals['counted'] or Decimal('0')
        self.total_difference_value = totals['difference'] or Decimal('0')
        self.save(update_fields=[
            'total_theoretical_value',
            'total_counted_value',
            'total_difference_value'
        ])

    @transaction.atomic
    def validate_and_adjust(self, user):
        """
        Valide l'inventaire et génère les ajustements
        """
        if self.state != 'COUNTING':
            raise ValidationError("L'inventaire doit être en cours de comptage")
        
        for line in self.lines.all():
            if line.counted_quantity is None:
                raise ValidationError(f"Comptage manquant pour {line.article.name}")
            
            if line.difference_quantity != 0:
                # Créer mouvement d'ajustement
                movement_reason = 'INVENTORY_PLUS' if line.difference_quantity > 0 else 'INVENTORY_MINUS'
                
                if line.difference_quantity > 0:
                    batch = StockBatch.objects.create(
                        content_type=line.content_type,
                        object_id=line.object_id,
                        warehouse=self.warehouse,
                        batch_number=f"INV-{self.inventory_number}",
                        reception_date=self.inventory_date,
                        initial_quantity=line.difference_quantity,
                        remaining_quantity=line.difference_quantity,
                        unit_cost=line.unit_price,
                        created_by=user
                    )
                else:
                    batch = line.batch

                movement = StockMovement.objects.create(
                    content_type=line.content_type,
                    object_id=line.object_id,
                    movement_type='ADJUST',
                    movement_reason=movement_reason,
                    source_warehouse=self.warehouse if line.difference_quantity < 0 else None,
                    destination_warehouse=self.warehouse if line.difference_quantity > 0 else None,
                    batch=batch,
                    quantity=abs(line.difference_quantity),
                    unit_price=line.unit_price,
                    movement_date=self.inventory_date,
                    document_type='INVENTORY',
                    document_reference=self.inventory_number,
                    state='VALIDATED',
                    created_by=user,
                    validated_by=user,
                    validated_at=timezone.now()
                )
                line.adjustment_movement = movement
                line.save(update_fields=['adjustment_movement'])
                
                # Mettre à jour le stock
                stock_level = StockLevel.objects.get(
                    content_type=line.content_type,
                    object_id=line.object_id,
                    warehouse=self.warehouse
                )
                stock_level.quantity = line.counted_quantity
                stock_level.last_inventory_date = self.inventory_date
                stock_level.last_inventory_quantity = line.counted_quantity
                stock_level.update_valuation(line.unit_price)
        
        self.state = 'VALIDATED'
        self.validated_by = user
        self.validated_at = timezone.now()
        self.save()


class PhysicalInventoryLine(models.Model):
    """Ligne d'inventaire par article"""
    inventory = models.ForeignKey(
        'PhysicalInventory',
        on_delete=models.CASCADE,
        related_name='lines'
    )
    
    # Article
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        limit_choices_to={'model__in': ['polyclinicproduct', 'equipment', 'consumable']}
    )
    object_id = models.PositiveIntegerField()
    article = GenericForeignKey('content_type', 'object_id')
    
    # Lot (optionnel)
    batch = models.ForeignKey(
        'StockBatch',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Quantités
    theoretical_quantity = models.DecimalField(max_digits=15, decimal_places=3)
    counted_quantity = models.DecimalField(
        max_digits=15,
        decimal_places=3,
        null=True,
        blank=True
    )
    difference_quantity = models.DecimalField(
        max_digits=15,
        decimal_places=3,
        default=0
    )
    
    # Valorisation (au PMP)
    unit_price = models.DecimalField(max_digits=15, decimal_places=2)
    theoretical_value = models.DecimalField(max_digits=15, decimal_places=2)
    counted_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )
    difference_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )
    
    # Mouvement d'ajustement généré
    adjustment_movement = models.OneToOneField(
        'StockMovement',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    notes = models.TextField(blank=True)
    counted_at = models.DateTimeField(null=True, blank=True)
    counted_by = models.ForeignKey(
        'authentication.MedicalStaff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    class Meta:
        verbose_name = "Ligne d'inventaire"
        verbose_name_plural = "Lignes d'inventaire"
    
    def save(self, *args, **kwargs):
        # Calculs automatiques
        self.theoretical_value = self.theoretical_quantity * self.unit_price
        
        if self.counted_quantity is not None:
            self.difference_quantity = self.counted_quantity - self.theoretical_quantity
            self.counted_value = self.counted_quantity * self.unit_price
            self.difference_value = self.counted_value - self.theoretical_value
        
        super().save(*args, **kwargs)


# ============================================================================
# TRANSFERTS INTER-DÉPÔTS
# ============================================================================

class StockTransfer(models.Model):
    """
    Transfert de stock entre dépôts.
    Mouvement interne sans impact comptable.
    """
    TRANSFER_STATES = [
        ('DRAFT', 'Brouillon'),
        ('PENDING', 'En attente réception'),
        ('PARTIAL', 'Partiellement reçu'),
        ('COMPLETED', 'Terminé'),
        ('CANCELLED', 'Annulé'),
    ]
    
    # Numérotation
    transfer_number = models.CharField(max_length=30, unique=True)
    
    # Dépôts
    source_warehouse = models.ForeignKey(
        'Warehouse',
        on_delete=models.PROTECT,
        related_name='outgoing_transfers'
    )
    destination_warehouse = models.ForeignKey(
        'Warehouse',
        on_delete=models.PROTECT,
        related_name='incoming_transfers'
    )
    
    # Dates
    transfer_date = models.DateField()
    reception_date = models.DateField(null=True, blank=True)
    
    # Montant total
    total_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # État
    state = models.CharField(max_length=15, choices=TRANSFER_STATES, default='DRAFT')
    notes = models.TextField(blank=True)
    
    # Traçabilité
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        'authentication.MedicalStaff',
        on_delete=models.PROTECT,
        related_name='created_transfers'
    )
    received_by = models.ForeignKey(
        'authentication.MedicalStaff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='received_transfers'
    )
    
    class Meta:
        verbose_name = "Transfert"
        verbose_name_plural = "Transferts"
        ordering = ['-transfer_date']
    
    def __str__(self):
        return f"{self.transfer_number}: {self.source_warehouse.code} → {self.destination_warehouse.code}"
    
    def save(self, *args, **kwargs):
        if not self.transfer_number:
            self.transfer_number = self._generate_transfer_number()
        super().save(*args, **kwargs)
    
    def _generate_transfer_number(self):
        """Génère un numéro de transfert"""
        prefix = f"TRF{timezone.now().strftime('%Y%m')}"
        last = StockTransfer.objects.filter(
            transfer_number__startswith=prefix
        ).order_by('-transfer_number').first()
        
        if last and last.transfer_number:
            try:
                num = int(last.transfer_number[-5:]) + 1
            except ValueError:
                num = 1
        else:
            num = 1
        
        return f"{prefix}{num:05d}"


class StockTransferLine(models.Model):
    """Ligne de transfert"""
    transfer = models.ForeignKey(
        'StockTransfer',
        on_delete=models.CASCADE,
        related_name='lines'
    )
    
    # Article
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        limit_choices_to={'model__in': ['polyclinicproduct', 'equipment', 'consumable']}
    )
    object_id = models.PositiveIntegerField()
    article = GenericForeignKey('content_type', 'object_id')
    
    # Lot
    source_batch = models.ForeignKey(
        'StockBatch',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='transfer_sources'
    )
    destination_batch = models.ForeignKey(
        'StockBatch',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transfer_destinations'
    )
    
    # Quantités
    quantity_sent = models.DecimalField(max_digits=15, decimal_places=3)
    quantity_received = models.DecimalField(
        max_digits=15,
        decimal_places=3,
        null=True,
        blank=True
    )
    
    # Valorisation (au PMP)
    unit_price = models.DecimalField(max_digits=15, decimal_places=2)
    total_value = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Mouvements générés
    source_movement = models.OneToOneField(
        'StockMovement',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transfer_source_line'
    )
    destination_movement = models.OneToOneField(
        'StockMovement',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transfer_destination_line'
    )
    
    class Meta:
        verbose_name = "Ligne de transfert"
        verbose_name_plural = "Lignes de transfert"
    
    def save(self, *args, **kwargs):
        self.total_value = self.quantity_sent * self.unit_price
        super().save(*args, **kwargs)
