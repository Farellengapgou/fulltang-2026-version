#!/usr/bin/env python3
"""
Script Python pour générer tous les composants de comptabilité manquants
Utilise Python pour mieux gérer les espaces dans les noms de fichiers
"""

import os
from pathlib import Path

BASE_DIR = Path("src/Pages/AccountantNew")

COMPONENT_TEMPLATE = '''import {{ useState, useEffect, useCallback }} from "react";
import {{ Search, Plus, RefreshCw, Download, Eye, Edit2, Trash2 }} from "lucide-react";
import {{ AccountantNavBar }} from "../../Accountant/Components/AccountantNavBar.jsx";
import {{ AccountantDashBoard }} from "../../Accountant/Components/AccountantDashboard.jsx";
import {{ FinancialAccountantNavLink }} from "../NavLink.js";

export function {component_name}() {{
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const loadData = useCallback(async () => {{
        setIsLoading(true);
        try {{
            // TODO: Intégrer appel API
            await new Promise(resolve => setTimeout(resolve, 500));
            setData([]);
        }} catch (error) {{
            console.error("Erreur:", error);
            setErrorMessage("Erreur lors du chargement.");
        }} finally {{
            setIsLoading(false);
        }}
    }}, []);

    useEffect(() => {{
        loadData();
    }}, [loadData]);

    return (
        <AccountantDashBoard linkList={{FinancialAccountantNavLink}} requiredRole={{"Accountant"}}>
            <AccountantNavBar />
            <div className="mx-auto p-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                        <p className="text-gray-600 mt-1">{description}</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={{loadData}} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                            <RefreshCw className="h-5 w-5 mr-2" />
                            Actualiser
                        </button>
                        <button className="flex items-center px-4 py-2 bg-primary-end text-white rounded-lg hover:bg-teal-700">
                            <Plus className="h-5 w-5 mr-2" />
                            Nouveau
                        </button>
                    </div>
                </div>
                
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={{searchTerm}}
                            onChange={{(e) => setSearchTerm(e.target.value)}}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none"
                        />
                    </div>
                </div>

                {{isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-end"></div>
                    </div>
                ) : errorMessage ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        {{errorMessage}}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-center text-gray-500">
                            Module prêt pour intégration API
                        </p>
                        <p className="text-center text-gray-400 text-sm mt-2">
                            Ce composant est fonctionnel et attend la connexion aux endpoints backend
                        </p>
                    </div>
                )}}
            </div>
        </AccountantDashBoard>
    );
}}
'''

components = [
    # Revenue & Receivables
    ("Revenue & Receivables", "Billing.jsx", "Billing", "Facturation Patients", "Gestion facturation consultations"),
    ("Revenue & Receivables", "RevenueByService.jsx", "RevenueByService", "Revenus par Service", "Analyse revenus par service"),
    ("Revenue & Receivables", "AccountsReceivable.jsx", "AccountsReceivable", "Créances Clients", "Suivi créances"),
    
    # Suppliers & Payables
    ("Suppliers & Payables", "SupplierDirectory.jsx", "SupplierDirectory", "Annuaire Fournisseurs", "Gestion fournisseurs"),
    ("Suppliers & Payables", "SupplierInvoices.jsx", "SupplierInvoices", "Factures Fournisseurs", "Factures reçues"),
    ("Suppliers & Payables", "PaymentSchedule.jsx", "PaymentSchedule", "Échéancier Paiements", "Échéances fournisseurs"),
    
    # Fixed Assets
    ("Fixed Assets", "FixedAssetsRegister.jsx", "FixedAssetsRegister", "Registre Immobilisations", "Patrimoine immobilisé"),
    ("Fixed Assets", "DepreciationCalculation.jsx", "DepreciationCalculation", "Calcul Amortissements", "Amortissements"),
    
    # Inventory & Stock
    ("Inventory & Stock", "InventoryValuation.jsx", "InventoryValuation", "Valorisation Stocks", "Valorisation FIFO/LIFO/WAC"),
    ("Inventory & Stock", "PhysicalInventory.jsx", "PhysicalInventory", "Inventaire Physique", "Comptages physiques"),
    ("Inventory & Stock", "ABCAnalysis.jsx", "ABCAnalysis", "Analyse ABC", "Classification stocks"),
    
    # Payroll & Social Charges
    ("Payroll & Social Charges", "PayrollAccounting.jsx", "PayrollAccounting", "Comptabilisation Paie", "Paie personnel"),
    ("Payroll & Social Charges", "SocialCharges.jsx", "SocialCharges", "Charges Sociales", "CNPS, formation"),
    ("Payroll & Social Charges", "HRCostAnalysis.jsx", "HRCostAnalysis", "Analyse Coûts RH", "Coûts par département"),
    
    # VAT & Taxation
    ("VAT & Taxation", "VATCalculation.jsx", "VATCalculation", "Calcul TVA", "TVA mensuelle"),
    ("VAT & Taxation", "TaxDeclarations.jsx", "TaxDeclarations", "Déclarations Fiscales", "Déclarations fiscales"),
    ("VAT & Taxation", "TaxCalendar.jsx", "TaxCalendar", "Calendrier Fiscal", "Échéances fiscales"),
    
    # Financial Analysis
    ("Financial Analysis", "FinancialRatios.jsx", "FinancialRatios", "Ratios Financiers", "Ratios performance"),
    ("Financial Analysis", "ProfitabilityAnalysis.jsx", "ProfitabilityAnalysis", "Analyse Rentabilité", "Rentabilité par service"),
    ("Financial Analysis", "ExecutiveDashboard.jsx", "ExecutiveDashboard", "Tableau de Bord Direction", "KPIs direction"),
    
    # Budget & Control
    ("Budget & Control", "BudgetEntry.jsx", "BudgetEntry", "Saisie Budgets", "Budgets"),
    ("Budget & Control", "BudgetVariance.jsx", "BudgetVariance", "Analyse Écarts", "Budget vs réalisé"),
    ("Budget & Control", "BudgetAlerts.jsx", "BudgetAlerts", "Alertes Budgétaires", "Alertes dépassement"),
]

print("🚀 Génération des composants...")
created = 0

for folder, filename, component_name, title, description in components:
    folder_path = BASE_DIR / folder
    folder_path.mkdir(parents=True, exist_ok=True)
    
    file_path = folder_path / filename
    
    content = COMPONENT_TEMPLATE.format(
        component_name=component_name,
        title=title,
        description=description
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    created += 1
    print(f"✅ {folder}/{filename}")

print(f"\n🎉 {created} composants créés avec succès!")
