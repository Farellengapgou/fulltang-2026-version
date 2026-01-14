#!/usr/bin/env python3
"""
Script pour créer les composants restants des Phases 2, 5 et 12
"""

import os
from pathlib import Path

BASE_DIR = Path("src/Pages/AccountantNew")

# Template pour composants avec tableau
TABLE_COMPONENT_TEMPLATE = '''import {{ useState, useEffect, useCallback }} from "react";
import {{ Search, Plus, RefreshCw, Download, Eye, Edit2, Trash2, Filter }} from "lucide-react";
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
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-6 text-center text-gray-500">
                            <p className="text-lg font-semibold">Module prêt pour intégration API</p>
                            <p className="text-sm mt-2 text-gray-400">
                                Ce composant attend la connexion aux endpoints backend
                            </p>
                        </div>
                    </div>
                )}}
            </div>
        </AccountantDashBoard>
    );
}}
'''

components = [
    # Phase 2: Comptabilité de Base (manquants)
    ("Comptabilité de Base", "AccountingJornal.jsx", "AccountingJornal", "Journaux Comptables", "Consultation des journaux par type"),
    ("Comptabilité de Base", "GrandLivre.jsx", "GrandLivre", "Grand Livre", "Mouvements et soldes par compte"),
    
    # Phase 5: Cash Management
    ("Cash Management", "CashPositions.jsx", "CashPositions", "Positions de Trésorerie", "Soldes bancaires en temps réel"),
    ("Cash Management", "BankReconciliation.jsx", "BankReconciliation", "Rapprochements Bancaires", "Pointage des relevés bancaires"),
    ("Cash Management", "CashFlowForecast.jsx", "CashFlowForecast", "Prévisions de Trésorerie", "Flux de trésorerie prévisionnels"),
    
    # Phase 12: Closing & Reporting
    ("Closing & Reporting", "PeriodClose.jsx", "PeriodClose", "Clôture de Période", "Assistant de clôture mensuelle"),
    ("Closing & Reporting", "FinancialStatements.jsx", "FinancialStatements", "États Financiers OHADA", "Bilan et compte de résultat"),
    ("Closing & Reporting", "CustomReports.jsx", "CustomReports", "Rapports Personnalisés", "Générateur de rapports"),
]

print("🚀 Génération des composants Phases 2, 5 et 12...")
created = 0

for folder, filename, component_name, title, description in components:
    folder_path = BASE_DIR / folder
    folder_path.mkdir(parents=True, exist_ok=True)
    
    file_path = folder_path / filename
    
    content = TABLE_COMPONENT_TEMPLATE.format(
        component_name=component_name,
        title=title,
        description=description
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    created += 1
    print(f"✅ {folder}/{filename}")

print(f"\n🎉 {created} composants créés avec succès!")
print(f"📊 Total de composants générés: {created + 23} composants")
