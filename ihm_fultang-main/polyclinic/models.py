from django.db import models
from django.db.models.deletion import CASCADE
from datetime import timedelta
from django.utils.timezone import now
import uuid
from mptt.models import MPTTModel, TreeForeignKey
# Create your models here.

TYPEDOCTOR = [
    ('Specialist', 'Specialist'),
    ('Ophtalmologist', 'Ophtalmologist'),
    ('Dentist', 'Dentist'),
]

MessageType = [

    ('REPORT_PROBLEM', 'REPORT_PROBLEM'),
    ('HOSPITALISATION_REQUEST', 'HOSPITALISATION_REQUEST'),
    ('CONSULTATION_REQUEST', 'CONSULTATION_REQUEST'),
    ('ACCESS_REQUEST', 'ACCESS_REQUEST'),
    ('INFO', 'INFO'),

]

CONDITION = [
    ('NoCritical', 'NoCritical'),
    ('Critical', 'Critical'),
]

SEXE = [
    ('Male', 'Male'),
    ('Female', 'Female'),
]

SERVICE = [

    ('Generalist', 'Generalist'),
    ('Specialist', 'Specialist'),
    ('All', 'All'),

]

STATECONSULTATION = [
    ('InProgress', 'InProgress'),
    ('Completed', 'Completed'),
    ('Pending', 'Pending'),
]

STATUT_PAIEMENT_CONSULTATION = [
    ('Invalid', 'Invalid'),
    ('Valid', 'Valid'),
]

STATEPATIENT = [
    ("Critical", "Critical"),
    ("Not Critical", "Not Critical"),
    ("Serious", "Serious"),
    ("Stable", "Stable"),
    ("Inprouving", "Inprouving"),
]

ROOM_TYPES = [
    ("Simple", "Simple"),
    ("Emergency", "Emergency"),
    ("Staff", "Staff"),
]

ROOM_FACILITIES = [
    ("Television", "Television"),
    ("Air Conditioning", "Air Conditioning"),
    ("Private bathroom", "Private bathroom"),
    ("Mini fridge", "Mini fridge"),
]

APPOINTMENT_STATUS = [
    ("Not Payable", "Not Payable"),   # n'a pas eu lieu
    ("Payable", "Payable"),
]

APPOINTMENT_STATE = [
    ("Pending", "Pending"),
    ("Completed", "Completed"),
]

STATUS_PRODUCT_CHOICES = [
        ('Available', 'Available'),
        ('Out of Stock', 'Out of Stock'),
        ('Discontinued', 'Discontinued'),
        ('Expiring Soon', 'Expiring Soon'),
    ]

# ======================================
# ======================================== APPOINTMENT DEPARTMENT, PATIENT
# ======================================


# cette classe définie les départements
class Department(models.Model):
    name = models.CharField(max_length=50, blank=True)
    reference = models.CharField(max_length=10, null=True)

    def __str__(self):
        return self.reference


####### Il y'a à faire par rapport à ce model, il faut mettre l'acces d'un objet à jour dans la BD en fonction des dates #########"
class PatientAccess(models.Model):
    givenAt = models.DateTimeField(auto_now_add=True, blank=True)
    lostAt = models.DateTimeField(blank=True)

    access = models.BooleanField(default=True)

    idPatient = models.ForeignKey("Patient", on_delete=models.CASCADE, null=False)
    idMedicalStaff = models.ForeignKey("authentication.MedicalStaff", on_delete=models.CASCADE, null=False)


