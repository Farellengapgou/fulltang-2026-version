from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from polyclinic.models import Notification


def _channel_group_name(user_id):
    return f"user_{user_id}"


def broadcast_notification(notification):
    channel_layer = get_channel_layer()
    if not channel_layer:
        return
    async_to_sync(channel_layer.group_send)(
        _channel_group_name(notification.recipient_id),
        {
            "type": "notify",
            "payload": {
                "id": notification.id,
                "event_type": notification.event_type,
                "priority": notification.priority,
                "message": notification.message,
                "scheduled_for": notification.scheduled_for.isoformat() if notification.scheduled_for else None,
                "data": notification.data,
                "created_at": notification.created_at.isoformat(),
            },
        },
    )


def create_notification(*, recipient, event_type, message, priority="GREEN", scheduled_for=None, data=None):
    notification = Notification.objects.create(
        recipient=recipient,
        event_type=event_type,
        priority=priority,
        message=message,
        scheduled_for=scheduled_for,
        data=data or {},
    )
    broadcast_notification(notification)
    return notification
