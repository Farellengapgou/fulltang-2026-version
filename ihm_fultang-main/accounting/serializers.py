from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
from datetime import date

from .models_financier import (
    BudgetExercise, Account, AccountState, FinancialOperation, Facture,
    ChartOfAccounts, Journal, JournalEntry, JournalEntryLine,
    Supplier, Customer, Asset, AnalyticAccount, Budget, BudgetLine,
    AccountingPeriod, AccountPeriodBalance, TaxRate, TaxDeclaration, 
    BankAccount, BankReconciliation, FinancialRatio, AccountingOperation,
    Inventory, Payroll, PayrollLine, VAT
)

from accounting.models_financier import (
    ChartOfAccounts, JournalEntry, JournalEntryLine, Journal,
    Supplier, Customer, Asset, Inventory, Payroll, PayrollLine,
    VAT, Budget, BudgetLine, AccountingPeriod, BankAccount,
    AnalyticAccount, FinancialRatio, AccountingOperation,
    BankReconciliation, TaxRate, TaxDeclaration
)


class AnalyticAccountSerializer(ModelSerializer):
    class Meta:
        model = AnalyticAccount
        fields = '__all__'


class AccountingOperationSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', read_only=True
    )

    class Meta:
        model = AccountingOperation
        fields = [
            'id', 'operation_type', 'operation_id', 'amount', 
            'journal_entry', 'bill', 'created_at', 'created_by', 'created_by_name'
        ]
        read_only_fields = ['created_at', 'created_by']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


# ============ SERIALIZERS EXISTANTS ============

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
    amount = serializers.DecimalField(max_digits=15, decimal_places=2, default=0)
    account = AccountSerializer()

    class Meta:
        model = AccountState
        fields = ['id', 'balance', 'account', 'amount']


# ============ NOUVEAUX SERIALIZERS ============

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
        if not self.context or not isinstance(self.context, dict):
            return obj.get_balance()
        start_date = self.context.get('start_date')
        end_date = self.context.get('end_date')
        return obj.get_balance(start_date, end_date)
    def get_children_count(self, obj):
        return obj.sub_accounts.count()

    def validate_code(self, value):
        if not value.isdigit():
            raise serializers.ValidationError(
                "Le code comptable doit contenir uniquement des chiffres"
            )
        if len(value) < 3:
            raise serializers.ValidationError(
                "Le code comptable doit contenir au moins 3 chiffres"
            )
        return value


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
        return obj.journalentry_set.count()


