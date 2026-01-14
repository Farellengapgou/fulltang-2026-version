from accounting.models import AccountState, BudgetExercise, Account
from accounting.permissions.accounting_staff_permissions import AccountingStaffPermission
from accounting.serializers import AccountStateSerializer, AccountingViewSerializer, AccountStateCreateSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.decorators import method_decorator
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet
from datetime import date
from rest_framework.response import Response
from polyclinic.pagination import CustomPagination

tags = ["account-state"]
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
        operation_summary="Lister les états de compte",
        operation_description="Retourne une liste paginée des états de compte.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
@method_decorator(
    name="retrieve",
    decorator=swagger_auto_schema(
        operation_summary="Récupérer un objet",
        operation_description=(
            "Cette route retourne les détails d'un objet spécifique en fonction de son ID. "
            "L'authentification est requise pour accéder à cette ressource."
        ),
        manual_parameters=[auth_header_param],
        tags=tags
    )
)
@method_decorator(
    name="create",
    decorator=swagger_auto_schema(
        operation_summary="Créer un nouvel objet",
        operation_description=(
            "Cette route permet de créer un nouvel objet. "
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
    name="partial_update",
    decorator=swagger_auto_schema(
        operation_summary="Mise à jour partielle d'un objet",
        operation_description=(
            "Cette route permet de mettre à jour partiellement un objet existant en fonction de son ID. "
            "Les données doivent être envoyées dans le corps de la requête. "
            "L'authentification est requise pour accéder à cette ressource."
        ),
        manual_parameters=[auth_header_param],
        tags=tags
    )
)
@method_decorator(
    name="destroy",
    decorator=swagger_auto_schema(
        operation_summary="Supprimer un objet",
        operation_description=(
            "Cette route permet de supprimer un objet existant en fonction de son ID. "
            "L'authentification est requise pour accéder à cette ressource."
        ),
        manual_parameters=[auth_header_param],
        tags=tags
    )
)
class AccountStateViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated, AccountingStaffPermission]
    pagination_class =  CustomPagination

    def get_queryset(self):
        return AccountState.objects.all()

    def get_serializer_class(self):
        if self.action in ["create", "partial_update", "update"] or self.request.method in ["post", "patch"]:
            return AccountStateCreateSerializer
        else:
            return AccountStateSerializer
    
    @swagger_auto_schema(
        method='get',
        operation_summary="Lister les états de compte pour l'exercice budgétaire courant",
        operation_description="Retourne une liste des états de compte pour un exercice budgétaire spécifié, avec des champs spécifiques de l'AccountState et de l'Account.",
        manual_parameters=[auth_header_param]
    )
    @action(detail=False, methods=['get'], permission_classes=[AccountingStaffPermission])
    def get_by_budget_exercise(self, request):
        # Find the active exercise
        today = date.today()
        budget_exercise = BudgetExercise.objects.filter(
            start__lte=today,
            end__gte=today
        ).first()

        if not budget_exercise:
            raise ValueError("Aucun Exercice Budgétaire actif trouvé pour la date actuelle." + str(today))
        else:
            queryset = AccountState.objects.filter(budgetExercise = budget_exercise)
            serialiser = AccountingViewSerializer(queryset, many=True)
            return Response(serialiser.data)
        
    @swagger_auto_schema(
        method='get',
        operation_summary="Lister les états de compte par préfixe de numéro de compte",
        operation_description="Retourne une liste des états de compte pour les comptes dont le numéro commence par les deux chiffres spécifiés.",
        manual_parameters=[
            auth_header_param,
            openapi.Parameter(
                'prefix',
                openapi.IN_QUERY,
                description="Les deux premiers chiffres du numéro de compte",
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        tags=tags
    )
    @action(detail=False, methods=['get'], permission_classes=[AccountingStaffPermission])
    def get_by_account_prefix(self, request):
        prefix = request.query_params.get('prefix', None)
        if prefix is None or len(prefix) != 2 or not prefix.isdigit():
            return Response({"detail": "Le préfixe doit être composé de deux chiffres."}, status=400)

        accounts = Account.objects.filter(number__startswith=prefix)
        account_states = AccountState.objects.filter(account__in=accounts)
        serializer = AccountStateSerializer(account_states, many=True)
        return Response(serializer.data)