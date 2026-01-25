import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from authentication.serializers.profile_serializers import (
    ProfileUpdateSerializer,
    PasswordChangeSerializer,
    ProfilePictureSerializer,
    ProfilePictureDeleteSerializer
)

from rest_framework.parsers import MultiPartParser, FormParser
class ProfileUpdateView(APIView):
    """
    Vue pour mettre à jour les informations personnelles de l'utilisateur.
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="Mettre à jour le profil utilisateur",
        operation_description=(
            "Permet à l'utilisateur connecté de mettre à jour ses informations personnelles. "
            "Les champs modifiables sont : first_name, last_name, email, phoneNumber, address."
        ),
        request_body=ProfileUpdateSerializer,
        responses={
            200: openapi.Response(
                description="Profil mis à jour avec succès",
                examples={
                    "application/json": {
                        "message": "Profil mis à jour avec succès",
                        "user": {
                            "id": 1,
                            "username": "johndoe",
                            "first_name": "John",
                            "last_name": "Doe",
                            "email": "johndoe@example.com",
                            "phoneNumber": "123-456-7890",
                            "address": "Yaounde - Bastos"
                        }
                    }
                }
            ),
            400: openapi.Response(
                description="Données invalides",
                examples={
                    "application/json": {
                        "email": ["Cet email est déjà utilisé par un autre utilisateur"]
                    }
                }
            )
        }
    )
    def patch(self, request):
        user = request.user
        serializer = ProfileUpdateSerializer(
            user,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            updated_user = serializer.save()
            
            return Response({
                "message": "Profil mis à jour avec succès",
                "user": {
                    "id": updated_user.id,
                    "username": updated_user.username,
                    "first_name": updated_user.first_name,
                    "last_name": updated_user.last_name,
                    "email": updated_user.email,
                    "phoneNumber": updated_user.phoneNumber,
                    "address": updated_user.address,
                    "gender": updated_user.gender,
                    "cniNumber": updated_user.cniNumber,
                    "birthDate": updated_user.birthDate,
                    "role": updated_user.role,
                    "userType": updated_user.userType,
                    "profilePicture": request.build_absolute_uri(updated_user.profilePicture.url) if updated_user.profilePicture else None
                }
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class PasswordChangeView(APIView):
    """
    Vue pour changer le mot de passe de l'utilisateur.
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="Changer le mot de passe",
        operation_description=(
            "Permet à l'utilisateur connecté de changer son mot de passe. "
            "Nécessite le mot de passe actuel, le nouveau mot de passe et sa confirmation."
        ),
        request_body=PasswordChangeSerializer,
        responses={
            200: openapi.Response(
                description="Mot de passe changé avec succès",
                examples={
                    "application/json": {
                        "message": "Mot de passe changé avec succès"
                    }
                }
            ),
            400: openapi.Response(
                description="Données invalides",
                examples={
                    "application/json": {
                        "current_password": ["Le mot de passe actuel est incorrect"],
                        "confirm_password": ["Les mots de passe ne correspondent pas"]
                    }
                }
            )
        }
    )
    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Invalider tous les tokens JWT existants pour forcer la reconnexion
            try:
                from rest_framework_simplejwt.tokens import RefreshToken
                from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
                
                # Blacklister tous les tokens existants de l'utilisateur
                tokens = OutstandingToken.objects.filter(user=user)
                for token in tokens:
                    try:
                        RefreshToken(token.token).blacklist()
                    except Exception:
                        pass  # Token déjà blacklisté ou invalide
                        
            except Exception as e:
                # Si le blacklisting échoue, on continue quand même
                print(f"Erreur lors du blacklisting des tokens: {e}")
            
            return Response({
                "message": "Mot de passe changé avec succès. Veuillez vous reconnecter."
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class ProfilePictureUploadView(APIView):
    """
    Vue pour uploader une photo de profil.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    @swagger_auto_schema(
        operation_summary="Uploader une photo de profil",
        operation_description=(
            "Permet à l'utilisateur de télécharger une photo de profil. "
            "Formats acceptés : JPG, PNG. Taille maximale : 5MB. "
            "L'ancienne photo est automatiquement supprimée."
        ),
        manual_parameters=[
            openapi.Parameter(
                'profilePicture',
                openapi.IN_FORM,
                description="Fichier image de la photo de profil",
                type=openapi.TYPE_FILE,
                required=True
            )
        ],
        responses={
            200: openapi.Response(
                description="Photo uploadée avec succès",
                examples={
                    "application/json": {
                        "message": "Photo de profil mise à jour avec succès",
                        "profilePicture": "http://127.0.0.1:8009/media/profile_pictures/user_1.jpg"
                    }
                }
            ),
            400: openapi.Response(
                description="Fichier invalide",
                examples={
                    "application/json": {
                        "profilePicture": ["Format de fichier non supporté. Utilisez JPG ou PNG."]
                    }
                }
            )
        }
    )
    def post(self, request):
        user = request.user
        serializer = ProfilePictureSerializer(
            user,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            updated_user = serializer.save()
            
            return Response({
                "message": "Photo de profil mise à jour avec succès",
                "profilePicture": request.build_absolute_uri(updated_user.profilePicture.url) if updated_user.profilePicture else None
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class ProfilePictureDeleteView(APIView):
    """
    Vue pour supprimer la photo de profil de l'utilisateur.
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="Supprimer la photo de profil",
        operation_description=(
            "Supprime la photo de profil de l'utilisateur connecté et revient à l'avatar par défaut. "
            "Le fichier physique est supprimé du serveur."
        ),
        responses={
            200: openapi.Response(
                description="Photo supprimée avec succès",
                examples={
                    "application/json": {
                        "message": "Photo de profil supprimée avec succès",
                        "profilePicture": None
                    }
                }
            ),
            404: openapi.Response(
                description="Aucune photo à supprimer",
                examples={
                    "application/json": {
                        "error": "Aucune photo de profil à supprimer"
                    }
                }
            )
        }
    )
    def delete(self, request):
        user = request.user
        
        # Vérifier si l'utilisateur a une photo de profil
        if not user.profilePicture:
            return Response(
                {"error": "Aucune photo de profil à supprimer"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Supprimer le fichier physique
        if user.profilePicture:
            try:
                if os.path.isfile(user.profilePicture.path):
                    os.remove(user.profilePicture.path)
            except Exception as e:
                print(f"Erreur lors de la suppression du fichier: {e}")
        
        # Réinitialiser le champ
        user.profilePicture = None
        user.save()
        
        return Response({
            "message": "Photo de profil supprimée avec succès",
            "profilePicture": None
        }, status=status.HTTP_200_OK)
