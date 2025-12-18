# accounts/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('verify-login/', views.verify_login, name='verify-login'),
    path('logout/', views.logout, name='logout'),
    path('refresh/', views.refresh_token, name='refresh-token'),
    path('', include(router.urls)),
]