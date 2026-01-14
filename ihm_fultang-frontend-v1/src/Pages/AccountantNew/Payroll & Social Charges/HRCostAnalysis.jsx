import { useState, useEffect, useCallback } from "react";
import { Search, Plus, RefreshCw, Download, Eye, Edit2, Trash2, PieChart, TrendingUp } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import payrollService from "../../../Services/Accounting/payrollService";

export function HRCostAnalysis() {
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState({ totalGross: 0, totalNet: 0, totalCharges: 0, count: 0 });
    const [errorMessage, setErrorMessage] = useState("");

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await payrollService.getAllPayslips();
            
            // Calcul agrégé simple
            const totalGross = data.reduce((acc, p) => acc + (p.grossSalary || 0), 0);
            const totalNet = data.reduce((acc, p) => acc + (p.netPayable || 0), 0);
            // Estimation charges (ex: 20% du brut) si pas de champ dédié
            const totalCharges = totalGross * 0.20; 

            setStats({
                totalGross,
                totalNet,
                totalCharges,
                count: data.length
            });
            setErrorMessage("");
        } catch (error) {
            console.error("Erreur:", error);
            setErrorMessage("Impossible de charger l'analyse des coûts.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(amount);
    };

    return (
        <AccountantDashBoard linkList={FinancialAccountantNavLink} requiredRole={"Accountant"}>
            <AccountantNavBar />
            <div className="mx-auto p-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Analyse Coûts RH</h1>
                        <p className="text-gray-600 mt-1">Vue d'ensemble de la masse salariale</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={loadData} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                            <RefreshCw className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Actualiser
                        </button>
                    </div>
                </div>
                
                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
                        {errorMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-gray-500 text-sm font-medium uppercase">Masse Salariale Brute</h3>
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <TrendingUp size={16}/>
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalGross)}</p>
                        <p className="text-xs text-gray-400 mt-1">Pour {stats.count} bulletins</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-gray-500 text-sm font-medium uppercase">Total Charges Patronales (Est.)</h3>
                            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                                <PieChart size={16}/>
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalCharges)}</p>
                        <p className="text-xs text-gray-400 mt-1">~20% de la masse salariale</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-gray-500 text-sm font-medium uppercase">Total Net à Payer</h3>
                            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <Download size={16}/>
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalNet)}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Détails Statistiques</h3>
                    <p className="text-gray-600">
                        Données calculées sur la base des bulletins chargés. Ce tableau de bord fournit une estimation rapide des coûts RH pour la période sélectionnée.
                    </p>
                    <div className="mt-4 border-t pt-4">
                        <p className="text-sm text-gray-500">Coût moyen par employé: <span className="font-bold text-gray-700">{formatCurrency(stats.count ? stats.totalGross / stats.count : 0)}</span></p>
                    </div>
                </div>
            </div>
        </AccountantDashBoard>
    );
}
