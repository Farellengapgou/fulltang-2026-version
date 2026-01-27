from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import OutstandingToken, BlacklistedToken
from authentication.serializers.auth_serializers import CustomTokenObtainPairSerializer, RegistrationSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.contrib.auth import get_user_model

# Create your views here.

User = get_user_model()

class LogoutAllView(APIView):
    permission_classes = [IsAuthenticated,]

    def post(self, request):
        tokens = OutstandingToken.objects.filter(user_id=request.user.id)
        for token in tokens:
            token.blacklist()
            t, _ = BlacklistedToken.objects.get_or_create(token=token)

        return Response(status=status.HTTP_205_RESET_CONTENT)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegistrationView(APIView):
    @swagger_auto_schema(
        operation_summary="Enregistrer un nouvel utilisateur",
        operation_description=(
                "Cette API permet d'enregistrer un nouvel utilisateur dans le système. "
                "L'utilisateur peut être de type `Medical` (personnel médical) ou `Accountant` (personnel comptable). "
                "Un token JWT est renvoyé après l'enregistrement pour permettre à l'utilisateur de se connecter immédiatement."
        ),
        request_body=RegistrationSerializer,  # Utilisez directement le serializer ici
        responses={
            201: openapi.Response(
                description="Utilisateur enregistré avec succès",
                examples={
                    "application/json": {
                        "user": {
                            "id": 1,
                            "username": "johndoe",
                            "email": "johndoe@example.com",
                            "userType": "Medical",
                            "role": "Doctor",
                        },
                        "token": {
                            "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                            "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        }
                    }
                }
            ),
            400: openapi.Response(
                description="Données invalides - vérifiez les champs obligatoires et les formats.",
                examples={
                    "application/json": {
                        "username": ["Ce champ est obligatoire."],
                        "email": ["Entrez une adresse email valide."],
                    }
                }
            ),
        }
    )
    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            responses = serializer.save()
            return Response(responses, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Obtenir le profil utilisateur connecté",
        operation_description=(
                "Cette API renvoie les informations du profil de l'utilisateur connecté. "
                "Le type d'utilisateur peut être `medical`, `accountant` ou `user`. "
                "Les champs spécifiques tels que `role` sont inclus si applicables."
        ),
        responses={
            200: openapi.Response(
                description="Profil utilisateur récupéré avec succès",
                examples={
                    "application/json": {
                        "username": "johndoe",
                        "email": "johndoe@example.com",
                        "first_name": "John",
                        "last_name": "Doe",
                        "gender": "Male",
                        "cniNumber": "123456789",
                        "phoneNumber": "123-456-7890",
                        "birthDate": "1985-10-15",
                        "address": "Yaoundé - damas",
                        "userType": "medical",
                        "role": "Doctor",
                    }
                }
            ),
            401: openapi.Response(
                description="Non autorisé - l'utilisateur doit être authentifié."
            ),
        }
    )
    # def get(self, request):
    #     user_instance = request.user
    #     # Retourner les informations de l'utilisateur connecté
    #     user_data = {
    #         "id": user_instance.id,
    #         "username": user_instance.username,
    #         "email": user_instance.email,
    #         "first_name": user_instance.first_name,
    #         "last_name": user_instance.last_name,
    #         "gender": user_instance.gender,
    #         "cniNumber": user_instance.cniNumber,
    #         "phoneNumber": user_instance.phoneNumber,
    #         "birthDate": user_instance.birthDate,
    #         "address": user_instance.address,
    #         "userType": user_instance.userType,
    #         "role": user_instance.role,
    #     }
    #     return Response(user_data)
    def get(self, request):
        user_instance = request.user
        # Retourner les informations de l'utilisateur connecté
        user_data = {
            "id": user_instance.id,
            "username": user_instance.username,
            "email": user_instance.email,
            "first_name": user_instance.first_name,
            "last_name": user_instance.last_name,
            "gender": user_instance.gender,
            "cniNumber": user_instance.cniNumber,
            "phoneNumber": user_instance.phoneNumber,
            "birthDate": user_instance.birthDate,
            "address": user_instance.address,
            "userType": user_instance.userType,
            "role": user_instance.role,
            "profilePicture": request.build_absolute_uri(user_instance.profilePicture.url) if user_instance.profilePicture else None,
        }
        return Response(user_data)

class PasswordResetRequestView(APIView):
    authentication_classes = []   
    permission_classes = [AllowAny]

    """Vue pour demander la réinitialisation du mot de passe"""
    @swagger_auto_schema(
        operation_summary="Demander la réinitialisation du mot de passe",
        operation_description=(
            "Cette API permet à un utilisateur de demander la réinitialisation de son mot de passe. "
            "Un email de confirmation sera envoyé à l'adresse fournie avec un lien pour confirmer le changement."
        ),
        request_body=PasswordResetRequestSerializer,
        responses={
            200: openapi.Response(
                description="Email de confirmation envoyé",
                examples={
                    "application/json": {
                        "message": "Un email de confirmation a été envoyé à votre adresse",
                        "email": "user@example.com"
                    }
                }
            ),
            400: openapi.Response(
                description="Données invalides",
                examples={
                    "application/json": {
                        "password_confirmation": ["Les mots de passe ne correspondent pas"],
                        "email": ["Aucun utilisateur trouvé avec cet email"]
                    }
                }
            )
        }
    )
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            serializer.save()
            return Response({
                "message": "Un email de confirmation a été envoyé à votre adresse",
                "email": request.data.get('email')
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "error": "Une erreur s'est produite lors de l'envoi de l'email"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PasswordResetConfirmView(APIView):
    authentication_classes = []   # 🔥 IMPORTANT
    permission_classes = [AllowAny]

    """Vue pour confirmer la réinitialisation du mot de passe"""
    @swagger_auto_schema(
        operation_summary="Confirmer la réinitialisation du mot de passe",
        operation_description=(
            "Cette API permet de confirmer la réinitialisation du mot de passe "
            "en utilisant le token reçu par email."
        ),
        request_body=PasswordResetConfirmSerializer,
        responses={
            200: openapi.Response(
                description="Mot de passe réinitialisé avec succès",
                examples={
                    "application/json": {
                        "message": "Votre mot de passe a été réinitialisé avec succès"
                    }
                }
            ),
            400: openapi.Response(
                description="Token invalide ou expiré",
                examples={
                    "application/json": {
                        "token": ["Ce lien de réinitialisation a expiré ou a déjà été utilisé"]
                    }
                }
            )
        }
    )
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save()
        return Response({
            "message": "Votre mot de passe a été réinitialisé avec succès"
        }, status=status.HTTP_200_OK)
    
