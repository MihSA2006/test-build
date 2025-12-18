import google.generativeai as genai
from django.conf import settings
from PIL import Image
import json
import io

class OrientationAIService:
    """
    Service pour interagir avec l'API Gemini pour l'orientation
    """
    
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('models/gemini-2.5-flash-lite')
    
    def analyser_releve_et_generer_questions(self, serie_bac, releve_note_file):
        """
        Analyse le relevé de note et génère 3-4 questions pour mieux orienter
        
        Args:
            serie_bac: Série du bac (S, C, D, etc.)
            releve_note_file: Fichier image du relevé de note
            
        Returns:
            dict: {'questions': [...], 'analyse_initiale': '...'}
        """
        try:
            # Charger l'image
            image = Image.open(releve_note_file)
            
            # Prompt pour l'analyse initiale et génération de questions
            prompt = f"""
Tu es un expert en orientation scolaire à Madagascar. Tu analyses le relevé de notes d'un élève qui a passé le baccalauréat série {serie_bac}.

MISSION 1: Analyse le relevé de note dans l'image et identifie:
- Les matières où l'élève excelle
- Les matières où l'élève a des difficultés
- Les tendances générales (scientifique, littéraire, artistique, etc.)

MISSION 2: Génère EXACTEMENT 3 ou 4 questions (pas plus) pour mieux comprendre:
- Ses passions et centres d'intérêt
- Ses objectifs de carrière
- Ses contraintes personnelles (géographiques, financières, etc.)
- Ses compétences extrascolaires

FORMATTING IMPORTANT:
- Pour "analyse_initiale": Utilise du Markdown pour rendre le texte attrayant:
  * Utilise **gras** pour les points forts
  * Structure avec des paragraphes clairs
  * Ajoute des listes à puces si nécessaire avec -

IMPORTANT: Réponds UNIQUEMENT au format JSON strict suivant, sans texte avant ou après:
{{
    "analyse_initiale": "## Analyse de votre profil\n\nVotre analyse formatée en Markdown avec **gras**, emojis et structure claire...",
    "questions": [
        {{"id": 1, "question": "Première question..."}},
        {{"id": 2, "question": "Deuxième question..."}},
        {{"id": 3, "question": "Troisième question..."}},
        {{"id": 4, "question": "Quatrième question (optionnelle)..."}}
    ]
}}

Assure-toi que les questions soient pertinentes pour l'orientation universitaire à Madagascar.
"""
            
            # Appel à l'API Gemini
            response = self.model.generate_content([prompt, image])
            
            # Parser la réponse JSON
            response_text = response.text.strip()
            
            # Nettoyer la réponse si elle contient des markdown
            if response_text.startswith('```json'):
                response_text = response_text.replace('```json', '').replace('```', '').strip()
            
            result = json.loads(response_text)
            
            return result
            
        except json.JSONDecodeError as e:
            raise Exception(f"Erreur de parsing JSON: {str(e)}")
        except Exception as e:
            raise Exception(f"Erreur lors de l'analyse: {str(e)}")
    
    def generer_recommandations_filieres(self, serie_bac, analyse_initiale, questions, reponses, releve_note_file):
        """
        Génère les recommandations de filières basées sur toutes les informations
        
        Args:
            serie_bac: Série du bac
            analyse_initiale: Analyse du relevé de note
            questions: Liste des questions posées
            reponses: Liste des réponses de l'utilisateur
            releve_note_file: Fichier image du relevé de note
            
        Returns:
            list: Liste des filières recommandées avec détails
        """
        try:
            # Charger l'image
            image = Image.open(releve_note_file)
            
            # Construire le contexte des Q&R
            qa_context = "\n".join([
                f"Q{i+1}: {q['question']}\nR{i+1}: {reponses[i]['reponse']}"
                for i, q in enumerate(questions)
            ])
            
            # Prompt pour les recommandations finales
            prompt = f"""
Tu es un expert en orientation universitaire à Madagascar. 

CONTEXTE:
- Série du bac: {serie_bac}
- Analyse initiale du relevé: {analyse_initiale}

QUESTIONS ET RÉPONSES:
{qa_context}

MISSION: Recommande les 5 à 8 meilleures filières universitaires pour cet étudiant.

Pour chaque filière, fournis:
1. Le nom complet de la filière
2. Une description courte (2-3 phrases)
3. Les débouchés professionnels principaux
4. Le pourcentage de correspondance avec le profil (0-100%)
5. Les établissements à Madagascar où cette filière est disponible
6. Les points forts de l'étudiant qui correspondent à cette filière

FORMATTING IMPORTANT:
- Pour "conseil_general": Utilise du Markdown pour rendre le texte attrayant:
  * Utilise **gras** pour les points forts
  * Structure avec des paragraphes clairs
  * Ajoute des listes à puces si nécessaire avec -

IMPORTANT: Réponds UNIQUEMENT au format JSON strict suivant:
{{
    "filieres": [
        {{
            "nom": "Nom de la filière",
            "description": "Description détaillée...",
            "debouches": ["Débouché 1", "Débouché 2", "Débouché 3"],
            "correspondance": 95,
            "etablissements": ["Université 1", "Université 2"],
            "points_forts": ["Point fort 1", "Point fort 2"],
            "duree": "3 ans (Licence) ou 5 ans (Master)"
        }}
    ],
    "conseil_general": "## Un conseil général personnalisé pour l'étudiant..."
}}

Classe les filières par ordre de correspondance décroissant.
"""
            
            # Appel à l'API Gemini
            response = self.model.generate_content([prompt, image])
            
            # Parser la réponse JSON
            response_text = response.text.strip()
            
            # Nettoyer la réponse
            if response_text.startswith('```json'):
                response_text = response_text.replace('```json', '').replace('```', '').strip()
            
            result = json.loads(response_text)
            
            return result
            
        except json.JSONDecodeError as e:
            raise Exception(f"Erreur de parsing JSON: {str(e)}")
        except Exception as e:
            raise Exception(f"Erreur lors de la génération des recommandations: {str(e)}")

