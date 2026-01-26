from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, F, Count
from django.utils import timezone
from datetime import timedelta
from accounting.permissions.accounting_staff_permissions import AccountingStaffPermission
from accounting.stock_models import Stock, Article, Batch, StockMovement, Depot
from accounting.stock_serializers import StockMovementSerializer

class MaterialDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        today = timezone.now()
        first_day_of_month = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        total_stock_value = Stock.objects.annotate(
            item_value=F('physical_quantity') * F('article__weighted_average_price')
        ).aggregate(total=Sum('item_value'))['total'] or 0

        # 2. Nombre total d'articles actifs
        total_articles = Article.objects.filter(is_active=True).count()

        # 3. Mouvements ce mois-ci
        movements_count = StockMovement.objects.filter(
            operation_date__gte=first_day_of_month,
            status='CONFIRMED'
        ).count()

        # 4. Alertes (Stock bas + Péremption)
        low_stock_qs = Stock.objects.filter(
            physical_quantity__lte=F('article__minimum_stock'),
            physical_quantity__gt=0
        )
        out_of_stock_count = Stock.objects.filter(physical_quantity=0).count()
        
        # Batches expirant dans 30 jours
        expiring_soon_count = Batch.objects.filter(
            expiry_date__lte=today.date() + timedelta(days=30),
            expiry_date__gt=today.date(),
            remaining_quantity__gt=0
        ).count()

        # 5. Mouvements récents
        recent_movements = StockMovement.objects.filter(status='CONFIRMED').order_by('-operation_date')[:5]
        
        # 6. Stock par dépôt
        stock_by_warehouse = []
        depots = Depot.objects.filter(is_active=True)
        for depot in depots:
            val = depot.stocks.annotate(
                item_value=F('physical_quantity') * F('article__weighted_average_price')
            ).aggregate(total=Sum('item_value'))['total'] or 0
            stock_by_warehouse.append({
                "name": depot.name,
                "value": float(val),
                "article_count": depot.stocks.filter(physical_quantity__gt=0).count()
            })

        # 7. Stock par catégorie
        from accounting.stock_models import Category
        stock_by_category = []
        categories = Category.objects.all()
        for cat in categories:
            val = Stock.objects.filter(article__category=cat).annotate(
                item_value=F('physical_quantity') * F('article__weighted_average_price')
            ).aggregate(total=Sum('item_value'))['total'] or 0
            if val > 0:
                stock_by_category.append({
                    "name": cat.name,
                    "value": float(val)
                })

        # 8. Top consommations (Articles les plus sortis ce mois-ci)
        top_consuming = StockMovement.objects.filter(
            movement_type='OUT',
            operation_date__gte=first_day_of_month,
            status='CONFIRMED'
        ).values('article__name').annotate(
            value=Sum('total_value')
        ).order_by('-value')[:5]

        # 9. Lots expirant bientôt (90 jours)
        expiring_batches = Batch.objects.filter(
            expiry_date__lte=today.date() + timedelta(days=90),
            remaining_quantity__gt=0
        ).order_by('expiry_date')[:10]

        data = {
            "total_stock_value": float(total_stock_value),
            "total_articles": total_articles,
            "movements_this_month": movements_count,
            "alerts_count": low_stock_qs.count() + out_of_stock_count + expiring_soon_count,
            "low_stock_count": low_stock_qs.count(),
            "out_of_stock_count": out_of_stock_count,
            "expiring_soon_count": expiring_soon_count,
            "recent_movements": [
                {
                    "number": m.movement_number,
                    "type": m.movement_type,
                    "article": {"name": m.article.name},
                    "source_warehouse": {"name": m.source_depot.name} if m.source_depot else None,
                    "destination_warehouse": {"name": m.destination_depot.name} if m.destination_depot else None,
                    "quantity": float(m.quantity),
                    "total_value": float(m.total_value),
                    "date": m.operation_date,
                    "status": m.status
                } for m in recent_movements
            ],
            "stock_by_warehouse": stock_by_warehouse,
            "stock_by_category": stock_by_category,
            "top_consuming_articles": [
                {
                    "article": item["article__name"],
                    "value": float(item["value"] or 0)
                } for item in top_consuming
            ],
            "expiring_batches": [
                {
                    "batch_number": b.batch_number,
                    "article": b.article.name,
                    "expiry_date": b.expiry_date,
                    "remaining_quantity": float(b.remaining_quantity),
                    "days_until_expiry": (b.expiry_date - today.date()).days if b.expiry_date else None
                } for b in expiring_batches
            ]
        }

        return Response(data)