# classe qui definie le patient
class Patient(models.Model):
    addDate = models.DateTimeField(auto_now_add=True, blank=True)
    cniNumber = models.CharField(max_length=255, blank=True, null=True)  # The patient CNI
    firstName = models.CharField(max_length=255, blank=True)
    lastName = models.CharField(max_length=255, blank=True, default=" ")
    gender = models.CharField(max_length=255, choices=SEXE, default='Male', blank=True)  # The patient gender (M, F)
    phoneNumber = models.CharField(max_length=255, blank=True, default=" ")
    birthDate = models.DateField(blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, default=" ")
    email = models.CharField(max_length=255, blank=True, null=True)
    condition = models.CharField(max_length=255, choices=CONDITION, default='NoCritical', null=True)
    service = models.CharField(max_length=50, choices=SERVICE, default='Generalist', null=True)
    status = models.CharField(max_length=20, default="invalid")  # The patient status

    # l'id du medical staff qui a créé le patient
    idMedicalStaff = models.ForeignKey(
        "authentication.MedicalStaff",
        on_delete=models.DO_NOTHING,
        null=False,
    )
    idMedicalFolder = models.OneToOneField("MedicalFolder", on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.firstName.__str__()


class Appointment(models.Model):
    atDate = models.DateTimeField(auto_now_add=False)
    reason = models.CharField(max_length=300, blank=True, null=True)
    requirements = models.CharField(max_length=500, blank=True, null=True)
    state = models.CharField(max_length=200, choices=APPOINTMENT_STATE, default='Pending')
    status = models.CharField(max_length=200, choices=APPOINTMENT_STATUS, default='Not Payable')

    idConsultation = models.ForeignKey("Consultation", on_delete=models.CASCADE, null=False)
    idPatient = models.ForeignKey("Patient", on_delete=models.CASCADE, null=False)
    idMedicalStaff = models.ForeignKey("authentication.MedicalStaff", on_delete=models.CASCADE, null=False)


# ======================================
# ======================================== PARAMETERS, APPOINTMENT, CONSULTATION, MEDICALFOLDER
# ======================================

class Parameters(models.Model):
    weight = models.FloatField(blank=True, null=True)
    height = models.FloatField(blank=True, null=True)
    temperature = models.FloatField(blank=True, null=True)
    bloodPressure = models.CharField(blank=True, null=True, max_length=255)
    heartRate = models.FloatField(blank=True, null=True)
    chronicalDiseases = models.TextField(blank=True, null=True)
    allergies = models.TextField(blank=True, null=True)
    surgeries = models.TextField(blank=True, null=True)
    currentMedication = models.TextField(blank=True, null=True)
    familyMedicalHistory = models.TextField(blank=True, null=True)
    skinAppearance = models.CharField(max_length=255, blank=True, null=True)
    addDate = models.DateTimeField(auto_now_add=True)

    idMedicalFolderPage = models.OneToOneField("MedicalFolderPage", on_delete=models.DO_NOTHING, null=True)
    idMedicalStaff = models.ForeignKey("authentication.MedicalStaff", on_delete=models.CASCADE, null=False)


class ConsultationType(models.Model):
    typeDoctor = models.CharField(max_length=100, choices=TYPEDOCTOR, default='Specialist')
    price = models.FloatField(default=0.0)


class Consultation(models.Model):
    consultationDate = models.DateTimeField(auto_now_add=True)
    consultationPrice = models.FloatField(default=5000)
    consultationReason = models.CharField(max_length=100, blank=True, null=True)
    consultationNotes = models.TextField(blank=True, null=True, max_length=100000)
    paymentStatus = models.CharField(max_length=100, choices=STATUT_PAIEMENT_CONSULTATION, default="Invalid")
    state = models.CharField(max_length=100, choices=STATECONSULTATION, default="Pending")
    statePatient = models.CharField(max_length=100, choices=STATEPATIENT, default="Not Critical")

    idMedicalFolderPage = models.OneToOneField("MedicalFolderPage", on_delete=models.CASCADE, null=False)
    idPatient = models.ForeignKey("Patient", on_delete=models.CASCADE, null=False)
    idMedicalStaffSender = models.ForeignKey("authentication.MedicalStaff", on_delete=models.CASCADE, null=False, related_name="consultation_send")  # celui qui envoi vers celui qui va faire la consultation
    idMedicalStaffGiver = models.ForeignKey("authentication.MedicalStaff", on_delete=models.CASCADE, null=False, related_name="consultation_give")   # celui qui va effectuer la consultation
    idConsultationType = models.ForeignKey("ConsultationType", on_delete=models.CASCADE, null=True)

    def __str__(self):
        return f"{self.idPatient.__str__()} par {self.idMedicalStaffGiver.__str__()}"

    def save(self, *args, **kwargs):
        giverRole = self.idMedicalStaffGiver.role
        consultation_type = ConsultationType.objects.filter(typeDoctor=giverRole).first()
        if consultation_type:
            self.idConsultationType = consultation_type
            self.consultationPrice = consultation_type.price
        super().save(*args, **kwargs)


class MedicalFolder(models.Model):
    createDate = models.DateTimeField(auto_now_add=True)
    lastModificationDate = models.DateTimeField(auto_now=True)
    folderCode = models.CharField(max_length=300)
    isClosed = models.BooleanField()


class MedicalFolderPage(models.Model):
    pageNumber = models.IntegerField()
    addDate = models.DateTimeField(auto_now_add=True)
    nurseNote = models.TextField(max_length=10000, blank=True, null=True)
    doctorNote = models.TextField(max_length=10000, blank=True, null=True)
    diagnostic = models.TextField(max_length=10000, blank=True, null=True)


    idMedicalFolder = models.ForeignKey("MedicalFolder", on_delete=models.CASCADE, null=True)
    idMedicalStaff = models.ForeignKey("authentication.MedicalStaff", on_delete=models.CASCADE, null=False, default=1)


# ======================================
# ======================================== EXAM
# ======================================


class Exam(models.Model):
    examName = models.CharField(max_length=100)
    examCost = models.FloatField()
    examDescription = models.TextField(max_length=23, blank=True, null=True)
    def __str__(self) -> str:
        return self.examName.__str__()


class ExamRequest(models.Model):
    addDate = models.DateTimeField(auto_now_add=True)
    examName = models.CharField(max_length=50, null=True, blank=True)
    examStatus = models.CharField(max_length=20, default="Invalid")
    patientStatus = models.CharField(max_length=20, choices=STATUT_PAIEMENT_CONSULTATION, default="Invalid")
    notes = models.TextField(max_length=10000, blank=True, null=True)

    idExam = models.ForeignKey("Exam", on_delete=models.SET_NULL, null=True)
    idConsultation = models.ForeignKey("Consultation", on_delete=models.CASCADE, null=True)
    idPatient = models.ForeignKey("Patient", on_delete=models.CASCADE, null=False)
    idMedicalStaff = models.ForeignKey("authentication.MedicalStaff", on_delete=models.CASCADE, null=False)

    def __str__(self):
        return str(self.idPatient) + ' ' + str(self.ExamDescription)


class ExamResult(models.Model):
    addDate = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(max_length=10000, blank=True, null=True)
    examFile = models.FileField(upload_to="exam_results/", blank=True, null=True)


    idExamRequest = models.ForeignKey("ExamRequest", on_delete=models.CASCADE, null=False)
    idMedicalFolderPage = models.ForeignKey("MedicalFolderPage", on_delete=models.CASCADE, null=False)
    idPatient = models.ForeignKey("Patient", on_delete=models.CASCADE, null=False)
    idMedicalStaff = models.ForeignKey("authentication.MedicalStaff", on_delete=models.CASCADE, null=False)

    def __str__(self):
        return str(self.idPatient) + ' ' + str(self.ExamDescription)


# ======================================
# ======================================== PRDOUIT DE L'HOPITAL, PRESCRIPTION, ROOM, HOSPITALISATION
# ======================================

class PolyclinicProductCategory(MPTTModel):
    name = models.CharField(max_length=255, null = False, blank = False)
    description = models.TextField(max_length=500, blank=True, null=True)
    parent = TreeForeignKey('self', on_delete=models.CASCADE, blank=False, null=True, related_name='children')
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [['name', 'parent'], ]
        verbose_name_plural = "PolyclinicProductCategories"

    def __str__(self):
        return self.name


class PolyclinicProduct(models.Model):

    category = models.ForeignKey('PolyclinicProductCategory', on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=100)
    generic_name = models.CharField(max_length=100, blank=True, null=True)
    brand = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(max_length=500, blank=True, null=True)
    price = models.FloatField(default=0.0)
    current_stock = models.IntegerField(default=0)
    min_stock_level = models.IntegerField(default=5)  # For low stock alerts
    status = models.CharField(max_length=20, choices=STATUS_PRODUCT_CHOICES, default='Available')
    requires_prescription = models.BooleanField(default=False)
    expiry_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Additional fields for medications specifically
    is_medication = models.BooleanField(default=False)
    dosage = models.CharField(max_length=100, blank=True, null=True)  # e.g., "500mg"
    form = models.CharField(max_length=50, blank=True, null=True)  # e.g., "tablet", "liquid", etc.

    def __str__(self):
        return f"{self.name} ({self.category.name})"

    def is_low_stock(self):
        return self.current_stock <= self.min_stock_level


class PolyclinicInventoryMovement(models.Model):
    MOVEMENT_TYPES = [
        ('purchase', 'Purchase'),
        ('sale', 'Sale'),
        ('return', 'Return'),
        ('adjustment', 'Adjustment'),
        ('expired', 'Expired'),
    ]

    product = models.ForeignKey('PolyclinicProduct', on_delete=models.CASCADE, related_name='movements')
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity = models.IntegerField()  # Positive for additions, negative for removals
    date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    # Reference to related entities
    prescription = models.ForeignKey('Prescription', on_delete=models.SET_NULL, null=True, blank=True)
    bill = models.ForeignKey('Bill', on_delete=models.SET_NULL, null=True, blank=True)
    staff = models.ForeignKey('authentication.MedicalStaff', on_delete=models.CASCADE)

    def __str__(self):
        movement = "added" if self.quantity > 0 else "removed"
        return f"{abs(self.quantity)} of {self.product.name} {movement} on {self.date.strftime('%Y-%m-%d')}"

    def save(self, *args, **kwargs):
        # Calculate total price if not provided
        if not self.total_price:
            self.total_price = self.quantity * self.unit_price

        # Update product stock
        self.product.current_stock += self.quantity
        self.product.save()

        super().save(*args, **kwargs)

class Prescription(models.Model):
    addDate = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True, null=True)

    idPatient = models.ForeignKey("Patient", on_delete=models.CASCADE, null=False)
    idConsultation = models.ForeignKey("Consultation", on_delete=models.CASCADE, null=True)
    idMedicalStaff = models.ForeignKey("authentication.MedicalStaff", on_delete=models.CASCADE, null=False)

    def __str__(self):
        return self.note.__str__() + " " + self.idPatient.__str__() + " " + self.idMedicalStaff.__str__()

