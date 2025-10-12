"""fultang URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from polyclinic import api_urls
from accounting import urls as accounting_urls
from authentication import urls as authentication_urls
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.conf import settings
from django.conf.urls.static import static


schema_view = get_schema_view(
   openapi.Info(
      title="Fultang Api",
      default_version='v1',
      description="Application de gestion hospitalière",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="jonathabachelard@gmail.com"),
      license=openapi.License(name="Free License"),
   ),
   public=True,
   permission_classes=[permissions.AllowAny],
)

urlpatterns = [

    #path('api/', api_urls()),
    path('admin/', admin.site.urls),
    path('api/v1/medical/', include(api_urls)),
    path('api/v1/accounting/', include(accounting_urls)),
    path('api/v1/auth/', include(authentication_urls)),
    path('api/v1/doc', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/v1/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('swagger.json', schema_view.without_ui(cache_timeout=0), name='schema-json'),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)