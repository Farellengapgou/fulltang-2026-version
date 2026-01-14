import { useState, useEffect, useCallback } from "react";
import { Search, Plus, RefreshCw, Download, Eye, Edit2, Trash2, PieChart, BarChart } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import financialReportService from "../../../Services/Accounting/financialReportService";

export function RevenueByService() {
    const [isLoading, setIsLoading] = useState(false);
    const [revenueData, setRevenueData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const loadRevenueData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await financialReportService.getRevenueData();
            // Simulation
            if (!data || data.length === 0) {
                 setRevenueData([
                     { id: 1, service: 'Télémédecine', revenue: 12500000, percentage: 35 },
                     { id: 2, service: 'Consultations', revenue: 8500000, percentage: 24 },
                     { id: 3, service: 'Laboratoire', revenue: 6200000, percentage: 18 },
                     { id: 4, service: 'Pharmacie', revenue: 5100000, percentage: 14 },
                     { id: 5, service: 'Radiologie', revenue: 3200000, percentage: 9 },
                 ]);
            } else {
                setRevenueData(data);
            }
            setErrorMessage("");
        } catch (error) {
            console.error("Erreur:", error);
            setErrorMessage("Impossible de charger les revenus par service.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRevenueData();
    }, [loadRevenueData]);

    const filteredData = revenueData.filter(item =>
        item.service?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(amount);
    };

    const totalRevenue = filteredData.reduce((acc, curr) => acc + curr.revenue, 0);

    return (
        <AccountantDashBoard linkList={FinancialAccountantNavLink} requiredRole={"Accountant"}>
            <AccountantNavBar />
            <div className="mx-auto p-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Revenus par Service</h1>
                        <p className="text-gray-600 mt-1">Répartition du chiffre d'affaires</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={loadRevenueData} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
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
                            placeholder="Rechercher un service..."
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                     <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-700">Détail des Revenus</h3>
                             <span className="text-sm font-medium text-gray-500">Total: {formatCurrency(totalRevenue)}</span>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenu</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% Total</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tendance</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredData.length > 0 ? (
                                    filteredData.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.service}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{formatCurrency(item.revenue)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{item.percentage}%</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                                 <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-200">
                                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                                            {isLoading ? "Chargement..." : "Aucune donnée disponible"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
                            <PieChart className="h-5 w-5 mr-2 text-primary-end" />
                            Répartition
                        </h3>
                        <div className="space-y-4">
                            {filteredData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center">
                                        <span className={`w-3 h-3 rounded-full mr-2 bg-blue-${Math.max(100, 900 - index * 100)}`}></span>
                                        <span className="text-gray-600">{item.service}</span>
                                    </div>
                                    <span className="font-medium text-gray-900">{item.percentage}%</span>
                                </div>
                            ))}
                        </div>
                         {/* Placeholder for a real chart library if available later */}
                         <div className="mt-8 flex justify-center items-center h-40 bg-gray-50 rounded border border-dashed border-gray-300 text-gray-400 text-xs">
                             Graphique
                         </div>
                    </div>
                </div>
            </div>
        </AccountantDashBoard>
    );
}