class PrescriptionDrug(models.Model):
    medicament = models.ForeignKey("polyclinic.PolyclinicProduct", on_delete=models.CASCADE, null=False)
    quantity = models.IntegerField(default=1)
    prescription = models.ForeignKey("polyclinic.Prescription", on_delete=models.CASCADE, null=False)
    dosage = models.CharField(max_length=255, null=False, default=" ")
    instructions = models.CharField(max_length=255, null=False, default=" ")
    frequency = models.CharField(max_length=255, null=False, default=" ")
    duration = models.CharField(max_length=255, null=False, default=" ")




class Room(models.Model):
    roomLabel = models.CharField(max_length=100)
    beds = models.PositiveIntegerField(default = 1)
    busyBeds = models.IntegerField(default = 0)
    price = models.FloatField(default=2000)
    type = models.CharField(max_length=255, choices=ROOM_TYPES, default="Simple")
    facilities = models.CharField(max_length=255, choices=ROOM_FACILITIES, default="Private Bathroom")

class Hospitalisation(models.Model):
    atDate = models.DateTimeField(auto_now_add=True)
    bedLabel = models.CharField(max_length=100)
    note = models.TextField(blank=True, null=True)
    isActive = models.BooleanField(default=True)
    paymentStatus = models.CharField(max_length=20, choices=STATUT_PAIEMENT_CONSULTATION, default="Invalid")
    removeAt = models.DateTimeField(auto_now_add=True)

    idRoom = models.ForeignKey("Room", on_delete=models.CASCADE, null=False)
    idPatient = models.ForeignKey("Patient", on_delete=models.CASCADE, null=False)
    idMedicalStaff = models.ForeignKey("authentication.MedicalStaff", on_delete=models.CASCADE, null=False)


