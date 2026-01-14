import { useState, useEffect, useCallback } from "react";
import { Search, Plus, RefreshCw, Download, Eye, Edit2, Trash2, PieChart } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import inventoryService from "../../../Services/Accounting/inventoryService";

export function ABCAnalysis() {
    const [isLoading, setIsLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await inventoryService.getStockItems();
            let itemsToAnalyze = data;

             // Simulation
            if (!data || data.length === 0) {
                 itemsToAnalyze = [
                     { id: 1, sku: 'MED-001', name: 'Paracétamol 500mg', quantity: 5000, unit_cost: 500 },
                     { id: 2, sku: 'MED-045', name: 'Amoxicilline 1g', quantity: 1200, unit_cost: 1500 },
                     { id: 3, sku: 'MAT-102', name: 'Seringues 5ml', quantity: 15000, unit_cost: 100 },
                     { id: 4, sku: 'PRO-999', name: 'Equipement IRM', quantity: 1, unit_cost: 50000000 },
                 ];
            }

            // Simuler une analyse ABC côté client
            // Trier par valeur décroissante (Prix * Qté)
            const sorted = [...itemsToAnalyze].sort((a, b) => 
                ((b.quantity || 0) * (b.unit_cost || 0)) - ((a.quantity || 0) * (a.unit_cost || 0))
            );
            
            // Assigner les catégories A, B, C (ex: 20% items = A, 30% items = B, 50% items = C)
            const totalItems = sorted.length;
            const categorized = sorted.map((item, index) => {
                let category = 'C';
                if (index < Math.max(1, totalItems * 0.2)) category = 'A';
                else if (index < Math.max(2, totalItems * 0.5)) category = 'B';
                return { ...item, category };
            });

            setItems(categorized);
            setErrorMessage("");
        } catch (error) {
            console.error("Erreur:", error);
            setErrorMessage("Impossible de charger les données pour l'analyse ABC.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredItems = items.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
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
                        <h1 className="text-2xl font-bold text-gray-800">Analyse ABC</h1>
                        <p className="text-gray-600 mt-1">Classification des stocks (Pareto)</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={loadData} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valeur Stock</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Classe</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommandation</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredItems.length > 0 ? (
                                filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.sku}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">
                                            {formatCurrency((item.quantity || 0) * (item.unit_cost || 0))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold 
                                                ${item.category === 'A' ? 'bg-green-100 text-green-800' : 
                                                  item.category === 'B' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                Classe {item.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.category === 'A' ? 'Contrôle strict, inventaire fréquent' : 
                                             item.category === 'B' ? 'Contrôle modéré' : 'Contrôle souple'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                        {isLoading ? "Chargement..." : "Aucune donnée disponible"}
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
