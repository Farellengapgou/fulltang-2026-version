from django.utils import timezone
from rest_framework import serializers

from polyclinic.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    computed_priority = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id',
            'event_type',
            'priority',
            'computed_priority',
            'message',
            'scheduled_for',
            'data',
            'created_at',
        ]

    def get_computed_priority(self, obj):
        if obj.event_type in ['SURGERY_SCHEDULED', 'SURGERY_REMINDER'] and obj.scheduled_for:
            now = timezone.now()
            delta = obj.scheduled_for - now
            if delta.total_seconds() <= 0:
                return 'RED'
            if delta.total_seconds() <= 30 * 60:
                return 'RED'
            return 'YELLOW'
        return obj.priority