# La classe pour la facture
class Bill(models.Model):
    billCode = models.CharField(max_length=355)
    date = models.DateTimeField(auto_now_add=True)
    amount = models.FloatField(default=0.0)
    operation = models.ForeignKey('accounting.FinancialOperation', on_delete=CASCADE, null=False)
    isAccounted = models.BooleanField(default=False)
    operator = models.ForeignKey("authentication.MedicalStaff", on_delete=CASCADE, null=False)
    patient = models.ForeignKey('polyclinic.Patient', on_delete=models.CASCADE, null=True)

    def generate_bill_code(self):
        today = now().strftime('%Y%m%d')  # Format : YYYYMMDD
        operation_code = self.operation.id if self.operation else "000"  # ID de l'opération
        unique_id = str(uuid.uuid4().hex[:6]).upper()  # ID aléatoire pour éviter les collisions

        return f"{today}-{operation_code}-{self.operator.cniNumber}-{unique_id}"

    def create_accounting_entry(self):
        """Génère automatiquement l'écriture comptable pour la facture"""
        return AccountingService.create_consultation_entry(self.consultation)
    
    def record_payment(self, amount, method='CASH'):
        """Enregistre un paiement sur la facture"""
        return AccountingService.create_payment_entry(self, amount, method)

    def save(self, *args, **kwargs):
        if not self.billCode:  # Génère un billCode uniquement s'il n'existe pas encore
            self.billCode = self.generate_bill_code()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Bill {self.billCode} - {self.amount}FCFA"

