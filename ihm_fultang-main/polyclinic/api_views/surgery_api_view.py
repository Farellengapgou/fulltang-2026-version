from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from polyclinic.models import Surgery
from polyclinic.serializers.surgery_serializers import SurgerySerializer


class SurgeryViewSet(ModelViewSet):
    queryset = Surgery.objects.all().order_by('-scheduled_at')
    serializer_class = SurgerySerializer
    permission_classes = [IsAuthenticated]
