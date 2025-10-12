from django.db.models.query import Prefetch
from rest_framework.viewsets import ModelViewSet

from polyclinic.models import MedicalFolder, MedicalFolderPage, Parameters
from polyclinic.permissions.medical_folder_permissions import MedicalFolderPermission
from polyclinic.serializers.medical_folder_serializers import MedicalFolderSerializer, MedicalFolderDetailsSerializer
from polyclinic.serializers.medical_folder_page_serializers import MedicalFolderPageCreateSerializer, MedicalFolderPageSerializer
from polyclinic.serializers.parameters_serializers import ParametersSerializer, ParametersCreateSerializer
from polyclinic.pagination import CustomPagination
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.decorators import method_decorator
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from django.db import transaction

tags = ["medical-folder"]
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
        tags=tags
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
class MedicalFolderViewSet(ModelViewSet):

    permission_classes = [IsAuthenticated, MedicalFolderPermission]
    #permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination

    def get_queryset(self):
        queryset = MedicalFolder.objects.all()
        queryset = MedicalFolder.objects.prefetch_related(
            Prefetch(
                'medicalfolderpage_set',  # Relation vers MedicalFolderPage
                queryset=MedicalFolderPage.objects.select_related('parameters')  # Relation vers Parameters
            )
        )
        return queryset

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"] or self.request.method in ["GET", "HEAD", "OPTIONS"]:
            return MedicalFolderDetailsSerializer
        else:
            return MedicalFolderSerializer

    def perform_create(self, serializer):
        if 'id' in serializer.validated_data:
            serializer.validated_data.pop('id')
        serializer.save()

    def perform_update(self, serializer):
        if 'id' in serializer.validated_data:
            serializer.validated_data.pop('id')
        serializer.save()

    @swagger_auto_schema(
        operation_description="Ajouter une nouvelle page à un carnet médical. ",
        request_body=MedicalFolderPageCreateSerializer,  # Explique le corps attendu
        responses={
            201: MedicalFolderPageCreateSerializer,
            400: openapi.Response(description="Requête invalide. Vérifiez les données envoyées."),
            403: openapi.Response(description="Token invalide ou expiré."),
        },
        manual_parameters=[
            auth_header_param
        ],
        tags=tags
    )
    @action(methods=['post'], detail=True, url_path='add-page', permission_classes=permission_classes)
    def add_page(self, request, *args, **kwargs):
        user = self.request.user
        medical_folder = self.get_object()
        number = MedicalFolderPage.objects.filter(idMedicalFolder=medical_folder).count() + 1
        data = request.data
        data['pageNumber'] = number
        if user.id != data['idMedicalStaff']:
            return Response({"details": "l'id du medicalstaff envoyé n'est pas celui de la requete"}, status=status.HTTP_400_BAD_REQUEST)
        if medical_folder.id != data['idMedicalFolder']:
            return Response({"details": "l'id du carnet medical donnée n'est pas celui de la requete"}, status=status.HTTP_400_BAD_REQUEST)
        serializer = MedicalFolderPageCreateSerializer(data=data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_description="Mettre à jour une page d'un cahier médical",
        request_body=MedicalFolderPageCreateSerializer,
        responses={
            200: MedicalFolderPageCreateSerializer,
            400: openapi.Response(description="Requête invalide. Vérifiez les données envoyées."),
            404: openapi.Response(description="Page inexistante"),
            403: openapi.Response(description="Token invalide ou expiré."),
        },
        manual_parameters=[
            openapi.Parameter(
                'id',
                openapi.IN_PATH,
                description="ID de la page.",
                type=openapi.TYPE_INTEGER
            )
        ],
        tags=tags
    )
    @action(methods=['put'], detail=True, url_path='update-page/(?P<id>[^/.]+)', permission_classes=permission_classes)
    def update_page(self, request, id=None, *args, **kwargs):
        try:
            if id is None:
                return Response({'error': 'L\'ID de la page est requis.'}, status=status.HTTP_400_BAD_REQUEST)

            page = MedicalFolderPage.objects.get(id=id)

            # Vérification que la page appartient bien au carnet médical (MedicalFolder)
            medical_folder = self.get_object()
            if page.idMedicalFolder != medical_folder:
                return Response(
                    {'details': 'Cette page n\'est pas associée au carnet médical spécifié.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Validation et mise à jour des données
            serializer = MedicalFolderPageCreateSerializer(page, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except MedicalFolderPage.DoesNotExist:
            return Response({'details': 'Page inexistante.'}, status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(
        operation_description="Ajouter de nouveaux paramètres, une nouvelle page sera cree d'abord",
        request_body=ParametersCreateSerializer,
        responses={
            201: ParametersCreateSerializer,
            400: openapi.Response(description="Requête invalide. Vérifiez les données envoyées."),
            403: openapi.Response(description="Token invalide ou expiré."),
        },
        tags=tags
    )
    @action(methods=['post'], detail=True, url_path='new-params', permission_classes=permission_classes)
    @transaction.atomic
    def new_params(self, request, *args, **kwargs):
        user = self.request.user
        medical_folder = self.get_object()
        number = MedicalFolderPage.objects.filter(idMedicalFolder=medical_folder).count() + 1
        data = {'idMedicalFolder': medical_folder.id,
                'idMedicalStaff': user.id,
                'pageNumber': number}
        page_serializer = MedicalFolderPageCreateSerializer(data=data)
        if page_serializer.is_valid(raise_exception=True):
            page = page_serializer.save()
            data = request.data
            data['idMedicalFolderPage'] = page.id
            params_serializer = ParametersCreateSerializer(data=data)
            if params_serializer.is_valid():
                params_serializer.save()
                return Response(params_serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(params_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(page_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_description="Mettre à jour les paramètres d'une page",
        request_body=ParametersCreateSerializer,
        responses={
            200: ParametersCreateSerializer,
            400: openapi.Response(description="Requête invalide. Vérifiez les données envoyées."),
            403: openapi.Response(description="Token invalide ou expiré."),
        },
        tags=tags
    )
    @action(methods=['put'], detail=True, url_path='update-params/(?P<idParam>[^/.]+)', permission_classes=permission_classes)
    def update_params(self, request, idParam=None, *args, **kwargs):
        try:
            if idParam is None:
                return Response({'details', "id du paramètre requis"}, status=status.HTTP_400_BAD_REQUEST)
            params = Parameters.objects.get(id=idParam)
            serializer = ParametersCreateSerializer(params, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Parameters.DoesNotExist:
            return Response({'details': 'Parameters not found'}, status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(
        operation_description="Obtenir la dernière page d'un cahier médical",
        responses={
            200: MedicalFolderPageSerializer,
            404: openapi.Response(description="Page inexistante"),
            403: openapi.Response(description="Token invalide ou expiré."),
        },
        tags=tags
    )
    @action(methods=['get'], detail=True, url_path='last-page', permission_classes=permission_classes)
    def last_page(self, request, pk=None, *args, **kwargs):
        medical_folder = self.get_object()
        #last_page = medical_folder.medicalfolderpage_set.order_by('-addDate').first()
        last_page = MedicalFolderPage.objects.filter(idMedicalFolder=medical_folder).order_by('-pageNumber').first()
        number_page = MedicalFolderPage.objects.filter(idMedicalFolder=medical_folder).count()
        if last_page:
            serializer = MedicalFolderPageSerializer(last_page)
            response_data = serializer.data
            response_data['totalPage'] = number_page
            return Response(response_data, status=status.HTTP_200_OK)
        return Response({'details': 'No pages found'}, status=status.HTTP_404_NOT_FOUND)


    @swagger_auto_schema(
        operation_description="Obtenir les paramètres les plus récents",
        responses={200: ParametersSerializer,
                   404: openapi.Response(description="Page inexistante"),
                   403: openapi.Response(description="Token invalide ou expiré."),
        },
        tags=tags
    )
    @action(methods=['get'], detail=True, url_path='last-params')
    def last_params(self, request, *args, **kwargs):
        medical_folder = self.get_object()
        pages = MedicalFolderPage.objects.filter(idMedicalFolder=medical_folder)
        parameters = Parameters.objects.filter(idMedicalFolderPage__in=pages)
        last_params = parameters.order_by('-addDate').first()
        if last_params:
            serializer = ParametersSerializer(last_params)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'details': 'No parameters found'}, status=status.HTTP_404_NOT_FOUND)


    @swagger_auto_schema(
        operation_description="Obtenir une page par id",
        responses={200: ParametersSerializer,
                   404: openapi.Response(description="Page inexistante"),
                   400: openapi.Response(description="Requête invalide. Vérifiez les données envoyées."),
                   403: openapi.Response(description="Token invalide ou expiré."),
        },
        manual_parameters=[auth_header_param,
           openapi.Parameter('id', openapi.IN_PATH, description="Id de la page",
                             type=openapi.TYPE_INTEGER, required=True),
           #openapi.Parameter(
           #    'date',
           #    openapi.IN_QUERY,
           #    description="pour effectuer un filtre par date",
           #    type=openapi.TYPE_BOOLEAN,
           #    required=False
           #),
        ],
        tags=tags
    )
    @action(methods=['get'], detail=True, url_path='get-page-by-id/(?P<id>[^/.]+)', permission_classes=permission_classes)
    def get_page_by_id(self, request, id=None, *args, **kwargs):
        date = request.query_params.get('date', None)
        medical_folder = self.get_object()
        pages = MedicalFolderPage.objects.filter(idMedicalFolder=medical_folder)
        if id:
            page = pages.filter(id=id).first()
            if not page:
                return Response({'details': 'Page not found'}, status=status.HTTP_404_NOT_FOUND)
            serializer = MedicalFolderPageSerializer(page)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'details': 'bad request'}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_description="Obtenir une page par numero de page",
        responses={200: ParametersSerializer,
                   404: openapi.Response(description="Page inexistante"),
                   400: openapi.Response(description="Requête invalide. Vérifiez les données envoyées."),
                   403: openapi.Response(description="Token invalide ou expiré."),
                   },
        manual_parameters=[auth_header_param,
           openapi.Parameter('number', openapi.IN_PATH, description="numero de la page",
                             type=openapi.TYPE_INTEGER, required=True),
           ],
        tags=tags
    )
    @action(methods=['get'], detail=True, url_path='get-page-by-page-number/(?P<number>[^/.]+)',
            permission_classes=permission_classes)
    def get_page_by_page_number(self, request, number=None, *args, **kwargs):
        medical_folder = self.get_object()
        pages = MedicalFolderPage.objects.filter(idMedicalFolder=medical_folder)
        if number:
            page = pages.filter(pageNumber=number).first()
            if not page:
                return Response({'details': 'Page not found'}, status=status.HTTP_404_NOT_FOUND)
            serializer = MedicalFolderPageSerializer(page)
            response_data = serializer.data
            page_number = pages.count()
            response_data['nextPage'] = int(number) + 1 if int(number) + 1 <= page_number else None
            return Response(response_data, status=status.HTTP_200_OK)
        return Response({'details': 'bad request'}, status=status.HTTP_400_BAD_REQUEST)





