from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate
from accounting.api_views.stock_api_views.supplier_api_view import SupplierViewSet

class Command(BaseCommand):
    help = 'Debug Supplier List'

    def handle(self, *args, **options):
        self.stdout.write("Starting Supplier List Debug...")
        try:
            # 1. Get a user
            User = get_user_model()
            user = User.objects.filter(is_superuser=True).first()
            
            # 2. Create Request
            factory = APIRequestFactory()
            request = factory.get('/api/v1/material-accounting/suppliers/')
            force_authenticate(request, user=user)

            # 3. Execute View
            view = SupplierViewSet.as_view({'get': 'list'})
            response = view(request)
            
            self.stdout.write(f"Response Status: {response.status_code}")
            if response.status_code != 200:
                self.stdout.write("Error detected!")
                # If it's a DRF response, it might have data
                if hasattr(response, 'data'):
                     self.stdout.write(f"Data: {response.data}")
            else:
                self.stdout.write("List success. First 2 items:")
                self.stdout.write(str(response.data[:2]))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"CRASH DETECTED: {str(e)}"))
            import traceback
            traceback.print_exc()
