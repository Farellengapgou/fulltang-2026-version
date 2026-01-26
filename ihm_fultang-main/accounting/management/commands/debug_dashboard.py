from django.core.management.base import BaseCommand
from django.db.models import Sum, F, Count
from django.utils import timezone
from datetime import timedelta
from accounting.stock_models import Stock, Article, Batch, StockMovement, Depot, Category

class Command(BaseCommand):
    help = 'Debug Dashboard Logic'

    def handle(self, *args, **options):
        self.stdout.write("Starting Dashboard Logic Debug...")
        try:
            today = timezone.now()
            first_day_of_month = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            
            # 1. Total Stock Value
            self.stdout.write("Checking Total Stock Value...")
            total_stock_value = Stock.objects.annotate(
                item_value=F('physical_quantity') * F('article__weighted_average_price')
            ).aggregate(total=Sum('item_value'))['total'] or 0
            self.stdout.write(f"Total Stock Value: {total_stock_value}")

            # 2. Total Articles
            self.stdout.write("Checking Total Articles...")
            total_articles = Article.objects.filter(is_active=True).count()
            self.stdout.write(f"Total Articles: {total_articles}")

            # 3. Movements
            self.stdout.write("Checking Movements...")
            movements_count = StockMovement.objects.filter(
                operation_date__gte=first_day_of_month,
                status='CONFIRMED'
            ).count()
            self.stdout.write(f"Movements: {movements_count}")

            # 4. Alerts
            self.stdout.write("Checking Alerts...")
            low_stock_qs = Stock.objects.filter(
                physical_quantity__lte=F('article__minimum_stock'),
                physical_quantity__gt=0
            )
            count_low = low_stock_qs.count() # Force evaluation
            self.stdout.write(f"Low Stock: {count_low}")
            
            out_of_stock_count = Stock.objects.filter(physical_quantity=0).count()
            self.stdout.write(f"Out of Stock: {out_of_stock_count}")

            expiring_soon_count = Batch.objects.filter(
                expiry_date__lte=today.date() + timedelta(days=30),
                expiry_date__gt=today.date(),
                remaining_quantity__gt=0
            ).count()
            self.stdout.write(f"Expiring Soon: {expiring_soon_count}")

            # 6. Stock by Warehouse
            self.stdout.write("Checking Stock by Warehouse...")
            depots = Depot.objects.filter(is_active=True)
            for depot in depots:
                val = depot.stocks.annotate(
                    item_value=F('physical_quantity') * F('article__weighted_average_price')
                ).aggregate(total=Sum('item_value'))['total'] or 0
                self.stdout.write(f"Depot {depot.name}: {val}")

            # 7. Stock by Category
            self.stdout.write("Checking Stock by Category...")
            categories = Category.objects.all()
            for cat in categories:
                val = Stock.objects.filter(article__category=cat).annotate(
                    item_value=F('physical_quantity') * F('article__weighted_average_price')
                ).aggregate(total=Sum('item_value'))['total'] or 0
                self.stdout.write(f"Category {cat.name}: {val}")

            # 8. Top Consuming
            self.stdout.write("Checking Top Consuming...")
            top_consuming = StockMovement.objects.filter(
                movement_type='OUT',
                operation_date__gte=first_day_of_month,
                status='CONFIRMED'
            ).values('article__name').annotate(
                value=Sum('total_value')
            ).order_by('-value')[:5]
            
            for item in top_consuming:
                self.stdout.write(f"Item: {item}")

            # 9. Expiring Batches
            self.stdout.write("Checking Expiring Batches...")
            expiring_batches = Batch.objects.filter(
                expiry_date__lte=today.date() + timedelta(days=90),
                remaining_quantity__gt=0
            ).order_by('expiry_date')[:10]
            for b in expiring_batches:
                self.stdout.write(f"Batch: {b}")

            self.stdout.write(self.style.SUCCESS("All checks passed successfully!"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error occurred: {str(e)}"))
            import traceback
            traceback.print_exc()
