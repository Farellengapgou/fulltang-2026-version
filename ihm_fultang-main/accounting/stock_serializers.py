from rest_framework import serializers
from .stock_models import (
    Category, Family, Article,
    Depot, Stock, Batch,
    StockMovement,
    GoodsReceiptNote, GoodsReceiptLine,
    GoodsIssueNote, GoodsIssueLine,
    StockInventory, StockInventoryLine,
    TransferNote, TransferLine,
    GoodsIssueNote, GoodsIssueLine,
    StockInventory, StockInventoryLine,
    TransferNote, TransferLine,
    StockJournal, 
    StockJournalEntry, StockJournalEntryLine,
    StockSupplier, StockAsset, StockAnalyticAccount, 
    StockBudget, StockBudgetLine, StockAccountingPeriod, 
    StockTaxRate, StockTaxDeclaration, StockBankAccount,
    StockBankReconciliation, StockFinancialRatio, StockAccountingOperation
)
from .models_financier import ChartOfAccounts as StockChartOfAccounts
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
from datetime import datetime
from authentication.models import MedicalStaff


class FamilySerializer(serializers.ModelSerializer):
    class Meta:
        model = Family
        fields = "__all__"
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Expand category to object for frontend
        if instance.category:
            representation['category'] = {
                'id': instance.category.id,
                'code': instance.category.code,
                'name': instance.category.name
            }
        return representation

class CategorySerializer(serializers.ModelSerializer):
    families = FamilySerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = "__all__"

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Add article count
        representation['article_count'] = instance.article_set.count()
        # Expand accounts
        if instance.default_stock_account:
            representation['default_stock_account'] = {
                'id': instance.default_stock_account.id,
                'code': instance.default_stock_account.code,
                'label': instance.default_stock_account.label
            }
        if instance.default_expense_account:
            representation['default_expense_account'] = {
                'id': instance.default_expense_account.id,
                'code': instance.default_expense_account.code,
                'label': instance.default_expense_account.label
            }
        return representation

