from accounting.permissions.accounting_staff_permissions import AccountingStaffPermission
from accounting.serializers import BudgetExerciseSerializer
from rest_framework.viewsets import ModelViewSet
from accounting.models import BudgetExercise, AccountState
from polyclinic.pagination import CustomPagination
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.decorators import method_decorator
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from accounting.services.budget_exercise_service import *


tags = ["budget-exercise"]
auth_header_param = openapi.Parameter(
    name="Authorization",
    in_=openapi.IN_HEADER,
    description="Token JWT pour l'authentification (Bearer <token>)",
    type=openapi.TYPE_STRING,
    required=True
)

@method_decorator(
    name="list",
    decorator=swagger_auto_schema(
        operation_summary="Lister les exercices budgétaires",
        operation_description="Retourne une liste paginée des exercices budgétaires.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
@method_decorator(
    name="retrieve",
    decorator=swagger_auto_schema(
        operation_summary="Récupérer un exercice budgétaire",
        operation_description="Retourne les détails d'un exercice budgétaire.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
@method_decorator(
    name="create",
    decorator=swagger_auto_schema(
        operation_summary="Créer un exercice budgétaire",
        operation_description="Permet de créer un nouvel exercice budgétaire.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
@method_decorator(
    name="update",
    decorator=swagger_auto_schema(
        operation_summary="Mettre à jour un objet",
        operation_description=(
            "Cette route permet de mettre à jour complètement un objet existant en fonction de son ID. "
            "Les données doivent être envoyées dans le corps de la requête. "
            "L'authentification est requise pour accéder à cette ressource."
        ),
        manual_parameters=[auth_header_param],
        tags=tags
    )
)
@method_decorator(
    name="update",
    decorator=swagger_auto_schema(
        operation_summary="Mettre à jour un exercice budgétaire",
        operation_description="Permet de mettre à jour un exercice budgétaire existant.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
)
@method_decorator(
    name="destroy",
    decorator=swagger_auto_schema(
        operation_summary="Supprimer un exercice budgétaire",
        operation_description="Supprime un exercice budgétaire existant.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
)
class BudgetExerciseViewSet(ModelViewSet):
    serializer_class = BudgetExerciseSerializer
    permission_classes = [IsAuthenticated, AccountingStaffPermission]
    pagination_class = CustomPagination

    def get_queryset(self):
        return BudgetExercise.objects.all()

    def perform_create(self, serializer):
        if 'id' in serializer.validated_data:
            serializer.validated_data.pop('id')
        serializer.save()

    def perform_update(self, serializer):
        if 'id' in serializer.validated_data:
            serializer.validated_data.pop('id')
        serializer.save()
        
    @swagger_auto_schema(
        method='get',
        operation_summary="Obtenir le compte de bilan",
        operation_description="Retourne un JSON avec les soldes réels et prévus des comptes de classe 1 à 6, classés en Actif et Passif.",
        manual_parameters=[auth_header_param],
        tags=tags
    )
    @action(detail=False, methods=['get'], permission_classes=[AccountingStaffPermission])
    def get_balance_sheet(self, request):
        immobilized_active = calculate_balance(immobilized_actives_prefixes)
        circulant_active = calculate_circulant_balance(circulant_actives_prefixes, "active")
        active_treasury = calculate_treasury(treasury_indexes, "active")
        equity = calculate_balance(equity_indexes)
        financial_debt = calculate_circulant_balance(financial_debt_prefixes)
        circulant_passive = calculate_circulant_balance(circulant_passives_prefixes, "passive")
        passive_treasury = calculate_treasury(treasury_indexes, "passive")
        active = immobilized_active['total'] + circulant_active['total'] + active_treasury['total']
        passive = equity['total'] + financial_debt['total'] + circulant_passive['total'] + passive_treasury['total']
        working_capital = equity['total'] + financial_debt['total'] - immobilized_active['total']
        working_capital_requirement = circulant_passive['total'] - circulant_active['total']
        treasury = active_treasury['total'] - passive_treasury['total']
        financial_autonomy_ratio = equity['total'] / passive if passive != 0 else None
        debt_to_equity_ratio = financial_debt['total'] / equity['total'] if equity['total'] != 0 else None
        general_liquidity = circulant_active['total'] / circulant_passive['total'] if circulant_passive['total'] != 0 else None
        stock = calculate_balance(stock_indexes)
        reduced_liquidity = (circulant_active['total'] - stock['total']) / circulant_passive['total'] if circulant_passive['total'] != 0 else None
        immediate_liquidity = treasury / circulant_passive['total'] if circulant_passive['total'] != 0 else None
        solvability_ratio = active / passive if passive != 0 else None
       
        return Response(
            {
                "data": [
                    {
                        "category":"IMMOBILIZED ACTIVE",
                        "items":immobilized_active['items'],
                        "total":immobilized_active['total']
                    },
                    {
                        "category":"CIRCULANT ACTIVE",
                        "items":circulant_active['items'],
                        "total":circulant_active['total']                        
                    },
                    {
                        "category":"ACTIVE TREASURY",
                        "items":active_treasury['items'],
                        "total":active_treasury['total']
                    },
                    {
                        "category":"EQUITY",
                        "items":equity['items'],
                        "total":equity['total']
                    },
                    {
                        "category":"FINANCIAL DEBT",
                        "items":financial_debt['items'],
                        "total":financial_debt['total']
                    },
                    {
                        "category":"CIRCULANT PASSIVE",
                        "items":circulant_passive['items'],
                        "total":circulant_passive['total']
                    },
                    {
                        "category":"PASSIVE TREASURY",
                        "items":passive_treasury['items'],
                        "total":passive_treasury['total']
                    },
                    {
                        "parameters":[
                            {
                                "item":"Total active",
                                "value":active
                            },
                            {
                                "item":"Total passive",
                                "value":passive
                            },
                            {
                                "item":"Working capital",
                                "value":working_capital
                            },
                            {
                                "item":"Working Capital Requirement",
                                "value":working_capital_requirement
                            },
                            {
                                "item":"Treasury",
                                "value":treasury
                            },
                            {
                                "item":"Financial Auntonmy Ratio",
                                "value":financial_autonomy_ratio
                            },
                            {
                                "item":"Debt to Equity Ratio",
                                "value":debt_to_equity_ratio
                            },
                            {
                                "item":"General Liquidity",
                                "value":general_liquidity
                            },
                            {
                                "item":"Reduced Liquidity",
                                "value":reduced_liquidity
                            },
                            {
                                "item":"Immediate Liquidity",
                                "value":immediate_liquidity
                            },
                            {
                                "item":"Solvability Ratio",
                                "value":solvability_ratio
                            }
                        ]
                    }
                ]
            }
        )
    
    @swagger_auto_schema(
        method='get',
        operation_summary="Calculer les comptes de résultat",
        operation_description="Retourne un JSON avec les soldes réels et prévus des comptes de charges (classe 6) et produits (classe 7).",
        manual_parameters=[auth_header_param],
        tags=tags
    )
    @action(detail=False, methods=['get'], permission_classes=[AccountingStaffPermission])
    def get_income_statement(self, request):

        charges = calculate_balance(charges_prefixes)
        products = calculate_balance(products_prefixes)
        sales_figure = calculate_balance(sales_figure_prefixes)
        sold_goods = calculate_balance(sold_goods_prefixes)
        gross_margin = sales_figure['total'] - sold_goods['total']
        working_charges = calculate_balance(working_charges_prefixes)
        gross_operating_surplus = gross_margin - working_charges['total']
        depreciation_allocations = calculate_balance(depreciation_allocations_prefixes)
        provision_allocations = calculate_balance(provision_allocations_prefixes)
        working_result = gross_operating_surplus - depreciation_allocations['total'] - provision_allocations['total']
        financial_charges = calculate_balance(financial_charges_prefixes)
        taxes = calculate_balance(taxes_prefixes)
        net_result = working_result - financial_charges['total'] - taxes['total']
        return Response(
            {
                "data":[
                    {
                        "category":"CHARGES",
                        "items":charges['items'],
                        "total":charges['total']
                    },
                    {
                        'category':'PRODUCTS',
                        "items":products['items'],
                        "total":products['total']
                    },
                    {
                        "parameters":[
                            {
                                "item":"Sales Figure",
                                "value":sales_figure['total']
                            },
                            {
                                "item":"Sold Goods",
                                "value":sold_goods['total']
                            },
                            {
                                "item":"Gross Margin",
                                "value":gross_margin
                            },
                            {
                                "item":"Working Charges",
                                "value":working_charges['total']
                            },
                            {
                                "item":"Gross Operating Surplus",
                                "value":gross_operating_surplus
                            },
                            {
                                "item":"Depreciation Allocations",
                                "value":depreciation_allocations['total']
                            },
                            {
                                "item":"Provision Allocations",
                                "value":provision_allocations['total']
                            },
                            {
                                "item":"Working Result",
                                "value":working_result
                            },
                            {
                                "item":"Financial Charges",
                                "value":financial_charges['total']
                            },
                            {
                                "item":"Taxes",
                                "value":taxes['total']
                            }
                        ]
                    }
                ]
            }
        )
        
    @swagger_auto_schema(
        method='get',
        operation_summary="Calculer la balance",
        operation_description="Retourne la balance",
        manual_parameters=[auth_header_param],
        tags=tags
    )
    @action(detail=False, methods=['get'])
    def get_balance(self, request):
        all_prefixes = [str(i) for i in range(10, 80)]
        return Response({
            "balance": calculate_balance(all_prefixes)
        })