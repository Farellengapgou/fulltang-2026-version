from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.decorators import method_decorator
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework import status, permissions
from rest_framework.response import Response
from django.utils.dateparse import parse_date
from django.utils import timezone
from django.db.models import Sum
from django.db import transaction
from django.core.exceptions import ValidationError

from accounting.stock_models import GoodsReceiptNote, GoodsReceiptLine, StockMovement
from accounting.stock_serializers import (
    GoodsReceiptNoteSerializer,
    GoodsReceiptLineSerializer,
)

auth_header_param = openapi.Parameter(
    name="Authorization",
    in_=openapi.IN_HEADER,
    description="Token JWT (Bearer <token>)",
    type=openapi.TYPE_STRING,
    required=True,
)

tags = ["material-accounting"]


def apply_receipt_filters(qs, params):
    """Applique les filtres sur les bons d'entrée"""

    state = params.get("state")
    if state:
        qs = qs.filter(status__iexact=state)

    receipt_type = params.get("receipt_type")
    if receipt_type:
        qs = qs.filter(receipt_type__iexact=receipt_type)

    warehouse_id = params.get("warehouse_id")
    if warehouse_id:
        qs = qs.filter(depot_id=warehouse_id)

    depot_id = params.get("depot_id")
    if depot_id:
        qs = qs.filter(depot_id=depot_id)

    supplier_id = params.get("supplier_id")
    if supplier_id:
        qs = qs.filter(supplier_id=supplier_id)

    start_date = params.get("start_date")
    end_date = params.get("end_date")
    if start_date:
        sd = parse_date(start_date)
        if sd:
            qs = qs.filter(receipt_date__gte=sd)
    if end_date:
        ed = parse_date(end_date)
        if ed:
            qs = qs.filter(receipt_date__lte=ed)

    is_posted = params.get("is_posted_to_finance")
    if is_posted is not None:
        val = is_posted.lower()
        if val in ["true", "1", "yes"]:
            qs = qs.filter(journal_entry__isnull=False)
        elif val in ["false", "0", "no"]:
            qs = qs.filter(journal_entry__isnull=True)

    receipt_number = params.get("receipt_number")
    if receipt_number:
        qs = qs.filter(receipt_number__icontains=receipt_number)

    return qs


