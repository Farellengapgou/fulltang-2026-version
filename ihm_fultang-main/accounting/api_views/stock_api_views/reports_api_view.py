from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.decorators import method_decorator

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounting.permissions.accounting_staff_permissions import AccountingStaffPermission

tags = ["report"]

auth_header_param = openapi.Parameter(
    name="Authorization",
    in_=openapi.IN_HEADER,
    description="JWT Bearer Token",
    type=openapi.TYPE_STRING,
    required=True
)

date_from_param = openapi.Parameter(
    "date_from",
    openapi.IN_QUERY,
    type=openapi.TYPE_STRING,
    format="date",
    description="Date de début (YYYY-MM-DD)"
)

date_to_param = openapi.Parameter(
    "date_to",
    openapi.IN_QUERY,
    type=openapi.TYPE_STRING,
    format="date",
    description="Date de fin (YYYY-MM-DD)"
)

@method_decorator(
    swagger_auto_schema(
        operation_summary="État des stocks",
        operation_description=(
            "Retourne l’état actuel des stocks par article et dépôt.\n\n"
            "Filtres possibles :\n"
            "- `article_id`\n"
            "- `depot_id`"
        ),
        manual_parameters=[auth_header_param],
        tags=tags
    ),
    name="get"
)
class StockStatusReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        from accounting.stock_models import Stock
        from django.db.models import F

        stocks = Stock.objects.select_related("article", "depot", "article__category").all()
        
        # Filtres
        article_id = request.query_params.get("article_id")
        depot_id = request.query_params.get("depot_id")
        if article_id:
            stocks = stocks.filter(article_id=article_id)
        if depot_id:
            stocks = stocks.filter(depot_id=depot_id)

        data = []
        for s in stocks:
            data.append({
                "article_code": s.article.code,
                "article_name": s.article.name,
                "category": s.article.category.name if s.article.category else "N/A",
                "depot": s.depot.name,
                "physical_quantity": float(s.physical_quantity),
                "theoretical_quantity": float(s.theoretical_quantity),
                "reserved_quantity": float(s.reserved_quantity),
                "available_quantity": float(s.available_quantity),
                "unit": s.article.unit or "U",
                "updated_at": s.updated_at.isoformat() if s.updated_at else None
            })
            
        return Response(data)

@method_decorator(
    swagger_auto_schema(
        operation_summary="Valorisation des stocks",
        operation_description=(
            "Valorisation des stocks selon la méthode du PMP "
            "(Prix Moyen Pondéré – conforme OHADA)."
        ),
        manual_parameters=[auth_header_param],
        tags=tags
    ),
    name="get"
)
class StockValuationReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        from accounting.stock_models import Stock
        from django.db.models import Sum, F

        stocks = Stock.objects.select_related("article", "depot").filter(physical_quantity__gt=0)
        
        data = []
        total_global_value = 0
        
        for s in stocks:
            val = float(s.physical_quantity * s.article.weighted_average_price)
            data.append({
                "article_code": s.article.code,
                "article_name": s.article.name,
                "depot": s.depot.name,
                "physical_quantity": float(s.physical_quantity),
                "unit_price_pmp": float(s.article.weighted_average_price),
                "total_value": val,
                "currency": "XAF"
            })
            total_global_value += val
            
        return Response({
            "report_name": "Valorisation des Stocks (PMP)",
            "total_value": total_global_value,
            "items": data
        })

@method_decorator(
    swagger_auto_schema(
        operation_summary="Ancienneté des stocks",
        operation_description="Répartition des stocks par tranche d’ancienneté.",
        manual_parameters=[auth_header_param],
        tags=tags
    ),
    name="get"
)
class StockAgingReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        data = []
        return Response(data)

@method_decorator(
    swagger_auto_schema(
        operation_summary="Résumé des mouvements",
        operation_description="Synthèse des entrées et sorties de stock.",
        manual_parameters=[auth_header_param, date_from_param, date_to_param],
        tags=tags
    ),
    name="get"
)
class MovementsSummaryReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        from accounting.stock_models import StockMovement
        from django.db.models import Sum
        
        qs = StockMovement.objects.all()
        
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")
        
        if date_from:
            qs = qs.filter(operation_date__date__gte=date_from)
        if date_to:
            qs = qs.filter(operation_date__date__lte=date_to)
            
        summary = qs.values("article__code", "article__name", "movement_type", "movement_reason").annotate(
            total_quantity=Sum("quantity"),
            total_value=Sum("total_value")
        ).order_by("article__code")
        
        return Response(summary)

