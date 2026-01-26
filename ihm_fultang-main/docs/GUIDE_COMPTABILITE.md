# Guide Utilisateur - Module Comptabilité

## Table des Matières
1. [Introduction](#introduction)
2. [Principe de la Partie Double](#principe-de-la-partie-double)
3. [Plan Comptable OHADA](#plan-comptable-ohada)
4. [Gestion des Périodes Comptables](#gestion-des-périodes-comptables)
5. [Clients et Fournisseurs](#clients-et-fournisseurs)
6. [Écritures Comptables](#écritures-comptables)
7. [Budgets](#budgets)
8. [Rapports Financiers](#rapports-financiers)
9. [Format Téléphone](#format-téléphone)

---

## Introduction

Le module de comptabilité de Fulltang suit les normes **OHADA** (Organisation pour l'Harmonisation en Afrique du Droit des Affaires) et implémente le principe de la **partie double**.

---

## Principe de la Partie Double

### Qu'est-ce que la Partie Double ?

La partie double est un principe fondamental de la comptabilité qui stipule que **chaque transaction doit être enregistrée deux fois** :
- Une fois au **débit** d'un compte
- Une fois au **crédit** d'un autre compte

### Pourquoi Débit = Crédit ?

**Question fréquente** : "Si débit = crédit, comment savoir si l'entreprise gagne ou perd de l'argent ?"

**Réponse** : Le principe débit = crédit s'applique à **chaque écriture individuelle**, pas au résultat global.

### Calcul du Résultat

Le résultat de l'entreprise se calcule en comparant :

```
Résultat = Total Produits (Classe 7) - Total Charges (Classe 6)
```

- **Résultat positif** = Bénéfice (l'entreprise gagne de l'argent)
- **Résultat négatif** = Perte (l'entreprise perd de l'argent)

### Exemple Pratique

**Vente de prestations médicales pour 100 000 FCFA** :

| Compte | Libellé | Débit | Crédit |
|--------|---------|-------|--------|
| 411000 | Clients | 100 000 | - |
| 706000 | Prestations de services | - | 100 000 |
| **TOTAL** | | **100 000** | **100 000** |

✅ L'écriture est équilibrée (débit = crédit)
✅ Le compte 706000 (Produit) augmente de 100 000 → **Gain pour l'entreprise**

---

## Plan Comptable OHADA

### Structure des Classes

Le plan comptable OHADA est organisé en **8 classes** :

| Classe | Désignation | Type | Sens Normal |
|--------|-------------|------|-------------|
| **1** | Comptes de capitaux | Passif | Crédit |
| **2** | Comptes d'immobilisations | Actif | Débit |
| **3** | Comptes de stocks | Actif | Débit |
| **4** | Comptes de tiers | Mixte | Mixte |
| **5** | Comptes de trésorerie | Actif | Débit |
| **6** | Comptes de charges | Charge | Débit |
| **7** | Comptes de produits | Produit | Crédit |
| **8** | Comptes spéciaux | Spécial | Variable |

### Règles de Codification

1. **Le code doit commencer par le chiffre de la classe**
   - Compte de classe 1 → Code commence par 1 (ex: 101000)
   - Compte de classe 4 → Code commence par 4 (ex: 411000)

2. **Minimum 3 chiffres** pour un code comptable

3. **Hiérarchie** : Plus le code est long, plus le compte est détaillé
   - 4 = Comptes de tiers
   - 41 = Clients et comptes rattachés
   - 411 = Clients
   - 411000 = Clients - Compte général

### Comptes Principaux

#### Classe 4 - Tiers (Clients/Fournisseurs)

- **401000** : Fournisseurs
- **411000** : Clients
- **421000** : Personnel - Rémunérations dues
- **431000** : Sécurité sociale
- **443000** : État - TVA facturée
- **445000** : État - TVA récupérable

#### Classe 5 - Trésorerie

- **512000** : Banque
- **521000** : Caisse

#### Classe 6 - Charges

- **601000** : Achats de marchandises
- **604000** : Achats de fournitures
- **641000** : Rémunérations du personnel
- **645000** : Charges sociales

#### Classe 7 - Produits

- **701000** : Ventes de marchandises
- **706000** : Prestations de services

---

## Gestion des Périodes Comptables

### Création d'une Période

1. Aller dans **Comptabilité de Base** → **Périodes Comptables**
2. Cliquer sur **+ Nouvelle Période**
3. Remplir les champs :
   - **Exercice Fiscal** : Année (ex: 2026)
   - **Mois** : 1-12
   - **Date de début** : Premier jour du mois
   - **Date de fin** : Dernier jour du mois
   - **Statut Initial** : OUVERTE

### Validation

✅ **Accepté** : Date de fin > Date de début
❌ **Refusé** : Date de fin ≤ Date de début

### États d'une Période

- **OUVERTE** : Saisie d'écritures autorisée
- **FERMÉE** : Consultation uniquement, peut être réouverte
- **VERROUILLÉE** : Aucune modification possible

### Fermeture/Réouverture

- **Fermer** : Cliquer sur le bouton "Fermer" → État passe à FERMÉE
- **Rouvrir** : Cliquer sur le bouton "Rouvrir" → État passe à OUVERTE
- ⚠️ Une période VERROUILLÉE ne peut pas être rouverte

---

## Clients et Fournisseurs

### Création d'un Client

1. Aller dans **Suppliers & Customers** → **Clients**
2. Cliquer sur **+ Nouveau Client**
3. Remplir les informations :
   - **Numéro Client** : Code unique (ex: CLT-2026-001)
   - **Nom / Raison Sociale** : Nom complet
   - **Type** : Particulier / Entreprise / Assurance / Organisme Public
   - **Liaison Plan Comptable** : ⚠️ **Obligatoirement classe 4**
   - **Téléphone** : Format +237 XXX XXX XXX
   - **Email, Adresse** : Informations de contact
   - **Délai de paiement** : En jours
   - **Limite de crédit** : Montant maximum en FCFA

### Validation Compte

✅ **Accepté** : Compte de classe 4 (ex: 411000 - Clients)
❌ **Refusé** : Compte d'une autre classe (ex: 512000 - Banque)

**Message d'erreur** : "Le compte client doit être de classe 4 (Comptes de tiers)"

### Fournisseurs

Même processus que les clients, avec :
- **Catégories** : Laboratoire pharmaceutique / Équipementier médical / Prestataire / Fournisseur général
- **Compte** : Doit être de classe 4 (généralement 401000 - Fournisseurs)

---

## Format Téléphone

### Format Attendu

**Format Camerounais** : `+237 XXX XXX XXX`

### Exemples Valides

- `+237 678 850 780`
- `+237 699 123 456`
- `+237 6 77 88 99 00`

### Auto-Formatage

Le système formate automatiquement votre saisie :

| Vous tapez | Système affiche |
|------------|-----------------|
| 678850780 | +237 678 850 780 |
| +237678850780 | +237 678 850 780 |
| 237 678850780 | +237 678 850 780 |

### Validation

❌ **Refusé** si :
- Moins de 9 chiffres après +237
- Plus de 9 chiffres après +237
- Caractères non numériques

**Message d'erreur** : "Format invalide. Attendu: +237 XXX XXX XXX"

---

## Écritures Comptables

### Création d'une Écriture

1. Aller dans **Écritures Comptables**
2. Cliquer sur **+ Nouvelle Écriture**
3. Sélectionner le **Journal** (Ventes / Achats / Banque / Caisse / OD)
4. Renseigner :
   - **Date** : Date de l'opération
   - **Référence** : Numéro de facture, etc.
   - **Description** : Libellé de l'opération

### Ajout de Lignes

Pour chaque ligne :
- **Compte** : Sélectionner dans le plan comptable
- **Libellé** : Description de la ligne
- **Débit** OU **Crédit** : Montant (pas les deux)

### Validation

✅ **Écriture valide** si :
- Au moins 2 lignes
- Total Débit = Total Crédit
- Chaque ligne a soit un débit, soit un crédit (pas les deux)

### États

- **BROUILLON** : Modifiable
- **VALIDÉE** : Comptabilisée, non modifiable
- **ANNULÉE** : Contre-passée

---

## Budgets

### Création d'un Budget

1. Aller dans **Budget & Control** → **Budgets**
2. Cliquer sur **+ Nouveau Budget**
3. Remplir :
   - **Nom** : Ex: "Budget de Fonctionnement 2026"
   - **Type** : Annuel / Trimestriel / Mensuel
   - **Exercice Fiscal** : Année
   - **Dates** : Début et fin

### Lignes Budgétaires

Après création du budget, ajouter des lignes budgétaires :
- **Compte** : Généralement comptes de classe 6 (Charges)
- **Montants mensuels** : Janvier à Décembre
- **Total annuel** : Calculé automatiquement

### Approbation

- Budget en **ATTENTE** : Modifiable
- Budget **APPROUVÉ** : Fixe les objectifs, non modifiable

---

## Rapports Financiers

### Bilan

Affiche la situation patrimoniale :
- **Actif** : Ce que possède l'entreprise
- **Passif** : Ce que doit l'entreprise

### Compte de Résultat

Affiche la performance :
```
Produits (Classe 7)
- Charges (Classe 6)
= Résultat
```

### Grand Livre

Liste toutes les écritures par compte.

### Balance

Résumé des soldes de tous les comptes.

---

## Flux Caissier → Comptabilité

### Paiement d'une Consultation

Lorsqu'un paiement est enregistré au caissier :

1. **Écriture automatique créée** :
   ```
   Débit  512000 (Banque) ou 521000 (Caisse)  : Montant
   Crédit 706000 (Prestations de services)    : Montant
   ```

2. **Mise à jour automatique** :
   - Solde du compte Banque/Caisse
   - Total des produits
   - Résultat de l'exercice

### Vérification

Pour vérifier que l'intégration fonctionne :
1. Effectuer un paiement au caissier
2. Aller dans **Écritures Comptables**
3. Vérifier qu'une nouvelle écriture apparaît
4. Vérifier que le compte Banque/Caisse est mis à jour

---

## Conseils et Bonnes Pratiques

### ✅ À Faire

- **Fermer les périodes** mensuellement
- **Vérifier l'équilibre** des écritures avant validation
- **Utiliser les bons comptes** selon la classe
- **Sauvegarder régulièrement** les rapports

### ❌ À Éviter

- Modifier une écriture validée (impossible)
- Utiliser un compte de classe 6 pour un client
- Oublier de fermer les périodes passées
- Créer des écritures déséquilibrées

---

## Support et Assistance

Pour toute question sur le module comptabilité :
- Consulter ce guide
- Vérifier les messages d'erreur (ils sont explicites)
- Contacter l'administrateur système

---

**Version** : 1.0
**Dernière mise à jour** : Janvier 2026
**Conformité** : OHADA
