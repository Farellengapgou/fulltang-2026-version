from rest_framework import serializers
from polyclinic.models import Department

class DepartementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'