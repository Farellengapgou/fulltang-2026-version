# Service Comptabilité - Fultang (module `accounting`)

Ce document décrit l'implémentation actuelle du service comptabilité dans le projet (backend Django et frontend React), les formules comptables utilisées, un comparatif avec un service comptabilité type CHU au Cameroun, les écarts, recommandations et une todo list pour rendre le service pleinement opérationnel.

## 1. Arborescence et fichiers clés

Backend (Django app `accounting` - chemin `ihm_fultang-main/accounting`):

- `models.py` : définition des modèles comptables (ChartOfAccounts, Journal, JournalEntry, JournalEntryLine, Supplier, Asset, Budget, BudgetLine, etc.).
- `serializers.py` : sérialiseurs DRF pour l'API (ChartOfAccountsSerializer, JournalEntrySerializer, AssetSerializer, BudgetSerializer, ...).
- `api_views/` : ViewSets et APIViews exposant l'API REST (account_api_view, facture_api_view, financial_operation_api_view, journal_entry_api_view, accounting_stats, etc.).
- `urls.py` : routeur DRF enregistrant les endpoints (ex: `/account`, `/facture`, `/financial-operation`, `/chart-of-accounts`, `/journal-entries`, `/statistics/`).
- `services/accounting_service.py` : fonctions utilitaires pour créer automatiquement des écritures (consultation, encaissement, factures fournisseurs, amortissements).

Frontend (React - chemin `ihm_fultang-frontend-v1/src/Pages/Accountant`):

- `Accountant.jsx` : Dashboard principal consommant des endpoints `/invoice/total`, `/account/total`, `/financial-operation/total` via `axiosInstanceAccountant`.
- `CreateFacture.jsx`, `FinancialReports.jsx`, `AccountList.jsx`, `AccountDetailsPage.jsx`, et composants sous `Components/` (AccountantDashboard, BalanceSheet, IncomeStatement, etc.) : interface utilisateur.
- `Utils/axiosInstanceAccountant.js` : configuration axios avec URL backend spécifique et header Authorization.

## 2. Flux & Endpoints observés

- Frontend (Dashboard) fait 3 appels:

  - `GET /invoice/total` (pour le total de factures)
  - `GET /account/total` (pour total comptes)
  - `GET /financial-operation/total` (pour total opérations financières)

