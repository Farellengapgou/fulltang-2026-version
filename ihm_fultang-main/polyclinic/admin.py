from django.contrib import admin
from mptt.admin import MPTTModelAdmin
from django.utils.translation import gettext_lazy as _
from .models import Patient, PatientAccess, Appointment, Parameters, ConsultationType, Consultation, MedicalFolder, MedicalFolderPage, Exam, ExamRequest, ExamResult, PolyclinicProductCategory, PolyclinicProduct, Bill, BillItem

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('firstName', 'lastName', 'gender', 'phoneNumber', 'email', 'condition', 'service', 'status')
    list_filter = ('gender', 'condition', 'service', 'status')
    search_fields = ('firstName', 'lastName', 'phoneNumber', 'email')
    ordering = ('firstName',)

    fieldsets = (
        (_('Informations personnelles'), {'fields': ('firstName', 'lastName', 'gender', 'birthDate', 'cniNumber', 'address', 'phoneNumber', 'email')}),
        (_('Informations médicales'), {'fields': ('condition', 'service', 'status')}),
        (_('Détails administratifs'), {'fields': ('idMedicalStaff', 'idMedicalFolder')}),
    )

@admin.register(PatientAccess)
class PatientAccessAdmin(admin.ModelAdmin):
    list_display = ('givenAt', 'lostAt', 'access', 'idPatient', 'idMedicalStaff')
    search_fields = ('idMedicalStaff__username', 'idPatient__username')
    ordering = ('givenAt',)

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('atDate', 'reason', 'state', 'status', 'idPatient', 'idMedicalStaff')
    list_filter = ('state', 'status')
    search_fields = ('reason', 'idPatient__firstName', 'idPatient__lastName')
    ordering = ('atDate',)

@admin.register(Parameters)
class ParametersAdmin(admin.ModelAdmin):
    list_display = ('weight', 'height', 'temperature', 'bloodPressure', 'heartRate')
    search_fields = ('idMedicalStaff__username',)
    ordering = ('addDate',)

@admin.register(ConsultationType)
class ConsultationTypeAdmin(admin.ModelAdmin):
    list_display = ('typeDoctor', 'price')
    ordering = ('typeDoctor',)

@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = ('consultationDate', 'consultationPrice', 'paymentStatus', 'state', 'statePatient')
    list_filter = ('paymentStatus', 'state', 'statePatient')
    ordering = ('consultationDate',)

@admin.register(MedicalFolder)
class MedicalFolderAdmin(admin.ModelAdmin):
    list_display = ('folderCode', 'isClosed', 'createDate', 'lastModificationDate')
    ordering = ('createDate',)

@admin.register(MedicalFolderPage)
class MedicalFolderPageAdmin(admin.ModelAdmin):
    list_display = ('pageNumber', 'addDate', 'nurseNote', 'doctorNote', 'diagnostic')
    ordering = ('addDate',)

@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ('examName', 'examCost')
    search_fields = ('examName',)
    ordering = ('examName',)

@admin.register(ExamRequest)
class ExamRequestAdmin(admin.ModelAdmin):
    list_display = ('examName', 'examStatus', 'patientStatus', 'idPatient', 'idMedicalStaff')
    list_filter = ('examStatus', 'patientStatus')
    ordering = ('addDate',)

@admin.register(ExamResult)
class ExamResultAdmin(admin.ModelAdmin):
    list_display = ('addDate', 'notes', 'examFile', 'idPatient', 'idMedicalStaff')
    ordering = ('addDate',)

@admin.register(PolyclinicProduct)
class PolyclinicProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'current_stock', 'min_stock_level', 'status')
    list_filter = ('category', 'status')
    search_fields = ('name', 'category__name')
    ordering = ('name',)

@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ('billCode', 'date', 'amount', 'operation', 'isAccounted', 'operator', 'patient')
    list_filter = ('date', 'operation', 'isAccounted', 'operator', 'patient')
    search_fields = ('date', 'isAccounted')
    ordering = ('date',)

@admin.register(BillItem)
class BillItemAdmin(admin.ModelAdmin):
    list_display = ('bill', 'medicament', 'consultation', 'hospitalisation', 'prescription', 'examRequest', 'quantity', 'unityPrice', 'total')
    list_filter = ('bill', 'medicament', 'quantity', 'unityPrice', 'total')
    search_fields = ('bill', 'unityPrice')
    ordering = ('total',)


class CustomMPTTModelAdmin(MPTTModelAdmin):
    # specify pixel amount for this ModelAdmin only:
    mptt_level_indent = 20

admin.site.register(PolyclinicProductCategory, CustomMPTTModelAdmin)

