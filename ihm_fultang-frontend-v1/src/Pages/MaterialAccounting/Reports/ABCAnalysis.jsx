import { useState, useEffect } from "react";
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { BarChart, TrendingUp, Package, AlertCircle } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { MaterialAccountingNavLink } from "../NavLink.js";
import { getABCAnalysis } from "../../../Utils/api/materialAccounting.js";

export function ABCAnalysis() {
    const [abcData, setAbcData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedClass, setSelectedClass] = useState("ALL");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const data = await getABCAnalysis(dateFrom, dateTo);
            setAbcData(data);
        } catch (error) {
            console.error("Error loading ABC analysis:", error);
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

    const getClassColor = (classType) => {
        const colors = {
            A: { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", badge: "bg-red-100" },
            B: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-800", badge: "bg-orange-100" },
            C: { bg: "bg-green-50", border: "border-green-200", text: "text-green-800", badge: "bg-green-100" },
        };
        return colors[classType];
    };

    const renderClass = (classType, classData) => {
        const colors = getClassColor(classType);
        return (
            <div className={`${colors.bg} border ${colors.border} rounded-lg p-6 mb-6`}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-bold ${colors.text}">
                            Classe {classType}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {classData.percentage}% des articles = {classData.valuePercentage}% de la valeur
                        </p>
                    </div>
                    <div className={`${colors.badge} px-4 py-2 rounded-lg`}>
                        <p className="text-sm font-medium ${colors.text}">
                            {classData.articles.length} articles
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto bg-white rounded-lg">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-4 py-3 text-left font-bold text-gray-700 border-b-2">Rang</th>
                                <th className="px-4 py-3 text-left font-bold text-gray-700 border-b-2">Code</th>
                                <th className="px-4 py-3 text-left font-bold text-gray-700 border-b-2">Désignation</th>
                                <th className="px-4 py-3 text-right font-bold text-gray-700 border-b-2">Consommation</th>
                                <th className="px-4 py-3 text-right font-bold text-gray-700 border-b-2">% Cumulé</th>
                                <th className="px-4 py-3 text-center font-bold text-gray-700 border-b-2">Recommandation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classData.articles.map((article, idx) => (
                                <tr key={idx} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-bold text-gray-900">{idx + 1}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900">{article.code}</td>
                                    <td className="px-4 py-3 text-gray-800">{article.name}</td>
                                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                                        {formatCurrency(article.consumption)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-700">
                                        {article.cumulativePercent.toFixed(2)}%
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {classType === "A" && (
                                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                                                Contrôle strict
                                            </span>
                                        )}
                                        {classType === "B" && (
                                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                                                Contrôle modéré
                                            </span>
                                        )}
                                        {classType === "C" && (
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                                Contrôle simple
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <AccountantDashBoard linkList={MaterialAccountingNavLink} requiredRole={"MaterialAccountant"}>
            <AccountantNavBar title="Material Accountant" />
            <div className="mx-auto p-12">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Analyse ABC (Méthode 20/80)</h1>
                    <p className="text-gray-600 mt-1">
                        Classification des articles par valeur de consommation
                    </p>
                </div>

                {/* Date Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date début
                            </label>
                            <DatePicker
                                placeholder="Start Date"
                                value={dateFrom ? dayjs(dateFrom) : null}
                                onChange={(date, dateString) => setDateFrom(dateString)}
                                disabledDate={(current) => {
                                    return current && current.isAfter(dayjs(), 'day');
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none h-10"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date fin
                            </label>
                            <DatePicker
                                placeholder="End Date"
                                value={dateTo ? dayjs(dateTo) : null}
                                onChange={(date, dateString) => setDateTo(dateString)}
                                disabledDate={(current) => {
                                    return current && current.isAfter(dayjs(), 'day');
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none h-10"
                            />
                        </div>
                        <button
                            onClick={loadData}
                            className="bg-primary-end text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-all font-medium h-[42px]"
                        >
                            Générer l'analyse
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-4 italic">
                        * Si aucune date n'est saisie, l'analyse porte sur la consommation totale historique.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-end mx-auto"></div>
                    </div>
                ) : abcData && (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <p className="text-sm text-gray-600">Consommation Totale</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">
                                    {formatCurrency(abcData.totalConsumption)}
                                </p>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                <p className="text-sm text-red-600 font-medium">Classe A (Critique)</p>
                                <p className="text-2xl font-bold text-red-800 mt-1">{abcData.classA.articles.length}</p>
                                <p className="text-xs text-red-600 mt-1">80% de la valeur</p>
                            </div>
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                                <p className="text-sm text-orange-600 font-medium">Classe B (Important)</p>
                                <p className="text-2xl font-bold text-orange-800 mt-1">{abcData.classB.articles.length}</p>
                                <p className="text-xs text-orange-600 mt-1">15% de la valeur</p>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                <p className="text-sm text-green-600 font-medium">Classe C (Standard)</p>
                                <p className="text-2xl font-bold text-green-800 mt-1">{abcData.classC.articles.length}</p>
                                <p className="text-xs text-green-600 mt-1">5% de la valeur</p>
                            </div>
                        </div>

                        {/* Principle Explanation */}
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded">
                            <div className="flex items-start">
                                <BarChart className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-bold mb-1">Principe de Pareto (20/80)</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li><strong>Classe A:</strong> 20% des articles génèrent 80% de la valeur → Suivi quotidien, stock de sécurité élevé</li>
                                        <li><strong>Classe B:</strong> 30% des articles génèrent 15% de la valeur → Suivi hebdomadaire, stock modéré</li>
                                        <li><strong>Classe C:</strong> 50% des articles génèrent 5% de la valeur → Suivi mensuel, stock minimal</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Class Selection */}
                        <div className="mb-6">
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none"
                            >
                                <option value="ALL">Toutes les classes</option>
                                <option value="A">Classe A uniquement</option>
                                <option value="B">Classe B uniquement</option>
                                <option value="C">Classe C uniquement</option>
                            </select>
                        </div>

                        {/* Classes Display */}
                        {abcData && (selectedClass === "ALL" || selectedClass === "A") && renderClass("A", abcData.classA)}
                        {abcData && (selectedClass === "ALL" || selectedClass === "B") && renderClass("B", abcData.classB)}
                        {abcData && (selectedClass === "ALL" || selectedClass === "C") && renderClass("C", abcData.classC)}

                        {/* Recommendations */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Recommandations de Gestion</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="border-l-4 border-red-500 pl-4">
                                    <h4 className="font-bold text-red-700 mb-2">Classe A - Gestion Stricte</h4>
                                    <ul className="text-sm text-gray-700 space-y-1">
                                        <li>✓ Révision quotidienne des stocks</li>
                                        <li>✓ Prévisions précises</li>
                                        <li>✓ Relations privilégiées fournisseurs</li>
                                        <li>✓ Stock de sécurité élevé</li>
                                        <li>✓ Alertes automatiques</li>
                                    </ul>
                                </div>
                                <div className="border-l-4 border-orange-500 pl-4">
                                    <h4 className="font-bold text-orange-700 mb-2">Classe B - Gestion Modérée</h4>
                                    <ul className="text-sm text-gray-700 space-y-1">
                                        <li>✓ Révision hebdomadaire</li>
                                        <li>✓ Formules de réapprovisionnement</li>
                                        <li>✓ Stock de sécurité moyen</li>
                                        <li>✓ Contrôles périodiques</li>
                                    </ul>
                                </div>
                                <div className="border-l-4 border-green-500 pl-4">
                                    <h4 className="font-bold text-green-700 mb-2">Classe C - Gestion Simple</h4>
                                    <ul className="text-sm text-gray-700 space-y-1">
                                        <li>✓ Révision mensuelle/trimestrielle</li>
                                        <li>✓ Commandes groupées</li>
                                        <li>✓ Stock minimal</li>
                                        <li>✓ Contrôle annuel</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AccountantDashBoard>
    );
}
