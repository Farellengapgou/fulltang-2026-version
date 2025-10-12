from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from accounting.models import *

class BudgetExerciseSerializer(ModelSerializer):
    class Meta:
        model = BudgetExercise
        fields = '__all__'


class AccountSerializer(ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'

class AccountStateSerializer(ModelSerializer):
    class Meta:
        model = AccountState
        fields = '__all__'

class AccountStateCreateSerializer(ModelSerializer):
    class Meta:
        model = AccountState
        exclude = ['id']


class FinancialOperationSerializer(ModelSerializer):
    class Meta:
        model = FinancialOperation
        fields = '__all__'

class FactureSerializer(ModelSerializer):
    class Meta:
        model = Facture
        fields = '__all__'

class AccountingViewSerializer(ModelSerializer):
    amount = serializers.FloatField(default=0)

    account = AccountSerializer()
    
    class Meta:
        model = AccountState
        fields = ['id', 'balance', 'account', 'amount']


################## Nouveau ##################################
# accounting/serializers.py

from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
from .models import (
    ChartOfAccounts, Journal, JournalEntry, JournalEntryLine,
    Supplier, Asset, AnalyticAccount, Budget, BudgetLine,
    AccountingPeriod, TaxRate, TaxDeclaration, BankAccount,
    BankReconciliation, FinancialRatio, AccountingOperation
)
from authentication.models import MedicalStaff


class ChartOfAccountsSerializer(serializers.ModelSerializer):
    balance = serializers.SerializerMethodField()
    parent_name = serializers.CharField(source='parent.label', read_only=True)
    children_count = serializers.SerializerMethodField()

    class Meta:
        model = ChartOfAccounts
        fields = [
            'id', 'code', 'label', 'account_class', 'account_type',
            'parent', 'parent_name', 'is_active', 'is_detailed',
            'balance', 'children_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_balance(self, obj):
        """Calcule le solde du compte"""
        start_date = self.context.get('start_date')
        end_date = self.context.get('end_date')
        return float(obj.get_balance(start_date, end_date))

    def get_children_count(self, obj):
        """Retourne le nombre de sous-comptes"""
        return obj.chartofaccounts_set.count()

    def validate_code(self, value):
        """Valide le format du code comptable"""
        if not value.isdigit():
            raise serializers.ValidationError(
                "Le code comptable doit contenir uniquement des chiffres"
            )
        if len(value) < 3:
            raise serializers.ValidationError(
                "Le code comptable doit contenir au moins 3 chiffres"
            )
        return value

    def validate(self, attrs):
        """Validation croisée"""
        # Vérifier la cohérence classe/type
        account_class = attrs.get('account_class')
        account_type = attrs.get('account_type')

        class_type_mapping = {
            '1': ['EQUITY', 'LIABILITY'],
            '2': ['ASSET'],
            '3': ['ASSET'],
            '4': ['ASSET', 'LIABILITY'],
            '5': ['ASSET'],
            '6': ['EXPENSE'],
            '7': ['REVENUE'],
            '8': ['ASSET', 'LIABILITY']
        }

        if account_class in class_type_mapping:
            if account_type not in class_type_mapping[account_class]:
                raise serializers.ValidationError({
                    'account_type': f"Type incompatible avec la classe {account_class}"
                })

        # Vérifier la hiérarchie parent
        parent = attrs.get('parent')
        if parent:
            code = attrs.get('code', '')
            if not code.startswith(parent.code):
                raise serializers.ValidationError({
                    'parent': "Le compte parent doit avoir un code compatible"
                })

        return attrs


class JournalSerializer(serializers.ModelSerializer):
    entries_count = serializers.SerializerMethodField()
    default_debit_account_name = serializers.CharField(
        source='default_debit_account.label', read_only=True
    )
    default_credit_account_name = serializers.CharField(
        source='default_credit_account.label', read_only=True
    )

    class Meta:
        model = Journal
        fields = [
            'id', 'code', 'name', 'journal_type',
            'default_debit_account', 'default_debit_account_name',
            'default_credit_account', 'default_credit_account_name',
            'is_active', 'entries_count'
        ]

    def get_entries_count(self, obj):
        """Retourne le nombre d'écritures dans ce journal"""
        return obj.journalentry_set.count()


class JournalEntryLineSerializer(serializers.ModelSerializer):
    account_code = serializers.CharField(source='account.code', read_only=True)
    account_label = serializers.CharField(source='account.label', read_only=True)
    partner_name = serializers.CharField(source='partner.name', read_only=True)
    analytic_account_name = serializers.CharField(
        source='analytic_account.name', read_only=True
    )

    class Meta:
        model = JournalEntryLine
        fields = [
            'id', 'sequence', 'account', 'account_code', 'account_label',
            'label', 'debit_amount', 'credit_amount', 'partner', 'partner_name',
            'analytic_account', 'analytic_account_name'
        ]

    def validate(self, attrs):
        """Validation des montants"""
        debit = attrs.get('debit_amount', 0)
        credit = attrs.get('credit_amount', 0)

        if debit and credit:
            raise serializers.ValidationError(
                "Une ligne ne peut pas être à la fois débit et crédit"
            )

        if not debit and not credit:
            raise serializers.ValidationError(
                "Une ligne doit avoir un montant débit ou crédit"
            )

        if debit < 0 or credit < 0:
            raise serializers.ValidationError(
                "Les montants ne peuvent pas être négatifs"
            )

        return attrs


class JournalEntrySerializer(serializers.ModelSerializer):
    lines = JournalEntryLineSerializer(many=True)
    journal_name = serializers.CharField(source='journal.name', read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', read_only=True
    )
    validated_by_name = serializers.CharField(
        source='validated_by.get_full_name', read_only=True
    )
    is_balanced = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()

    class Meta:
        model = JournalEntry
        fields = [
            'id', 'entry_number', 'entry_date', 'journal', 'journal_name',
            'reference', 'description', 'state', 'total_debit', 'total_credit',
            'created_by', 'created_by_name', 'validated_by', 'validated_by_name',
            'created_at', 'validated_at', 'bill', 'consultation',
            'lines', 'is_balanced', 'can_edit'
        ]
        read_only_fields = [
            'entry_number', 'total_debit', 'total_credit',
            'created_by', 'validated_by', 'created_at', 'validated_at'
        ]

    def get_is_balanced(self, obj):
        """Vérifie si l'écriture est équilibrée"""
        return obj.is_balanced()

    def get_can_edit(self, obj):
        """Vérifie si l'écriture peut être modifiée"""
        return obj.state == 'DRAFT'

    def validate_entry_date(self, value):
        """Valide la date d'écriture"""
        # Vérifier que la période n'est pas clôturée
        try:
            period = AccountingPeriod.objects.get(
                year=value.year,
                month=value.month
            )
            if not period.can_post_entries():
                raise serializers.ValidationError(
                    f"La période {period} est clôturée"
                )
        except AccountingPeriod.DoesNotExist:
            # Créer automatiquement la période si elle n'existe pas
            AccountingPeriod.objects.create(
                year=value.year,
                month=value.month
            )

        return value

    def validate_lines(self, lines_data):
        """Valide les lignes d'écriture"""
        if len(lines_data) < 2:
            raise serializers.ValidationError(
                "Une écriture doit avoir au moins 2 lignes"
            )

        total_debit = sum(line.get('debit_amount', 0) for line in lines_data)
        total_credit = sum(line.get('credit_amount', 0) for line in lines_data)

        if abs(total_debit - total_credit) > 0.01:
            raise serializers.ValidationError(
                f"L'écriture n'est pas équilibrée: "
                f"Débit={total_debit}, Crédit={total_credit}"
            )

        return lines_data

    @transaction.atomic
    def create(self, validated_data):
        """Création d'une écriture avec ses lignes"""
        lines_data = validated_data.pop('lines')
        validated_data['created_by'] = self.context['request'].user

        journal_entry = JournalEntry.objects.create(**validated_data)

        for i, line_data in enumerate(lines_data, 1):
            line_data['sequence'] = i
            JournalEntryLine.objects.create(
                journal_entry=journal_entry,
                **line_data
            )

        journal_entry.update_totals()
        return journal_entry

    @transaction.atomic
    def update(self, instance, validated_data):
        """Mise à jour d'une écriture"""
        if instance.state != 'DRAFT':
            raise serializers.ValidationError(
                "Seules les écritures en brouillon peuvent être modifiées"
            )

        lines_data = validated_data.pop('lines', None)

        # Mettre à jour l'écriture
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if lines_data is not None:
            # Supprimer les anciennes lignes
            instance.lines.all().delete()

            # Créer les nouvelles lignes
            for i, line_data in enumerate(lines_data, 1):
                line_data['sequence'] = i
                JournalEntryLine.objects.create(
                    journal_entry=instance,
                    **line_data
                )

            instance.update_totals()

        return instance


class SupplierSerializer(serializers.ModelSerializer):
    account_label = serializers.CharField(source='account.label', read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', read_only=True
    )
    balance = serializers.SerializerMethodField()
    orders_total_current_year = serializers.SerializerMethodField()

    class Meta:
        model = Supplier
        fields = [
            'id', 'code', 'name', 'supplier_type', 'address', 'phone',
            'email', 'website', 'payment_terms', 'credit_limit',
            'discount_rate', 'tax_id', 'trade_register', 'account',
            'account_label', 'is_active', 'created_at', 'created_by',
            'created_by_name', 'balance', 'orders_total_current_year'
        ]
        read_only_fields = ['created_at', 'created_by']

    def get_balance(self, obj):
        """Retourne le solde fournisseur"""
        return float(obj.get_balance())

    def get_orders_total_current_year(self, obj):
        """Retourne le CA de l'année en cours"""
        current_year = timezone.now().year
        return float(obj.get_orders_total(current_year))

    def validate_code(self, value):
        """Valide l'unicité du code fournisseur"""
        if self.instance and self.instance.code == value:
            return value

        if Supplier.objects.filter(code=value).exists():
            raise serializers.ValidationError(
                "Ce code fournisseur existe déjà"
            )
        return value

    def validate_email(self, value):
        """Valide le format email"""
        if value and '@' not in value:
            raise serializers.ValidationError("Format email invalide")
        return value

    def create(self, validated_data):
        """Création avec utilisateur connecté"""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class AssetSerializer(serializers.ModelSerializer):
    asset_account_label = serializers.CharField(
        source='asset_account.label', read_only=True
    )
    depreciation_account_label = serializers.CharField(
        source='depreciation_account.label', read_only=True
    )
    expense_account_label = serializers.CharField(
        source='expense_account.label', read_only=True
    )
    department_name = serializers.CharField(
        source='department.name', read_only=True
    )
    responsible_name = serializers.CharField(
        source='responsible.get_full_name', read_only=True
    )
    annual_depreciation = serializers.SerializerMethodField()
    accumulated_depreciation = serializers.SerializerMethodField()
    net_book_value = serializers.SerializerMethodField()

    class Meta:
        model = Asset
        fields = [
            'id', 'asset_number', 'name', 'category', 'description',
            'acquisition_cost', 'acquisition_date', 'useful_life_years',
            'salvage_value', 'depreciation_method', 'depreciation_rate',
            'asset_account', 'asset_account_label',
            'depreciation_account', 'depreciation_account_label',
            'expense_account', 'expense_account_label',
            'location', 'department', 'department_name',
            'responsible', 'responsible_name',
            'is_active', 'disposal_date', 'disposal_value',
            'annual_depreciation', 'accumulated_depreciation', 'net_book_value',
            'created_at', 'created_by'
        ]
        read_only_fields = ['asset_number', 'created_at', 'created_by']

    def get_annual_depreciation(self, obj):
        """Retourne l'amortissement annuel"""
        return float(obj.calculate_annual_depreciation())

    def get_accumulated_depreciation(self, obj):
        """Retourne les amortissements cumulés"""
        return float(obj.get_accumulated_depreciation())

    def get_net_book_value(self, obj):
        """Retourne la valeur nette comptable"""
        return float(obj.get_net_book_value())

    def validate(self, attrs):
        """Validation métier des immobilisations"""
        acquisition_cost = attrs.get('acquisition_cost')
        salvage_value = attrs.get('salvage_value', 0)
        useful_life_years = attrs.get('useful_life_years')

        if salvage_value >= acquisition_cost:
            raise serializers.ValidationError({
                'salvage_value': "La valeur résiduelle doit être inférieure au coût d'acquisition"
            })

        if useful_life_years <= 0:
            raise serializers.ValidationError({
                'useful_life_years': "La durée d'utilité doit être positive"
            })

        # Vérifier que les comptes sont cohérents
        asset_account = attrs.get('asset_account')
        if asset_account and asset_account.account_type != 'ASSET':
            raise serializers.ValidationError({
                'asset_account': "Le compte d'immobilisation doit être de type ASSET"
            })

        return attrs

    def create(self, validated_data):
        """Création avec numéro automatique"""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class BudgetLineSerializer(serializers.ModelSerializer):
    account_code = serializers.CharField(source='account.code', read_only=True)
    account_label = serializers.CharField(source='account.label', read_only=True)
    analytic_account_name = serializers.CharField(
        source='analytic_account.name', read_only=True
    )
    annual_total = serializers.SerializerMethodField()

    class Meta:
        model = BudgetLine
        fields = [
            'id', 'account', 'account_code', 'account_label',
            'analytic_account', 'analytic_account_name',
            'january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december',
            'notes', 'annual_total'
        ]

    def get_annual_total(self, obj):
        """Retourne le total annuel"""
        return float(obj.get_annual_total())


class BudgetSerializer(serializers.ModelSerializer):
    lines = BudgetLineSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', read_only=True
    )
    approved_by_name = serializers.CharField(
        source='approved_by.get_full_name', read_only=True
    )
    total_budget = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = [
            'id', 'name', 'budget_type', 'fiscal_year',
            'start_date', 'end_date', 'is_active', 'is_approved',
            'approved_by', 'approved_by_name', 'approved_at',
            'created_by', 'created_by_name', 'created_at',
            'lines', 'total_budget'
        ]
        read_only_fields = [
            'approved_by', 'approved_at', 'created_by', 'created_at'
        ]

    def get_total_budget(self, obj):
        """Calcule le budget total"""
        return float(sum(line.get_annual_total() for line in obj.lines.all()))

    def validate(self, attrs):
        """Validation des dates"""
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')

        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError({
                'end_date': "La date de fin doit être postérieure à la date de début"
            })

        return attrs

    def create(self, validated_data):
        """Création avec utilisateur connecté"""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class TaxRateSerializer(serializers.ModelSerializer):
    collected_account_label = serializers.CharField(
        source='collected_account.label', read_only=True
    )
    paid_account_label = serializers.CharField(
        source='paid_account.label', read_only=True
    )
    rate_percentage = serializers.SerializerMethodField()

    class Meta:
        model = TaxRate
        fields = [
            'id', 'name', 'tax_type', 'rate', 'rate_percentage',
            'is_active', 'start_date', 'end_date',
            'collected_account', 'collected_account_label',
            'paid_account', 'paid_account_label'
        ]

    def get_rate_percentage(self, obj):
        """Retourne le taux en pourcentage"""
        return float(obj.rate * 100)


class TaxDeclarationSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', read_only=True
    )
    total_due = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = TaxDeclaration
        fields = [
            'id', 'declaration_type', 'period_year', 'period_month',
            'period_quarter', 'tax_base', 'tax_amount', 'penalties',
            'due_date', 'submission_date', 'payment_date', 'status',
            'journal_entry', 'created_by', 'created_by_name',
            'created_at', 'total_due', 'is_overdue'
        ]
        read_only_fields = ['created_by', 'created_at', 'penalties']

    def get_total_due(self, obj):
        """Retourne le montant total dû"""
        return float(obj.tax_amount + obj.penalties)

    def get_is_overdue(self, obj):
        """Vérifie si la déclaration est en retard"""
        return (obj.status in ['DRAFT', 'SUBMITTED'] and
                timezone.now().date() > obj.due_date)

    def validate(self, attrs):
        """Validation des périodes"""
        declaration_type = attrs.get('declaration_type')
        period_month = attrs.get('period_month')
        period_quarter = attrs.get('period_quarter')

        if 'MONTHLY' in declaration_type and not period_month:
            raise serializers.ValidationError({
                'period_month': "Le mois est requis pour une déclaration mensuelle"
            })

        if 'QUARTERLY' in declaration_type and not period_quarter:
            raise serializers.ValidationError({
                'period_quarter': "Le trimestre est requis pour une déclaration trimestrielle"
            })

        return attrs

    def create(self, validated_data):
        """Création avec calcul automatique des pénalités"""
        validated_data['created_by'] = self.context['request'].user
        instance = super().create(validated_data)

        # Calculer les pénalités si applicable
        if instance.submission_date:
            instance.penalties = instance.calculate_penalties()
            instance.save()

        return instance