@method_decorator(
    name="list",
    decorator=swagger_auto_schema(
        operation_summary="Lister les bons d'entrée",
        operation_description="Retourne une liste paginée des bons d'entrée avec filtres optionnels.",
        manual_parameters=[
            auth_header_param,
            openapi.Parameter(
                "state",
                openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                enum=["DRAFT", "CONFIRMED", "POSTED", "CANCELLED"],
            ),
            openapi.Parameter(
                "receipt_type",
                openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                enum=["PURCHASE", "TRANSFER_IN", "RETURN", "ADJUSTMENT", "INITIAL"],
            ),
            openapi.Parameter(
                "warehouse_id", openapi.IN_QUERY, type=openapi.TYPE_INTEGER
            ),
            openapi.Parameter(
                "supplier_id", openapi.IN_QUERY, type=openapi.TYPE_INTEGER
            ),
            openapi.Parameter(
                "start_date", openapi.IN_QUERY, type=openapi.TYPE_STRING, format="date"
            ),
            openapi.Parameter(
                "end_date", openapi.IN_QUERY, type=openapi.TYPE_STRING, format="date"
            ),
            openapi.Parameter(
                "receipt_number", openapi.IN_QUERY, type=openapi.TYPE_STRING
            ),
        ],
        tags=tags,
    ),
)
@method_decorator(
    name="retrieve",
    decorator=swagger_auto_schema(
        operation_summary="Récupérer un bon d'entrée",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
@method_decorator(
    name="create",
    decorator=swagger_auto_schema(
        operation_summary="Créer un bon d'entrée",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
@method_decorator(
    name="update",
    decorator=swagger_auto_schema(
        operation_summary="Mettre à jour un bon d'entrée",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
@method_decorator(
    name="partial_update",
    decorator=swagger_auto_schema(
        operation_summary="Mise à jour partielle d'un bon d'entrée",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
@method_decorator(
    name="destroy",
    decorator=swagger_auto_schema(
        operation_summary="Supprimer un bon d'entrée",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
class GoodsReceiptNoteViewSet(ModelViewSet):
    """
    ViewSet pour la gestion des bons d'entrée (réception marchandises).

    Actions disponibles:
    - lines: Lister/Ajouter des lignes
    - validate: Confirmer le bon et mettre à jour les stocks
    - cancel: Annuler le bon
    - update-totals: Recalculer les totaux
    - preview-accounting: Prévisualiser l'écriture comptable
    """

    queryset = (
        GoodsReceiptNote.objects.select_related(
            "depot", "supplier", "created_by", "validated_by"
        )
        .prefetch_related("lines__article")
        .order_by("-receipt_date", "-created_at")
    )
    serializer_class = GoodsReceiptNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        return apply_receipt_filters(qs, self.request.query_params)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        instance = serializer.instance
        if instance.status not in ["DRAFT"]:
            raise ValidationError("Seuls les bons en brouillon peuvent être modifiés")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.status not in ["DRAFT"]:
            raise ValidationError("Seuls les bons en brouillon peuvent être supprimés")
        instance.delete()

    @swagger_auto_schema(
        operation_summary="Lister les lignes d'un bon d'entrée",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @action(detail=True, methods=["get"], url_path="lines")
    def lines(self, request, pk=None):
        receipt = self.get_object()
        lines = (
            GoodsReceiptLine.objects.filter(receipt_id=receipt.pk)
            .select_related("article")
            .order_by("id")
        )
        serializer = GoodsReceiptLineSerializer(lines, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_summary="Ajouter une ligne au bon d'entrée",
        request_body=GoodsReceiptLineSerializer,
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @lines.mapping.post
    @transaction.atomic
    def add_line(self, request, pk=None):
        receipt = self.get_object()

        if receipt.status != "DRAFT":
            return Response(
                {"detail": "Impossible d'ajouter des lignes à un bon non brouillon"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = request.data.copy()
        data["receipt"] = pk

        serializer = GoodsReceiptLineSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # CORRIGÉ: Mettre à jour les totaux après ajout
        receipt.update_totals()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @swagger_auto_schema(
        operation_summary="Valider un bon d'entrée",
        operation_description="Confirme le bon d'entrée, crée les lots et met à jour les stocks (PMP).",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @action(detail=True, methods=["post"], url_path="validate")
    @transaction.atomic
    def validate_receipt(self, request, pk=None):
        receipt = self.get_object()

        if receipt.status != "DRAFT":
            return Response(
                {"detail": f"Le bon est déjà {receipt.get_status_display()}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not receipt.lines.exists():
            return Response(
                {"detail": "Le bon doit contenir au moins une ligne"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            receipt.confirm(request.user)
        except ValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            {
                "detail": "Bon d'entrée validé avec succès",
                "receipt_number": receipt.receipt_number,
                "status": receipt.status,
            },
            status=status.HTTP_200_OK,
        )

    @swagger_auto_schema(
        operation_summary="Annuler un bon d'entrée",
        operation_description="Annule le bon et inverse les mouvements de stock si confirmé.",
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
        receipt = self.get_object()
        reason = request.data.get("reason", "")

        if receipt.status == "CANCELLED":
            return Response(
                {"detail": "Le bon est déjà annulé"}, status=status.HTTP_400_BAD_REQUEST
            )

        if receipt.status == "DRAFT":
            receipt.delete()
            return Response({"detail": "Bon supprimé"}, status=status.HTTP_200_OK)

        if receipt.status != "CONFIRMED":
            return Response(
                {"detail": "Seuls les bons confirmés peuvent être annulés"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Annuler les mouvements associés
        movements = StockMovement.objects.filter(
            reference_document=receipt.receipt_number
        )
        errors = []
        for mv in movements:
            try:
                mv.cancel(
                    request.user,
                    reason=f"Annulation bon {receipt.receipt_number}: {reason}",
                )
            except Exception as e:
                errors.append(f"Mouvement {mv.movement_number}: {str(e)}")

        # Annuler l'écriture comptable si existe
        if hasattr(receipt, "journal_entry") and receipt.journal_entry:
            receipt.journal_entry.state = "CANCELLED"
            receipt.journal_entry.save()

        receipt.status = "CANCELLED"
        receipt.notes = (
            receipt.notes or ""
        ) + f"\n[Annulé le {timezone.now()} par {request.user}] {reason}"
        receipt.save()

        if errors:
            return Response(
                {"detail": "Bon annulé avec des erreurs", "errors": errors},
                status=status.HTTP_207_MULTI_STATUS,
            )

        return Response({"detail": "Bon annulé avec succès"}, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="Recalculer les totaux",
        operation_description="Recalcule les totaux du bon à partir des lignes.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @action(detail=True, methods=["post"], url_path="update-totals")
    def update_totals(self, request, pk=None):
        receipt = self.get_object()
        receipt.update_totals()
        return Response(
            {
                "detail": "Totaux mis à jour",
                "subtotal": (
                    float(receipt.subtotal) if hasattr(receipt, "subtotal") else 0
                ),
                "total_amount": float(receipt.total_amount),
            },
            status=status.HTTP_200_OK,
        )

    @swagger_auto_schema(
        operation_summary="Prévisualiser l'écriture comptable",
        operation_description="Retourne un aperçu de l'écriture comptable qui sera générée.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @action(detail=True, methods=["get"], url_path="preview-accounting")
    def preview_accounting(self, request, pk=None):
        receipt = self.get_object()
        preview_lines = []
        total = 0

        for line in receipt.lines.select_related("article").all():
            stock_account = getattr(line.article, "stock_account", None)

            preview_lines.append(
                {
                    "type": "debit",
                    "account_code": stock_account.code if stock_account else "N/A",
                    "account_label": (
                        stock_account.label
                        if stock_account
                        else "Compte stock non défini"
                    ),
                    "label": f"Stock {line.article.name}",
                    "amount": float(line.line_amount),
                }
            )
            total += float(line.line_amount)

        # Crédit fournisseur
        supplier_account = None
        if receipt.supplier and hasattr(receipt.supplier, "account"):
            supplier_account = receipt.supplier.account

        preview_lines.append(
            {
                "type": "credit",
                "account_code": supplier_account.code if supplier_account else "401000",
                "account_label": (
                    supplier_account.label if supplier_account else "Fournisseurs"
                ),
                "label": f"Fournisseur {receipt.supplier.name if receipt.supplier else 'N/A'}",
                "amount": float(total),
            }
        )

        return Response(
            {
                "reference": receipt.receipt_number,
                "date": (
                    receipt.receipt_date.isoformat() if receipt.receipt_date else None
                ),
                "description": f"Réception {receipt.supplier.name if receipt.supplier else 'N/A'} - {receipt.receipt_number}",
                "lines": preview_lines,
                "total_debit": float(total),
                "total_credit": float(total),
                "is_balanced": True,
            }
        )
