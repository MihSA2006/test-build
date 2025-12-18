from django.db import models
from django.contrib.auth.models import User
import json

class OrientationSession(models.Model):
    """
    Session d'orientation pour un utilisateur
    """
    SERIES_CHOICES = [
        ('S', 'Série S (Scientifique)'),
        ('C', 'Série C'),
        ('D', 'Série D'),
        ('A1', 'Série A1'),
        ('A2', 'Série A2'),
        ('L', 'Série L (Littéraire)'),
        ('OSE', 'Série OSE'),
    ]
    
    STATUS_CHOICES = [
        ('initial', 'Information initiale envoyée'),
        ('questions_sent', 'Questions envoyées à l\'utilisateur'),
        ('completed', 'Orientation complétée'),
        ('error', 'Erreur'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orientation_sessions')
    serie_bac = models.CharField(max_length=10, choices=SERIES_CHOICES)
    releve_note = models.ImageField(upload_to='releves_notes/%Y/%m/%d/')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='initial')
    
    # Questions générées par l'IA
    questions_json = models.TextField(blank=True, null=True, help_text='Questions au format JSON')
    
    # Réponses de l'utilisateur
    reponses_json = models.TextField(blank=True, null=True, help_text='Réponses au format JSON')
    
    # Résultat final
    filieres_recommandees_json = models.TextField(blank=True, null=True, help_text='Filières recommandées au format JSON')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Session d\'Orientation'
        verbose_name_plural = 'Sessions d\'Orientation'
    
    def __str__(self):
        return f"Session {self.id} - {self.user.username} - {self.serie_bac} - {self.status}"
    
    def set_questions(self, questions_list):
        """Enregistrer les questions au format JSON"""
        self.questions_json = json.dumps(questions_list, ensure_ascii=False)
        self.save()
    
    def get_questions(self):
        """Récupérer les questions depuis JSON"""
        if self.questions_json:
            return json.loads(self.questions_json)
        return []
    
    def set_reponses(self, reponses_list):
        """Enregistrer les réponses au format JSON"""
        self.reponses_json = json.dumps(reponses_list, ensure_ascii=False)
        self.save()
    
    def get_reponses(self):
        """Récupérer les réponses depuis JSON"""
        if self.reponses_json:
            return json.loads(self.reponses_json)
        return []
    
    def set_filieres(self, filieres_list):
        """Enregistrer les filières recommandées au format JSON"""
        self.filieres_recommandees_json = json.dumps(filieres_list, ensure_ascii=False)
        self.save()
    
    def get_filieres(self):
        """Récupérer les filières recommandées depuis JSON"""
        if self.filieres_recommandees_json:
            return json.loads(self.filieres_recommandees_json)
        return []