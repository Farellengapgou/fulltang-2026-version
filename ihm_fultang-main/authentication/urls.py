from django.urls import path
from authentication.api_views.auth_api_views import CustomTokenObtainPairView, UserProfileView, PasswordResetView, LogoutAllView
from rest_framework_simplejwt import views as jwt_views

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserProfileView.as_view(), name='user_profile'),
    path('reset-password/', PasswordResetView.as_view(), name='password_reset'),
    path('logout/', LogoutAllView.as_view(), name='logout_all'),
]