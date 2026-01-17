import { useState, useEffect } from "react";
import { Scale, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { MaterialAccountingNavLink } from "../NavLink.js";
import { getReconciliation } from "../../../Utils/api/materialAccounting.js";

export function StockAccountingReconciliation() {
    const [reconciliationData, setReconciliationData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const data = await getReconciliation();
            setReconciliationData(data.results || []);
        } catch (error) {
            console.error("Error loading reconciliation data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "XAF",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <AccountantDashBoard linkList={MaterialAccountingNavLink} requiredRole={"MaterialAccountant"}>
            <AccountantNavBar />
            <div className="mx-auto p-12">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Rapprochement Stock-Comptabilité</h1>
                        <p className="text-gray-600 mt-1">Vérification de la concordance entre l'inventaire permanent et la comptabilité générale</p>
                    </div>
                    <button className="bg-primary-end text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-all">
                        <RefreshCw className="h-4 w-4" /> Lancer le rapprochement
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-end mx-auto"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Compte OHADA</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Valeur Inventaire</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Valeur Comptable</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Écart</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reconciliationData.map((item, idx) => (
                                    <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{item.account}</td>
                                        <td className="px-6 py-4 text-right text-sm text-gray-600">{formatCurrency(item.physical_value)}</td>
                                        <td className="px-6 py-4 text-right text-sm text-gray-600">{formatCurrency(item.accounting_value)}</td>
                                        <td className={`px-6 py-4 text-right text-sm font-bold ${item.variance === 0 ? "text-green-600" : "text-red-600"}`}>
                                            {formatCurrency(item.variance)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === "BALANCED" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                }`}>
                                                {item.status === "BALANCED" ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                                                {item.status === "BALANCED" ? "Accordé" : "Écart détecté"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="flex gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Scale className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-blue-800">Note OHADA</h3>
                            <p className="text-sm text-blue-700 mt-1">
                                Conformément aux normes OHADA, tout écart constaté lors de l'inventaire physique doit faire l'objet d'une écriture de régularisation pour que la valeur comptable reflète la réalité du stock.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AccountantDashBoard>
    );
}