class AccountingPeriodSerializer(serializers.ModelSerializer):
    closed_by_name = serializers.CharField(
        source='closed_by.get_full_name', read_only=True
    )
    period_label = serializers.SerializerMethodField()
    entries_count = serializers.SerializerMethodField()

    class Meta:
        model = AccountingPeriod
        fields = [
            'id', 'year', 'month', 'state', 'closed_by', 'closed_by_name',
            'closed_at', 'period_label', 'entries_count'
        ]
        read_only_fields = ['closed_by', 'closed_at']

    def get_period_label(self, obj):
        """Retourne le libellé de la période"""
        return f"{obj.month:02d}/{obj.year}"

    def get_entries_count(self, obj):
        """Retourne le nombre d'écritures sur la période"""
        from datetime import date
        start_date = date(obj.year, obj.month, 1)
        if obj.month == 12:
            end_date = date(obj.year + 1, 1, 1)
        else:
            end_date = date(obj.year, obj.month + 1, 1)

        return JournalEntry.objects.filter(
            entry_date__gte=start_date,
            entry_date__lt=end_date
        ).count()


# Serializers pour les rapports
class BalanceSheetSerializer(serializers.Serializer):
    """Serializer pour le bilan comptable"""
    assets = serializers.DictField()
    liabilities = serializers.DictField()
    equity = serializers.DictField()
    total_assets = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_liabilities_equity = serializers.DecimalField(max_digits=15, decimal_places=2)
    is_balanced = serializers.BooleanField()


