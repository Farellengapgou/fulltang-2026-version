from django.core.management.base import BaseCommand
from django.test import RequestFactory
from django.contrib.auth import get_user_model
from accounting.api_views.stock_api_views.dashboard_api_view import MaterialDashboardAPIView

class Command(BaseCommand):
    help = 'Debug Dashboard View Execution'

    def handle(self, *args, **options):
        self.stdout.write("Simulating Dashboard View Request...")
        try:
            # 1. Get a user
            User = get_user_model()
            user = User.objects.filter(is_superuser=True).first()
            if not user:
                user = User.objects.first()
            if not user:
                self.stdout.write("No user found to simulate request!")
                return

            self.stdout.write(f"Using user: {user.username}")

            # 2. Create Request
            factory = RequestFactory()
            request = factory.get('/api/v1/material-accounting/dashboard/overview/')
            request.user = user

            # 3. Instantiate View
            view = MaterialDashboardAPIView.as_view()
            
            # 4. Execute
            response = view(request)
            
            self.stdout.write(f"Response Status: {response.status_code}")
            if response.status_code != 200:
                self.stdout.write(f"Response Content: {response.data}")
            else:
                self.stdout.write("View executed successfully!")

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Exception during view execution: {str(e)}"))
            import traceback
            traceback.print_exc()