@method_decorator(
    swagger_auto_schema(
        operation_summary="Analyse de consommation",
        operation_description="Analyse de la consommation par article ou service.",
        manual_parameters=[auth_header_param, date_from_param, date_to_param],
        tags=tags
    ),
    name="get"
)
class ConsumptionAnalysisReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        from accounting.stock_models import StockMovement, Article
        from django.db.models import Sum, Q
        
        # 1. Get all active articles
        articles = Article.objects.filter(is_active=True)
        
        # 2. Filter movements (Only confirmed exits)
        qs = StockMovement.objects.filter(movement_type="OUT", status="CONFIRMED")
        
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")
        
        if date_from:
            qs = qs.filter(operation_date__date__gte=date_from)
        if date_to:
            qs = qs.filter(operation_date__date__lte=date_to)
            
        # 3. Aggregate consumption by article
        consumption_map = {
            item["article_id"]: float(item["total_value"] or 0)
            for item in qs.values("article_id").annotate(total_value=Sum("total_value"))
        }
        
        # 4. Build data list for all active articles
        usage_data = []
        for art in articles:
            val = consumption_map.get(art.id, 0.0)
            usage_data.append({
                "id": art.id,
                "code": art.code,
                "name": art.name,
                "consumption": val
            })
            
        # 5. Sort by consumption DESC
        usage_data.sort(key=lambda x: x["consumption"], reverse=True)
        
        total_consumption = sum(item["consumption"] for item in usage_data)
        
        class_a, class_b, class_c = [], [], []
        cumulative_value = 0
        total_articles_count = len(usage_data)
        
        for item in usage_data:
            val = item["consumption"]
            cumulative_value += val
            
            # Cumulative percent calculation
            if total_consumption > 0:
                cumulative_percent = (cumulative_value / total_consumption * 100)
            else:
                cumulative_percent = 100 # If no consumption, everything is 100% (ends up in C)
            
            item["cumulativePercent"] = cumulative_percent
            
            # Pareto Classification (80 - 15 - 5)
            if total_consumption == 0:
                class_c.append(item)
            elif cumulative_percent <= 80:
                class_a.append(item)
            elif cumulative_percent <= 95:
                class_b.append(item)
            else:
                class_c.append(item)
        
        # Security: if we have consumption but class A is empty due to small values
        if total_consumption > 0 and not class_a and usage_data:
            class_a.append(usage_data[0])
            if usage_data[0] in class_b: class_b.remove(usage_data[0])
            if usage_data[0] in class_c: class_c.remove(usage_data[0])

        return Response({
            "totalConsumption": total_consumption,
            "classA": {
                "articles": class_a,
                "percentage": round(len(class_a) / total_articles_count * 100, 2) if total_articles_count > 0 else 0,
                "valuePercentage": 80
            },
            "classB": {
                "articles": class_b,
                "percentage": round(len(class_b) / total_articles_count * 100, 2) if total_articles_count > 0 else 0,
                "valuePercentage": 15
            },
            "classC": {
                "articles": class_c,
                "percentage": round(len(class_c) / total_articles_count * 100, 2) if total_articles_count > 0 else 0,
                "valuePercentage": 5
            }
        })

@method_decorator(
    swagger_auto_schema(
        operation_summary="Taux de rotation des stocks",
        operation_description=(
            "Calcul du taux de rotation des stocks.\n"
            "Formule : Consommation / Stock Moyen"
        ),
        manual_parameters=[auth_header_param, date_from_param, date_to_param],
        tags=tags
    ),
    name="get"
)
class RotationRateReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        from accounting.stock_models import StockMovement, Stock
        from django.db.models import Sum, Avg
        from datetime import datetime
        
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")
        
        # 1. Consommation (Sorties)
        consumption_qs = StockMovement.objects.filter(movement_type="OUT")
        if date_from:
            consumption_qs = consumption_qs.filter(operation_date__date__gte=date_from)
        if date_to:
            consumption_qs = consumption_qs.filter(operation_date__date__lte=date_to)
            
        consumption = consumption_qs.values("article__code", "article__name").annotate(
            total_out=Sum("quantity")
        )
        
        # 2. Stock Moyen
        # Pour simplifier, on prend (Stock Initial + Stock Final) / 2
        # Mais ici on va juste prendre le stock actuel comme approximation si pas d'historique
        stocks = Stock.objects.all().values("article__code").annotate(
            current_qty=Avg("physical_quantity")
        )
        stock_map = {s["article__code"]: s["current_qty"] for s in stocks}
        
        data = []
        for c in consumption:
            avg_stock = stock_map.get(c["article__code"], 0)
            rotation = float(c["total_out"]) / float(avg_stock) if avg_stock > 0 else 0
            days = 365 / rotation if rotation > 0 else 365
            data.append({
                "article": c["article__name"],
                "rate": round(rotation, 2),
                "days": round(days, 0)
            })
            
        return Response({"results": data})

