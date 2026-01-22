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

from accounting.stock_models import (
    GoodsIssueNote,
    GoodsIssueLine,
    StockMovement,
    Batch,
    Stock,
)
from accounting.stock_serializers import (
    GoodsIssueNoteSerializer,
    GoodsIssueLineSerializer,
)

auth_header_param = openapi.Parameter(
    name="Authorization",
    in_=openapi.IN_HEADER,
    description="Token JWT (Bearer <token>)",
    type=openapi.TYPE_STRING,
    required=True,
)

tags = ["goods-issue"]


def apply_issue_filters(qs, params):
    """Applique les filtres sur les bons de sortie"""

    state = params.get("state")
    if state:
        qs = qs.filter(status__iexact=state)

    issue_type = params.get("issue_type")
    if issue_type:
        qs = qs.filter(issue_type__iexact=issue_type)

    warehouse_id = params.get("warehouse_id")
    if warehouse_id:
        qs = qs.filter(depot_id=warehouse_id)

    depot_id = params.get("depot_id")
    if depot_id:
        qs = qs.filter(depot_id=depot_id)

    department_id = params.get("department_id")
    if department_id:
        qs = qs.filter(department_id=department_id)

    patient_id = params.get("patient_id")
    if patient_id:
        qs = qs.filter(patient_id=patient_id)

    beneficiary_type = params.get("beneficiary_type")
    if beneficiary_type:
        if beneficiary_type.upper() == "PATIENT":
            qs = qs.filter(patient__isnull=False)
        elif beneficiary_type.upper() == "DEPARTMENT":
            qs = qs.filter(department__isnull=False)

    start_date = params.get("start_date")
    end_date = params.get("end_date")
    if start_date:
        sd = parse_date(start_date)
        if sd:
            qs = qs.filter(issue_date__gte=sd)
    if end_date:
        ed = parse_date(end_date)
        if ed:
            qs = qs.filter(issue_date__lte=ed)

    issue_number = params.get("issue_number")
    if issue_number:
        qs = qs.filter(issue_number__icontains=issue_number)

    return qs


