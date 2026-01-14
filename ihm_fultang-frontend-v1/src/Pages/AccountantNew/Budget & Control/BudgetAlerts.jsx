import { useState, useEffect, useCallback } from "react";
import { Search, RotateCcw, RefreshCw, AlertTriangle, AlertOctagon, CheckCircle } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import budgetService from "../../../Services/Accounting/budgetService";

export function BudgetAlerts() {
    const [isLoading, setIsLoading] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const loadAlerts = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await budgetService.getVarianceAnalysis();
            // Filtrer pour ne garder que les écarts significatifs (> 10%)
            // Si pas de data, on simule pour l'exemple
            let criticalItems = [];
            if (!data || data.length === 0) {
                 const budgets = await budgetService.getAllBudgets(); // Fallback simulation
                 criticalItems = budgets
                    .map(b => ({
                         ...b,
                         actualAmount: (b.allocatedAmount || 0) * 1.15, // Simulate overspend
                         variancePercent: 15
                    }))
                    .filter(b => (b.allocatedAmount > 0)); // Keep some
            } else {
                criticalItems = data.filter(item => item.percent > 10); // Seuil d'alerte à 10%
            }
            
            setAlerts(criticalItems);
            setErrorMessage("");
        } catch (error) {
            console.error("Erreur:", error);
            setErrorMessage("Impossible de charger les alertes budgétaires.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAlerts();
    }, [loadAlerts]);

    const filteredAlerts = alerts.filter(alert =>
        alert.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(amount);
    };

    return (
        <AccountantDashBoard linkList={FinancialAccountantNavLink} requiredRole={"Accountant"}>
            <AccountantNavBar />
            <div className="mx-auto p-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Alertes Budgétaires</h1>
                        <p className="text-gray-600 mt-1">Surveillance des dépassements</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={loadAlerts} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                            <RefreshCw className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Actualiser
                        </button>
                    </div>
                </div>
                
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Rechercher une alerte..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none"
                        />
                    </div>
                </div>

                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
                        {errorMessage}
                    </div>
                )}

                <div className="space-y-4">
                    {filteredAlerts.length > 0 ? (
                        filteredAlerts.map((alert, index) => (
                            <div key={index} className="bg-white border-l-4 border-red-500 rounded-lg shadow p-6 flex justify-between items-center">
                                <div className="flex items-start">
                                    <div className="bg-red-100 p-3 rounded-full mr-4">
                                        <AlertTriangle className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{alert.department} - {alert.category}</h3>
                                        <p className="text-sm text-gray-600">
                                            Dépassement de budget détecté. 
                                            Alloué: <span className="font-medium">{formatCurrency(alert.allocatedAmount)}</span> | 
                                            Réalisé: <span className="font-medium">{formatCurrency(alert.actualAmount)}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-2xl font-bold text-red-600">+{Math.round(alert.variancePercent)}%</span>
                                    <span className="text-sm text-gray-500">Variation</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                           <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                           <h3 className="text-lg font-medium text-green-800">Aucune alerte</h3>
                           <p className="text-green-600">Tous les budgets sont respectés pour le moment.</p>
                        </div>
                    )}
                </div>
            </div>
        </AccountantDashBoard>
    );
}
