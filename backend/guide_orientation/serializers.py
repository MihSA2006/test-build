from rest_framework import serializers
from .models import OrientationSession

class InitialOrientationSerializer(serializers.Serializer):
    """
    Serializer pour la soumission initiale (série + relevé de note)
    """
    serie_bac = serializers.ChoiceField(choices=OrientationSession.SERIES_CHOICES)
    releve_note = serializers.ImageField()
    
    def validate_releve_note(self, value):
        """Valider que c'est bien une image"""
        if not value.content_type.startswith('image/'):
            raise serializers.ValidationError("Le fichier doit être une image")
        
        # Limite de taille (5MB)
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("L'image ne doit pas dépasser 5MB")
        
        return value


class QuestionSerializer(serializers.Serializer):
    """
    Serializer pour une question
    """
    id = serializers.IntegerField()
    question = serializers.CharField()


class QuestionsResponseSerializer(serializers.Serializer):
    """
    Serializer pour la réponse contenant les questions
    """
    session_id = serializers.IntegerField()
    analyse_initiale = serializers.CharField()
    questions = QuestionSerializer(many=True)
    message = serializers.CharField()


class ReponseQuestionSerializer(serializers.Serializer):
    """
    Serializer pour une réponse à une question
    """
    question_id = serializers.IntegerField()
    reponse = serializers.CharField()


class SubmitReponsesSerializer(serializers.Serializer):
    """
    Serializer pour la soumission des réponses
    """
    session_id = serializers.IntegerField()
    reponses = ReponseQuestionSerializer(many=True)
    
    def validate_reponses(self, value):
        """Valider qu'il y a entre 3 et 4 réponses"""
        if len(value) < 3 or len(value) > 4:
            raise serializers.ValidationError("Vous devez répondre à toutes les questions (3 ou 4)")
        return value


class FiliereSerializer(serializers.Serializer):
    """
    Serializer pour une filière recommandée
    """
    nom = serializers.CharField()
    description = serializers.CharField()
    debouches = serializers.ListField(child=serializers.CharField())
    correspondance = serializers.IntegerField()
    points_forts = serializers.ListField(child=serializers.CharField())
    duree = serializers.CharField()


class FilieresRecommendationSerializer(serializers.Serializer):
    """
    Serializer pour la réponse finale avec les filières
    """
    session_id = serializers.IntegerField()
    filieres = FiliereSerializer(many=True)
    conseil_general = serializers.CharField()
    message = serializers.CharField()


class OrientationSessionSerializer(serializers.ModelSerializer):
    """
    Serializer complet pour une session d'orientation
    """
    questions = serializers.SerializerMethodField()
    reponses = serializers.SerializerMethodField()
    filieres_recommandees = serializers.SerializerMethodField()
    
    class Meta:
        model = OrientationSession
        fields = [
            'id', 'serie_bac', 'status', 'questions', 
            'reponses', 'filieres_recommandees', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']
    
    def get_questions(self, obj):
        return obj.get_questions()
    
    def get_reponses(self, obj):
        return obj.get_reponses()
    
    def get_filieres_recommandees(self, obj):
        return obj.get_filieres()

# from rest_framework import serializers
# from .models import OrientationSession

# class InitialOrientationSerializer(serializers.Serializer):
#     """
#     Serializer pour la soumission initiale (série + relevé de note)
#     """
#     serie_bac = serializers.ChoiceField(choices=OrientationSession.SERIES_CHOICES)
#     releve_note = serializers.ImageField()
    
#     def validate_releve_note(self, value):
#         """Valider que c'est bien une image"""
#         if not value.content_type.startswith('image/'):
#             raise serializers.ValidationError("Le fichier doit être une image")
        
#         # Limite de taille (5MB)
#         if value.size > 5 * 1024 * 1024:
#             raise serializers.ValidationError("L'image ne doit pas dépasser 5MB")
        
#         return value


# class QuestionSerializer(serializers.Serializer):
#     """
#     Serializer pour une question
#     """
#     id = serializers.IntegerField()
#     question = serializers.CharField()


# class QuestionsResponseSerializer(serializers.Serializer):
#     """
#     Serializer pour la réponse contenant les questions
#     """
#     session_id = serializers.IntegerField()
#     analyse_initiale = serializers.CharField()
#     questions = QuestionSerializer(many=True)
#     message = serializers.CharField()


# class ReponseQuestionSerializer(serializers.Serializer):
#     """
#     Serializer pour une réponse à une question
#     """
#     question_id = serializers.IntegerField()
#     reponse = serializers.CharField()


# class SubmitReponsesSerializer(serializers.Serializer):
#     """
#     Serializer pour la soumission des réponses
#     """
#     session_id = serializers.IntegerField()
#     reponses = ReponseQuestionSerializer(many=True)
    
#     def validate_reponses(self, value):
#         """Valider qu'il y a entre 3 et 4 réponses"""
#         if len(value) < 3 or len(value) > 4:
#             raise serializers.ValidationError("Vous devez répondre à toutes les questions (3 ou 4)")
#         return value


# class FiliereSerializer(serializers.Serializer):
#     """
#     Serializer pour une filière recommandée
#     """
#     nom = serializers.CharField()
#     description = serializers.CharField()
#     debouches = serializers.ListField(child=serializers.CharField())
#     correspondance = serializers.IntegerField()
#     etablissements = serializers.ListField(child=serializers.CharField())
#     points_forts = serializers.ListField(child=serializers.CharField())
#     duree = serializers.CharField()


# class FilieresRecommendationSerializer(serializers.Serializer):
#     """
#     Serializer pour la réponse finale avec les filières
#     """
#     session_id = serializers.IntegerField()
#     filieres = FiliereSerializer(many=True)
#     conseil_general = serializers.CharField()
#     message = serializers.CharField()


# class OrientationSessionSerializer(serializers.ModelSerializer):
#     """
#     Serializer complet pour une session d'orientation
#     """
#     questions = serializers.SerializerMethodField()
#     reponses = serializers.SerializerMethodField()
#     filieres_recommandees = serializers.SerializerMethodField()
    
#     class Meta:
#         model = OrientationSession
#         fields = [
#             'id', 'serie_bac', 'status', 'questions', 
#             'reponses', 'filieres_recommandees', 'created_at', 'updated_at'
#         ]
#         read_only_fields = ['id', 'status', 'created_at', 'updated_at']
    
#     def get_questions(self, obj):
#         return obj.get_questions()
    
#     def get_reponses(self, obj):
#         return obj.get_reponses()
    
#     def get_filieres_recommandees(self, obj):
#         return obj.get_filieres()