from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from decimal import Decimal
from datetime import datetime, timedelta


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
        'accounting.Supplier',
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
        self.save(update_fields=['stock_value', 'updated_at'])
    
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
        'accounting.Supplier',
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
        'accounting.Supplier',
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
            # Créer le lot si nécessaire
            if line.article.requires_batch:
                batch = Batch.objects.create(
                    article=line.article,
                    supplier=self.supplier,
                    batch_number=line.batch_number,
                    manufacturing_date=line.manufacturing_date,
                    expiry_date=line.expiry_date,
                    reception_date=self.receipt_date,
                    initial_quantity=line.quantity_received,
                    remaining_quantity=line.quantity_received,
                    unit_cost=line.unit_price,
                    created_by=user
                )
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
            
            # Mettre à jour le stock
            stock, created = Stock.objects.get_or_create(
                article=line.article,
                depot=self.depot,
                defaults={'physical_quantity': 0, 'theoretical_quantity': 0}
            )
            stock.physical_quantity += line.quantity_received
            stock.theoretical_quantity += line.quantity_received
            stock.update_value()
            
            # Recalculer le PMP
            line.article.recalculate_pmp(line.quantity_received, line.unit_price)
        
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
        
        from accounting.models import JournalEntry, JournalEntryLine, Journal
        
        # Récupérer le journal d'achats
        journal = Journal.objects.get(journal_type='PURCHASES')
        
        # Créer l'écriture
        entry = JournalEntry.objects.create(
            journal=journal,
            entry_date=self.receipt_date,
            reference=self.receipt_number,
            description=f"Réception {self.supplier.name if self.supplier else 'N/A'} - {self.receipt_number}",
            state='DRAFT',
            created_by=self.validated_by
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
                credit_amount=0,
                partner=self.supplier
            )
            sequence += 1
        
        # Crédit fournisseur (total)
        if self.supplier and self.supplier.account:
            JournalEntryLine.objects.create(
                journal_entry=entry,
                sequence=sequence,
                account=self.supplier.account,
                label=f"Fournisseur {self.supplier.name}",
                debit_amount=0,
                credit_amount=self.total_amount,
                partner=self.supplier
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
        discounted_price = self.unit_price * (1 - self.discount_rate / 100)
        self.line_amount = self.quantity_received * discounted_price
        super().save(*args, **kwargs)


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
    
    ISSUE_STATUS = [
        ('DRAFT', 'Brouillon'),
        ('CONFIRMED', 'Confirmé'),
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
    status = models.CharField(max_length=15, choices=ISSUE_STATUS, default='DRAFT')
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
    
    def confirm(self, user):
        """Confirme le bon de sortie avec méthode FEFO"""
        if self.status != 'DRAFT':
            raise ValidationError("Seul un bon en brouillon peut être confirmé")
        
        for line in self.lines.all():
            # Sélectionner le lot selon FEFO (First Expired, First Out)
            batch = Batch.objects.filter(
                article=line.article,
                remaining_quantity__gte=line.quantity,
                is_blocked=False
            ).order_by('expiry_date', 'reception_date').first()
            
            if not batch:
                raise ValidationError(f"Stock insuffisant pour {line.article.name}")
            
            # Créer le mouvement
            StockMovement.objects.create(
                movement_type='OUT',
                movement_reason=self.issue_type,
                article=line.article,
                batch=batch,
                source_depot=self.depot,
                quantity=line.quantity,
                unit_price=line.article.weighted_average_price,
                total_value=line.line_amount,
                operation_date=timezone.now(),
                reference_document=self.issue_number,
                document_type='GOODS_ISSUE',
                status='CONFIRMED',
                created_by=user
            )
            
            # Mettre à jour le stock
            stock = Stock.objects.get(article=line.article, depot=self.depot)
            stock.physical_quantity -= line.quantity
            stock.theoretical_quantity -= line.quantity
            stock.update_value()
            
            # Mettre à jour le lot
            batch.remaining_quantity -= line.quantity
            batch.save()
        
        self.status = 'CONFIRMED'
        self.validated_by = user
        self.validated_at = timezone.now()
        self.save()
    
    def post_to_accounting(self):
        """Écriture comptable sortie OHADA"""
        # Débit 603x - Variation de stocks
        # Crédit 33xx - Stock
        pass  # À implémenter selon même logique que GoodsReceiptNote


class GoodsIssueLine(models.Model):
    """Lignes de bon de sortie"""
    issue = models.ForeignKey('GoodsIssueNote', on_delete=models.CASCADE, related_name='lines')
    sequence = models.PositiveIntegerField()
    
    article = models.ForeignKey('Article', on_delete=models.PROTECT)
    batch = models.ForeignKey('Batch', on_delete=models.PROTECT, null=True, blank=True)
    
    quantity = models.DecimalField(max_digits=15, decimal_places=3)
    unit_price = models.DecimalField(max_digits=15, decimal_places=2, help_text="PMP au moment de la sortie")
    line_amount = models.DecimalField(max_digits=15, decimal_places=2)
    
    notes = models.TextField(blank=True)
    
    class Meta:
        verbose_name = "Ligne bon de sortie"
        ordering = ['issue', 'sequence']
        unique_together = ['issue', 'sequence']
    
    def save(self, *args, **kwargs):
        self.line_amount = self.quantity * self.unit_price
        super().save(*args, **kwargs)


# ==================== TRANSFERTS INTER-DEPOTS ====================


class TransferNote(models.Model):
    """Transferts inter-dépôts (suivi séparé)."""
    TRANSFER_STATUS = [
        ('PENDING', 'En attente'),
        ('IN_TRANSIT', 'En transit'),
        ('RECEIVED', 'Reçu'),
        ('CANCELLED', 'Annulé'),
    ]

    transfer_number = models.CharField(max_length=30, unique=True)
    source_depot = models.ForeignKey('Depot', on_delete=models.PROTECT, related_name='outgoing_transfers')
    destination_depot = models.ForeignKey('Depot', on_delete=models.PROTECT, related_name='incoming_transfers')
    planned_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=TRANSFER_STATUS, default='PENDING')

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

class Inventory(models.Model):
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
        related_name='managed_inventories'
    )
    validated_by = models.ForeignKey(
        "authentication.MedicalStaff",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='validated_inventories'
    )
    validated_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        "authentication.MedicalStaff",
        on_delete=models.PROTECT,
        related_name='created_inventories'
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
        last = Inventory.objects.filter(
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
                InventoryLine.objects.create(
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


class InventoryLine(models.Model):
    """Lignes de comptage inventaire"""
    inventory = models.ForeignKey('Inventory', on_delete=models.CASCADE, related_name='lines')
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