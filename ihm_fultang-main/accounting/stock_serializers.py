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

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"

class FamilySerializer(serializers.ModelSerializer):
    class Meta:
        model = Family
        fields = "__all__"

class ArticleSerializer(serializers.ModelSerializer):
    total_stock = serializers.DecimalField(
        max_digits=15, decimal_places=3, read_only=True
    )
    available_stock = serializers.DecimalField(
        max_digits=15, decimal_places=3, read_only=True
    )

    class Meta:
        model = Article
        fields = "__all__"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["total_stock"] = instance.get_total_stock()
        data["available_stock"] = instance.get_available_stock()
        return data

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
        return data

class StockSerializer(serializers.ModelSerializer):
    available_quantity = serializers.DecimalField(
        max_digits=15, decimal_places=3, read_only=True
    )

    class Meta:
        model = Stock
        fields = "__all__"

class BatchSerializer(serializers.ModelSerializer):
    is_expired = serializers.BooleanField(read_only=True)
    days_until_expiry = serializers.IntegerField(read_only=True)

    class Meta:
        model = Batch
        fields = "__all__"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["is_expired"] = instance.is_expired()
        data["days_until_expiry"] = instance.days_until_expiry()
        return data

class StockMovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockMovement
        fields = "__all__"
        read_only_fields = [
            "movement_number",
            "total_value",
            "status",
            "created_at"
        ]

class GoodsReceiptLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = GoodsReceiptLine
        fields = "__all__"

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
            "created_at"
        ]

class GoodsIssueLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = GoodsIssueLine
        fields = "__all__"

class GoodsIssueNoteSerializer(serializers.ModelSerializer):
    lines = GoodsIssueLineSerializer(many=True, read_only=True)

    class Meta:
        model = GoodsIssueNote
        fields = "__all__"
        read_only_fields = [
            "issue_number",
            "total_amount",
            "status",
            "created_at"
        ]

class InventoryLineSerializer(serializers.ModelSerializer):
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
            "created_at"
        ]


class TransferLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransferLine
        fields = "__all__"


class TransferNoteSerializer(serializers.ModelSerializer):
    lines = TransferLineSerializer(many=True, read_only=True)

    class Meta:
        model = TransferNote
        fields = "__all__"

