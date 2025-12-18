from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import OrientationSession
from .serializers import (
    InitialOrientationSerializer,
    QuestionsResponseSerializer,
    SubmitReponsesSerializer,
    FilieresRecommendationSerializer,
    OrientationSessionSerializer
)
from .services import OrientationAIService


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_initial_info(request):
    """
    Endpoint 1: Soumission initiale (série + relevé de note)
    
    POST /api/orientation/submit-initial/
    
    Body (multipart/form-data):
    - serie_bac: S, C, D, A1, L, OSE
    - releve_note: fichier image
    
    Returns:
    - session_id
    - questions générées par l'IA
    - analyse initiale
    """
    serializer = InitialOrientationSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            {'error': 'Données invalides', 'details': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Créer une nouvelle session
        session = OrientationSession.objects.create(
            user=request.user,
            serie_bac=serializer.validated_data['serie_bac'],
            releve_note=serializer.validated_data['releve_note'],
            status='initial'
        )
        
        # Utiliser le service IA pour analyser et générer les questions
        ai_service = OrientationAIService()
        result = ai_service.analyser_releve_et_generer_questions(
            serie_bac=session.serie_bac,
            releve_note_file=session.releve_note
        )
        
        # Sauvegarder les questions dans la session
        session.set_questions(result['questions'])
        session.status = 'questions_sent'
        session.save()
        
        # Préparer la réponse
        response_data = {
            'session_id': session.id,
            'analyse_initiale': result.get('analyse_initiale', ''),
            'questions': result['questions'],
            'message': 'Questions générées avec succès. Veuillez y répondre.'
        }
        
        response_serializer = QuestionsResponseSerializer(data=response_data)
        response_serializer.is_valid(raise_exception=True)
        
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        # En cas d'erreur, marquer la session comme erreur
        if 'session' in locals():
            session.status = 'error'
            session.save()
        
        return Response(
            {'error': 'Erreur lors de l\'analyse', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_reponses(request):
    """
    Endpoint 2: Soumission des réponses aux questions
    
    POST /api/orientation/submit-reponses/
    
    Body (JSON):
    {
        "session_id": 1,
        "reponses": [
            {"question_id": 1, "reponse": "Ma réponse..."},
            {"question_id": 2, "reponse": "Ma réponse..."},
            {"question_id": 3, "reponse": "Ma réponse..."}
        ]
    }
    
    Returns:
    - Liste des filières recommandées
    - Conseil général
    """
    serializer = SubmitReponsesSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            {'error': 'Données invalides', 'details': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Récupérer la session
        session = get_object_or_404(
            OrientationSession,
            id=serializer.validated_data['session_id'],
            user=request.user
        )
        
        # Vérifier que la session est au bon état
        if session.status != 'questions_sent':
            return Response(
                {'error': 'Session invalide ou déjà complétée'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Récupérer les questions de la session
        questions = session.get_questions()
        
        # Valider que les IDs des questions correspondent
        reponses_data = serializer.validated_data['reponses']
        question_ids = [q['id'] for q in questions]
        reponse_ids = [r['question_id'] for r in reponses_data]
        
        if sorted(question_ids) != sorted(reponse_ids):
            return Response(
                {'error': 'Les IDs des questions ne correspondent pas'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Sauvegarder les réponses
        session.set_reponses(reponses_data)
        
        # Utiliser le service IA pour générer les recommandations
        ai_service = OrientationAIService()
        
        # Récupérer l'analyse initiale depuis les questions
        analyse_initiale = ""
        if session.questions_json:
            import json
            questions_data = json.loads(session.questions_json)
            # L'analyse initiale devrait être stockée séparément, mais pour simplifier
            # on la récupère du premier appel
        
        result = ai_service.generer_recommandations_filieres(
            serie_bac=session.serie_bac,
            analyse_initiale=analyse_initiale,
            questions=questions,
            reponses=reponses_data,
            releve_note_file=session.releve_note
        )
        
        # Sauvegarder les filières recommandées
        session.set_filieres(result['filieres'])
        session.status = 'completed'
        session.save()
        
        # Préparer la réponse
        response_data = {
            'session_id': session.id,
            'filieres': result['filieres'],
            'conseil_general': result.get('conseil_general', ''),
            'message': 'Orientation complétée avec succès!'
        }
        
        response_serializer = FilieresRecommendationSerializer(data=response_data)
        response_serializer.is_valid(raise_exception=True)
        
        return Response(response_serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        # En cas d'erreur, marquer la session comme erreur
        if 'session' in locals():
            session.status = 'error'
            session.save()
        
        return Response(
            {'error': 'Erreur lors de la génération des recommandations', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_session_detail(request, session_id):
    """
    Endpoint 3: Récupérer les détails d'une session
    
    GET /api/orientation/session/<session_id>/
    
    Returns:
    - Tous les détails de la session
    """
    session = get_object_or_404(
        OrientationSession,
        id=session_id,
        user=request.user
    )
    
    serializer = OrientationSessionSerializer(session)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_user_sessions(request):
    """
    Endpoint 4: Lister toutes les sessions de l'utilisateur
    
    GET /api/orientation/sessions/
    
    Returns:
    - Liste de toutes les sessions de l'utilisateur
    """
    sessions = OrientationSession.objects.filter(user=request.user)
    serializer = OrientationSessionSerializer(sessions, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_session(request, session_id):
    """
    Endpoint 5: Supprimer une session
    
    DELETE /api/orientation/session/<session_id>/
    """
    session = get_object_or_404(
        OrientationSession,
        id=session_id,
        user=request.user
    )
    
    session.delete()
    return Response(
        {'message': 'Session supprimée avec succès'},
        status=status.HTTP_204_NO_CONTENT
    )