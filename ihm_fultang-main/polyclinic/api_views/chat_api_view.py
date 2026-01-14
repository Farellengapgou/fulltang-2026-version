# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# try:
#     import PyPDF2
# except ImportError:
#     PyPDF2 = None
# try:
#     import openai
# except ImportError:
#     openai = None
# import os
# from django.conf import settings
# from polyclinic.serializers.chat_serializers import UserQuerySerializer
# from drf_yasg.utils import swagger_auto_schema
# from drf_yasg import openapi

# if openai is not None:
#     # Configuration OpenAI (compatible avec OpenRouter)
#     OPENAI_API_KEY = "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"
#     openai.api_key = OPENAI_API_KEY
#     openai.api_base = "https://openrouter.ai/api/v1"  # IMPORTANT: URL OpenRouter

# # Charger le guide PDF
# PDF_PATH = os.path.join(settings.MEDIA_ROOT, "guide_fultang.pdf")

# def extract_text_from_pdf(pdf_path):
#     """Extrait le texte du PDF avec PyPDF2"""
#     if PyPDF2 is None:
#         return ""
#     try:
#         text = ""
#         with open(pdf_path, 'rb') as file:
#             pdf_reader = PyPDF2.PdfReader(file)
#             for page in pdf_reader.pages:
#                 text += page.extract_text() + "\n"
#         return text
#     except Exception as e:
#         print(f"Erreur lors de l'extraction du PDF: {str(e)}")
#         return ""

# # Charger le guide une seule fois au démarrage
# try:
#     guide_text = extract_text_from_pdf(PDF_PATH)
#     if not guide_text:
#         guide_text = """
#         Guide Fultang - Application de Gestion Hospitalière
        
#         CONSULTATIONS:
#         - Pour créer une consultation, allez dans le menu Consultations
#         - Sélectionnez le patient et le type de consultation
#         - Les prix sont : Généraliste 5000 FCFA, Spécialiste 10000 FCFA
        
#         RENDEZ-VOUS:
#         - Créez un rendez-vous depuis le menu Appointments
#         - Sélectionnez la date, l'heure et le médecin
#         - Le patient recevra une confirmation
        
#         PAIEMENTS:
#         - Les factures sont générées automatiquement
#         - Accepte Cash, Mobile Money, Carte bancaire
#         - Imprimez le reçu après paiement
        
#         PATIENTS:
#         - Créez un dossier patient avec CNI, nom, prénom
#         - Un dossier médical est automatiquement créé
#         - Recherche par nom, téléphone ou CNI
#         """
# except Exception as e:
#     print(f"Erreur chargement PDF: {str(e)}")
#     guide_text = "Guide non disponible"

# def generate_answer(question):
#     """Génère une réponse avec OpenAI via OpenRouter"""
#     if openai is None:
#         return fallback_answer(question)
#     try:
#         prompt = f"""Tu es un assistant pour l'application Fultang, un système de gestion hospitalière.
        
# Guide d'utilisation:
# {guide_text[:3000]}  # Limité pour rester dans les tokens

# Question de l'utilisateur: {question}

# Réponds de manière claire, concise et professionnelle en français. Si la question concerne:
# - Les consultations: explique comment créer, modifier ou annuler
# - Les paiements: explique le processus de facturation
# - Les patients: explique comment gérer les dossiers
# - Technique: donne des solutions de dépannage

# Si tu ne trouves pas l'info dans le guide, dis-le honnêtement et suggère de contacter le support.
# """

#         response = openai.ChatCompletion.create(
#             model="openai/gpt-3.5-turbo",  # Format OpenRouter
#             messages=[
#                 {"role": "system", "content": "Tu es un assistant utile pour l'application Fultang."},
#                 {"role": "user", "content": prompt}
#             ],
#             max_tokens=500,
#             temperature=0.7
#         )
        
#         return response['choices'][0]['message']['content'].strip()
    
#     except Exception as e:
#         error_msg = str(e)
#         print(f"Erreur OpenAI: {error_msg}")
#         return fallback_answer(question)

