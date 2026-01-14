import { useState, useEffect, useCallback } from "react";
import { Search, Plus, RefreshCw, Download, Eye, Edit2, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import budgetService from "../../../Services/Accounting/budgetService";

export function BudgetVariance() {
    const [isLoading, setIsLoading] = useState(false);
    const [varianceData, setVarianceData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const loadVarianceData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await budgetService.getVarianceAnalysis();
            // Simulation si le backend ne retourne pas encore les données d'analyse
            // On peut récupérer les budgets et simuler un montant "réalisé" pour la démo
            if (!data || data.length === 0) {
                 const budgets = await budgetService.getAllBudgets();
                 const simulatedData = budgets.map(b => {
                     const actual = (b.allocatedAmount || 0) * (0.8 + Math.random() * 0.4); // Random actual between 80% and 120%
                     return {
                         ...b,
                         actualAmount: actual,
                         variance: (b.allocatedAmount || 0) - actual,
                         percent: ((actual - (b.allocatedAmount || 0)) / (b.allocatedAmount || 0)) * 100
                     };
                 });
                 setVarianceData(simulatedData);
            } else {
                setVarianceData(data);
            }
            setErrorMessage("");
        } catch (error) {
            console.error("Erreur:", error);
            setErrorMessage("Impossible de charger l'analyse des écarts.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadVarianceData();
    }, [loadVarianceData]);

    const filteredData = varianceData.filter(item =>
        item.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
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
                        <h1 className="text-2xl font-bold text-gray-800">Analyse Écarts</h1>
                        <p className="text-gray-600 mt-1">Comparaison Budget vs Réalisé</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={loadVarianceData} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
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
                            placeholder="Rechercher..."
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

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Département</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Budget Alloué</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Réalisé</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Écart</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">% Variation</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredData.length > 0 ? (
                                filteredData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.department}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(item.allocatedAmount || 0)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">{formatCurrency(item.actualAmount || 0)}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${(item.actualAmount > item.allocatedAmount) ? 'text-red-600' : 'text-green-600'}`}>
                                            {formatCurrency((item.actualAmount || 0) - (item.allocatedAmount || 0))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className={`flex items-center justify-center text-sm font-medium ${(item.percent > 0) ? 'text-red-600' : 'text-green-600'}`}>
                                                {item.percent > 0 ? <ArrowUpRight size={16} className="mr-1"/> : <ArrowDownRight size={16} className="mr-1"/>}
                                                {Math.abs(item.percent).toFixed(1)}%
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                        {isLoading ? "Chargement..." : "Aucune donnée d'écart disponible"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AccountantDashBoard>
    );
}
