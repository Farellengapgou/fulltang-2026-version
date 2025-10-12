from rest_framework.viewsets import ModelViewSet
from polyclinic.models import Bill, MedicalFolderPage, BillItem
from accounting.models import FinancialOperation, Account
from polyclinic.permissions.bill_permissions import BillPermissions
from polyclinic.serializers.bill_items_serializers import BillItemSerializer, BillItemCreateSerializer, BillItemUpdateSerializer
from polyclinic.serializers.bill_serializers import BillSerializer, BillCreateSerializer, BillUpdateSerializer
from polyclinic.pagination import CustomPagination
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.decorators import method_decorator
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from accounting.models import AccountState, BudgetExercise
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from django.db import transaction
from polyclinic.services.bill_service import BillService


tags = ["bill"]
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
        operation_summary="Lister les objets",
        operation_description=(
            "Cette route retourne une liste paginée de tous les objets du modèle. "
            "L'authentification est requise pour accéder à cette ressource."
        ),
        manual_parameters=[auth_header_param],
        tags = tags
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
        tags = tags
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
        tags = tags
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
        tags = tags
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
        tags = tags
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
        tags = tags
    )
)
class BillViewSet(ModelViewSet):

    permission_classes = [IsAuthenticated, BillPermissions]
    #permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination

    def get_queryset(self):
        queryset = Bill.objects.all()
        return queryset

    def get_serializer_class(self):
        if self.action == "create" or self.request.method == "POST":
            return BillCreateSerializer
        elif self.action in ["update", "partial_update"] or self.request.method in ["PUT", "PATCH"]:
            return BillUpdateSerializer
        else:
            return BillSerializer

    @transaction.atomic
    def perform_create(self, serializer):
        if 'id' in serializer.validated_data:
            serializer.validated_data.pop('id')

        serializer.save()

    @transaction.atomic
    def perform_update(self, serializer):
        if 'id' in serializer.validated_data:
            serializer.validated_data.pop('id')
        serializer.save()

    @swagger_auto_schema(
        method='get',
        operation_summary="Liste les items d'une facture",
        operation_description="Retourne tous les items d'une facture",
        manual_parameters=[
            openapi.Parameter(
                'id', openapi.IN_PATH,
                type=openapi.TYPE_INTEGER,
                description="ID de la facture",
                required=True
            ),
            auth_header_param
        ],
        tags=["bill"]
    )
    @action(methods=['get'], detail=True, url_path="bill-items", permission_classes=permission_classes)
    def get_bill_items(self, request):
        bill = self.get_object()
        bill_items = BillItem.objects.filter(bill=bill)
        serializer = BillItemSerializer(bill_items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


    @swagger_auto_schema(
        method='get',
        operation_summary="recupère un item",
        operation_description="Retourne un item dont on connait l'id",
        manual_parameters=[
            openapi.Parameter(
                'id', openapi.IN_PATH,
                type=openapi.TYPE_INTEGER,
                description="ID de l'item",
                required=True
            ),
            auth_header_param
        ],
        tags=["bill"]
    )
    @action(methods=['get'], detail=False, url_path="bill-item/(?P<id>[^/.]+)", permission_classes=permission_classes)
    def get_bill_item(self, request, id=None):
        try:
            if id is None:
                return Response({"details": "id abscent"}, status=status.HTTP_400_BAD_REQUEST)
            bill_item = BillItem.objects.get(id=id)
            serializer = BillItemSerializer(bill_item)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except BillItem.DoesNotExist:
            return Response({"details": "cet item n'existe pas"}, status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(
        method='put',
        operation_summary="Met à jour un item de facture",
        operation_description="Met à jour un item d'une facture existante",
        manual_parameters=[
            openapi.Parameter(
                'id', openapi.IN_PATH,
                type=openapi.TYPE_INTEGER,
                description="ID de la facture",
                required=True
            ),
            openapi.Parameter(
                'item_id', openapi.IN_QUERY,
                type=openapi.TYPE_INTEGER,
                description="ID de l'item à mettre à jour",
                required=True
            ),
            auth_header_param
        ],
        request_body=BillItemCreateSerializer,  # ou un serializer spécifique si nécessaire
        responses={200: openapi.Response('Item mis à jour', BillItemSerializer)},
        tags=["bill"]
    )
    @action(methods=['put'], detail=True, url_path="bill-items/update", permission_classes=permission_classes)
    @transaction.atomic
    def update_bill_item(self, request, id=None):
        """
        Met à jour un BillItem et recalcule le total.
        """
        bill = self.get_object()
        item_id = request.query_params.get('item_id')

        if not item_id:
            return Response({"error": "Paramètre 'item_id' manquant"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            bill_item = BillItem.objects.get(id=item_id, bill=bill)
        except BillItem.DoesNotExist:
            return Response({"error": "BillItem introuvable"}, status=status.HTTP_404_NOT_FOUND)

        serializer = BillItemCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data
        validated_data['bill'] = bill

        # Supprimer l'ancien item pour recréer un nouveau proprement
        bill_item.delete()

        bill_service = BillService()
        try:
            new_item = bill_service.create_bill_item(validated_data, is_accounting=not bool(bill.patient))
        except serializer.ValidationError as e:
            transaction.set_rollback(True)
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Mettre à jour le montant total de la facture
        bill.amount = sum(item.total for item in BillItem.objects.filter(bill=bill))
        bill.save()

        response_serializer = BillItemSerializer(new_item)
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        method='get',
        operation_summary="Lister des factures non verifiées par le comptable",
        operation_description="Retourne toutes les factures non vérifiées par le comptable",
        manual_parameters=[
            openapi.Parameter(
                'account_id', openapi.IN_QUERY,
                type=openapi.TYPE_INTEGER,
                description="ID du compte",
                required=True
            ),
            auth_header_param
        ],
        tags=["bill"]
    )
    @action(methods=["get"], detail=False, url_path="bill-unaccounted", permission_classes=permission_classes, pagination_class=pagination_class)
    def get_bill_unaccounted(self, request):
        account_id = request.query_params.get('account_id')

        if not account_id:
            return Response(
                {"details": "Le paramètre 'account_id' est requis dans les paramètres de la requête."},
                status=status.HTTP_400_BAD_REQUEST
            )

        account = Account.objects.filter(id=account_id).first()
        if not account:
            return Response(
                {"details": "Aucun compte trouvé avec cet ID."},
                status=status.HTTP_404_NOT_FOUND
            )

        operations = FinancialOperation.objects.filter(account=account)
        bills = Bill.objects.filter(operation__in=operations).filter(isAccounted=False)

        serializer = self.get_serializer(bills, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


    @swagger_auto_schema(
        method='get',
        operation_summary="Lister toutes les factures d'un compte",
        operation_description="Retourne toutes les factures associées à un compte spécifique.",
        manual_parameters=[
            openapi.Parameter(
                'account_id', openapi.IN_QUERY, 
                type=openapi.TYPE_INTEGER, 
                description="ID du compte", 
                required=True
            ),
            auth_header_param
        ],
        tags=["bill"]
    )
    @action(detail=False, methods=['get'], permission_classes=permission_classes, pagination_class=pagination_class)
    def get_for_account(self, request):
        account_id = request.query_params.get('account_id')

        if not account_id:
            return Response(
                {"details": "Le paramètre 'account_id' est requis dans les paramètres de la requête."},
                status=status.HTTP_400_BAD_REQUEST
            )

        account = Account.objects.filter(id=account_id).first()
        if not account:
            return Response(
                {"details": "Aucun compte trouvé avec cet ID."},
                status=status.HTTP_404_NOT_FOUND
            )

        operations = FinancialOperation.objects.filter(account=account)
        bills = Bill.objects.filter(operation__in=operations)

        serializer = self.get_serializer(bills, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    
    @swagger_auto_schema(
        method='patch',
        operation_summary="Approuver une facture",
        operation_description="Cette route permet d'approuver une facture en mettant à jour son champ 'isApproved' à True et en mettant à jour le solde réel du compte associé.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'isAccounted': openapi.Schema(type=openapi.TYPE_BOOLEAN, description="Statut d'approbation de la facture"),
            },
            required=['isAccounted']
        ),
        manual_parameters=[auth_header_param],
        tags=["bill"]
    )
    @action(detail=True, methods=['patch'], permission_classes=permission_classes)
    def account(self, request, pk):
        bill = self.get_object()
        if bill is None:
            return Response({"details": "La facture est absente"}, status=status.HTTP_404_NOT_FOUND)

        if bill.isAccounted:
            return Response(
                {"error": "La facture est déjà approuvée."},
                status=status.HTTP_409_CONFLICT
            )

        bill.isAccounted = True
        bill.save()
        serializer = self.get_serializer(bill)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        method='get',
        operation_summary="Lister les factures par opération financière",
        operation_description="Retourne toutes les factures associées à une opération financière spécifique.",
        manual_parameters=[
            openapi.Parameter(
                'operation_id', openapi.IN_QUERY, 
                type=openapi.TYPE_INTEGER, 
                description="ID de l'opération financière", 
                required=True
            ),
            auth_header_param
        ],
        tags=["bill"]
    )
    @action(detail=True, methods=['get'], permission_classes=permission_classes)
    def get_by_operation(self, request):
        operation_id = request.query_params.get('operation_id')

        if not operation_id:
            return Response(
                {"details": "Le paramètre 'operation_id' est requis dans les paramètres de la requête."},
                status=status.HTTP_400_BAD_REQUEST
            )

        operation = FinancialOperation.objects.filter(id=operation_id).first()
        if not operation:
            return Response(
                {"details": "Aucune opération financière trouvée avec cet ID."},
                status=status.HTTP_404_NOT_FOUND
            )

        bills = Bill.objects.filter(operation=operation)

        serializer = self.get_serializer(bills, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        method='get',
        operation_summary="Lister les factures par opérateur médical",
        operation_description="Retourne toutes les factures associées à un opérateur médical spécifique.",
        manual_parameters=[
            openapi.Parameter(
                'medical_operator_id', openapi.IN_QUERY, 
                type=openapi.TYPE_INTEGER, 
                description="ID de l'opérateur médical", 
                required=True
            ),
            auth_header_param
        ],
        tags=["bill"]
    )
    @action(detail=True, methods=['get'], permission_classes=permission_classes)
    def get_by_medical_operator(self, request):
        medical_operator_id = request.query_params.get('medical_operator_id')

        if not medical_operator_id:
            return Response(
                {"details": "Le paramètre 'medical_operator_id' est requis dans les paramètres de la requête."},
                status=status.HTTP_400_BAD_REQUEST
            )

        medical_operator = MedicalFolderPage.objects.filter(id=medical_operator_id).first()
        if not medical_operator:
            return Response(
                {"details": "Aucun opérateur médical trouvé avec cet ID."},
                status=status.HTTP_404_NOT_FOUND
            )

        bills = Bill.objects.filter(operator=medical_operator)

        serializer = self.get_serializer(bills, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        method='get',
        operation_summary="Lister toutes les factures avec la source",
        operation_description="Retourne toutes les factures avec un attribut supplémentaire 'source' basé sur le rôle de l'opérateur médical.",
        manual_parameters=[auth_header_param],
        tags=["bill"]
    )
    @action(detail=False, methods=['get'], permission_classes=permission_classes)
    def list_with_source(self, request):
        bills = Bill.objects.all()
        serializer = BillSerializer(bills, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)