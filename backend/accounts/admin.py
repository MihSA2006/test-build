from django.contrib import admin
from .models import LoginAttempt, UserProfile

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'created_at']
    list_filter = ['role']
    search_fields = ['user__username', 'user__email']

@admin.register(LoginAttempt)
class LoginAttemptAdmin(admin.ModelAdmin):
    list_display = ['user', 'city', 'country', 'created_at', 'is_verified', 'is_approved']
    list_filter = ['is_verified', 'is_approved']