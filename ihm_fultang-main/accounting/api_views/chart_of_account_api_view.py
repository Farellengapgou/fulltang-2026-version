from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.decorators import method_decorator
from rest_framework.permissions import IsAuthenticated
from accounting.serializers import ChartOfAccountsSerializer

from accounting.permissions.accounting_staff_permissions import AccountingStaffPermission
from accounting.serializers import AccountSerializer
from accounting.models_financier import Account, AccountState, BudgetExercise
from rest_framework.viewsets import ModelViewSet
from django.utils.timezone import now
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action
from rest_framework.response import Response
from accounting.models_financier import ChartOfAccounts
from django.db import transaction

tags = ["chart-account"]
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
class ChartOfAccountsViewSet(ModelViewSet):
    """
    ViewSet pour la gestion du plan comptable
    """
    queryset = ChartOfAccounts.objects.all().order_by('code')
    serializer_class = ChartOfAccountsSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        # Convert strings to date objects if they exist
        if start_date:
            try:
                from datetime import datetime
                context['start_date'] = datetime.strptime(start_date, '%Y-%m-%d').date()
            except (ValueError, TypeError):
                pass
        
        if end_date:
            try:
                from datetime import datetime
                context['end_date'] = datetime.strptime(end_date, '%Y-%m-%d').date()
            except (ValueError, TypeError):
                pass

        return context

    @transaction.atomic
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
        operation_summary="hierarchie des comptes",
        operation_description="Récupère la hiérarchie complète des comptes",
        manual_parameters=[
            openapi.Parameter(
                'start_date', openapi.IN_QUERY,
                type=openapi.FORMAT_DATE,
                description="date de début",
                required=False
            ),
            openapi.Parameter(
                'end_date', openapi.IN_QUERY,
                type=openapi.FORMAT_DATE,
                description="date de fin",
                required=False
            ),
            auth_header_param
        ],
        tags=["bill"],
        responses={200: ChartOfAccountsSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], permission_classes=permission_classes)
    def hierarchy(self, request):
        """Retourne la hiérarchie des comptes"""
        root_accounts = self.queryset.filter(parent__isnull=True)
        serializer = self.get_serializer(root_accounts, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        method='get',
        operation_description="Récupère les comptes détaillés uniquement",
        responses={200: ChartOfAccountsSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def detailed_accounts(self, request):
        """Retourne uniquement les comptes détaillés"""
        detailed_accounts = self.queryset.filter(is_detailed=True)
        serializer = self.get_serializer(detailed_accounts, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        method='get',
        operation_description="Récupère le Grand Livre (historique) d'un compte",
        manual_parameters=[
            openapi.Parameter('start_date', openapi.IN_QUERY, type=openapi.FORMAT_DATE, description="Date début"),
            openapi.Parameter('end_date', openapi.IN_QUERY, type=openapi.FORMAT_DATE, description="Date fin"),
        ],
        responses={200: openapi.Response("Liste des mouvements")}
    )
    @action(detail=True, methods=['get'])
    def ledger(self, request, pk=None):
        """Grand Livre du compte : retourne les lignes d'écritures validées"""
        account = self.get_object()
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        # Import local pour éviter les cycles si nécessaire, ou utiliser self.queryset.model...
        from accounting.models_financier import JournalEntryLine
        
        lines = JournalEntryLine.objects.filter(
            account=account,
            journal_entry__state='POSTED'
        ).select_related('journal_entry', 'journal_entry__journal').order_by('journal_entry__entry_date')

        if start_date:
            lines = lines.filter(journal_entry__entry_date__gte=start_date)
        if end_date:
            lines = lines.filter(journal_entry__entry_date__lte=end_date)
            
        # On pourrait utiliser un serializer spécifique, mais faisons simple pour l'instant
        data = []
        balance = 0 # Solde cumulé (faudrait ajouter le solde d'ouverture si date_start > début exercice)
        
        for line in lines:
            debit = line.debit_amount
            credit = line.credit_amount
            if account.account_class in ['2','3','5','6']: # Actif/Charge -> Debit augmente
                balance += (debit - credit)
            else: # Passif/Produit -> Credit augmente
                balance += (credit - debit)
                
            data.append({
                'date': line.journal_entry.entry_date,
                'journal': line.journal_entry.journal.code,
                'entry_number': line.journal_entry.entry_number,
                'voucher': line.journal_entry.voucher_number,
                'label': line.label,
                'debit': debit,
                'credit': credit,
                'balance': balance
            })
            
        return Response(data)