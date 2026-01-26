from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ReadOnlyModelViewSet

from polyclinic.models import Notification
from polyclinic.serializers.notification_serializers import NotificationSerializer


class NotificationViewSet(ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).order_by('-created_at')