@method_decorator(
    name="list",
    decorator=swagger_auto_schema(
        operation_summary="Lister les bons de sortie",
        operation_description="Retourne une liste paginée des bons de sortie avec filtres optionnels.",
        manual_parameters=[
            auth_header_param,
            openapi.Parameter(
                "state",
                openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                enum=["DRAFT", "CONFIRMED", "POSTED", "CANCELLED"],
            ),
            openapi.Parameter(
                "issue_type",
                openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                enum=[
                    "SALE",
                    "CONSUMPTION",
                    "TRANSFER_OUT",
                    "DAMAGE",
                    "EXPIRY",
                    "RETURN",
                    "DISPENSATION",
                ],
            ),
            openapi.Parameter(
                "warehouse_id", openapi.IN_QUERY, type=openapi.TYPE_INTEGER
            ),
            openapi.Parameter(
                "department_id", openapi.IN_QUERY, type=openapi.TYPE_INTEGER
            ),
            openapi.Parameter(
                "patient_id", openapi.IN_QUERY, type=openapi.TYPE_INTEGER
            ),
            openapi.Parameter(
                "beneficiary_type",
                openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                enum=["PATIENT", "DEPARTMENT"],
            ),
            openapi.Parameter(
                "start_date", openapi.IN_QUERY, type=openapi.TYPE_STRING, format="date"
            ),
            openapi.Parameter(
                "end_date", openapi.IN_QUERY, type=openapi.TYPE_STRING, format="date"
            ),
            openapi.Parameter(
                "issue_number", openapi.IN_QUERY, type=openapi.TYPE_STRING
            ),
        ],
        tags=tags,
    ),
)
@method_decorator(
    name="retrieve",
    decorator=swagger_auto_schema(
        operation_summary="Récupérer un bon de sortie",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
@method_decorator(
    name="create",
    decorator=swagger_auto_schema(
        operation_summary="Créer un bon de sortie",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
@method_decorator(
    name="update",
    decorator=swagger_auto_schema(
        operation_summary="Mettre à jour un bon de sortie",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
@method_decorator(
    name="partial_update",
    decorator=swagger_auto_schema(
        operation_summary="Mise à jour partielle d'un bon de sortie",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
@method_decorator(
    name="destroy",
    decorator=swagger_auto_schema(
        operation_summary="Supprimer un bon de sortie",
        manual_parameters=[auth_header_param],
        tags=tags,
    ),
)
class GoodsIssueNoteViewSet(ModelViewSet):
    """
    ViewSet pour la gestion des bons de sortie.

    Actions disponibles:
    - lines: Lister/Ajouter des lignes
    - line_detail: GET/PUT/DELETE sur une ligne spécifique
    - validate: Confirmer le bon (méthode FEFO)
    - post: Comptabiliser le bon
    - cancel: Annuler le bon
    - check-availability: Vérifier la disponibilité du stock
    - suggested-batches: Suggérer les lots selon FEFO
    """

    queryset = (
        GoodsIssueNote.objects.select_related(
            "depot", "department", "patient", "created_by", "validated_by"
        )
        .prefetch_related("lines__article", "lines__batch")
        .order_by("-issue_date", "-created_at")
    )
    serializer_class = GoodsIssueNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status != 'DRAFT':
            return Response(
                {"detail": "Seuls les bons en brouillon peuvent être supprimés pour préserver la traçabilité du stock (lots réservés ou déduits)."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)


    def get_queryset(self):
        qs = super().get_queryset()
        return apply_issue_filters(qs, self.request.query_params)

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
        operation_summary="Lister les lignes d'un bon de sortie",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @action(detail=True, methods=["get"], url_path="lines")
    def lines(self, request, pk=None):
        issue = self.get_object()
        lines = (
            GoodsIssueLine.objects.filter(issue_id=issue.pk)
            .select_related("article", "batch")
            .order_by("id")
        )
        serializer = GoodsIssueLineSerializer(lines, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_summary="Ajouter une ligne au bon de sortie",
        request_body=GoodsIssueLineSerializer,
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @lines.mapping.post
    @transaction.atomic
    def add_line(self, request, pk=None):
        issue = self.get_object()

        if issue.status != "DRAFT":
            return Response(
                {"detail": "Impossible d'ajouter des lignes à un bon non brouillon"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = request.data.copy()
        data["issue"] = pk

        serializer = GoodsIssueLineSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Mettre à jour le total (PMP prévisionnel)
        issue.total_amount = sum(line.quantity * line.article.weighted_average_price for line in issue.lines.all())
        issue.save(update_fields=["total_amount"])

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @swagger_auto_schema(
        operation_summary="Récupérer une ligne spécifique",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @action(detail=True, methods=["get"], url_path=r"lines/(?P<line_id>\d+)")
    def line_detail(self, request, pk=None, line_id=None):
        """Récupère une ligne spécifique"""
        issue = self.get_object()
        try:
            line = GoodsIssueLine.objects.select_related("article", "batch").get(
                issue_id=pk, pk=line_id
            )
        except GoodsIssueLine.DoesNotExist:
            return Response(
                {"detail": "Ligne non trouvée"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = GoodsIssueLineSerializer(line)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_summary="Modifier une ligne spécifique",
        request_body=GoodsIssueLineSerializer,
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @line_detail.mapping.put
    @transaction.atomic
    def update_line(self, request, pk=None, line_id=None):
        """Modifie une ligne spécifique"""
        issue = self.get_object()

        if issue.status != "DRAFT":
            return Response(
                {"detail": "Impossible de modifier les lignes d'un bon non brouillon"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            line = GoodsIssueLine.objects.get(issue_id=pk, pk=line_id)
        except GoodsIssueLine.DoesNotExist:
            return Response(
                {"detail": "Ligne non trouvée"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = GoodsIssueLineSerializer(line, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Mettre à jour le total
        issue.total_amount = sum(l.quantity * l.article.weighted_average_price for l in issue.lines.all())
        issue.save(update_fields=["total_amount"])

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
        issue = self.get_object()

        if issue.status != "DRAFT":
            return Response(
                {"detail": "Impossible de supprimer les lignes d'un bon non brouillon"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            line = GoodsIssueLine.objects.get(issue_id=pk, pk=line_id)
        except GoodsIssueLine.DoesNotExist:
            return Response(
                {"detail": "Ligne non trouvée"}, status=status.HTTP_404_NOT_FOUND
            )

        line.delete()

        # Mettre à jour le total
        issue.total_amount = sum(l.line_amount for l in issue.lines.all())
        issue.save(update_fields=["total_amount"])

        return Response(status=status.HTTP_204_NO_CONTENT)

    @swagger_auto_schema(
        operation_summary="Valider un bon de sortie (Réservation)",
        operation_description="Passe le bon en VALIDATED et réserve les quantités dans le stock.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @action(detail=True, methods=["post"], url_path="validate")
    @transaction.atomic
    def validate_issue(self, request, pk=None):
        issue = self.get_object()

        if issue.status != "DRAFT":
            return Response(
                {"detail": f"Le bon est déjà {issue.get_status_display()}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not issue.lines.exists():
            return Response(
                {"detail": "Le bon doit contenir au moins une ligne"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            issue.validate(request.user)
        except ValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            {
                "detail": "Bon de sortie réservé avec succès",
                "issue_number": issue.issue_number,
                "status": issue.status,
            },
            status=status.HTTP_200_OK,
        )

    @swagger_auto_schema(
        operation_summary="Confirmer un bon de sortie (Sortie Physique)",
        operation_description="Passe le bon en CONFIRMED et déduit physiquement les quantités des lots.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @action(detail=True, methods=["post"], url_path="confirm")
    @transaction.atomic
    def confirm_issue(self, request, pk=None):
        issue = self.get_object()

        if issue.status != "VALIDATED":
            return Response(
                {"detail": "Le bon doit être validé avant d'être confirmé"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            issue.confirm(request.user)
        except ValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            {
                "detail": "Sortie physique confirmée avec succès",
                "issue_number": issue.issue_number,
                "status": issue.status,
            },
            status=status.HTTP_200_OK,
        )

    @swagger_auto_schema(
        operation_summary="Annuler un bon de sortie",
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
        issue = self.get_object()
        reason = request.data.get("reason", "")

        if issue.status == "CANCELLED":
            return Response(
                {"detail": "Le bon est déjà annulé"}, status=status.HTTP_400_BAD_REQUEST
            )

        if issue.status == "DRAFT":
            issue.delete()
            return Response({"detail": "Bon supprimé"}, status=status.HTTP_200_OK)

        if issue.status not in ["CONFIRMED", "POSTED"]:
            return Response(
                {"detail": "Seuls les bons confirmés ou comptabilisés peuvent être annulés"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Annuler les mouvements associés
        movements = StockMovement.objects.filter(reference_document=issue.issue_number)
        errors = []
        for mv in movements:
            try:
                mv.cancel(
                    request.user,
                    reason=f"Annulation bon {issue.issue_number}: {reason}",
                )
            except Exception as e:
                errors.append(f"Mouvement {mv.movement_number}: {str(e)}")

        # Annuler l'écriture comptable si existe
        if hasattr(issue, "journal_entry") and issue.journal_entry:
            issue.journal_entry.state = "CANCELLED"
            issue.journal_entry.save()

        issue.status = "CANCELLED"
        issue.notes = (
            issue.notes or ""
        ) + f"\n[Annulé le {timezone.now()} par {request.user}] {reason}"
        issue.save()

        if errors:
            return Response(
                {"detail": "Bon annulé avec des erreurs", "errors": errors},
                status=status.HTTP_207_MULTI_STATUS,
            )

        return Response({"detail": "Bon annulé avec succès"}, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="Comptabiliser un bon de sortie",
        operation_description="Génère l'écriture comptable valorisée et passe le statut en POSTED.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @action(detail=True, methods=["post"], url_path="post")
    @transaction.atomic
    def post_issue(self, request, pk=None):
        issue = self.get_object()

        if issue.status != "CONFIRMED":
            return Response(
                {"detail": "Le bon doit être confirmé physiquement avant comptabilisation"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            issue.generate_journal_entry(request.user)
        except ValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            {
                "detail": "Bon de sortie comptabilisé avec succès",
                "journal_entry": issue.journal_entry.entry_number,
                "status": issue.status,
            },
            status=status.HTTP_200_OK,
        )

    @swagger_auto_schema(
        operation_summary="Vérifier la disponibilité",
        operation_description="Vérifie si le stock est suffisant pour chaque ligne dans le dépôt du bon.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @action(detail=True, methods=["post"], url_path="check-availability")
    def check_availability(self, request, pk=None):
        issue = self.get_object()
        result = []
        all_available = True

        for line in issue.lines.select_related("article").all():
            try:
                stock = Stock.objects.get(article=line.article, depot=issue.depot)
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
                "depot_id": issue.depot_id,
                "depot_code": issue.depot.code if issue.depot else None,
                "all_available": all_available,
                "availability": result,
            }
        )

    @swagger_auto_schema(
        operation_summary="Lots suggérés (FEFO)",
        operation_description="Suggère les lots à utiliser selon la méthode FEFO pour le dépôt du bon.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
    @action(detail=True, methods=["get"], url_path="suggested-batches")
    def suggested_batches(self, request, pk=None):
        issue = self.get_object()
        suggestions = []

        for line in issue.lines.select_related("article").all():
            needed = float(line.quantity)

            # Filtrer les lots disponibles (globalement pour l'instant car Batch n'a pas de dépôt)
            batches = Batch.objects.filter(
                article=line.article,
                remaining_quantity__gt=0,
                is_blocked=False,
            ).order_by("expiry_date", "reception_date")

            chosen = []
            remaining_needed = needed

            for batch in batches:
                if remaining_needed <= 0:
                    break

                batch_available = float(batch.remaining_quantity)
                take = min(remaining_needed, batch_available)

                if take > 0:
                    days_until_expiry = None
                    is_near_expiry = False

                    if hasattr(batch, "days_until_expiry"):
                        days_until_expiry = batch.days_until_expiry()
                    if hasattr(batch, "is_near_expiry"):
                        is_near_expiry = batch.is_near_expiry()

                    chosen.append(
                        {
                            "batch_id": batch.id,
                            "batch_number": batch.batch_number,
                            "available": batch_available,
                            "suggested_quantity": take,
                            "expiry_date": (
                                batch.expiry_date.isoformat()
                                if batch.expiry_date
                                else None
                            ),
                            "days_until_expiry": days_until_expiry,
                            "is_near_expiry": is_near_expiry,
                        }
                    )
                    remaining_needed -= take

            suggestions.append(
                {
                    "line_id": line.id,
                    "article_id": line.article_id,
                    "article_code": line.article.code,
                    "article_name": line.article.name,
                    "required": needed,
                    "chosen_batches": chosen,
                    "total_suggested": needed - remaining_needed,
                    "satisfied": remaining_needed <= 0,
                    "shortage": max(0, remaining_needed),
                }
            )

        all_satisfied = all(s["satisfied"] for s in suggestions)

        return Response(
            {
                "depot_id": issue.depot_id,
                "depot_code": issue.depot.code if issue.depot else None,
                "all_satisfied": all_satisfied,
                "suggestions": suggestions,
            }
        )