class BillItem(models.Model):
    bill = models.ForeignKey('polyclinic.Bill', on_delete=models.CASCADE, null=False)
    medicament = models.ForeignKey("polyclinic.PolyclinicProduct", on_delete=models.SET_NULL, null=True)
    consultation = models.ForeignKey('polyclinic.Consultation', on_delete=models.SET_NULL, null=True)
    hospitalisation = models.ForeignKey('polyclinic.Hospitalisation', on_delete=models.SET_NULL, null=True)
    prescription = models.ForeignKey('polyclinic.Prescription', on_delete=models.SET_NULL, null=True)
    examRequest = models.ForeignKey('polyclinic.ExamRequest', on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=0)
    unityPrice = models.FloatField(default=0)
    designation = models.CharField(max_length=255)
    description = models.CharField(max_length=255, null=True, blank=True)
    total = models.FloatField(default=0)

# ======================================
# ======================================== I DON'T NO
# ======================================
#
# class Drog(models.Model):
#     medecineName = models.CharField(max_length=100)
#     medecineCoast = models.FloatField()


class Message(models.Model):
    addAt = models.DateTimeField(auto_now_add=True)
    message = models.TextField()
    reason = models.TextField()
    messageType = models.CharField(max_length=30, choices=MessageType, default='INFO')

    idMedicalStaff = models.ForeignKey("authentication.MedicalStaff", on_delete=models.CASCADE, null=False)

    def __str__(self):
        return self.messageType.__str__() + " " + self.idMedicalStaff.__str__()
