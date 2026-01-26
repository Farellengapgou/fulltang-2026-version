from urllib.parse import parse_qs

from asgiref.sync import sync_to_async
from channels.middleware import BaseMiddleware


@sync_to_async
def _get_user_from_token(token):
    try:
        from rest_framework_simplejwt.tokens import AccessToken
        from django.contrib.auth import get_user_model
        from django.contrib.auth.models import AnonymousUser

        access_token = AccessToken(token)
        user_id = access_token.get("user_id")
        if not user_id:
            return AnonymousUser()
        return get_user_model().objects.get(id=user_id)
    except Exception:
        from django.contrib.auth.models import AnonymousUser

        return AnonymousUser()


class JwtAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        token = parse_qs(query_string).get("token", [None])[0]
        if token:
            scope["user"] = await _get_user_from_token(token)
        else:
            from django.contrib.auth.models import AnonymousUser

            scope["user"] = AnonymousUser()
        return await super().__call__(scope, receive, send)