# import google.generativeai as genai
# from django.conf import settings
# from PIL import Image
# import json
# import io

# class OrientationAIService:
#     """
#     Service pour interagir avec l'API Gemini pour l'orientation
#     """
    
#     def __init__(self):
#         genai.configure(api_key=settings.GEMINI_API_KEY)
#         self.model = genai.GenerativeModel('models/gemini-2.5-flash-lite')
    
#     def analyser_releve_et_generer_questions(self, serie_bac, releve_note_file):
#         """
#         Analyse le relevé de note et génère 3-4 questions pour mieux orienter
        
#         Args:
#             serie_bac: Série du bac (S, C, D, etc.)
#             releve_note_file: Fichier image du relevé de note
            
#         Returns:
#             dict: {'questions': [...], 'analyse_initiale': '...'}
#         """
#         try:
#             # Charger l'image
#             image = Image.open(releve_note_file)
            
#             # Prompt pour l'analyse initiale et génération de questions
#             prompt = f"""
# Tu es un expert en orientation scolaire à Madagascar. Tu analyses le relevé de notes d'un élève qui a passé le baccalauréat série {serie_bac}.

# MISSION 1: Analyse le relevé de note dans l'image et identifie:
# - Les matières où l'élève excelle
# - Les matières où l'élève a des difficultés
# - Les tendances générales (scientifique, littéraire, artistique, etc.)

# MISSION 2: Génère EXACTEMENT 3 ou 4 questions (pas plus) pour mieux comprendre:
# - Ses passions et centres d'intérêt
# - Ses objectifs de carrière
# - Ses contraintes personnelles (géographiques, financières, etc.)
# - Ses compétences extrascolaires

