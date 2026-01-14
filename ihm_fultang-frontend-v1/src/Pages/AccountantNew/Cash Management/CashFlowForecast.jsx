import { useState, useEffect, useCallback } from "react";
import { Search, Plus, RefreshCw, Download, Eye, Edit2, Trash2, Filter, TrendingUp, TrendingDown } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import bankReconciliationService from "../../../Services/Accounting/bankReconciliationService";

export function CashFlowForecast() {
    const [isLoading, setIsLoading] = useState(false);
    const [forecasts, setForecasts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const loadForecasts = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await bankReconciliationService.getCashFlowForecast();
             // Simulation si vide
             if (!data || data.length === 0) {
                 const today = new Date();
                 setForecasts([
                     { date: new Date(today.getTime() + 86400000 * 2).toISOString(), description: 'Paiement Client X', amount: 500000, type: 'IN' },
                     { date: new Date(today.getTime() + 86400000 * 5).toISOString(), description: 'Loyer Mensuel', amount: 200000, type: 'OUT' },
                     { date: new Date(today.getTime() + 86400000 * 10).toISOString(), description: 'Facture Fournisseur Y', amount: 150000, type: 'OUT' },
                     { date: new Date(today.getTime() + 86400000 * 15).toISOString(), description: 'Vente Service Z', amount: 800000, type: 'IN' },
                 ]);
             } else {
                 setForecasts(data);
             }
            setErrorMessage("");
        } catch (error) {
            console.error("Erreur:", error);
            setErrorMessage("Impossible de charger les prévisions de trésorerie.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadForecasts();
    }, [loadForecasts]);

    const filteredForecasts = forecasts.filter(item =>
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(amount);
    };

    const formatDate = (dateString) => {
        return dateString ? new Date(dateString).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-';
    };

    const totalIn = filteredForecasts.filter(f => f.type === 'IN').reduce((acc, curr) => acc + curr.amount, 0);
    const totalOut = filteredForecasts.filter(f => f.type === 'OUT').reduce((acc, curr) => acc + curr.amount, 0);
    const netCashFlow = totalIn - totalOut;

    return (
        <AccountantDashBoard linkList={FinancialAccountantNavLink} requiredRole={"Accountant"}>
            <AccountantNavBar />
            <div className="mx-auto p-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Prévisions de Trésorerie</h1>
                        <p className="text-gray-600 mt-1">Anticipation des flux financiers</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={loadForecasts} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                            <RefreshCw className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Actualiser
                        </button>
                        <button className="flex items-center px-4 py-2 bg-primary-end text-white rounded-lg hover:bg-teal-700">
                            <Plus className="h-5 w-5 mr-2" />
                            Ajouter Prévision
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-4 rounded-lg shadow border-b-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 uppercase font-medium">Entrées Prévues</p>
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIn)}</p>
                            </div>
                            <div className="p-2 bg-green-100 rounded-full">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow border-b-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 uppercase font-medium">Sorties Prévues</p>
                                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOut)}</p>
                            </div>
                            <div className="p-2 bg-red-100 rounded-full">
                                <TrendingDown className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow border-b-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 uppercase font-medium">Flux Net</p>
                                <p className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>{formatCurrency(netCashFlow)}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Rechercher une prévision..."
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Prévue</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredForecasts.length > 0 ? (
                                filteredForecasts.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${item.type === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {item.type === 'IN' ? 'Entrée' : 'Sortie'}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${item.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                            {item.type === 'IN' ? '+' : '-'} {formatCurrency(item.amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <div className="flex justify-center space-x-2">
                                                <button className="text-indigo-600 hover:text-indigo-900" title="Modifier"><Edit2 size={18} /></button>
                                                <button className="text-red-600 hover:text-red-900" title="Supprimer"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                        {isLoading ? "Chargement..." : "Aucune prévision trouvée"}
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
