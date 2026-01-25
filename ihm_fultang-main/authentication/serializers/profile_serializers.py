from rest_framework import serializers
from authentication.models import MedicalStaff
from django.contrib.auth.password_validation import validate_password
from rest_framework.exceptions import ValidationError
class ProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer pour la mise à jour des informations personnelles.
    Permet de modifier uniquement les champs autorisés.
    """
    
    class Meta:
        model = MedicalStaff
        fields = ['first_name', 'last_name', 'email', 'phoneNumber', 'address']
    
    def validate_email(self, value):
    user = self.context['request'].user

    # 🔥 Si l'email n'a pas changé, on ne valide pas
    if value == user.email:
        return value

    if MedicalStaff.objects.exclude(pk=user.pk).filter(email=value).exists():
        raise serializers.ValidationError(
            "Cet email est déjà utilisé par un autre utilisateur"
        )

    return value

    
    def update(self, instance, validated_data):
        """Mettre à jour les champs autorisés"""
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.phoneNumber = validated_data.get('phoneNumber', instance.phoneNumber)
        instance.address = validated_data.get('address', instance.address)
        instance.save()
        return instance
class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer pour le changement de mot de passe.
    Valide l'ancien mot de passe et le nouveau mot de passe.
    """
    current_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    confirm_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate_current_password(self, value):
        """Vérifier que le mot de passe actuel est correct"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Le mot de passe actuel est incorrect")
        return value
    
    def validate(self, attrs):
        """Vérifier que les nouveaux mots de passe correspondent"""
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": "Les mots de passe ne correspondent pas"
            })
        
        # Valider la force du nouveau mot de passe
        try:
            validate_password(attrs['new_password'], self.context['request'].user)
        except ValidationError as e:
            raise serializers.ValidationError({'new_password': list(e.messages)})
        
        return attrs
    
    def save(self):
        """Enregistrer le nouveau mot de passe"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
class ProfilePictureSerializer(serializers.ModelSerializer):
    """
    Serializer pour l'upload de la photo de profil.
    Valide le format et la taille de l'image.
    """
    
    class Meta:
        model = MedicalStaff
        fields = ['profilePicture']
    
    def validate_profilePicture(self, value):
        """Valider le fichier image"""
        # Vérifier le format
        valid_formats = ['image/jpeg', 'image/jpg', 'image/png']
        if value.content_type not in valid_formats:
            raise serializers.ValidationError(
                "Format de fichier non supporté. Utilisez JPG ou PNG."
            )
        
        # Vérifier la taille (max 5MB)
        max_size = 5 * 1024 * 1024  # 5MB
        if value.size > max_size:
            raise serializers.ValidationError(
                "Le fichier est trop volumineux. Taille maximale : 5MB."
            )
        
        return value
    
    def update(self, instance, validated_data):
        """Mettre à jour la photo de profil"""
        # Supprimer l'ancienne photo si elle existe
        if instance.profilePicture:
            import os
            if os.path.isfile(instance.profilePicture.path):
                try:
                    os.remove(instance.profilePicture.path)
                except Exception as e:
                    print(f"Erreur lors de la suppression de l'ancienne photo: {e}")
        
        # Enregistrer la nouvelle photo
        instance.profilePicture = validated_data.get('profilePicture')
        instance.save()
        return instance
class ProfilePictureDeleteSerializer(serializers.Serializer):
    """
    Serializer pour la suppression de la photo de profil.
    Aucun champ nécessaire.
    """
    pass
