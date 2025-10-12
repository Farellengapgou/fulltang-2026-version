from rest_framework import serializers

class UserQuerySerializer(serializers.Serializer):
    question = serializers.CharField(max_length=1000)