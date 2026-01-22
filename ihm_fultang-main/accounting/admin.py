from django.contrib import admin
from .models_financier import *

# Register your models here.
admin.site.register(BudgetExercise)
admin.site.register(Account)
admin.site.register(AccountState)
admin.site.register(FinancialOperation)
admin.site.register(Facture)