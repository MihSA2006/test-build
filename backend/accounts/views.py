# accounts/views.py
import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, LoginSerializer, VerifyLoginSerializer
from .models import LoginAttempt
from .utils import get_client_ip, get_location_from_ip, get_device_info, send_verification_email
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .serializers import UserSerializer

logger = logging.getLogger('accounts')

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Inscription d'un nouvel utilisateur"""
    logger.info(f"Tentative d'inscription - Username: {request.data.get('username')}")
    
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        logger.info(f"Utilisateur créé avec succès: {user.username}")
        return Response({
            'message': 'Utilisateur créé avec succès',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name
            }
        }, status=status.HTTP_201_CREATED)
    
    logger.error(f"Erreur lors de l'inscription: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Première étape de connexion - envoie un email de vérification"""
    logger.info(f"Tentative de connexion - Username: {request.data.get('username')}")
    
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        logger.error(f"Données de connexion invalides: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    username = serializer.validated_data['username']
    password = serializer.validated_data['password']
    
    # Authentification
    user = authenticate(username=username, password=password)
    if not user:
        logger.warning(f"Échec d'authentification pour: {username}")
        return Response({
            'error': 'Identifiants invalides'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    logger.info(f"Authentification réussie pour: {username}")
    
    # Récupération des informations
    ip_address = get_client_ip(request)
    logger.info(f"IP client: {ip_address}")
    
    location = get_location_from_ip(ip_address)
    logger.info(f"Localisation: {location}")
    
    device_info = get_device_info(request)
    logger.info(f"Info appareil: {device_info}")
    
    # Création de la tentative de connexion
    try:
        login_attempt = LoginAttempt.objects.create(
            user=user,
            city=location['city'],
            country=location['country'],
            browser=device_info['browser'],
            os=device_info['os'],
            ip_address=ip_address
        )
        logger.info(f"LoginAttempt créé avec ID: {login_attempt.id}, Token: {login_attempt.token[:20]}...")
    except Exception as e:
        logger.error(f"Erreur lors de la création de LoginAttempt: {str(e)}", exc_info=True)
        return Response({
            'error': f'Erreur lors de la création de la tentative: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Envoi de l'email
    try:
        send_verification_email(user, login_attempt, request)
        logger.info(f"Email de vérification envoyé avec succès à {user.email}")
    except Exception as e:
        logger.error(f"Erreur lors de l'envoi de l'email: {str(e)}", exc_info=True)
        return Response({
            'error': f'Erreur lors de l\'envoi de l\'email: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({
        'message': 'Email de vérification envoyé',
        'tkn':login_attempt.token,  # Pour debug
        'details': {
            'city': login_attempt.city,
            'country': login_attempt.country,
            'browser': login_attempt.browser,
            'os': login_attempt.os,
            'time': login_attempt.created_at,
            'ip_address': login_attempt.ip_address  # Pour debug
        }
    }, status=status.HTTP_200_OK)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def verify_login(request):
    """Vérification de la tentative de connexion via le token"""
    
    # Récupération du token et de la réponse (approved)
    if request.method == 'GET':
        token = request.query_params.get('token')
        approved = request.query_params.get('approved', '').lower() == 'true'
        logger.info(f"Vérification GET - Token: {token[:20] if token else 'None'}..., Approved: {approved}")
    else:
        serializer = VerifyLoginSerializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Données de vérification invalides: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        token = serializer.validated_data['token']
        approved = serializer.validated_data['approved']
        logger.info(f"Vérification POST - Token: {token[:20]}..., Approved: {approved}")
    
    if not token:
        logger.error("Token manquant")
        return Response({
            'error': 'Token requis'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Recherche de la tentative de connexion
    try:
        login_attempt = LoginAttempt.objects.get(token=token)
        logger.info(f"LoginAttempt trouvé - ID: {login_attempt.id}, User: {login_attempt.user.username}")
    except LoginAttempt.DoesNotExist:
        logger.error(f"Token invalide: {token[:20]}...")
        return Response({
            'error': 'Token invalide'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Vérification de l'expiration
    if login_attempt.is_expired():
        logger.warning(f"Token expiré pour LoginAttempt ID: {login_attempt.id}")
        return Response({
            'error': 'Token expiré'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Vérification si déjà utilisé
    if login_attempt.is_verified:
        logger.warning(f"Token déjà utilisé pour LoginAttempt ID: {login_attempt.id}")
        return Response({
            'error': 'Token déjà utilisé'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Mise à jour de la tentative
    login_attempt.is_verified = True
    login_attempt.is_approved = approved
    login_attempt.save()
    logger.info(f"LoginAttempt mis à jour - ID: {login_attempt.id}, Verified: True, Approved: {approved}")
    
    # Dans la fonction verify_login, remplacez la partie de retour par :

    if not approved:
        logger.warning(f"Connexion refusée par l'utilisateur: {login_attempt.user.username}")
        return Response({
            'message': 'Connexion refusée. Si ce n\'était pas vous, veuillez sécuriser votre compte.'
        }, status=status.HTTP_200_OK)

    # Connexion approuvée - génération des tokens JWT
    logger.info(f"Génération des tokens JWT pour: {login_attempt.user.username}")
    try:
        refresh = RefreshToken.for_user(login_attempt.user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        # Récupération du profil et du rôle
        user_profile = login_attempt.user.profile
        
        logger.info(f"Tokens JWT générés avec succès - Access: {access_token[:20]}..., Refresh: {refresh_token[:20]}...")
        
        return Response({
            'message': 'Connexion réussie',
            'access': access_token,
            'refresh': refresh_token,
            'user': {
                'id': login_attempt.user.id,
                'username': login_attempt.user.username,
                'email': login_attempt.user.email,
                'first_name': login_attempt.user.first_name,
                'last_name': login_attempt.user.last_name,
                'role': user_profile.role,
                'role_display': user_profile.get_role_display(),
            }
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Erreur lors de la génération des tokens JWT: {str(e)}", exc_info=True)
        return Response({
            'error': f'Erreur lors de la génération des tokens: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def logout(request):
    """Déconnexion de l'utilisateur"""
    if request.user.is_authenticated:
        logger.info(f"Déconnexion de l'utilisateur: {request.user.username}")
        try:
            # Blacklist du refresh token si fourni
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
                logger.info("Refresh token blacklisté")
        except Exception as e:
            logger.error(f"Erreur lors du blacklist du token: {str(e)}")
    
    return Response({
        'message': 'Déconnexion réussie'
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    """Rafraîchir l'access token avec le refresh token"""
    refresh = request.data.get('refresh')
    
    if not refresh:
        logger.error("Refresh token manquant")
        return Response({
            'error': 'Refresh token requis'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        refresh_token_obj = RefreshToken(refresh)
        access_token = str(refresh_token_obj.access_token)
        
        logger.info(f"Access token rafraîchi avec succès")
        
        return Response({
            'access': access_token
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Erreur lors du rafraîchissement du token: {str(e)}")
        return Response({
            'error': 'Refresh token invalide ou expiré'
        }, status=status.HTTP_401_UNAUTHORIZED)

@permission_classes([IsAuthenticated])
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API pour récupérer les utilisateurs
    """
    queryset = User.objects.all().order_by('username')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]