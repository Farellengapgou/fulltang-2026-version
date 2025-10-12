from rest_framework import serializers

from polyclinic.models import PolyclinicProduct, PolyclinicProductCategory


class PolyclinicProductSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=PolyclinicProductCategory.objects.all())

    class Meta:
        model = PolyclinicProduct
        fields = [
            'id', 'category', 'name', 'generic_name', 'brand', 'description', 'price',
            'current_stock', 'min_stock_level', 'status', 'requires_prescription',
            'expiry_date', 'is_medication', 'dosage', 'form', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class PolyclinicProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PolyclinicProduct
        fields = [
            'category', 'name', 'generic_name', 'brand', 'description', 'price',
            'current_stock', 'min_stock_level', 'status', 'requires_prescription',
            'expiry_date', 'is_medication', 'dosage', 'form'
        ]

    def validate(self, data):
        if data.get('is_medication') and not data.get('dosage'):
            raise serializers.ValidationError("Les médicaments doivent avoir un dosage spécifié.")
        return data