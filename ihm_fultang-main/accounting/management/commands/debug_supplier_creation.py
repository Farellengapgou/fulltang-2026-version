from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounting.stock_serializers import SupplierSerializer
from rest_framework.request import Request
from django.test import RequestFactory

class Command(BaseCommand):
    help = 'Debug Supplier Creation'

    def handle(self, *args, **options):
        self.stdout.write("Starting Supplier Creation Debug...")
        try:
            # 1. Get a user
            User = get_user_model()
            user = User.objects.filter(is_superuser=True).first()
            if not user:
                user = User.objects.first()
            
            self.stdout.write(f"Using user: {user.username}")

            # 2. Mock Data
            data = {
                "code": "SUP-DEBUG-001",
                "name": "Debug Supplier",
                "supplier_type": "SUPPLIER",
                "email": "debug@test.com",
                "phone": "123456789",
                "address": "Debug Address",
                "payment_terms": 30,
                "is_active": True
            }

            # 3. Create Request Context
            factory = RequestFactory()
            wsgi_request = factory.post('/api/v1/material-accounting/suppliers/', data)
            wsgi_request.user = user
            
            # DRF Request wrapper is needed for context
            drf_request = Request(wsgi_request)

            # 4. Initialize Serializer
            serializer = SupplierSerializer(data=data, context={'request': drf_request})
            
            # 5. Validate
            if serializer.is_valid():
                self.stdout.write("Serializer is valid.")
                # 6. Save (This is where it likely crashes)
                supplier = serializer.save()
                self.stdout.write(f"Supplier created successfully: {supplier}")
                
                # Cleanup
                supplier.delete()
                self.stdout.write("Cleaned up debug supplier.")
            else:
                self.stdout.write(f"Validation Errors: {serializer.errors}")

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"CRASH DETECTED: {str(e)}"))
            import traceback
            traceback.print_exc()
