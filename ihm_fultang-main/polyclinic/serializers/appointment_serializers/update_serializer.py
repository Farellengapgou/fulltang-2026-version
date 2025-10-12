from rest_framework.exceptions import ValidationError
from rest_framework import serializers
from polyclinic.models import Appointment, MedicalFolderPage
from django.forms.models import model_to_dict

from polyclinic.serializers.consultation_serializers import ConsultationCreateSerializer
from polyclinic.serializers.medical_folder_page_serializers import MedicalFolderPageCreateSerializer
from polyclinic.serializers.parameters_serializers import ParametersSerializer, ParametersCreateSerializer

class AppointmentUpdateSerializer(serializers.ModelSerializer):
    parameters = ParametersSerializer(required=False, many=False)

    class Meta:
        model = Appointment
        exclude = ['id']

    def update(self, instance, validated_data):
        parameters = validated_data.pop('parameters', None)
        # si le status de la consultaion associé n'est pas à Completed tous va bien
        print(instance)
        print(instance.idPatient.idMedicalFolder)
        if instance.idConsultation.state != "Completed":
            return super().update(instance, validated_data)
        else: # on va devoir creer une nouvelle  page, consultation et appointement
            # creation d'une nouvelle page
            medical_folder = instance.idPatient.idMedicalFolder
            if medical_folder is None:
                raise ValidationError({"details": "Medical folder of existing patient cannot be None"})
            number_folder_page = MedicalFolderPage.objects.filter(idMedicalFolder=medical_folder).count()
            data = {'idMedicalFolder': medical_folder.id,
                    'idMedicalStaff': instance.idMedicalStaff.id,
                    'pageNumber': number_folder_page + 1,
                    'automaticCreation': True}
            page_serializer = MedicalFolderPageCreateSerializer(data=data)
            page_serializer.is_valid(raise_exception=True)
            folder_page = page_serializer.save()

            # eventuels paramètres
            if parameters:
                parameters = model_to_dict(parameters)
                parameters['idMedicalFolderPage'] = folder_page.id
                params_serializer = ParametersCreateSerializer(data=parameters)
                params_serializer.is_valid(raise_exception=True)
                params_serializer.save()

            # creation de la consultation
            consultation_dict = model_to_dict(instance.idConsultation)
            consultation_dict['state'] = "InProgress"
            consultation_dict['idMedicalFolderPage'] = folder_page.id
            consultation_serializer = ConsultationCreateSerializer(data=consultation_dict)
            consultation_serializer.is_valid(raise_exception=True)
            consultation = consultation_serializer.save()

            # creation de l'appointment
            appointment_dict = model_to_dict(instance)

            #Fusionner avec les nouvelles données
            merged_data = {**appointment_dict, **validated_data}
            merged_data.pop('id', None)
            merged_data['idConsultation'] = consultation
            merged_data['status'] = "Not Payable"

            new_instance = self.Meta.model.objects.create(**merged_data)

            return new_instance
