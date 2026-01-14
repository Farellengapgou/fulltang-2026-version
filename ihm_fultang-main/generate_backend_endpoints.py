#!/usr/bin/env python3
"""
Script pour créer tous les endpoints backend manquants (Phase 13)
"""

from pathlib import Path

BASE_DIR = Path("accounting")

# Template pour ViewSet backend
VIEWSET_TEMPLATE = '''from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from ..models_financier import {model_name}
from ..serializers import {serializer_name}


class {viewset_name}(ModelViewSet):
    """
    ViewSet pour {description}
    """
    queryset = {model_name}.objects.all()
    serializer_class = {serializer_name}
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @transaction.atomic
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
'''

# Template pour Serializer
SERIALIZER_TEMPLATE = '''from rest_framework import serializers
from .models_financier import {model_name}


class {serializer_name}(serializers.ModelSerializer):
    class Meta:
        model = {model_name}
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
'''

# Template pour Model
MODEL_TEMPLATE = '''from django.db import models
from django.contrib.auth.models import User


class {model_name}(models.Model):
    """
    {description}
    """
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='{related_name}_created')
    
    class Meta:
        db_table = '{table_name}'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{{self.code}} - {{self.name}}"
'''

endpoints = [
    {
        'name': 'Supplier',
        'description': 'la gestion des fournisseurs',
        'file': 'supplier_api_view.py',
        'table': 'suppliers'
    },
    {
        'name': 'FixedAsset',
        'description': 'la gestion des immobilisations',
        'file': 'asset_api_view.py',
        'table': 'fixed_assets'
    },
    {
        'name': 'Inventory',
        'description': 'la gestion des stocks',
        'file': 'inventory_api_view.py',
        'table': 'inventory'
    },
    {
        'name': 'Payroll',
        'description': 'la comptabilisation de la paie',
        'file': 'payroll_api_view.py',
        'table': 'payroll'
    },
    {
        'name': 'VAT',
        'description': 'la gestion de la TVA',
        'file': 'vat_api_view.py',
        'table': 'vat_records'
    },
    {
        'name': 'Budget',
        'description': 'la gestion des budgets',
        'file': 'budget_api_view.py',
        'table': 'budgets'
    },
    {
        'name': 'BankReconciliation',
        'description': 'les rapprochements bancaires',
        'file': 'bank_reconciliation_api_view.py',
        'table': 'bank_reconciliations'
    },
]

print("🚀 Génération des endpoints backend...")

# Créer le dossier api_views s'il n'existe pas
api_views_dir = BASE_DIR / "api_views"
api_views_dir.mkdir(exist_ok=True)

created_files = []

for endpoint in endpoints:
    model_name = endpoint['name']
    viewset_name = f"{model_name}ViewSet"
    serializer_name = f"{model_name}Serializer"
    description = endpoint['description']
    file_name = endpoint['file']
    table_name = endpoint['table']
    related_name = table_name.replace('_', '')
    
    # Créer le ViewSet
    viewset_path = api_views_dir / file_name
    viewset_content = VIEWSET_TEMPLATE.format(
        model_name=model_name,
        serializer_name=serializer_name,
        viewset_name=viewset_name,
        description=description
    )
    
    with open(viewset_path, 'w', encoding='utf-8') as f:
        f.write(viewset_content)
    
    created_files.append(f"api_views/{file_name}")
    print(f"✅ {file_name}")

print(f"\n🎉 {len(created_files)} endpoints backend créés!")
print("\n📝 Prochaines étapes:")
print("1. Ajouter les modèles dans models_financier.py")
print("2. Créer les serializers dans serializers.py")
print("3. Enregistrer les ViewSets dans urls.py")
print("4. Créer les migrations: python manage.py makemigrations")
print("5. Appliquer les migrations: python manage.py migrate")
