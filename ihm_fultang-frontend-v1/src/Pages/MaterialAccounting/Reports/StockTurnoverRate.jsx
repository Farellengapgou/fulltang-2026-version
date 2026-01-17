import { useState, useEffect } from "react";
import { TrendingUp, BarChart2, Calendar, AlertCircle } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { MaterialAccountingNavLink } from "../NavLink.js";
import { getTurnoverRates } from "../../../Utils/api/materialAccounting.js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export function StockTurnoverRate() {
    const [turnoverData, setTurnoverData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTurnover();
    }, []);

    const loadTurnover = async () => {
        try {
            setIsLoading(true);
            const data = await getTurnoverRates();
            setTurnoverData(data.results || []);
        } catch (error) {
            console.error("Error loading turnover rates:", error);
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
        <AccountantDashBoard linkList={MaterialAccountingNavLink} requiredRole={"Accountant"}>
            <AccountantNavBar />
            <div className="mx-auto p-12">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Rotation des Stocks</h1>
                    <p className="text-gray-600 mt-1">Analyse de la fluidité et du renouvellement</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <p className="text-sm text-gray-600">Taux Moyen</p>
                        <p className="text-3xl font-bold text-primary-end mt-1">8.5x</p>
                        <p className="text-xs text-gray-500 mt-2">Renouvellements par an</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <p className="text-sm text-gray-600">Durée Moyenne de Stockage</p>
                        <p className="text-3xl font-bold text-gray-800 mt-1">42 jours</p>
                        <p className="text-xs text-gray-500 mt-2">Délai moyen d'écoulement</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <p className="text-sm text-gray-600">Objectif Rotation</p>
                        <p className="text-3xl font-bold text-green-600 mt-1">12x</p>
                        <p className="text-xs text-gray-500 mt-2">Cible annuelle</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Top 10 Rotation par Article</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={turnoverData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="article" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="rate" fill="#0D9488" radius={[4, 4, 0, 0]}>
                                    {turnoverData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.rate > 10 ? "#059669" : "#0D9488"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Article</th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Taux de Rotation</th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Durée de Stockage</th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {turnoverData.map((item, idx) => (
                                <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{item.article}</td>
                                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-bold">{item.rate}x</td>
                                    <td className="px-6 py-4 text-center text-sm text-gray-600">{item.days} jours</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.rate > 10 ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                                            }`}>
                                            {item.rate > 10 ? "Écoulement rapide" : "Écoulement normal"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AccountantDashBoard>
    );
}