- Backend expose (d'après `urls.py`):
  - `/facture/` (FactureViewSet), `/account/` (AccountViewSet), `/financial-operation/` (FinancialOperationViewSet)
  - `/statistics/` (AccountingStatsAPI)

Observation: `/invoice/total` et `/account/total` ne sont pas présents tels quels; il existe `/facture/` et `/account/` endpoints génériques. Le dashboard frontend attend des endpoints `.../total` renvoyant {total: N}. Soit on adapte le frontend pour consommer `/statistics/` (qui retourne des totaux composés), soit on ajoute des endpoints `facture/total` etc. dans le backend.

## 3. Principales entités et formules implémentées

Entités principales:

- ChartOfAccounts : plan comptable avec code, label, classe, type (ASSET/LIABILITY/REVENUE/EXPENSE).
- Journal, JournalEntry, JournalEntryLine : gestion des écritures et lignes (débit/crédit), génération de numéro auto, contrôle d'équilibrage.
- Supplier, Asset : fournisseurs et immobilisations avec calculs d'amortissement.
- Budget/BudgetLine : gestion budgétaire.

Formules et règles clés présentes dans le code:

1. Calcul de solde d'un compte (méthode `ChartOfAccounts.get_balance`):

- total_debit = SUM(debit_amount) sur lignes filtrées
- total_credit = SUM(credit_amount)
- Si account_type in ['ASSET', 'EXPENSE'] : balance = total_debit - total_credit
- Else : balance = total_credit - total_debit

2. Vérification d'équilibre d'une écriture (`JournalEntry.is_balanced`):

- balanced iff total_debit == total_credit

3. Génération numéro écriture:

- Préfixe = journal.code + YYYYMM
- Numéro séquentiel sur 4 chiffres ajouté

4. Amortissement linéaire (méthode `Asset.calculate_annual_depreciation`):

- annual_depreciation = (acquisition_cost - salvage_value) / useful_life_years
- amortissement mensuel = annual_depreciation / 12 (utilisé dans `create_depreciation_entries`)

5. Écritures automatiques (services):

- Consultation: débit client (411001) / crédit produit (7011)
- Paiement: débit trésorerie (5711 ou 5121) / crédit client (411001)
- Facture fournisseur: débit charge (6031) (+ debit TVA 4451) / crédit fournisseur

6. Budget total: somme des `BudgetLine.get_annual_total`

Notes sur types numériques:

- Le code mélange `FloatField` et `DecimalField`. Les montants critiques (écritures, comptes, amortissements) utilisent `DecimalField` dans la partie "nouvelle" (ChartOfAccounts, JournalEntry.total_debit/credit, JournalEntryLine montants). Quelques anciens modèles (Facture, AccountState.balance) utilisent encore `FloatField`.

## 4. Comparatif avec un service comptabilité réel d'un CHU (Cameroun)

Approche: je me suis basé sur documents publics (ministère de la santé, rapports d'audit, manuels comptables des hôpitaux publics) et sur les principes comptables applicables au Cameroun (OHADA / plan comptable OHADA, réglementation fiscale locale). Références listées en section 8.

Organisation et obligations typiques d'un CHU au Cameroun:

- Utilisation du Plan Comptable OHADA (PCMN) adapté au secteur public/assimilé.
- Tenue de journaux : ventes, achats, banque, caisse, opérations diverses.
- Comptabilisation des recettes hospitalières (facturation patients), subventions publiques, dons et autres produits.
- Gestion des immobilisations avec plan d'amortissement et suivi (numéro d'actif, valeur nette comptable, amortissements cumulés).
- TVA : collecte et déductibilité suivant régime (certaines prestations médicales exonérées selon la loi) — nécessité de calculer TVA collectée et déductible, et de produire déclarations.
- Clôture de période (mois/année) avec impossibilité de modifier écritures post-clôture sans procédure (arrêtés, journaux d'ajustement).
- Contrôles internes : séparation des tâches (encaisseur != validateur), piste d'audit, rapprochement bancaire régulier.
- Rapports financiers : bilan, compte de résultat, rapports budgétaires, états de trésorerie, rapports pour le ministère et audit externe.

Formules/ratios usuels dans CHU (exemples):

- Solde compte = Débits - Crédits (même logique selon nature du compte)
- Marge brute = Produits d'exploitation - Charges d'exploitation
- Ratio d'autonomie financière = Capitaux propres / Total bilan
- Délai moyen de paiement fournisseur = (Dettes fournisseurs / Achats annuels) \* 365
- Délai moyen de recouvrement client = (Créances clients / Ventes annuelles) \* 365

Exemple d'écritures CHU:

- Facturation patient: Débit client (411) / Crédit produit (70)
- Encaissement espèces: Débit caisse (57) / Crédit client (411)
- Achat médicament: Débit charge (60) / Crédit fournisseur (401 ou 404 selon PCMN)
- Enregistrement amortissement: Débit charge d'amortissement / Crédit amortissements cumulés

## 5. Écarts entre notre implémentation et un service CHU réel

Points positifs (bien faits):

- Structure robuste de plan comptable (ChartOfAccounts, classes, types). Bonne séparation Journal / JournalEntry / Line.
- Sérialiseurs et validations: checks pour équilibrage, montants non-négatifs, contraintes parent-enfant sur codes.
- Services automatisés pour écritures fréquentes (consultation, paiement, amortissement) — utile pour intégration avec polyclinic.
- Existence d'un module budgétaire (Budget/BudgetLine) permettant planification.

Points manquants ou à améliorer (critique):

1. Endpoints manquants et incompatibilité frontend:
   - Frontend attend `/invoice/total` etc. Backend expose `/facture/` et `/statistics/`. Besoin d'alignement.
2. Contrôle de précision monétaire:
   - Mélange FloatField (imprécis) et DecimalField. Les montants doivent tous utiliser DecimalField avec précision définie (ex: max_digits=18, decimal_places=2).
   - Normaliser les arrondis: utiliser Decimal.quantize avec ROUND_HALF_UP pour cohérence.
3. Séparation des tâches & permissions:
   - `JournalEntry.post` utilise `validated_by` mais les permissions côté viewset sont permissives (JournalEntryViewSet permission_classes = [IsAuthenticated]) ; il faut restreindre à rôle comptable et assurer séparation (créateur != validateur).
4. Clôture de période:
   - Le modèle AccountingPeriod est référencé mais partiellement implémenté; il faut verrouiller périodes, fournir procédures d'ouverture/fermeture et journaux d'ajustement.
5. Piste d'audit:
   - Manque d'historisation complète (qui a modifié quoi, avant/après). Utiliser django-simple-history ou équivalent.
6. Rapports et déclarations fiscales:
   - Pas d'exports standards pour TVA/fiscalité, ni gestion des exonérations médicales spécifiques.
7. Tests & robustesse:
   - Peu (ou pas) de tests unitaires montrés pour équilibrage, services d'intégration, et points critiques.
8. Réconciliation bancaire:
   - Module de rapprochement partiellement présent (BankReconciliation mentionné) mais pas de vue ni d'UI dédiée.

## 6. Recommandations (techniques et métier)

Technique:

1. Aligner endpoints frontend/back : soit adaptez le frontend (consommer `/statistics/`), soit exposez endpoints `/facture/total`, `/account/total`, `/financial-operation/total` (ajout d'actions `@action` dans les ViewSets renvoyant {total: N}).
2. Convertir tous les montants sensibles à `DecimalField` (database) et utiliser `decimal.Decimal` côté Python/serializers. Définir constantes globales DECIMAL_MAX_DIGITS=18, DECIMAL_PLACES=2.
3. Ajouter transactions @transaction.atomic sur créations d'écritures et validations, avec tests unitaires.
4. Implémenter `AccountingPeriod` complet avec verrouillage post-clôture. Refuser posts si période fermée.
5. Ajouter journal d'audit (django-simple-history ou log d'audit personnalisé) pour JournalEntry et modifications critiques.
6. Restreindre permissions: créer classes de permission pour rôle `Accountant`, `ChiefAccountant`, `Auditor` et appliquer sur ViewSets sensibles.
7. Normaliser formules d'arrondi et précision (Decimal.quantize).
8. Écrire tests unitaires/integration pour: équilibrage d'écritures, services (create_payment_entry), amortissement, endpoints totals.

Métier:

1. Valider le plan comptable contre le PCMN/OHADA adapté au public; mapper codes (ex: 411 pour clients, 701 pour produits) correctement.
2. Définir politique TVA et traitements d'exonération pour actes médicaux.
3. Définir workflow de validation d'écritures (création par opérateur, validation par comptable, approbation finale par chef comptable).
4. Rapprochement bancaire mensuel et procédure d'ajustements.

## 7. Todo technique priorisée (pour rendre le service 100% opérationnel)

Priorité haute (P0):

- [ ] Aligner frontend/backend: implémenter endpoints `facture/total`, `account/total`, `financial-operation/total` côté backend OR modifier axios calls côté frontend pour `/statistics/`.
- [ ] Remplacer `FloatField` par `DecimalField` sur `AccountState.balance`, `Facture.montant`, autres champs monétaires hérités. Ajouter migrations.
- [ ] Restreindre permissions sur JournalEntry (validation uniquement pour comptables), ajouter séparations de rôle.
- [ ] Mettre en place tests unitaires pour l'équilibrage des écritures et services d'écriture.

Priorité moyenne (P1):

- [ ] Implémenter piste d'audit (historique des écritures).
- [ ] Finaliser `AccountingPeriod` pour verrouillage de période.
- [ ] Ajouter endpoints pour rapports fiscaux (TVA) et exports CSV/Excel.
- [ ] Vérifier et corriger tous les codes de comptes dans `services` (411001, 7011, etc.) pour correspondre au plan comptable choisi.

Priorité basse (P2):

- [ ] UI: améliorer forms, loaders, erreurs, web sockets pour mises à jour temps réel.
- [ ] Monitoring, backups et docs d'exploitation.

## 8. Références et sources (exemples)

- OHADA Plan Comptable (PCMN) — documentation officielle OHADA
- Exemples de manuels comptables hospitaliers (ministères de la santé / rapports d'audit) — rechercher rapports CHU locaux
- Législation fiscale camerounaise (fichier officiel taxe sur la valeur ajoutée)

> Note: fournir des liens directs requiert accès web externe; je peux ajouter les URL précises si vous le souhaitez.

## 9. Sauvegarde en "mémoire"

Résumé clé stocké : structure du module `accounting`, endpoints manquants entre frontend et backend, mélange Float/Decimal, recommandations principales (mettre tout en Decimal, verrouillage période, piste d'audit), todo list priorisée.

## 10. Prochaines étapes que je peux exécuter maintenant

- Implémenter les endpoints `/facture/total`, `/account/total`, `/financial-operation/total` côté backend (ajout d'actions dans les ViewSets) — faible risque et rapide.
- Ou modifier `Accountant.jsx` pour appeler `/statistics/` et mapper le résultat.

Dites-moi laquelle des deux options vous préférez; je peux réaliser la modification immédiatement et créer les fichiers/migrations nécessaires.
