from rest_framework import serializers
from polyclinic.models import PolyclinicProductCategory
from rest_framework_recursive.fields import RecursiveField
from polyclinic.serializers.polyclinic_product_serializer import PolyclinicProductSerializer

class PolyclinicProductCategorySerializer(serializers.ModelSerializer):
    name = serializers.CharField(min_length=1, max_length=255, allow_blank=False, trim_whitespace=True)
    parent = serializers.SlugRelatedField(slug_field='name', allow_null=True, queryset=PolyclinicProductCategory.objects.all())
    children = RecursiveField(many=True, read_only=True)
    products = PolyclinicProductSerializer(many=True, read_only=True)

    class Meta:
        model = PolyclinicProductCategory
        fields = ['id', 'name', 'parent', 'products', 'children']

class PolyclinicProductCategoryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PolyclinicProductCategory
        fields = ['name', 'parent']