class IncomeStatementSerializer(serializers.Serializer):
    """Serializer pour le compte de résultat"""
    revenues = serializers.DictField()
    expenses = serializers.DictField()
    total_revenues = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_expenses = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_income = serializers.DecimalField(max_digits=15, decimal_places=2)
    gross_margin = serializers.DecimalField(max_digits=15, decimal_places=2)
    operating_margin = serializers.DecimalField(max_digits=15, decimal_places=2)


class TrialBalanceSerializer(serializers.Serializer):
    """Serializer pour la balance comptable"""
    account_code = serializers.CharField()
    account_label = serializers.CharField()
    opening_balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    debit_movements = serializers.DecimalField(max_digits=15, decimal_places=2)
    credit_movements = serializers.DecimalField(max_digits=15, decimal_places=2)
    closing_balance = serializers.DecimalField(max_digits=15, decimal_places=2)


# Serializer pour actions spéciales
class PostJournalEntrySerializer(serializers.Serializer):
    """Serializer pour valider une écriture"""
    entry_id = serializers.IntegerField()
    validation_note = serializers.CharField(max_length=500, required=False)

    def validate_entry_id(self, value):
        """Valide que l'écriture existe et peut être validée"""
        try:
            entry = JournalEntry.objects.get(id=value)
            if entry.state != 'DRAFT':
                raise serializers.ValidationError(
                    "Seules les écritures en brouillon peuvent être validées"
                )
            if not entry.is_balanced():
                raise serializers.ValidationError(
                    "L'écriture n'est pas équilibrée"
                )
            return value
        except JournalEntry.DoesNotExist:
            raise serializers.ValidationError("Écriture non trouvée")