@method_decorator(
    swagger_auto_schema(
        operation_summary="Achats par fournisseur",
        operation_description="Montant et quantités achetées par fournisseur.",
        manual_parameters=[auth_header_param, date_from_param, date_to_param],
        tags=tags
    ),
    name="get"
)
class PurchasesBySupplierReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        from accounting.stock_models import StockMovement
        from django.db.models import Sum
        
        # Les achats correspondent aux entrées ("IN") liées à des réceptions de marchandises ("PURCHASE")
        qs = StockMovement.objects.filter(movement_type="IN", movement_reason="PURCHASE")
        
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")
        
        if date_from:
            qs = qs.filter(operation_date__date__gte=date_from)
        if date_to:
            qs = qs.filter(operation_date__date__lte=date_to)
            
        # On suppose que StockMovement a un champ batch qui a un supplier? 
        # Ou on passe par le document de référence (GoodsReceiptNote)
        # Mais StockMovement a batch, on peut essayer d'en tirer le supplier.
        purchases = qs.values("batch__supplier__name").annotate(
            total_amount=Sum("total_value"),
            total_items=Sum("quantity")
        ).order_by("-total_amount")
        
        return Response(purchases)

@method_decorator(
    swagger_auto_schema(
        operation_summary="Achats par catégorie",
        operation_description="Analyse des achats par catégorie d’articles.",
        manual_parameters=[auth_header_param],
        tags=tags
    ),
    name="get"
)
class PurchasesByCategoryReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        data = []
        return Response(data)

@method_decorator(
    swagger_auto_schema(
        operation_summary="Achats par période",
        operation_description="Analyse des achats sur une période donnée.",
        manual_parameters=[auth_header_param, date_from_param, date_to_param],
        tags=tags
    ),
    name="get"
)
class PurchasesByPeriodReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        data = []
        return Response(data)

@method_decorator(
    swagger_auto_schema(
        operation_summary="Écarts d’inventaire",
        operation_description="Différences entre stock théorique et stock physique.",
        manual_parameters=[auth_header_param],
        tags=tags
    ),
    name="get"
)
class InventoryVariancesReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        from accounting.stock_models import InventoryLine
        from django.db.models import F, Q
        
        # We group by Article Category to get values by OHADA account
        # Including COMPLETED, VALIDATED, and POSTED inventories for reconciliation
        variances = InventoryLine.objects.filter(
            inventory__status__in=["COMPLETED", "VALIDATED", "POSTED"]
        ).select_related("article", "article__category")
        
        # Simple grouping by category
        summary = {}
        for line in variances:
            cat = line.article.category
            cat_code = cat.code if cat else "INCONNU"
            cat_name = cat.name if cat else "Sans catégorie"
            
            if cat_code not in summary:
                summary[cat_code] = {
                    "account": cat_code,
                    "category": cat_name,
                    "accounting_value": 0,
                    "physical_value": 0,
                    "variance": 0,
                    "status": "BALANCED"
                }
            
            price = float(line.article.weighted_average_price or 0)
            summary[cat_code]["accounting_value"] += float(line.theoretical_quantity) * price
            summary[cat_code]["physical_value"] += float(line.physical_quantity) * price
            
        data = []
        for code, values in summary.items():
            diff = values["physical_value"] - values["accounting_value"]
            values["variance"] = diff
            values["status"] = "BALANCED" if abs(diff) < 0.01 else "ADJUSTED"
            data.append(values)
            
        return Response({"results": data})

@method_decorator(
    swagger_auto_schema(
        operation_summary="Historique des inventaires",
        operation_description="Liste des inventaires réalisés.",
        manual_parameters=[auth_header_param],
        tags=tags
    ),
    name="get"
)
class InventoryHistoryReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        data = []
        return Response(data)

@method_decorator(
    swagger_auto_schema(
        operation_summary="Alertes de péremption",
        operation_description="Lots bientôt périmés.",
        manual_parameters=[auth_header_param],
        tags=tags
    ),
    name="get"
)
class ExpiryAlertsReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        from accounting.stock_models import Batch
        from datetime import date, timedelta
        
        limit_date = date.today() + timedelta(days=30)
        batches = Batch.objects.select_related("article").filter(
            expiry_date__lte=limit_date,
            expiry_date__gte=date.today()
        ).order_by("expiry_date")
        
        data = []
        for b in batches:
            data.append({
                "article_code": b.article.code,
                "article_name": b.article.name,
                "batch_number": b.batch_number,
                "expiry_date": b.expiry_date.isoformat(),
                "remaining_days": (b.expiry_date - date.today()).days
            })
            
        return Response(data)