# IMPORTANT: Réponds UNIQUEMENT au format JSON strict suivant, sans texte avant ou après:
# {{
#     "analyse_initiale": "Ton analyse du relevé de note en 2-3 phrases",
#     "questions": [
#         {{"id": 1, "question": "Première question..."}},
#         {{"id": 2, "question": "Deuxième question..."}},
#         {{"id": 3, "question": "Troisième question..."}},
#         {{"id": 4, "question": "Quatrième question (optionnelle)..."}}
#     ]
# }}

# Assure-toi que les questions soient pertinentes pour l'orientation universitaire à Madagascar.
# """
            
#             # Appel à l'API Gemini
#             response = self.model.generate_content([prompt, image])
            
#             # Parser la réponse JSON
#             response_text = response.text.strip()
            
#             # Nettoyer la réponse si elle contient des markdown
#             if response_text.startswith('```json'):
#                 response_text = response_text.replace('```json', '').replace('```', '').strip()
            
#             result = json.loads(response_text)
            
#             return result
            
#         except json.JSONDecodeError as e:
#             raise Exception(f"Erreur de parsing JSON: {str(e)}")
#         except Exception as e:
#             raise Exception(f"Erreur lors de l'analyse: {str(e)}")
    
#     def generer_recommandations_filieres(self, serie_bac, analyse_initiale, questions, reponses, releve_note_file):
#         """
#         Génère les recommandations de filières basées sur toutes les informations
        
#         Args:
#             serie_bac: Série du bac
#             analyse_initiale: Analyse du relevé de note
#             questions: Liste des questions posées
#             reponses: Liste des réponses de l'utilisateur
#             releve_note_file: Fichier image du relevé de note
            
#         Returns:
#             list: Liste des filières recommandées avec détails
#         """
#         try:
#             # Charger l'image
#             image = Image.open(releve_note_file)
            
#             # Construire le contexte des Q&R
#             qa_context = "\n".join([
#                 f"Q{i+1}: {q['question']}\nR{i+1}: {reponses[i]['reponse']}"
#                 for i, q in enumerate(questions)
#             ])
            
#             # Prompt pour les recommandations finales
#             prompt = f"""
# Tu es un expert en orientation universitaire à Madagascar. 

# CONTEXTE:
# - Série du bac: {serie_bac}
# - Analyse initiale du relevé: {analyse_initiale}

# QUESTIONS ET RÉPONSES:
# {qa_context}

# MISSION: Recommande les 5 à 8 meilleures filières universitaires pour cet étudiant.

# Pour chaque filière, fournis:
# 1. Le nom complet de la filière
# 2. Une description courte (2-3 phrases)
# 3. Les débouchés professionnels principaux
# 4. Le pourcentage de correspondance avec le profil (0-100%)
# 5. Les établissements à Madagascar où cette filière est disponible
# 6. Les points forts de l'étudiant qui correspondent à cette filière

# IMPORTANT: Réponds UNIQUEMENT au format JSON strict suivant:
# {{
#     "filieres": [
#         {{
#             "nom": "Nom de la filière",
#             "description": "Description détaillée...",
#             "debouches": ["Débouché 1", "Débouché 2", "Débouché 3"],
#             "correspondance": 95,
#             "etablissements": ["Université 1", "Université 2"],
#             "points_forts": ["Point fort 1", "Point fort 2"],
#             "duree": "3 ans (Licence) ou 5 ans (Master)"
#         }}
#     ],
#     "conseil_general": "Un conseil général personnalisé pour l'étudiant..."
# }}

# Classe les filières par ordre de correspondance décroissant.
# """
            
#             # Appel à l'API Gemini
#             response = self.model.generate_content([prompt, image])
            
#             # Parser la réponse JSON
#             response_text = response.text.strip()
            
#             # Nettoyer la réponse
#             if response_text.startswith('```json'):
#                 response_text = response_text.replace('```json', '').replace('```', '').strip()
            
#             result = json.loads(response_text)
            
#             return result
            
#         except json.JSONDecodeError as e:
#             raise Exception(f"Erreur de parsing JSON: {str(e)}")
#         except Exception as e:
#             raise Exception(f"Erreur lors de la génération des recommandations: {str(e)}")
