from rest_framework import serializers
from polyclinic.models import Exam

class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = '__all__'


class ExamCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        exclude = ['id']