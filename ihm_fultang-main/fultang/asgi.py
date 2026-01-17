"""
ASGI config for fultang project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

from fultang.routing import websocket_urlpatterns
from fultang.channels_auth import JwtAuthMiddleware

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fultang.settings')

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": JwtAuthMiddleware(URLRouter(websocket_urlpatterns)),
    }
)