@method_decorator(
    swagger_auto_schema(
        operation_summary="Produits expirés",
        operation_description="Liste des produits déjà périmés.",
        manual_parameters=[auth_header_param],
        tags=tags
    ),
    name="get"
)
class ExpiredProductsReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        from accounting.stock_models import Batch
        from datetime import date
        
        batches = Batch.objects.select_related("article").filter(
            expiry_date__lt=date.today()
        ).order_by("expiry_date")
        
        data = []
        for b in batches:
            data.append({
                "article_code": b.article.code,
                "article_name": b.article.name,
                "batch_number": b.batch_number,
                "expiry_date": b.expiry_date.isoformat(),
                "overdue_days": (date.today() - b.expiry_date).days
            })
            
        return Response(data)

@method_decorator(
    swagger_auto_schema(
        operation_summary="Alertes stock bas",
        operation_description="Articles dont le stock est sous le seuil minimum.",
        manual_parameters=[auth_header_param],
        tags=tags
    ),
    name="get"
)
class LowStockAlertsReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        from accounting.stock_models import Stock
        from django.db.models import F

        stocks = Stock.objects.select_related("article", "depot").filter(
            physical_quantity__lt=F("article__minimum_stock")
        )
        
        data = []
        for s in stocks:
            data.append({
                "article_code": s.article.code,
                "article_name": s.article.name,
                "depot": s.depot.name,
                "current_quantity": float(s.physical_quantity),
                "minimum_stock": float(s.article.minimum_stock),
                "gap": float(s.article.minimum_stock - s.physical_quantity)
            })
            
        return Response(data)

@method_decorator(
    swagger_auto_schema(
        operation_summary="Ruptures de stock",
        operation_description="Articles totalement en rupture.",
        manual_parameters=[auth_header_param],
        tags=tags
    ),
    name="get"
)
class OutOfStockAlertsReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        from accounting.stock_models import Stock

        stocks = Stock.objects.select_related("article", "depot").filter(
            physical_quantity=0,
            theoretical_quantity=0
        )
        
        data = []
        for s in stocks:
            data.append({
                "article_code": s.article.code,
                "article_name": s.article.name,
                "depot": s.depot.name,
                "available_quantity": 0
            })
            
        return Response(data)

@method_decorator(
    swagger_auto_schema(
        operation_summary="Export Excel",
        operation_description="Export des rapports au format Excel.",
        manual_parameters=[auth_header_param],
        tags=tags
    ),
    name="get"
)
class ExportExcelReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        return Response({"message": "Export Excel"})

@method_decorator(
    swagger_auto_schema(
        operation_summary="Export PDF",
        operation_description="Export des rapports au format PDF.",
        manual_parameters=[auth_header_param],
        tags=tags
    ),
    name="get"
)
class ExportPDFReportAPI(APIView):
    def get(self, request):
        return Response({"message": "PDF export"})


