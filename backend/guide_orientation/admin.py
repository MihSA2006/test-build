from django.contrib import admin
from .models import OrientationSession

@admin.register(OrientationSession)
class OrientationSessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'serie_bac', 'status', 'created_at', 'updated_at']
    list_filter = ['status', 'serie_bac', 'created_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at', 'questions_json', 'reponses_json', 'filieres_recommandees_json']
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('user', 'serie_bac', 'releve_note', 'status')
        }),
        ('Données JSON', {
            'fields': ('questions_json', 'reponses_json', 'filieres_recommandees_json'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
        }),
    )
    
    def has_add_permission(self, request):
        # Désactiver l'ajout manuel depuis l'admin
        return False