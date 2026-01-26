from rest_framework import serializers
from polyclinic.models import Room

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'
    
    def validate_roomNumber(self, value):
        """Validate that roomNumber is not empty and unique."""
        if not value or value.strip() == '':
            raise serializers.ValidationError("Room number cannot be empty. Please provide a valid room number.")
        
        # Check for uniqueness
        if self.instance and self.instance.pk:
            # Updating existing room - exclude current room from check
            if Room.objects.exclude(pk=self.instance.pk).filter(roomNumber=value).exists():
                raise serializers.ValidationError(
                    f"Room number '{value}' is already taken! "
                    f"This number is already assigned to another room. "
                    f"Please choose a different room number."
                )
        else:
            # Creating new room
            if Room.objects.filter(roomNumber=value).exists():
                raise serializers.ValidationError(
                    f"Room number '{value}' already exists! "
                    f"A room with this number has already been registered. "
                    f"Please choose a different room number."
                )
        
        return value
    
    def validate_beds(self, value):
        """Validate that beds is at least 1."""
        if value < 1:
            raise serializers.ValidationError("Number of beds must be at least 1. Please enter a valid number.")
        return value
    
    def validate_price(self, value):
        """Validate that price is positive."""
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative. Please enter a valid price amount.")
        return value
    
    def validate_type(self, value):
        """Validate that type is one of allowed types."""
        allowed_types = ["Simple", "Double", "VIP", "Multiple", "Emergency", "Staff"]
        if value not in allowed_types:
            raise serializers.ValidationError(
                f"Invalid room type! Please select one of the following: {', '.join(allowed_types)}"
            )
        return value

    def to_representation(self, instance):
        """Customize the serializer output to include addDate field."""
        ret = super().to_representation(instance)
        # Ensure addDate is always present; if not, use None
        if not ret.get('addDate'):
            ret['addDate'] = None
        # Also expose as created_at for frontend compatibility
        ret['created_at'] = ret.get('addDate')
        return ret