@method_decorator(
    swagger_auto_schema(
        operation_summary="Fiche de stock (Détail movement par article)",
        operation_description="Historique détaillé des mouvements pour un article spécifique.",
        manual_parameters=[
            auth_header_param,
            openapi.Parameter("article_id", openapi.IN_QUERY, type=openapi.TYPE_INTEGER, required=True),
            openapi.Parameter("depot_id", openapi.IN_QUERY, type=openapi.TYPE_INTEGER, required=False),
            date_from_param,
            date_to_param
        ],
        tags=tags
    ),
    name="get"
)
class StockCardReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        from accounting.stock_models import StockMovement, Article
        from django.db.models import Q
        
        article_id = request.query_params.get("article_id")
        if not article_id:
            return Response({"detail": "article_id est requis"}, status=400)
            
        try:
            article = Article.objects.get(id=article_id)
        except Article.DoesNotExist:
            return Response({"detail": "Article non trouvé"}, status=404)
            
        movements = StockMovement.objects.filter(article=article).order_by("operation_date", "created_at")
        
        depot_id = request.query_params.get("depot_id")
        if depot_id:
            movements = movements.filter(Q(source_depot_id=depot_id) | Q(destination_depot_id=depot_id))

        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")
        if date_from:
            movements = movements.filter(operation_date__date__gte=date_from)
        # Initial balance calculation (movements before date_from)
        opening_balance = 0
        if date_from:
            pre_movements = StockMovement.objects.filter(article=article, operation_date__date__lt=date_from)
            if depot_id:
                pre_movements = pre_movements.filter(Q(source_depot_id=depot_id) | Q(destination_depot_id=depot_id))
            
            for pm in pre_movements:
                p_qty = float(pm.quantity)
                is_p_entry = False
                if depot_id:
                    is_p_entry = str(pm.destination_depot_id) == str(depot_id)
                else:
                    is_p_entry = (pm.movement_type == "IN")
                
                if is_p_entry:
                    opening_balance += p_qty
                else:
                    opening_balance -= p_qty

        data = []
        balance = opening_balance
        
        # Add opening balance row if there's a starting date or a non-zero balance
        if date_from or opening_balance != 0:
            data.append({
                "date": date_from if date_from else "N/A",
                "reference": "SOLDE",
                "description": "SOLDE INITIAL AU " + (date_from if date_from else ""),
                "entry_qty": 0,
                "entry_price": 0,
                "entry_value": 0,
                "exit_qty": 0,
                "exit_price": 0,
                "exit_value": 0,
                "balance_qty": opening_balance,
                "pmp": float(article.weighted_average_price),
                "balance_value": opening_balance * float(article.weighted_average_price)
            })

        if date_to:
            movements = movements.filter(operation_date__date__lte=date_to)

        for m in movements:
            qty = float(m.quantity)
            
            # Determine if it's an entry or exit relative to the selected depot (if any)
            is_entry = False
            if depot_id:
                # If depot filtered, entry is when destination is the depot
                is_entry = str(m.destination_depot_id) == str(depot_id)
            else:
                # Global view: follow movement_type
                is_entry = (m.movement_type == "IN")
            
            if is_entry:
                balance += qty
            else:
                balance -= qty
            
            data.append({
                "date": m.operation_date.isoformat(),
                "reference": m.reference_document or "N/A",
                "description": m.get_movement_reason_display() if hasattr(m, 'get_movement_reason_display') else m.movement_reason,
                "entry_qty": qty if is_entry else 0,
                "entry_price": float(m.unit_price) if is_entry else 0,
                "entry_value": float(m.total_value) if is_entry else 0,
                "exit_qty": qty if not is_entry else 0,
                "exit_price": float(m.unit_price) if not is_entry else 0,
                "exit_value": float(m.total_value) if not is_entry else 0,
                "balance_qty": balance,
                "pmp": float(m.unit_price), # simplified for report
                "balance_value": balance * float(m.unit_price) # simplified
            })
            
        from accounting.stock_models import Depot
        return Response({
            "article": {
                "code": article.code,
                "name": article.name,
                "category": article.category.name if article.category else "Général",
                "unit": article.unit or "U",
                "depot": Depot.objects.get(id=depot_id).name if depot_id else "Global (Tous les dépôts)"
            },
            "results": data
        })

@method_decorator(
    swagger_auto_schema(
        operation_summary="Inventaire Permanent (Log global)",
        operation_description="Journal exhaustif de tous les mouvements de stock valorisés.",
        manual_parameters=[auth_header_param, date_from_param, date_to_param],
        tags=tags
    ),
    name="get"
)
class PerpetualInventoryReportAPI(APIView):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get(self, request):
        from accounting.stock_models import Stock, Category
        from django.db.models import Sum, Q
        from datetime import date
        
        # Perpetual Inventory in this context is Stock Valuation by Category
        categories = Category.objects.all()
        
        data_categories = []
        total_value_global = 0
        
        for cat in categories:
            stocks = Stock.objects.filter(article__category=cat).select_related("article")
            
            # Filter by depot if requested
            depot_id = request.query_params.get("depot_id")
            if depot_id:
                stocks = stocks.filter(depot_id=depot_id)

            articles_data = []
            cat_value = 0
            
            for s in stocks:
                pmp = float(s.article.weighted_average_price or 0)
                val = float(s.physical_quantity) * pmp
                articles_data.append({
                    "code": s.article.code,
                    "name": s.article.name,
                    "qty": float(s.physical_quantity),
                    "pmp": pmp,
                    "value": val
                })
                cat_value += val
                
            if articles_data:
                data_categories.append({
                    "code": cat.code,
                    "name": cat.name,
                    "articles": articles_data
                })
                total_value_global += cat_value
                
        return Response({
            "date": date.today().isoformat(),
            "totalValue": total_value_global,
            "categories": data_categories
        })

@method_decorator(
    swagger_auto_schema(
        operation_summary="Export CSV",
        operation_description="Export des rapports au format CSV.",
        manual_parameters=[auth_header_param],
        tags=tags
    ),
    name="get"
)
class ExportCSVReportAPI(APIView):
    def get(self, request):
        return Response({"message": "CSV export"})
