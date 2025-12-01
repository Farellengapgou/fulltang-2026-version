from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import os

class HelpCenterCategoriesView(APIView):
    """
    API pour récupérer les catégories du Help Center
    """
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        categories = [
            {
                "title": "Consultations & Rendez-vous",
                "description": "Guide pour planifier ou annuler un rendez-vous",
                "link": "/help/consultations",
                "icon": "calendar"
            },
            {
                "title": "Paiements & Facturation",
                "description": "Informations sur les paiements et remboursements",
                "link": "/help/payments",
                "icon": "money"
            },
            {
                "title": "Problèmes Techniques",
                "description": "Résolution des problèmes techniques",
                "link": "/help/technical",
                "icon": "bug"
            },
            {
                "title": "FAQ",
                "description": "Réponses aux questions fréquemment posées",
                "link": "/help/faq",
                "icon": "question"
            }
        ]
        return Response(categories, status=status.HTTP_200_OK)
