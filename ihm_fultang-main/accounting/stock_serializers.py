from rest_framework import serializers
from .stock_models import (
    Category, Family, Article,
    Depot, Stock, Batch,
    StockMovement,
    GoodsReceiptNote, GoodsReceiptLine,
    GoodsIssueNote, GoodsIssueLine,
    Inventory, InventoryLine,
    TransferNote, TransferLine
)
from .models import ChartOfAccounts


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
        queryset=ChartOfAccounts.objects.all(),
        required=False,
        allow_null=True
    )
    purchase_account = serializers.PrimaryKeyRelatedField(
        queryset=ChartOfAccounts.objects.all(),
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
        representation['date'] = instance.receipt_date
        representation['supplier'] = instance.supplier.name if instance.supplier else "N/A"
        representation['supplier_id'] = instance.supplier.id if instance.supplier else None
        representation['warehouse'] = instance.depot.name if instance.depot else "N/A"
        representation['depot_id'] = instance.depot.id if instance.depot else None
        representation['line_count'] = instance.lines.count()
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
        model = InventoryLine
        fields = "__all__"

class InventorySerializer(serializers.ModelSerializer):
    lines = InventoryLineSerializer(many=True, read_only=True)

    class Meta:
        model = Inventory
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
