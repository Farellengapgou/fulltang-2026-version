from django.urls import path
from authentication.api_views.auth_api_views import (
    CustomTokenObtainPairView,
    PasswordResetRequestView,
    UserProfileView,
    PasswordResetConfirmView,
    LogoutAllView
)
from authentication.api_views.profile_api_views import (
    ProfileUpdateView,
    PasswordChangeView,
    ProfilePictureUploadView,
    ProfilePictureDeleteView
)
from rest_framework_simplejwt import views as jwt_views
urlpatterns = [
    # Authentication
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserProfileView.as_view(), name='user_profile'),
    path('password-reset/request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('logout/', LogoutAllView.as_view(), name='logout_all'),
    
    # Profile Management
    path('profile/update/', ProfileUpdateView.as_view(), name='profile_update'),
    path('profile/change-password/', PasswordChangeView.as_view(), name='change_password'),
    path('profile/upload-picture/', ProfilePictureUploadView.as_view(), name='upload_picture'),
    path('profile/delete-picture/', ProfilePictureDeleteView.as_view(), name='delete_picture'),
]
