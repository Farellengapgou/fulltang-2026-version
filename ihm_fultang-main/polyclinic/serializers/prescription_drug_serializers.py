from rest_framework import serializers
from polyclinic.models import PrescriptionDrug
from polyclinic.serializers.polyclinic_product_serializer import PolyclinicProductSerializer


class PrescriptionDrugSerializer(serializers.ModelSerializer):
    medicament = PolyclinicProductSerializer(read_only=True)
    quantity_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = PrescriptionDrug
        fields = '__all__'

    def get_quantity_remaining(self, obj):
        # Calculate quantity remaining: prescribed - sum(sold)
        # Assuming we have a way to track sales linked to this prescription_drug
        # In this simplified model, we might need to query the BillItems that reference this prescription and medicament
        from polyclinic.models import BillItem
        sold_count = 0
        bill_items = BillItem.objects.filter(prescription=obj.prescription, medicament=obj.medicament)
        for item in bill_items:
            # We assume BillItem has a quantity field
            sold_count += item.quantity
        
        remaining = obj.quantity - sold_count
        return max(remaining, 0)


class PrescriptionDrugCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrescriptionDrug
        exclude = ['id', 'prescription']