class ArticleSerializer(serializers.ModelSerializer):
    total_stock = serializers.SerializerMethodField()
    available_stock = serializers.SerializerMethodField()
    
    # Make accounting fields optional for creation
    stock_account = serializers.PrimaryKeyRelatedField(
        queryset=StockChartOfAccounts.objects.all(),
        required=False,
        allow_null=True
    )
    purchase_account = serializers.PrimaryKeyRelatedField(
        queryset=StockChartOfAccounts.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Article
        fields = "__all__"

    def get_total_stock(self, obj):
        return obj.get_total_stock()

    def get_available_stock(self, obj):
        return obj.get_available_stock()

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Expand category and family for frontend display
        if instance.category:
            representation['category'] = {
                'id': instance.category.id,
                'name': instance.category.name,
                'code': instance.category.code
            }
        if instance.family:
            representation['family'] = {
                'id': instance.family.id,
                'name': instance.family.name,
                'code': instance.family.code
            }
        # Expand accounts
        if instance.stock_account:
            representation['stock_account'] = {
                'id': instance.stock_account.id,
                'code': instance.stock_account.code,
                'label': instance.stock_account.label
            }
        if instance.purchase_account:
            representation['purchase_account'] = {
                'id': instance.purchase_account.id,
                'code': instance.purchase_account.code,
                'label': instance.purchase_account.label
            }
        if instance.sales_account:
            representation['sales_account'] = {
                'id': instance.sales_account.id,
                'code': instance.sales_account.code,
                'label': instance.sales_account.label
            }
        return representation



class DepotSerializer(serializers.ModelSerializer):
    total_value = serializers.DecimalField(
        max_digits=15, decimal_places=2, read_only=True
    )

    class Meta:
        model = Depot
        fields = "__all__"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["total_value"] = instance.get_total_value()
        data["article_count"] = instance.stocks.filter(physical_quantity__gt=0).count()
        # Aliases for frontend compatibility
        data["warehouse_type"] = instance.depot_type
        data["is_main_warehouse"] = instance.depot_type == "CENTRAL" and instance.is_active
        return data

class StockSerializer(serializers.ModelSerializer):
    available_quantity = serializers.SerializerMethodField()

    class Meta:
        model = Stock
        fields = "__all__"

    def get_available_quantity(self, obj):
        return obj.available_quantity

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        
        # Expand article
        if instance.article:
            representation['article'] = {
                'id': instance.article.id,
                'code': instance.article.code,
                'name': instance.article.name,
                'category': instance.article.category.name if instance.article.category else "N/A"
            }
        else:
            representation['article'] = {
                'id': None,
                'code': 'N/A',
                'name': 'Article Inconnu',
                'category': 'N/A'
            }
            
        # Add Article fields to top-level for frontend convenience
        if instance.article:
            representation['weighted_average_price'] = instance.article.weighted_average_price
            representation['minimum_stock'] = instance.article.minimum_stock
            
        # Expand depot as warehouse
        if instance.depot:
            representation['warehouse'] = {
                'id': instance.depot.id,
                'name': instance.depot.name,
                'code': instance.depot.code
            }
        else:
            representation['warehouse'] = {
                'id': None,
                'name': 'Aucun Dépôt',
                'code': 'N/A'
            }
            
        return representation
class BatchSerializer(serializers.ModelSerializer):
    is_expired = serializers.SerializerMethodField()
    days_until_expiry = serializers.SerializerMethodField()

    class Meta:
        model = Batch
        fields = "__all__"

    def get_is_expired(self, obj):
        return obj.is_expired()

    def get_days_until_expiry(self, obj):
        return obj.days_until_expiry()
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        
        # Expand article
        if instance.article:
            representation['article'] = {
                'id': instance.article.id,
                'code': instance.article.code,
                'name': instance.article.name
            }
        
        return representation


class StockMovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockMovement
        fields = "__all__"
        read_only_fields = [
            "movement_number",
            "total_value",
            "status",
            "created_at",
            "created_by"
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        
        # Expand article
        if instance.article:
            representation['article'] = {
                'id': instance.article.id,
                'code': instance.article.code,
                'name': instance.article.name
            }
            
        # Expand depots
        if instance.source_depot:
            representation['source_warehouse'] = {
                'id': instance.source_depot.id,
                'name': instance.source_depot.name,
                'code': instance.source_depot.code
            }
        if instance.destination_depot:
            representation['destination_warehouse'] = {
                'id': instance.destination_depot.id,
                'name': instance.destination_depot.name,
                'code': instance.destination_depot.code
            }
            
        # Expand creator
        if instance.created_by:
            representation['created_by'] = {
                'id': instance.created_by.id,
                'name': f"{instance.created_by.first_name} {instance.created_by.last_name}".strip() or instance.created_by.user.username
            }
            
        return representation

    def validate(self, data):
        movement_type = data.get("movement_type")

        if movement_type == "IN" and not data.get("destination_depot"):
            raise serializers.ValidationError("Une entrée nécessite un dépôt destination")

        if movement_type == "OUT" and not data.get("source_depot"):
            raise serializers.ValidationError("Une sortie nécessite un dépôt source")

        if data["quantity"] <= 0:
            raise serializers.ValidationError("La quantité doit être positive")

        return data


class GoodsReceiptLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = GoodsReceiptLine
        fields = "__all__"

class GoodsReceiptConfirmSerializer(serializers.Serializer):
    confirm = serializers.BooleanField()

class GoodsReceiptNoteSerializer(serializers.ModelSerializer):
    lines = GoodsReceiptLineSerializer(many=True, read_only=True)

    class Meta:
        model = GoodsReceiptNote
        fields = "__all__"
        read_only_fields = [
            "receipt_number",
            "subtotal",
            "total_amount",
            "status",
            "created_at",
            "created_by"
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Map fields for frontend display
        representation['number'] = instance.receipt_number
        representation['date'] = instance.receipt_date
        representation['supplier'] = instance.supplier.name if instance.supplier else "N/A"
        representation['supplier_id'] = instance.supplier.id if instance.supplier else None
        representation['warehouse'] = instance.depot.name if instance.depot else "N/A"
        representation['depot_id'] = instance.depot.id if instance.depot else None
        representation['line_count'] = instance.lines.count()
        representation['total_amount'] = float(instance.total_amount)
        return representation

class GoodsIssueLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = GoodsIssueLine
        fields = "__all__"
        read_only_fields = ['unit_price', 'line_amount']

class GoodsIssueNoteSerializer(serializers.ModelSerializer):
    lines = GoodsIssueLineSerializer(many=True, read_only=True)

    class Meta:
        model = GoodsIssueNote
        fields = "__all__"
        read_only_fields = [
            "issue_number",
            "total_amount",
            "status",
            "created_at",
            "created_by"
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Map fields for frontend display
        representation['number'] = instance.issue_number
        representation['date'] = instance.issue_date
        representation['type'] = instance.issue_type
        representation['warehouse'] = instance.depot.name if instance.depot else "N/A"
        representation['depot_id'] = instance.depot.id if instance.depot else None
        representation['line_count'] = instance.lines.count()
        representation['total_amount'] = float(instance.total_amount)
        representation['lines'] = [
            {
                'id': line.id,
                'article': line.article.id,
                'quantity': float(line.quantity),
                'unit_price': float(line.unit_price),
                'line_amount': float(line.line_amount)
            } for line in instance.lines.all()
        ]
        return representation

class InventoryLineSerializer(serializers.ModelSerializer):
    article_name = serializers.CharField(source="article.name", read_only=True)
    article_code = serializers.CharField(source="article.code", read_only=True)
    article_pmp = serializers.DecimalField(source="article.weighted_average_price", max_digits=15, decimal_places=2, read_only=True)
    variance = serializers.DecimalField(
        max_digits=15, decimal_places=3, read_only=True
    )
    variance_value = serializers.DecimalField(
        max_digits=15, decimal_places=2, read_only=True
    )

    class Meta:
        model = StockInventoryLine
        fields = "__all__"

class InventorySerializer(serializers.ModelSerializer):
    lines = InventoryLineSerializer(many=True, read_only=True)

    class Meta:
        model = StockInventory
        fields = "__all__"
        read_only_fields = [
            "inventory_number",
            "status",
            "created_at",
            "created_by",
            "manager",
            "start_date"
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['number'] = instance.inventory_number
        representation['date'] = instance.inventory_date
        representation['warehouse'] = instance.depot.name if instance.depot else "N/A"
        representation['warehouse_id'] = instance.depot.id if instance.depot else None
        representation['article_count'] = instance.lines.count()
        # Variance value calculated from property
        representation['variance_value'] = float(instance.variance_value)
        return representation


class TransferLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransferLine
        fields = "__all__"

class TransferNoteSerializer(serializers.ModelSerializer):
    lines = TransferLineSerializer(many=True, read_only=True)

    class Meta:
        model = TransferNote
        fields = "__all__"
        read_only_fields = [
            "transfer_number",
            "status",
            "created_at",
            "created_by"
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Map fields for frontend display
        representation['number'] = instance.transfer_number
        representation['date'] = instance.planned_date
        representation['from_warehouse'] = instance.source_depot.name if instance.source_depot else "N/A"
        representation['from_warehouse_id'] = instance.source_depot.id if instance.source_depot else None
        representation['to_warehouse'] = instance.destination_depot.name if instance.destination_depot else "N/A"
        representation['to_warehouse_id'] = instance.destination_depot.id if instance.destination_depot else None
        representation['line_count'] = instance.lines.count()
        
        # Expand lines with more info
        representation['lines'] = [
            {
                'id': line.id,
                'article': line.article.id,
                'article_name': line.article.name,
                'article_code': line.article.code,
                'quantity': float(line.quantity),
                'sequence': line.sequence
            } for line in instance.lines.all()
        ]
        
        return representation

class ChartOfAccountsSerializer(serializers.ModelSerializer):
    balance = serializers.SerializerMethodField()
    parent_name = serializers.CharField(source='parent.label', read_only=True)
    children_count = serializers.SerializerMethodField()

    class Meta:
        model = StockChartOfAccounts
        fields = [
            'id', 'code', 'label', 'account_class', 'account_type',
            'parent', 'parent_name', 'is_active', 'is_detailed',
            'balance', 'children_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_balance(self, obj):
        """Calcule le solde du compte"""
        # Vérifier que le contexte existe
        if self.context is None:
            return obj.get_balance(None, None)
        
        start_date = self.context.get('start_date')
        end_date = self.context.get('end_date')
        
        # Convertir les chaînes de date en objets date si nécessaire
        if isinstance(start_date, str):
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            except ValueError:
                start_date = None
                
        if isinstance(end_date, str):
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            except ValueError:
                end_date = None
                
        return obj.get_balance(start_date, end_date)

    def get_children_count(self, obj):
        """Retourne le nombre de sous-comptes"""
        # Utiliser sub_accounts car related_name='sub_accounts' dans le modèle
        return obj.sub_accounts.count()

    def validate_code(self, value):
        """Valide le format du code comptable"""
        if not value.isdigit():
            raise serializers.ValidationError(
                "Le code comptable doit contenir uniquement des chiffres"
            )
        if len(value) < 3:
            raise serializers.ValidationError(
                "Le code comptable doit contenir au moins 3 chiffres"
            )
        return value

    def validate(self, attrs):
        """Validation croisée"""
        # Vérifier la cohérence classe/type
        account_class = attrs.get('account_class')
        account_type = attrs.get('account_type')

        class_type_mapping = {
            '1': ['EQUITY', 'LIABILITY'],
            '2': ['ASSET'],
            '3': ['ASSET'],
            '4': ['ASSET', 'LIABILITY'],
            '5': ['ASSET'],
            '6': ['EXPENSE'],
            '7': ['REVENUE'],
            '8': ['ASSET', 'LIABILITY']
        }

        if account_class in class_type_mapping:
            if account_type not in class_type_mapping[account_class]:
                raise serializers.ValidationError({
                    'account_type': f"Type incompatible avec la classe {account_class}"
                })

        # Vérifier la hiérarchie parent
        parent = attrs.get('parent')
        if parent:
            code = attrs.get('code', '')
            if not code.startswith(parent.code):
                raise serializers.ValidationError({
                    'parent': "Le compte parent doit avoir un code compatible"
                })

        return attrs


class JournalSerializer(serializers.ModelSerializer):
    entries_count = serializers.SerializerMethodField()
    default_debit_account_name = serializers.CharField(
        source='default_debit_account.label', read_only=True
    )
    default_credit_account_name = serializers.CharField(
        source='default_credit_account.label', read_only=True
    )

    class Meta:
        model = StockJournal
        fields = [
            'id', 'code', 'name', 'journal_type',
            'default_debit_account', 'default_debit_account_name',
            'default_credit_account', 'default_credit_account_name',
            'is_active', 'entries_count'
        ]

    def get_entries_count(self, obj):
        """Retourne le nombre d'écritures dans ce journal"""
        return obj.journalentry_set.count()


class JournalEntryLineSerializer(serializers.ModelSerializer):
    account_code = serializers.CharField(source='account.code', read_only=True)
    account_label = serializers.CharField(source='account.label', read_only=True)
    partner_supplier_name = serializers.CharField(source='partner_supplier.name', read_only=True)
    partner_customer_name = serializers.CharField(source='partner_customer.name', read_only=True)
    analytic_account_name = serializers.CharField(
        source='analytic_account.name', read_only=True
    )

    class Meta:
        model = StockJournalEntryLine
        fields = [
            'id', 'sequence', 'account', 'account_code', 'account_label',
            'label', 'debit_amount', 'credit_amount', 'partner_supplier', 'partner_supplier_name',
            'partner_customer', 'partner_customer_name',
            'analytic_account', 'analytic_account_name'
        ]

    def validate(self, attrs):
        """Validation des montants"""
        debit = attrs.get('debit_amount', 0)
        credit = attrs.get('credit_amount', 0)

        if debit and credit:
            raise serializers.ValidationError(
                "Une ligne ne peut pas être à la fois débit et crédit"
            )

        if not debit and not credit:
            raise serializers.ValidationError(
                "Une ligne doit avoir un montant débit ou crédit"
            )

        if debit < 0 or credit < 0:
            raise serializers.ValidationError(
                "Les montants ne peuvent pas être négatifs"
            )

        return attrs


class JournalEntrySerializer(serializers.ModelSerializer):
    lines = JournalEntryLineSerializer(many=True)
    journal_name = serializers.CharField(source='journal.name', read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', read_only=True
    )
    validated_by_name = serializers.CharField(
        source='validated_by.get_full_name', read_only=True
    )
    is_balanced = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()

    class Meta:
        model = StockJournalEntry
        fields = [
            'id', 'entry_number', 'entry_date', 'journal', 'journal_name',
            'reference', 'description', 'state', 'total_debit', 'total_credit',
            'created_by', 'created_by_name', 'validated_by', 'validated_by_name',
            'created_at', 'validated_at', 'bill', 'consultation',
            'lines', 'is_balanced', 'can_edit'
        ]
        read_only_fields = [
            'entry_number', 'total_debit', 'total_credit',
            'created_by', 'validated_by', 'created_at', 'validated_at'
        ]

    def get_is_balanced(self, obj):
        """Vérifie si l'écriture est équilibrée"""
        return obj.is_balanced

    def get_can_edit(self, obj):
        """Vérifie si l'écriture peut être modifiée"""
        return obj.state == 'DRAFT'

    def validate_entry_date(self, value):
        """Valide la date d'écriture"""
        # Vérifier que la période n'est pas clôturée
        try:
            period = StockAccountingPeriod.objects.get(
                year=value.year,
                month=value.month
            )
            if not period.can_post_entries():
                raise serializers.ValidationError(
                    f"La période {period} est clôturée"
                )
        except StockAccountingPeriod.DoesNotExist:
            # Créer automatiquement la période si elle n'existe pas
            StockAccountingPeriod.objects.create(
                year=value.year,
                month=value.month
            )

        return value

    def validate_lines(self, lines_data):
        """Valide les lignes d'écriture"""
        if len(lines_data) < 2:
            raise serializers.ValidationError(
                "Une écriture doit avoir au moins 2 lignes"
            )

        total_debit = sum(line.get('debit_amount', 0) for line in lines_data)
        total_credit = sum(line.get('credit_amount', 0) for line in lines_data)

        if abs(total_debit - total_credit) > 0.01:
            raise serializers.ValidationError(
                f"L'écriture n'est pas équilibrée: "
                f"Débit={total_debit}, Crédit={total_credit}"
            )

        return lines_data

    @transaction.atomic
    def create(self, validated_data):
        """Création d'une écriture avec ses lignes"""
        lines_data = validated_data.pop('lines')
        validated_data['created_by'] = self.context['request'].user

        journal_entry = StockJournalEntry.objects.create(**validated_data)

        for i, line_data in enumerate(lines_data, 1):
            line_data['sequence'] = i
            StockJournalEntryLine.objects.create(
                journal_entry=journal_entry,
                **line_data
            )

        journal_entry.update_totals()
        return journal_entry

    @transaction.atomic
    def update(self, instance, validated_data):
        """Mise à jour d'une écriture"""
        if instance.state != 'DRAFT':
            raise serializers.ValidationError(
                "Seules les écritures en brouillon peuvent être modifiées"
            )

        lines_data = validated_data.pop('lines', None)

        # Mettre à jour l'écriture
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if lines_data is not None:
            # Supprimer les anciennes lignes
            instance.lines.all().delete()

            # Créer les nouvelles lignes
            for i, line_data in enumerate(lines_data, 1):
                line_data['sequence'] = i
                StockJournalEntryLine.objects.create(
                    journal_entry=instance,
                    **line_data
                )

            instance.update_totals()

        return instance


class SupplierSerializer(serializers.ModelSerializer):
    account_label = serializers.CharField(source='account.label', read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', read_only=True
    )
    balance = serializers.SerializerMethodField()
    orders_total_current_year = serializers.SerializerMethodField()
    total_purchases = serializers.SerializerMethodField()
    last_purchase_date = serializers.SerializerMethodField()

    class Meta:
        model = StockSupplier
        fields = [
            'id', 'code', 'name', 'supplier_type', 'address', 'phone',
            'email', 'website', 'payment_terms', 'credit_limit',
            'discount_rate', 'tax_id', 'trade_register', 'account',
            'account_label', 'is_active', 'created_at', 'created_by',
            'created_by_name', 'balance', 'orders_total_current_year',
            'total_purchases', 'last_purchase_date'
        ]
        read_only_fields = ['created_at', 'created_by']
        extra_kwargs = {
            'website': {'allow_blank': True, 'required': False},
            'email': {'allow_blank': True, 'required': False},
            'phone': {'allow_blank': True, 'required': False},
            'tax_id': {'allow_blank': True, 'required': False},
            'trade_register': {'allow_blank': True, 'required': False},
        }

    def get_total_purchases(self, obj):
        from .stock_models import GoodsReceiptNote
        from django.db.models import Sum
        total = GoodsReceiptNote.objects.filter(
            supplier=obj,
            status__in=["CONFIRMED", "POSTED"]
        ).aggregate(total=Sum("total_amount"))["total"] or 0
        return float(total)

    def get_last_purchase_date(self, obj):
        from .stock_models import GoodsReceiptNote
        last = GoodsReceiptNote.objects.filter(
            supplier=obj,
            status__in=["CONFIRMED", "POSTED"]
        ).order_by("-receipt_date").first()
        return last.receipt_date if last else None

    def get_balance(self, obj):
        """Retourne le solde fournisseur"""
        # SAFEGUARD: Returning 0 temporarily to prevent 500 error
        return 0 
        # return obj.get_balance()

    def get_orders_total_current_year(self, obj):
        """Retourne le CA de l'année en cours"""
        # SAFEGUARD: Returning 0 temporarily to prevent 500 error
        return 0
        # current_year = timezone.now().year
        # return obj.get_orders_total(current_year)

    def validate_code(self, value):
        """Valide l'unicité du code fournisseur"""
        if self.instance and self.instance.code == value:
            return value

        if StockSupplier.objects.filter(code=value).exists():
            raise serializers.ValidationError(
                "Ce code fournisseur existe déjà"
            )
        return value

    def validate_email(self, value):
        """Valide le format email"""
        if value and '@' not in value:
            raise serializers.ValidationError("Format email invalide")
        return value

    def create(self, validated_data):
        """Création avec utilisateur connecté"""
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        else:
            # Fallback for scripts/testing or raise error
            from django.contrib.auth import get_user_model
            User = get_user_model()
            # Try to get first admin user as fallback if no auth (should not happen in prod with permissions)
            user = User.objects.filter(is_superuser=True).first()
            if user:
                validated_data['created_by'] = user
            else:
                 raise serializers.ValidationError("Impossible d'identifier l'utilisateur créateur.")
                 
        return super().create(validated_data)


class AssetSerializer(serializers.ModelSerializer):
    asset_account_label = serializers.CharField(
        source='asset_account.label', read_only=True
    )
    depreciation_account_label = serializers.CharField(
        source='depreciation_account.label', read_only=True
    )
    expense_account_label = serializers.CharField(
        source='expense_account.label', read_only=True
    )
    department_name = serializers.CharField(
        source='department.name', read_only=True
    )
    responsible_name = serializers.CharField(
        source='responsible.get_full_name', read_only=True
    )
    annual_depreciation = serializers.SerializerMethodField()
    accumulated_depreciation = serializers.SerializerMethodField()
    net_book_value = serializers.SerializerMethodField()

    class Meta:
        model = StockAsset
        fields = [
            'id', 'asset_number', 'name', 'category', 'description',
            'acquisition_cost', 'acquisition_date', 'useful_life_years',
            'salvage_value', 'depreciation_method', 'depreciation_rate',
            'asset_account', 'asset_account_label',
            'depreciation_account', 'depreciation_account_label',
            'expense_account', 'expense_account_label',
            'location', 'department', 'department_name',
            'responsible', 'responsible_name',
            'is_active', 'disposal_date', 'disposal_value',
            'annual_depreciation', 'accumulated_depreciation', 'net_book_value',
            'created_at', 'created_by'
        ]
        read_only_fields = ['asset_number', 'created_at', 'created_by']

    def get_annual_depreciation(self, obj):
        """Retourne l'amortissement annuel"""
        return obj.calculate_annual_depreciation()

    def get_accumulated_depreciation(self, obj):
        """Retourne les amortissements cumulés"""
        return obj.get_accumulated_depreciation()

    def get_net_book_value(self, obj):
        """Retourne la valeur nette comptable"""
        return obj.get_net_book_value()

    def validate(self, attrs):
        """Validation métier des immobilisations"""
        acquisition_cost = attrs.get('acquisition_cost')
        salvage_value = attrs.get('salvage_value', 0)
        useful_life_years = attrs.get('useful_life_years')

        if salvage_value >= acquisition_cost:
            raise serializers.ValidationError({
                'salvage_value': "La valeur résiduelle doit être inférieure au coût d'acquisition"
            })

        if useful_life_years <= 0:
            raise serializers.ValidationError({
                'useful_life_years': "La durée d'utilité doit être positive"
            })

        # Vérifier que les comptes sont cohérents
        asset_account = attrs.get('asset_account')
        if asset_account and asset_account.account_type != 'ASSET':
            raise serializers.ValidationError({
                'asset_account': "Le compte d'immobilisation doit être de type ASSET"
            })

        return attrs

    def create(self, validated_data):
        """Création avec numéro automatique"""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class BudgetLineSerializer(serializers.ModelSerializer):
    account_code = serializers.CharField(source='account.code', read_only=True)
    account_label = serializers.CharField(source='account.label', read_only=True)
    analytic_account_name = serializers.CharField(
        source='analytic_account.name', read_only=True
    )
    annual_total = serializers.SerializerMethodField()

    class Meta:
        model = StockBudgetLine
        fields = [
            'id', 'account', 'account_code', 'account_label',
            'analytic_account', 'analytic_account_name',
            'january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december',
            'notes', 'annual_total'
        ]

    def get_annual_total(self, obj):
        """Retourne le total annuel"""
        return obj.get_annual_total()


class BudgetSerializer(serializers.ModelSerializer):
    lines = BudgetLineSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', read_only=True
    )
    approved_by_name = serializers.CharField(
        source='approved_by.get_full_name', read_only=True
    )
    total_budget = serializers.SerializerMethodField()

    class Meta:
        model = StockBudget
        fields = [
            'id', 'name', 'budget_type', 'fiscal_year',
            'start_date', 'end_date', 'is_active', 'is_approved',
            'approved_by', 'approved_by_name', 'approved_at',
            'created_by', 'created_by_name', 'created_at',
            'lines', 'total_budget'
        ]
        read_only_fields = [
            'approved_by', 'approved_at', 'created_by', 'created_at'
        ]

    def get_total_budget(self, obj):
        """Calcule le budget total"""
        return sum(line.get_annual_total() for line in obj.lines.all())

    def validate(self, attrs):
        """Validation des dates"""
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')

        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError({
                'end_date': "La date de fin doit être postérieure à la date de début"
            })

        return attrs

    def create(self, validated_data):
        """Création avec utilisateur connecté"""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class TaxRateSerializer(serializers.ModelSerializer):
    collected_account_label = serializers.CharField(
        source='collected_account.label', read_only=True
    )
    paid_account_label = serializers.CharField(
        source='paid_account.label', read_only=True
    )
    rate_percentage = serializers.SerializerMethodField()

    class Meta:
        model = StockTaxRate
        fields = [
            'id', 'name', 'tax_type', 'rate', 'rate_percentage',
            'is_active', 'start_date', 'end_date',
            'collected_account', 'collected_account_label',
            'paid_account', 'paid_account_label'
        ]

    def get_rate_percentage(self, obj):
        """Retourne le taux en pourcentage"""
        return obj.rate * 100


class TaxDeclarationSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', read_only=True
    )
    total_due = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = StockTaxDeclaration
        fields = [
            'id', 'declaration_type', 'period_year', 'period_month',
            'period_quarter', 'tax_base', 'tax_amount', 'penalties',
            'due_date', 'submission_date', 'payment_date', 'status',
            'journal_entry', 'created_by', 'created_by_name',
            'created_at', 'total_due', 'is_overdue'
        ]
        read_only_fields = ['created_by', 'created_at', 'penalties']

    def get_total_due(self, obj):
        """Retourne le montant total dû"""
        return obj.tax_amount + obj.penalties

    def get_is_overdue(self, obj):
        """Vérifie si la déclaration est en retard"""
        return (obj.status in ['DRAFT', 'SUBMITTED'] and
                timezone.now().date() > obj.due_date)

    def validate(self, attrs):
        """Validation des périodes"""
        declaration_type = attrs.get('declaration_type')
        period_month = attrs.get('period_month')
        period_quarter = attrs.get('period_quarter')

        if 'MONTHLY' in declaration_type and not period_month:
            raise serializers.ValidationError({
                'period_month': "Le mois est requis pour une déclaration mensuelle"
            })

        if 'QUARTERLY' in declaration_type and not period_quarter:
            raise serializers.ValidationError({
                'period_quarter': "Le trimestre est requis pour une déclaration trimestrielle"
            })

        return attrs

    def create(self, validated_data):
        """Création avec calcul automatique des pénalités"""
        validated_data['created_by'] = self.context['request'].user
        instance = super().create(validated_data)

        # Calculer les pénalités si applicable
        if instance.submission_date:
            instance.penalties = instance.calculate_penalties()
            instance.save()

        return instance


class AnalyticAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockAnalyticAccount
        fields = ['id', 'code', 'name', 'parent', 'is_active']


class AccountingPeriodSerializer(serializers.ModelSerializer):
    closed_by_name = serializers.CharField(
        source='closed_by.get_full_name', read_only=True
    )
    period_label = serializers.SerializerMethodField()
    entries_count = serializers.SerializerMethodField()

    class Meta:
        model = StockAccountingPeriod
        fields = [
            'id', 'year', 'month', 'state', 'closed_by', 'closed_by_name',
            'closed_at', 'period_label', 'entries_count'
        ]
        read_only_fields = ['closed_by', 'closed_at']

    def get_period_label(self, obj):
        """Retourne le libellé de la période"""
        return f"{obj.month:02d}/{obj.year}"

    def get_entries_count(self, obj):
        """Retourne le nombre d'écritures sur la période"""
        from datetime import date
        start_date = date(obj.year, obj.month, 1)
        if obj.month == 12:
            end_date = date(obj.year + 1, 1, 1)
        else:
            end_date = date(obj.year, obj.month + 1, 1)

        return StockJournalEntry.objects.filter(
            entry_date__gte=start_date,
            entry_date__lt=end_date
        ).count()


# Serializers pour les rapports
class BalanceSheetSerializer(serializers.Serializer):
    """Serializer pour le bilan comptable"""
    assets = serializers.DictField()
    liabilities = serializers.DictField()
    equity = serializers.DictField()
    total_assets = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_liabilities_equity = serializers.DecimalField(max_digits=15, decimal_places=2)
    is_balanced = serializers.BooleanField()


class IncomeStatementSerializer(serializers.Serializer):
    """Serializer pour le compte de résultat"""
    revenues = serializers.DictField()
    expenses = serializers.DictField()
    total_revenues = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_expenses = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_income = serializers.DecimalField(max_digits=15, decimal_places=2)
    gross_margin = serializers.DecimalField(max_digits=15, decimal_places=2)
    operating_margin = serializers.DecimalField(max_digits=15, decimal_places=2)


class TrialBalanceSerializer(serializers.Serializer):
    """Serializer pour la balance comptable"""
    account_code = serializers.CharField()
    account_label = serializers.CharField()
    opening_balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    debit_movements = serializers.DecimalField(max_digits=15, decimal_places=2)
    credit_movements = serializers.DecimalField(max_digits=15, decimal_places=2)
    closing_balance = serializers.DecimalField(max_digits=15, decimal_places=2)


# Serializer pour actions spéciales
class PostJournalEntrySerializer(serializers.Serializer):
    """Serializer pour valider une écriture"""
    entry_id = serializers.IntegerField()
    validation_note = serializers.CharField(max_length=500, required=False)

    def validate_entry_id(self, value):
        """Valide que l'écriture existe et peut être validée"""
        try:
            entry = StockJournalEntry.objects.get(id=value)
            if entry.state != 'DRAFT':
                raise serializers.ValidationError(
                    "Seules les écritures en brouillon peuvent être validées"
                )
            if not entry.is_balanced:
                raise serializers.ValidationError(
                    "L'écriture n'est pas équilibrée"
                )
            return value
        except StockJournalEntry.DoesNotExist:
            raise serializers.ValidationError("Écriture non trouvée")


class ClosePeriodSerializer(serializers.Serializer):
    """Serializer pour clôturer une période"""
    year = serializers.IntegerField()
    month = serializers.IntegerField(min_value=1, max_value=12)
    closure_note = serializers.CharField(max_length=1000, required=False)

    def validate(self, attrs):
        """Valide que la période peut être clôturée"""
        year = attrs['year']
        month = attrs['month']

        try:
            period = StockAccountingPeriod.objects.get(year=year, month=month)
            if period.state != 'OPEN':
                raise serializers.ValidationError(
                    f"La période {period} n'est pas ouverte"
                )
        except StockAccountingPeriod.DoesNotExist:
            raise serializers.ValidationError(
                f"La période {month:02d}/{year} n'existe pas"
            )

        # Vérifier qu'il n'y a pas d'écritures en brouillon
        from datetime import date
        start_date = date(year, month, 1)
        if month == 12:
            end_date = date(year + 1, 1, 1)
        else:
            end_date = date(year, month + 1, 1)

        draft_entries = StockJournalEntry.objects.filter(
            entry_date__gte=start_date,
            entry_date__lt=end_date,
            state='DRAFT'
        ).count()

        if draft_entries > 0:
            raise serializers.ValidationError(
                f"Il reste {draft_entries} écriture(s) en brouillon sur cette période"
            )

        return attrs


class GenerateDepreciationSerializer(serializers.Serializer):
    """Serializer pour générer les amortissements"""
    period_date = serializers.DateField()
    asset_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text="IDs des immobilisations à amortir (toutes si vide)"
    )

    def validate_asset_ids(self, value):
        """Valide que les immobilisations existent"""
        if value:
            existing_ids = StockAsset.objects.filter(
                id__in=value, is_active=True
            ).values_list('id', flat=True)

            missing_ids = set(value) - set(existing_ids)
            if missing_ids:
                raise serializers.ValidationError(
                    f"Immobilisations non trouvées: {list(missing_ids)}"
                )

        return value