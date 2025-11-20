from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.decorators import method_decorator
from rest_framework.permissions import IsAuthenticated

from accounting.permissions.accounting_staff_permissions import AccountingStaffPermission
from accounting.serializers import AccountSerializer
from accounting.models import Account, AccountState, BudgetExercise
from rest_framework.viewsets import ModelViewSet
from django.utils.timezone import now
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action
from rest_framework.response import Response
from accounting.models import FinancialOperation
from accounting.serializers import FinancialOperationSerializer
from django.db import transaction

tags = ["account"]
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
        operation_summary="Lister les classes de compte",
        operation_description="Retourne une liste paginée des classes de compte.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
@method_decorator(
    name="retrieve",
    decorator=swagger_auto_schema(
        operation_summary="Récupérer une classe de compte",
        operation_description="Retourne les détails d'une classe de compte.",
        manual_parameters=[auth_header_param],
        tags=tags,
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
        tags=tags,
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
        tags=tags,
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
        tags=tags,
    )
)
class AccountViewSet(ModelViewSet):
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated, AccountingStaffPermission]

    def get_queryset(self):
        return Account.objects.all()

    @transaction.atomic
    def perform_create(self, serializer):
        if 'id' in serializer.validated_data:
            serializer.validated_data.pop('id')
        account = serializer.save()
        # Find the active exercise
        budget_exercise = BudgetExercise.objects.filter(
            start__lte=now(),
            end__gte=now()
        ).first()

        if not budget_exercise:
            raise ValidationError({"details": f"Aucun Exercice Budgétaire actif trouvé pour la date actuelle. {str(now())}"})
        
        AccountState.objects.create(
            account=account,
            budgetExercise=budget_exercise
        )

    def perform_update(self, serializer):
        if 'id' in serializer.validated_data:
            serializer.validated_data.pop('id')
        serializer.save()

    @swagger_auto_schema(
        operation_summary="Récupérer les opérations financières d'un compte",
        operation_description=(
            "Cette route permet d'obtenir toutes les opérations financières liées à un compte spécifique. "
            "L'authentification est requise pour accéder à cette ressource."
        ),
        manual_parameters=[auth_header_param],
        responses={
            200: "Liste des opérations financières",
            404: "Compte non trouvé"
        },
        tags=tags,
    )
    @action(detail=True, methods=["get"], url_path="financial-operations", url_name="financial_operations")
    def financial_operations(self, request, pk=None):
        try:
            account = Account.objects.get(pk=pk)
        except Account.DoesNotExist:
            return Response({"detail": "Compte non trouvé."}, status=404)

        operations = FinancialOperation.objects.filter(account=account)
        
        serializer = FinancialOperationSerializer(operations, many=True)
        return Response(serializer.data)