from rest_framework.exceptions import ValidationError
from rest_framework import serializers
from polyclinic.models import Appointment, Consultation, MedicalFolder, MedicalFolderPage

class AppointmentCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['idConsultation', 'status']  # Ces champs sont générés automatiquement

    def create(self, validated_data):
        patient = validated_data["idPatient"]
        medical_staff = validated_data["idMedicalStaff"]
        
        # 🔹 Récupérer ou créer le dossier médical du patient
        medical_folder = patient.idMedicalFolder
        if not medical_folder:
            # Créer un nouveau dossier médical si le patient n'en a pas
            medical_folder = MedicalFolder.objects.create(
                folderCode=f"MF-{patient.id}-{patient.firstName}",
                isClosed=False
            )
            patient.idMedicalFolder = medical_folder
            patient.save()
        
        # 🔹 Créer une nouvelle page de dossier médical
        last_page = MedicalFolderPage.objects.filter(
            idMedicalFolder=medical_folder
        ).order_by('-pageNumber').first()
        
        next_page_number = (last_page.pageNumber + 1) if last_page else 1
        
        medical_folder_page = MedicalFolderPage.objects.create(
            pageNumber=next_page_number,
            idMedicalFolder=medical_folder,
            idMedicalStaff=medical_staff
        )
        
        # 🔹 Créer automatiquement la consultation avec tous les champs requis
        consultation = Consultation.objects.create(
            idPatient=patient,
            idMedicalStaffSender=medical_staff,  # Celui qui crée le rendez-vous
            idMedicalStaffGiver=medical_staff,   # Celui qui va effectuer la consultation
            idMedicalFolderPage=medical_folder_page,
            consultationReason=validated_data.get("reason", "")
        )

        # 🔹 Créer l'appointment avec la consultation générée
        appointment = Appointment.objects.create(
            idConsultation=consultation,
            **validated_data
        )

        return appointment