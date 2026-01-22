from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.decorators import method_decorator
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework import status, permissions
from rest_framework.response import Response
from django.utils.dateparse import parse_date
from django.utils import timezone
from django.db.models import Q
from django.db import transaction
from django.core.exceptions import ValidationError
from datetime import datetime, time

from accounting.stock_models import TransferNote, TransferLine, StockMovement, Stock
from accounting.stock_serializers import TransferNoteSerializer, TransferLineSerializer

auth_header_param = openapi.Parameter(
    name="Authorization",
    in_=openapi.IN_HEADER,
    description="Token JWT (Bearer <token>)",
    type=openapi.TYPE_STRING,
    required=True,
)

tags = ["transfer"]


def apply_transfer_filters(qs, params):
    """Applique les filtres sur les transferts"""

    state = params.get("state")
    if state:
        # Mapping pour compatibilité
        state_mapping = {
            "PENDING": "DRAFT",
        }
        mapped_state = state_mapping.get(state.upper(), state)
        qs = qs.filter(status__iexact=mapped_state)

    source_depot_id = params.get("source_depot_id")
    if source_depot_id:
        qs = qs.filter(source_depot_id=source_depot_id)

    # Alias pour compatibilité
    source_warehouse_id = params.get("source_warehouse_id")
    if source_warehouse_id:
        qs = qs.filter(source_depot_id=source_warehouse_id)

    destination_depot_id = params.get("destination_depot_id")
    if destination_depot_id:
        qs = qs.filter(destination_depot_id=destination_depot_id)

    # Alias pour compatibilité
    destination_warehouse_id = params.get("destination_warehouse_id")
    if destination_warehouse_id:
        qs = qs.filter(destination_depot_id=destination_warehouse_id)

    # Filtre générique warehouse_id (source OU destination)
    warehouse_id = params.get("warehouse_id")
    if warehouse_id:
        qs = qs.filter(
            Q(source_depot_id=warehouse_id) | Q(destination_depot_id=warehouse_id)
        )

    start_date = params.get("start_date")
    end_date = params.get("end_date")
    if start_date:
        sd = parse_date(start_date)
        if sd:
            qs = qs.filter(planned_date__gte=sd)
    if end_date:
        ed = parse_date(end_date)
        if ed:
            qs = qs.filter(planned_date__lte=ed)

    transfer_number = params.get("transfer_number")
    if transfer_number:
        qs = qs.filter(transfer_number__icontains=transfer_number)

    return qs


