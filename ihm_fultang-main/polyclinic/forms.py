from django.forms import ModelForm
from .models import MedicalStaff, Patient

class StaffForm (ModelForm):
    class Meta:
        model = MedicalStaff
        fields = ('username','first_name','last_name','gender',
                    'password','cniNumber','email','role')




class PatientForm(ModelForm):
    class Meta:
        model = Patient
        fields = "__all__"