class JournalEntryLineSerializer(serializers.ModelSerializer):
    account_code = serializers.CharField(source='account.code', read_only=True)
    account_label = serializers.CharField(source='account.label', read_only=True)
    partner_supplier_name = serializers.CharField(source='partner_supplier.name', read_only=True, allow_null=True)
    partner_customer_name = serializers.CharField(source='partner_customer.name', read_only=True, allow_null=True)
    analytic_account_name = serializers.CharField(
        source='analytic_account.name', read_only=True, allow_null=True
    )

    class Meta:
        model = JournalEntryLine
        fields = [
            'id', 'sequence', 'account', 'account_code', 'account_label',
            'label', 'debit_amount', 'credit_amount', 'partner_supplier', 'partner_supplier_name',
            'partner_customer', 'partner_customer_name',
            'analytic_account', 'analytic_account_name'
        ]

    def validate(self, attrs):
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
        source='validated_by.get_full_name', read_only=True, allow_null=True
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
        return obj.is_balanced

    def get_can_edit(self, obj):
        return obj.state == 'DRAFT'

    def validate_entry_date(self, value):
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
            AccountingPeriod.objects.create(
                year=value.year,
                month=value.month
            )

        return value

    def validate_lines(self, lines_data):
        if len(lines_data) < 2:
            raise serializers.ValidationError(
                "Une écriture doit avoir au moins 2 lignes"
            )

        total_debit = sum(line.get('debit_amount', 0) for line in lines_data)
        total_credit = sum(line.get('credit_amount', 0) for line in lines_data)

        if abs(total_debit - total_credit) > Decimal('0.01'):
            raise serializers.ValidationError(
                f"L'écriture n'est pas équilibrée: "
                f"Débit={total_debit}, Crédit={total_credit}"
            )

        return lines_data

    @transaction.atomic
    def create(self, validated_data):
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
        if instance.state != 'DRAFT':
            raise serializers.ValidationError(
                "Seules les écritures en brouillon peuvent être modifiées"
            )

        lines_data = validated_data.pop('lines', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if lines_data is not None:
            instance.lines.all().delete()

            for i, line_data in enumerate(lines_data, 1):
                line_data['sequence'] = i
                JournalEntryLine.objects.create(
                    journal_entry=instance,
                    **line_data
                )

            instance.update_totals()

        return instance


class SupplierSerializer(serializers.ModelSerializer):
    account_label = serializers.CharField(source='account.label', read_only=True, allow_null=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', read_only=True
    )
    balance = serializers.SerializerMethodField()

    class Meta:
        model = Supplier
        fields = [
            'id', 'code', 'name', 'supplier_type', 'address', 'phone',
            'email', 'website', 'payment_terms', 'credit_limit',
            'discount_rate', 'tax_id', 'trade_register', 'account',
            'account_label', 'is_active', 'created_at', 'created_by',
            'created_by_name', 'balance'
        ]
        read_only_fields = ['created_at', 'created_by']

    def get_balance(self, obj):
        return obj.get_balance()

    def validate_code(self, value):
        if self.instance and self.instance.code == value:
            return value

        if Supplier.objects.filter(code=value).exists():
            raise serializers.ValidationError(
                "Ce code fournisseur existe déjà"
            )
        return value

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class CustomerSerializer(serializers.ModelSerializer):
    account_label = serializers.CharField(source='account.label', read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', read_only=True
    )

    class Meta:
        model = Customer
        fields = [
            'id', 'code', 'name', 'customer_type', 'address', 'phone',
            'email', 'payment_terms', 'credit_limit', 'account',
            'account_label', 'is_active', 'created_at', 'created_by',
            'created_by_name'
        ]
        read_only_fields = ['created_at', 'created_by']

    def create(self, validated_data):
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
        source='department.name', read_only=True, allow_null=True
    )
    responsible_name = serializers.CharField(
        source='responsible.get_full_name', read_only=True, allow_null=True
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
        return obj.calculate_annual_depreciation()

    def get_accumulated_depreciation(self, obj):
        return obj.get_accumulated_depreciation()

    def get_net_book_value(self, obj):
        return obj.get_net_book_value()

    def validate(self, attrs):
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

        return attrs

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class BudgetLineSerializer(serializers.ModelSerializer):
    account_code = serializers.CharField(source='account.code', read_only=True)
    account_label = serializers.CharField(source='account.label', read_only=True)
    analytic_account_name = serializers.CharField(
        source='analytic_account.name', read_only=True, allow_null=True
    )
    annual_total = serializers.SerializerMethodField()

    class Meta:
        model = BudgetLine
        fields = [
            'id', 'budget', 'account', 'account_code', 'account_label',
            'analytic_account', 'analytic_account_name',
            'january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december',
            'notes', 'annual_total'
        ]

    def get_annual_total(self, obj):
        return obj.get_annual_total()


class BudgetSerializer(serializers.ModelSerializer):
    lines = BudgetLineSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', read_only=True
    )
    approved_by_name = serializers.CharField(
        source='approved_by.get_full_name', read_only=True, allow_null=True
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
        return sum(line.get_annual_total() for line in obj.lines.all())

    def validate(self, attrs):
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')

        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError({
                'end_date': "La date de fin doit être postérieure à la date de début"
            })

        return attrs

    def create(self, validated_data):
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
        return obj.rate * 100


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
        return obj.tax_amount + obj.penalties

    def get_is_overdue(self, obj):
        return (obj.status in ['DRAFT', 'SUBMITTED'] and
                timezone.now().date() > obj.due_date)

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        instance = super().create(validated_data)

        if instance.submission_date:
            instance.penalties = instance.calculate_penalties()
            instance.save()

        return instance


class BankAccountSerializer(serializers.ModelSerializer):
    account_label = serializers.CharField(source='account.label', read_only=True)

    class Meta:
        model = BankAccount
        fields = [
            'id', 'account', 'account_label', 'bank_name', 'account_number',
            'iban', 'swift_code', 'balance_date', 'balance_amount', 'is_active'
        ]


class BankReconciliationSerializer(serializers.ModelSerializer):
    bank_account_name = serializers.CharField(
        source='bank_account.bank_name', read_only=True
    )
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', read_only=True
    )
    is_reconciled_status = serializers.SerializerMethodField()

    class Meta:
        model = BankReconciliation
        fields = [
            'id', 'bank_account', 'bank_account_name', 'reconciliation_date',
            'statement_balance', 'book_balance', 'outstanding_checks',
            'deposits_in_transit', 'bank_charges', 'is_reconciled',
            'is_reconciled_status', 'notes', 'created_by', 'created_by_name',
            'created_at'
        ]
        read_only_fields = ['created_by', 'created_at']

    def get_is_reconciled_status(self, obj):
        return obj.check_reconciliation()

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class AccountingPeriodSerializer(serializers.ModelSerializer):
    closed_by_name = serializers.CharField(
        source='closed_by.get_full_name', read_only=True, allow_null=True
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
        return f"{obj.month:02d}/{obj.year}"

    def get_entries_count(self, obj):
        start_date = date(obj.year, obj.month, 1)
        if obj.month == 12:
            end_date = date(obj.year + 1, 1, 1)
        else:
            end_date = date(obj.year, obj.month + 1, 1)

        return JournalEntry.objects.filter(
            entry_date__gte=start_date,
            entry_date__lt=end_date
        ).count()


class InventorySerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True, allow_null=True)
    account_label = serializers.CharField(source='stock_account.label', read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', read_only=True
    )

    class Meta:
        model = Inventory
        fields = [
            'id', 'inventory_number', 'name', 'inventory_type', 'quantity',
            'unit_cost', 'total_value', 'reorder_level', 'reorder_quantity',
            'stock_account', 'account_label', 'supplier', 'supplier_name',
            'location', 'expiration_date', 'is_active', 'created_at', 'created_by',
            'created_by_name'
        ]
        read_only_fields = ['inventory_number', 'total_value', 'created_at', 'created_by']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class PayrollLineSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)

    class Meta:
        model = PayrollLine
        fields = [
            'id', 'payroll', 'employee', 'employee_name', 'gross_salary',
            'tax_deduction', 'social_security', 'health_insurance',
            'other_deductions', 'total_deductions', 'net_salary',
            'employer_contributions'
        ]