@method_decorator(
    name="list",
    decorator=swagger_auto_schema(
        operation_summary="Lister les transferts",
        operation_description="Retourne une liste paginée des transferts inter-dépôts avec filtres optionnels.",
        manual_parameters=[
            auth_header_param,
            openapi.Parameter(
                "state",
                openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                enum=["DRAFT", "PENDING", "SENT", "RECEIVED", "CANCELLED"],
            ),
            openapi.Parameter(
                "source_depot_id", openapi.IN_QUERY, type=openapi.TYPE_INTEGER
            ),
            openapi.Parameter(
                "source_warehouse_id",
                openapi.IN_QUERY,
                type=openapi.TYPE_INTEGER,
                description="Alias de source_depot_id",
            ),
            openapi.Parameter(
                "destination_depot_id", openapi.IN_QUERY, type=openapi.TYPE_INTEGER
            ),
            openapi.Parameter(
                "destination_warehouse_id",
                openapi.IN_QUERY,
                type=openapi.TYPE_INTEGER,
                description="Alias de destination_depot_id",
            ),
            openapi.Parameter(
                "warehouse_id",
                openapi.IN_QUERY,
                type=openapi.TYPE_INTEGER,
                description="Filtre source OU destination",
            ),
            openapi.Parameter(
                "start_date", openapi.IN_QUERY, type=openapi.TYPE_STRING, format="date"
            ),
            openapi.Parameter(
                "end_date", openapi.IN_QUERY, type=openapi.TYPE_STRING, format="date"
            ),
            openapi.Parameter(
                "transfer_number", openapi.IN_QUERY, type=openapi.TYPE_STRING
            ),
        ],
        tags=tags,
    ),
)
@method_decorator(
    name="retrieve",
    decorator=swagger_auto_schema(
        operation_summary="Récupérer un transfert",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
@method_decorator(
    name="create",
    decorator=swagger_auto_schema(
        operation_summary="Créer un transfert",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
@method_decorator(
    name="update",
    decorator=swagger_auto_schema(
        operation_summary="Mettre à jour un transfert",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
@method_decorator(
    name="partial_update",
    decorator=swagger_auto_schema(
        operation_summary="Mise à jour partielle d'un transfert",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
@method_decorator(
    name="destroy",
    decorator=swagger_auto_schema(
        operation_summary="Supprimer un transfert",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
class TransferNoteViewSet(ModelViewSet):
    """
    ViewSet pour la gestion des transferts inter-dépôts.

    Actions disponibles:
    - lines: Lister/Ajouter des lignes
    - line_detail: GET/DELETE sur une ligne spécifique
    - send: Expédier le transfert (sortie du dépôt source)
    - receive: Réceptionner le transfert (entrée au dépôt destination)
    - cancel: Annuler le transfert
    - check-availability: Vérifier la disponibilité au dépôt source
    """

    queryset = (
        TransferNote.objects.select_related(
            "source_depot", "destination_depot", "created_by"
        )
        .prefetch_related("lines__article")
        .order_by("-planned_date", "-created_at")
    )
    serializer_class = TransferNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        return apply_transfer_filters(qs, self.request.query_params)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        instance = serializer.instance
        if instance.status not in ["DRAFT"]:
            raise ValidationError(
                "Seuls les transferts en brouillon peuvent être modifiés"
            )
        serializer.save()

    def perform_destroy(self, instance):
        if instance.status not in ["DRAFT"]:
            raise ValidationError(
                "Seuls les transferts en brouillon peuvent être supprimés"
            )
        instance.delete()

    @swagger_auto_schema(
        operation_summary="Lister les lignes d'un transfert",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @action(detail=True, methods=["get"], url_path="lines")
    def lines(self, request, pk=None):
        transfer = self.get_object()
        lines = (
            TransferLine.objects.filter(transfer_id=transfer.pk)
            .select_related("article")
            .order_by("sequence")
        )
        serializer = TransferLineSerializer(lines, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_summary="Ajouter une ligne au transfert",
        request_body=TransferLineSerializer,
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @lines.mapping.post
    @transaction.atomic
    def add_line(self, request, pk=None):
        transfer = self.get_object()

        if transfer.status != "DRAFT":
            return Response(
                {
                    "detail": "Impossible d'ajouter des lignes à un transfert non brouillon"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = request.data.copy()
        data["transfer"] = pk

        # Auto-calculate sequence if not provided
        if not data.get("sequence"):
            last_line = transfer.lines.order_by("-sequence").first()
            data["sequence"] = (last_line.sequence + 1) if last_line else 1

        serializer = TransferLineSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @swagger_auto_schema(
        operation_summary="Récupérer une ligne spécifique",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @action(detail=True, methods=["get"], url_path=r"lines/(?P<line_id>\d+)")
    def line_detail(self, request, pk=None, line_id=None):
        """Récupère une ligne spécifique"""
        transfer = self.get_object()
        try:
            line = TransferLine.objects.select_related("article", "batch").get(
                transfer_id=pk, pk=line_id
            )
        except TransferLine.DoesNotExist:
            return Response(
                {"detail": "Ligne non trouvée"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = TransferLineSerializer(line)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_summary="Supprimer une ligne spécifique",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @line_detail.mapping.delete
    @transaction.atomic
    def delete_line(self, request, pk=None, line_id=None):
        """Supprime une ligne spécifique"""
        transfer = self.get_object()

        if transfer.status != "DRAFT":
            return Response(
                {
                    "detail": "Impossible de supprimer les lignes d'un transfert non brouillon"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            line = TransferLine.objects.get(transfer_id=pk, pk=line_id)
        except TransferLine.DoesNotExist:
            return Response(
                {"detail": "Ligne non trouvée"}, status=status.HTTP_404_NOT_FOUND
            )

        line.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)

    @swagger_auto_schema(
        operation_summary="Vérifier la disponibilité",
        operation_description="Vérifie si le stock est suffisant au dépôt source pour chaque ligne.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @action(detail=True, methods=["post"], url_path="check-availability")
    def check_availability(self, request, pk=None):
        transfer = self.get_object()
        result = []
        all_available = True

        for line in transfer.lines.select_related("article").all():
            try:
                stock = Stock.objects.get(
                    article=line.article, depot=transfer.source_depot
                )
                available = float(stock.available_quantity)
            except Stock.DoesNotExist:
                available = 0.0

            required = float(line.quantity)
            ok = available >= required

            if not ok:
                all_available = False

            result.append(
                {
                    "line_id": line.id,
                    "article_id": line.article_id,
                    "article_code": line.article.code,
                    "article_name": line.article.name,
                    "required": required,
                    "available": available,
                    "shortage": max(0, required - available),
                    "ok": ok,
                }
            )

        return Response(
            {
                "source_depot_id": transfer.source_depot_id,
                "source_depot_code": (
                    transfer.source_depot.code if transfer.source_depot else None
                ),
                "all_available": all_available,
                "availability": result,
            }
        )

    @swagger_auto_schema(
        operation_summary="Expédier le transfert",
        operation_description="Confirme l'expédition et crée les mouvements de sortie au dépôt source.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @action(detail=True, methods=["post"], url_path="send")
    @transaction.atomic
    def send(self, request, pk=None):
        transfer = self.get_object()

        if transfer.status != "DRAFT":
            return Response(
                {"detail": f"Le transfert est déjà {transfer.get_status_display()}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not transfer.lines.exists():
            return Response(
                {"detail": "Le transfert doit contenir au moins une ligne"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Vérifier la disponibilité
        errors = []
        for line in transfer.lines.select_related("article").all():
            try:
                stock = Stock.objects.get(
                    article=line.article, depot=transfer.source_depot
                )
                if stock.available_quantity < line.quantity:
                    errors.append(
                        f"{line.article.code}: Stock insuffisant ({stock.available_quantity} < {line.quantity})"
                    )
            except Stock.DoesNotExist:
                errors.append(f"{line.article.code}: Pas de stock dans ce dépôt")

        if errors:
            return Response(
                {"detail": "Stock insuffisant pour certaines lignes", "errors": errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Créer les mouvements de sortie
        for line in transfer.lines.select_related("article").all():
            unit_price = line.article.weighted_average_price
            StockMovement.objects.create(
                movement_type="OUT",
                movement_reason="TRANSFER",
                article=line.article,
                quantity=line.quantity,
                unit_price=unit_price,
                total_value=line.quantity * unit_price,
                source_depot=transfer.source_depot,
                destination_depot=transfer.destination_depot,
                reference_document=transfer.transfer_number,
                document_type='TRANSFER_NOTE',
                operation_date=timezone.make_aware(datetime.combine(transfer.planned_date, time.min)) if transfer.planned_date else timezone.now(),
                notes=f"Transfert vers {transfer.destination_depot.name if transfer.destination_depot else 'N/A'}",
                created_by=request.user,
                status="CONFIRMED"
            )
            
            # Mettre à jour le stock source
            stock, _ = Stock.objects.get_or_create(
                article=line.article, 
                depot=transfer.source_depot,
                defaults={'physical_quantity': 0, 'theoretical_quantity': 0}
            )
            stock.physical_quantity -= line.quantity
            stock.theoretical_quantity -= line.quantity
            stock.update_value()

        transfer.status = "SENT"
        transfer.save()

        return Response(
            {
                "detail": "Transfert expédié avec succès",
                "transfer_number": transfer.transfer_number,
                "status": transfer.status,
            },
            status=status.HTTP_200_OK,
        )

    @swagger_auto_schema(
        operation_summary="Réceptionner le transfert",
        operation_description="Confirme la réception et crée les mouvements d'entrée au dépôt destination.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @action(detail=True, methods=["post"], url_path="receive")
    @transaction.atomic
    def receive(self, request, pk=None):
        transfer = self.get_object()

        if transfer.status != "SENT":
            return Response(
                {"detail": "Le transfert doit être expédié pour être réceptionné"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Créer les mouvements d'entrée
        for line in transfer.lines.select_related("article").all():
            unit_price = line.article.weighted_average_price
            StockMovement.objects.create(
                movement_type="IN",
                movement_reason="TRANSFER",
                article=line.article,
                quantity=line.quantity,
                unit_price=unit_price,
                total_value=line.quantity * unit_price,
                source_depot=transfer.source_depot,
                destination_depot=transfer.destination_depot,
                reference_document=transfer.transfer_number,
                document_type='TRANSFER_NOTE',
                operation_date=timezone.now(),
                notes=f"Réception de {transfer.source_depot.name if transfer.source_depot else 'N/A'}",
                created_by=request.user,
                status="CONFIRMED"
            )

            # Mettre à jour le stock destination
            stock, _ = Stock.objects.get_or_create(
                article=line.article, 
                depot=transfer.destination_depot,
                defaults={'physical_quantity': 0, 'theoretical_quantity': 0}
            )
            stock.physical_quantity += line.quantity
            stock.theoretical_quantity += line.quantity
            stock.update_value()

        transfer.status = "RECEIVED"
        transfer.save()

        return Response(
            {
                "detail": "Transfert réceptionné avec succès",
                "transfer_number": transfer.transfer_number,
                "status": transfer.status,
            },
            status=status.HTTP_200_OK,
        )

    @swagger_auto_schema(
        operation_summary="Annuler le transfert",
        operation_description="Annule le transfert et inverse les mouvements si expédié.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "reason": openapi.Schema(
                    type=openapi.TYPE_STRING, description="Raison de l'annulation"
                )
            },
        ),
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @action(detail=True, methods=["post"], url_path="cancel")
    @transaction.atomic
    def cancel(self, request, pk=None):
        transfer = self.get_object()
        reason = request.data.get("reason", "")

        if transfer.status == "CANCELLED":
            return Response(
                {"detail": "Le transfert est déjà annulé"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if transfer.status == "RECEIVED":
            return Response(
                {"detail": "Un transfert réceptionné ne peut pas être annulé"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if transfer.status == "DRAFT":
            transfer.delete()
            return Response({"detail": "Transfert supprimé"}, status=status.HTTP_200_OK)

        # Si SENT, annuler les mouvements de sortie
        if transfer.status == "SENT":
            movements = StockMovement.objects.filter(
                reference_document=transfer.transfer_number
            )
            errors = []
            for mv in movements:
                try:
                    mv.cancel(
                        request.user,
                        reason=f"Annulation transfert {transfer.transfer_number}: {reason}",
                    )
                except Exception as e:
                    errors.append(f"Mouvement {mv.movement_number}: {str(e)}")

            if errors:
                return Response(
                    {"detail": "Transfert annulé avec des erreurs", "errors": errors},
                    status=status.HTTP_207_MULTI_STATUS,
                )

        transfer.status = "CANCELLED"
        transfer.notes = (
            transfer.notes or ""
        ) + f"\n[Annulé le {timezone.now()} par {request.user}] {reason}"
        transfer.save()

        return Response(
            {"detail": "Transfert annulé avec succès"}, status=status.HTTP_200_OK
        )
