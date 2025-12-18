# accounts/utils.py
import requests
from user_agents import parse
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings

def get_client_ip(request):
    """Récupère l'IP réelle du client"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def get_location_from_ip(ip_address):
    """Récupère la localisation depuis l'IP"""
    try:
        # Utilise ipapi.co (gratuit, sans clé API)
        response = requests.get(f'https://ipapi.co/{ip_address}/json/', timeout=10)
        if response.status_code == 200:
            data = response.json()
            return {
                'city': data.get('city', 'Inconnue'),
                'country': data.get('country_name', 'Inconnu')
            }
    except:
        pass
    return {'city': 'Inconnue', 'country': 'Inconnu'}

def get_device_info(request):
    """Extrait les informations du navigateur et OS"""
    user_agent_string = request.META.get('HTTP_USER_AGENT', '')
    user_agent = parse(user_agent_string)
    
    return {
        'browser': f"{user_agent.browser.family} {user_agent.browser.version_string}",
        'os': f"{user_agent.os.family} {user_agent.os.version_string}"
    }

def send_verification_email(user, login_attempt, request):
    """Envoie l'email de vérification avec template HTML"""
    
    # URL de base pour la vérification
    domain = request.get_host()
    protocol = 'https' if request.is_secure() else 'http'
    
    context = {
        'user': user,
        'city': login_attempt.city,
        'country': login_attempt.country,
        'browser': login_attempt.browser,
        'os': login_attempt.os,
        'time': login_attempt.created_at.strftime('%d/%m/%Y à %H:%M'),
        'token': login_attempt.token,
        'approve_url': f"{settings.BASE_URL}/api/auth/verify-login/?token={login_attempt.token}&approved=true",
        'deny_url': f"{settings.BASE_URL}/api/auth/verify-login/?token={login_attempt.token}&approved=false",
    }
    
    # Rendu du template HTML
    html_content = render_to_string('emails/login_verification.html', context)
    text_content = f"""
    Bonjour {user.first_name},
    
    Une tentative de connexion à votre compte a été détectée :
    
    📍 Localisation : {login_attempt.city}, {login_attempt.country}
    🌐 Navigateur : {login_attempt.browser}
    💻 Système : {login_attempt.os}
    🕒 Date et heure : {context['time']}
    
    Était-ce bien vous ?
    
    ✅ Oui, confirmer : {context['approve_url']}
    ❌ Non, refuser : {context['deny_url']}
    
    Ce lien expire dans 15 minutes.
    
    Si vous n'êtes pas à l'origine de cette tentative, veuillez sécuriser votre compte immédiatement.
    """
    
    email = EmailMultiAlternatives(
        subject='Confirmation de connexion requise',
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email]
    )
    
    email.attach_alternative(html_content, "text/html")
    email.send()