class PayrollSerializer(serializers.ModelSerializer):
    lines = PayrollLineSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', read_only=True
    )
    salary_expense_account_label = serializers.CharField(
        source='salary_expense_account.label', read_only=True
    )
    total_gross = serializers.DecimalField(
        source='total_gross_salary', max_digits=15, decimal_places=2, required=False
    )
    total_net = serializers.DecimalField(
        source='total_net_salary', max_digits=15, decimal_places=2, read_only=True
    )

    salary_expense_account = serializers.PrimaryKeyRelatedField(
        queryset=ChartOfAccounts.objects.all(), required=False
    )

    class Meta:
        model = Payroll
        fields = [
            'id', 'payroll_number', 'payroll_period', 'period_start', 'period_end',
            'total_gross_salary', 'total_gross', 'total_deductions', 'total_net_salary',
            'total_net', 'total_employer_contributions', 'status', 'salary_expense_account',
            'salary_expense_account_label', 'created_by', 'created_by_name',
            'created_at', 'lines'
        ]
        read_only_fields = ['payroll_number', 'created_at', 'created_by', 'total_net_salary']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class VATSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', read_only=True
    )

    class Meta:
        model = VAT
        fields = [
            'id', 'vat_number', 'vat_type', 'period_month', 'period_year',
            'amount', 'related_operation', 'journal_entry', 'status',
            'created_at', 'created_by', 'created_by_name'
        ]
        read_only_fields = ['vat_number', 'created_at', 'created_by']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class FinancialRatioSerializer(serializers.ModelSerializer):
    calculated_by_name = serializers.CharField(
        source='calculated_by.get_full_name', read_only=True
    )

    class Meta:
        model = FinancialRatio
        fields = [
            'id', 'period_year', 'period_month', 'ratio_type', 'ratio_name',
            'ratio_value', 'calculation_date', 'calculated_by', 'calculated_by_name'
        ]
        read_only_fields = ['calculation_date', 'calculated_by']

    def create(self, validated_data):
        validated_data['calculated_by'] = self.context['request'].user
        return super().create(validated_data)
    
class PostJournalEntrySerializer(serializers.ModelSerializer):
    """Serializer pour valider/poster une écriture comptable"""
    lines = JournalEntryLineSerializer(many=True, read_only=True)
    
    class Meta:
        model = JournalEntry
        fields = [
            'id', 'entry_number', 'entry_date', 'journal', 'reference',
            'description', 'state', 'total_debit', 'total_credit',
            'created_by', 'validated_by', 'validated_at', 'lines'
        ]
        read_only_fields = [
            'entry_number', 'total_debit', 'total_credit',
            'created_by', 'validated_by', 'validated_at'
        ]
    
    def validate(self, attrs):
        if self.instance and self.instance.state != 'DRAFT':
            raise serializers.ValidationError(
                "Seules les écritures en brouillon peuvent être validées"
            )
        return attrs

# Alias du serializer pour FixedAsset
FixedAssetSerializer = AssetSerializer