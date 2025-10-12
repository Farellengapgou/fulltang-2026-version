from rest_framework import serializers
from polyclinic.models import Parameters, MedicalFolderPage


class ParametersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parameters
        fields = '__all__'

class ParametersCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parameters
        exclude = ['id']


    def create(self, validated_data):
        medical_page = validated_data['idMedicalFolderPage']
        medical_page = MedicalFolderPage.objects.filter(pk=medical_page.id).first()
        if medical_page:
            parameter = Parameters.objects.filter(idMedicalFolderPage=medical_page.id).first()
            if parameter:  # si il y'a déjà un paramètre dans la page alors on fait une mise à jour
                for key, value in self.validated_data.items():
                    setattr(parameter, key, value)
                parameter.save()
                return parameter
            return super().create(self.validated_data)

        else:
            raise serializers.ValidationError('Medical Folder Page does not exist')

