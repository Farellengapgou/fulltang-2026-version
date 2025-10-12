from rest_framework import serializers
from polyclinic.models import MedicalFolder
from polyclinic.serializers.medical_folder_page_serializers import MedicalFolderPageSerializer

class MedicalFolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalFolder
        fields = '__all__'

class MedicalFolderDetailsSerializer(serializers.ModelSerializer):
    pages = MedicalFolderPageSerializer(source='medicalfolderpage_set', many=True)
    class Meta:
        model = MedicalFolder
        fields = ['id', 'createDate', 'lastModificationDate', 'folderCode', 'isClosed', 'pages']