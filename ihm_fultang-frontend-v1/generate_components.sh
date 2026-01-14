#!/bin/bash

# Script de génération automatique des composants de comptabilité financière

BASE_DIR="src/Pages/AccountantNew"

# Fonction pour créer un composant de base
create_component() {
    local dir="$1"
    local filename="$2"
    local title="$3"
    local description="$4"
    
    mkdir -p "$BASE_DIR/$dir"
    
    cat > "$BASE_DIR/$dir/$filename" << 'COMPONENT_EOF'
import { useState, useEffect, useCallback } from "react";
import { Search, Plus, RefreshCw } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { FinancialAccountantDashBoard } from "../DashBoard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";

export function COMPONENT_NAME() {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            // TODO: Remplacer par appel API réel
            await new Promise(resolve => setTimeout(resolve, 500));
            setData([]);
            setErrorMessage("");
        } catch (error) {
            console.error("Erreur lors du chargement:", error);
            setErrorMessage("Une erreur est survenue lors du chargement des données.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <FinancialAccountantDashBoard linkList={FinancialAccountantNavLink} requiredRole={"Accountant"}>
            <AccountantNavBar />
            <div className="mx-auto p-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">COMPONENT_TITLE</h1>
                        <p className="text-gray-600 mt-1">COMPONENT_DESCRIPTION</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={loadData} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all">
                            <RefreshCw className="h-5 w-5 mr-2" />
                            Actualiser
                        </button>
                        <button className="flex items-center px-4 py-2 bg-primary-end text-white rounded-lg hover:bg-teal-700 transition-all">
                            <Plus className="h-5 w-5 mr-2" />
                            Nouveau
                        </button>
                    </div>
                </div>
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none" />
                    </div>
                </div>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-end"></div>
                    </div>
                ) : errorMessage ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{errorMessage}</div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">Aucune donnée disponible</p>
                        <p className="text-gray-400 mt-2">Les données seront affichées ici une fois l'API connectée</p>
                    </div>
                )}
            </div>
        </FinancialAccountantDashBoard>
    );
}
COMPONENT_EOF

    sed -i "s/COMPONENT_NAME/${filename%.jsx}/g" "$BASE_DIR/$dir/$filename"
    sed -i "s/COMPONENT_TITLE/$title/g" "$BASE_DIR/$dir/$filename"
    sed -i "s/COMPONENT_DESCRIPTION/$description/g" "$BASE_DIR/$dir/$filename"
}

echo "🚀 Génération des composants..."

# Revenue & Receivables
create_component "Revenue & Receivables" "Billing.jsx" "Facturation Patients" "Gestion de la facturation des consultations"
create_component "Revenue & Receivables" "RevenueByService.jsx" "Revenus par Service" "Analyse des revenus par service"
create_component "Revenue & Receivables" "AccountsReceivable.jsx" "Créances Clients" "Suivi des créances"

# Suppliers & Payables
create_component "Suppliers & Payables" "SupplierDirectory.jsx" "Annuaire Fournisseurs" "Gestion des fournisseurs"
create_component "Suppliers & Payables" "SupplierInvoices.jsx" "Factures Fournisseurs" "Factures reçues"
create_component "Suppliers & Payables" "PaymentSchedule.jsx" "Échéancier Paiements" "Échéances fournisseurs"

# Fixed Assets
create_component "Fixed Assets" "FixedAssetsRegister.jsx" "Registre Immobilisations" "Patrimoine immobilisé"
create_component "Fixed Assets" "DepreciationCalculation.jsx" "Calcul Amortissements" "Amortissements"

# Inventory & Stock
create_component "Inventory & Stock" "InventoryValuation.jsx" "Valorisation Stocks" "Valorisation FIFO/LIFO/WAC"
create_component "Inventory & Stock" "PhysicalInventory.jsx" "Inventaire Physique" "Comptages physiques"
create_component "Inventory & Stock" "ABCAnalysis.jsx" "Analyse ABC" "Classification stocks"

# Payroll & Social Charges
create_component "Payroll & Social Charges" "PayrollAccounting.jsx" "Comptabilisation Paie" "Paie du personnel"
create_component "Payroll & Social Charges" "SocialCharges.jsx" "Charges Sociales" "CNPS, formation"
create_component "Payroll & Social Charges" "HRCostAnalysis.jsx" "Analyse Coûts RH" "Coûts par département"

# VAT & Taxation
create_component "VAT & Taxation" "VATCalculation.jsx" "Calcul TVA" "TVA mensuelle"
create_component "VAT & Taxation" "TaxDeclarations.jsx" "Déclarations Fiscales" "Déclarations fiscales"
create_component "VAT & Taxation" "TaxCalendar.jsx" "Calendrier Fiscal" "Échéances fiscales"

# Financial Analysis
create_component "Financial Analysis" "FinancialRatios.jsx" "Ratios Financiers" "Ratios de performance"
create_component "Financial Analysis" "ProfitabilityAnalysis.jsx" "Analyse Rentabilité" "Rentabilité par service"
create_component "Financial Analysis" "ExecutiveDashboard.jsx" "Tableau de Bord Direction" "KPIs direction"

# Budget & Control
create_component "Budget & Control" "BudgetEntry.jsx" "Saisie Budgets" "Budgets"
create_component "Budget & Control" "BudgetVariance.jsx" "Analyse Écarts" "Budget vs réalisé"
create_component "Budget & Control" "BudgetAlerts.jsx" "Alertes Budgétaires" "Alertes dépassement"

echo "✅ Composants générés!"