# def fallback_answer(question):
#     """Réponses de secours basées sur des mots-clés (sans mention d'erreur technique)"""
#     question_lower = (question or "").lower()

#     if any(word in question_lower for word in ['bonjour', 'salut', 'hello', 'bonsoir']):
#         return """Bonjour ! 👋
# Je peux vous aider sur :
# - Consultations et rendez-vous
# - Paiements et facturation
# - Gestion des patients
# - Problèmes techniques

# Posez-moi votre question."""

#     if any(word in question_lower for word in ['consultation', 'rendez-vous', 'rdv', 'appointment']):
#         return """Pour créer une consultation dans Fultang:

# 1. Allez dans le menu 'Consultations' ou 'Appointments'
# 2. Cliquez sur 'Nouveau' ou 'New'
# 3. Sélectionnez le patient
# 4. Choisissez le type de consultation et le médecin
# 5. Définissez la date et l'heure
# 6. Confirmez et enregistrez

# Prix des consultations:
# - Généraliste: 5000 FCFA
# - Spécialiste: 10000 FCFA
# - Dentiste: 7000 FCFA
# - Ophtalmologue: 8000 FCFA"""
        
#     if any(word in question_lower for word in ['paiement', 'facture', 'payment', 'bill']):
#         return """Gestion des paiements dans Fultang:

# 1. Les factures sont générées automatiquement après consultation
# 2. Pour enregistrer un paiement:
#    - Trouvez la facture du patient
#    - Cliquez sur 'Enregistrer paiement'
#    - Sélectionnez le mode (Cash, Mobile Money, Carte)
#    - Validez

# Modes de paiement acceptés:
# - Espèces (Cash)
# - Mobile Money (MTN, Orange)
# - Carte bancaire

# Un reçu est généré automatiquement."""
        
#     if any(word in question_lower for word in ['patient', 'dossier', 'créer']):
#         return """Création d'un dossier patient:

# 1. Allez dans 'Patients'
# 2. Cliquez sur 'Nouveau Patient'
# 3. Remplissez les informations obligatoires:
#    - Nom et Prénom
#    - Date de naissance
#    - Sexe
#    - Numéro de téléphone
#    - CNI (optionnel)
# 4. Sauvegardez

# Un dossier médical sera automatiquement créé. Vous pouvez ensuite:
# - Ajouter des consultations
# - Prescrire des examens
# - Gérer les hospitalisations"""
        
#     return """Je n'ai pas assez d'informations sur cette question.

# Pour une assistance immédiate:
# - Consultez la FAQ dans le Help Center
# - Contactez le support: support@fultang.cm
# - Appelez: +237 XXX XXX XXX

# Questions fréquentes que je peux aider:
# - Comment créer une consultation ?
# - Comment gérer les paiements ?
# - Comment créer un dossier patient ?
# - Problèmes de connexion ?"""


# class ChatbotView(APIView):
#     """
#     Vue pour le chatbot d'assistance Fultang
#     """
#     authentication_classes = []
#     permission_classes = []

#     @swagger_auto_schema(
#         operation_description="Poser une question au chatbot pour plus d'information sur Fultang",
#         request_body=UserQuerySerializer,
#         responses={
#             200: openapi.Response(
#                 description="Réponse du chatbot",
#                 schema=openapi.Schema(
#                     type=openapi.TYPE_OBJECT,
#                     properties={
#                         'response': openapi.Schema(type=openapi.TYPE_STRING),
#                         'success': openapi.Schema(type=openapi.TYPE_BOOLEAN),
#                     }
#                 )
#             ),
#             400: "Requête invalide",
#             500: "Erreur interne du serveur"
#         }
#     )
#     def post(self, request):
#         serializer = UserQuerySerializer(data=request.data)
        
#         if not serializer.is_valid():
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
#         question = serializer.validated_data['question']
        
#         try:
#             answer = generate_answer(question)
#             return Response({
#                 "response": answer,
#                 "success": True
#             }, status=status.HTTP_200_OK)
        
#         except Exception as e:
#             return Response({
#                 "error": "Une erreur est survenue. Veuillez réessayer.",
#                 "details": str(e),
#                 "success": False
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
