from django.urls import path
from . import views

app_name = 'guide_orientation'

urlpatterns = [
    # Endpoint 1: Soumission initiale (série + relevé de note)
    path('submit-initial/', views.submit_initial_info, name='submit_initial'),
    
    # Endpoint 2: Soumission des réponses aux questions
    path('submit-reponses/', views.submit_reponses, name='submit_reponses'),
    
    # Endpoint 3: Récupérer les détails d'une session
    path('session/<int:session_id>/', views.get_session_detail, name='session_detail'),
    
    # Endpoint 4: Lister toutes les sessions de l'utilisateur
    path('sessions/', views.list_user_sessions, name='list_sessions'),
    
    # Endpoint 5: Supprimer une session
    path('session/<int:session_id>/delete/', views.delete_session, name='delete_session'),
]