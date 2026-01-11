"""
Accounting Models - Point d'entrée unique
==========================================

Ce fichier expose tous les modèles de l'application accounting pour Django.
Les modèles sont répartis dans:
- models_financier.py: Comptabilité financière (OHADA)
- models_matiere.py: Comptabilité matière (Stock)
"""

# Comptabilité financière
from .models_financier import (
    BudgetExercise,
    Account,
    AccountState,
    FinancialOperation,
    Facture,
    ChartOfAccounts,
    Journal,
    JournalEntry,
    JournalEntryLine,
    Supplier as FinancialSupplier,
    Customer,
    Asset,
    AnalyticAccount,
    Budget,
    BudgetLine,
    AccountingPeriod,
    AccountPeriodBalance,
    AccountingOperation,
    TaxRate,
    TaxDeclaration,
    BankAccount,
    BankReconciliation,
    FinancialRatio,
)

# Comptabilité matière
from .models_matiere import (
    calculate_new_pmp,
    ArticleCategory,
    Warehouse,
    StockLevel,
    StockBatch,
    Supplier,
    StockMovement,
    GoodsReceipt,
    GoodsReceiptLine,
    GoodsIssue,
    GoodsIssueLine,
    PhysicalInventory,
    PhysicalInventoryLine,
    StockTransfer,
    StockTransferLine,
)

__all__ = [
    # Financier
    'BudgetExercise',
    'Account',
    'AccountState',
    'FinancialOperation',
    'Facture',
    'ChartOfAccounts',
    'Journal',
    'JournalEntry',
    'JournalEntryLine',
    'FinancialSupplier',
    'Customer',
    'Asset',
    'AnalyticAccount',
    'Budget',
    'BudgetLine',
    'AccountingPeriod',
    'AccountPeriodBalance',
    'AccountingOperation',
    'TaxRate',
    'TaxDeclaration',
    'BankAccount',
    'BankReconciliation',
    'FinancialRatio',
    # Matière
    'calculate_new_pmp',
    'ArticleCategory',
    'Warehouse',
    'StockLevel',
    'StockBatch',
    'Supplier',
    'StockMovement',
    'GoodsReceipt',
    'GoodsReceiptLine',
    'GoodsIssue',
    'GoodsIssueLine',
    'PhysicalInventory',
    'PhysicalInventoryLine',
    'StockTransfer',
    'StockTransferLine',
]