class ClosePeriodSerializer(serializers.Serializer):
    """Serializer pour clôturer une période"""
    year = serializers.IntegerField()
    month = serializers.IntegerField(min_value=1, max_value=12)
    closure_note = serializers.CharField(max_length=1000, required=False)

    def validate(self, attrs):
        """Valide que la période peut être clôturée"""
        year = attrs['year']
        month = attrs['month']

        try:
            period = AccountingPeriod.objects.get(year=year, month=month)
            if period.state != 'OPEN':
                raise serializers.ValidationError(
                    f"La période {period} n'est pas ouverte"
                )
        except AccountingPeriod.DoesNotExist:
            raise serializers.ValidationError(
                f"La période {month:02d}/{year} n'existe pas"
            )

        # Vérifier qu'il n'y a pas d'écritures en brouillon
        from datetime import date
        start_date = date(year, month, 1)
        if month == 12:
            end_date = date(year + 1, 1, 1)
        else:
            end_date = date(year, month + 1, 1)

        draft_entries = JournalEntry.objects.filter(
            entry_date__gte=start_date,
            entry_date__lt=end_date,
            state='DRAFT'
        ).count()

        if draft_entries > 0:
            raise serializers.ValidationError(
                f"Il reste {draft_entries} écriture(s) en brouillon sur cette période"
            )

        return attrs


class GenerateDepreciationSerializer(serializers.Serializer):
    """Serializer pour générer les amortissements"""
    period_date = serializers.DateField()
    asset_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text="IDs des immobilisations à amortir (toutes si vide)"
    )

    def validate_asset_ids(self, value):
        """Valide que les immobilisations existent"""
        if value:
            existing_ids = Asset.objects.filter(
                id__in=value, is_active=True
            ).values_list('id', flat=True)

            missing_ids = set(value) - set(existing_ids)
            if missing_ids:
                raise serializers.ValidationError(
                    f"Immobilisations non trouvées: {list(missing_ids)}"
                )

        return value
