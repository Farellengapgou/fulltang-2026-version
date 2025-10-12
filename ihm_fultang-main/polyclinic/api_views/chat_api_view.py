from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import fitz  # PyMuPDF pour extraire le texte du PDF
import google.generativeai as genai
import os
from fultang.settings import MEDIA_URL, MEDIA_ROOT
from polyclinic.serializers.chat_serializers import UserQuerySerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.conf import settings
from rest_framework.permissions import IsAuthenticated

# Charger la clé API Gemini
os.environ["GEMINI_API_KEY"] = "AIzaSyAfCi7g6555XvHg2Qfr84eX04J3fo5kvz8"
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

# Charger et extraire le texte du PDF
PDF_PATH = MEDIA_ROOT + "/guide_fultang.pdf"
def extract_text_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    text = "\n".join([page.get_text() for page in doc])
    return text

guide_text = extract_text_from_pdf(PDF_PATH)

# Fonction pour générer une réponse
def generate_answer(prompt):
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(prompt)
    return response.text.strip()

class ChatbotView(APIView):
    permission_classes = [IsAuthenticated]
    @swagger_auto_schema(
        operation_description="poser une question au chatbot pour plus d'information sur fultnag",
        request_body=UserQuerySerializer,
        responses={
            200: openapi.Response(
                description="Reponse du chat bot",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'response': openapi.Schema(type=openapi.TYPE_STRING),
                    }
                )
            ),
            400: "Requet invalide",
            500: "Erreur interne du serveur"
        }
    )
    def post(self, request):
        serializer = UserQuerySerializer(data=request.data)
        if serializer.is_valid():
            question = serializer.validated_data['question']
            prompt = f"""
            Tu es un assistant qui aide les utilisateurs à comprendre comment utiliser une application de gestion d'hopitaux.
            Voici le guide d'utilisation :\n{guide_text}\n\n
            Question de l'utilisateur : {question}
            Réponds clairement en fonction du guide.
            """
            try:
                answer = generate_answer(prompt)
                return Response({"response": answer}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)