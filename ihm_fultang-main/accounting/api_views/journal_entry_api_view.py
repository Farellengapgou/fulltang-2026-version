from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.decorators import method_decorator
from rest_framework.permissions import IsAuthenticated
from accounting.serializers import PostJournalEntrySerializer, JournalEntrySerializer
from rest_framework.viewsets import ModelViewSet
from accounting.models import JournalEntry
from django.db import transaction
from django.utils.timezone import now
from rest_framework.exceptions import ValidationError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action

tags = ["journal-entry"]
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
        operation_description="Retourne une liste paginée des classes de compte.",
        manual_parameters=[auth_header_param],
        tags=tags,
    )
)
@method_decorator(
    name="retrieve",
    decorator=swagger_auto_schema(
        operation_summary="Récupérer un objet spécifique",
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
class JournalEntryViewSet(ModelViewSet):
    """
    ViewSet pour la gestion des écritures comptables
    """
    queryset = JournalEntry.objects.all().order_by('-entry_date', '-entry_number')
    serializer_class = JournalEntrySerializer
    permission_classes = [IsAuthenticated]

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
        method='post',
        operation_description="Valide une écriture comptable",
        request_body=PostJournalEntrySerializer,
        responses={
            200: openapi.Response('Écriture validée avec succès', JournalEntrySerializer),
            400: "Erreurs de validation"
        }
    )
    @action(detail=True, methods=['post'])
    def validate_entry(self, request, pk=None):
        """Valide une écriture comptable"""
        entry = self.get_object()

        if entry.state != 'DRAFT':
            return Response(
                {'error': 'Seules les écritures en brouillon peuvent être validées'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not entry.is_balanced():
            return Response(
                {'error': 'L\'écriture n\'est pas équilibrée'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            entry.state = 'VALIDATED'
            entry.validated_by = request.user
            entry.validated_at = now()
            entry.save()

        serializer = self.get_serializer(entry)
        return Response(serializer.data)

    @swagger_auto_schema(
        method='get',
        operation_description="Récupère les écritures en brouillon",
        responses={200: JournalEntrySerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def draft_entries(self, request):
        """Retourne les écritures en brouillon"""
        draft_entries = self.queryset.filter(state='DRAFT')
        serializer = self.get_serializer(draft_entries, many=True)
        return Response(serializer.data)

