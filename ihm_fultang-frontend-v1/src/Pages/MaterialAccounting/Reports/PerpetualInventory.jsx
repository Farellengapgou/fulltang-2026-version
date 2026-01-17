import { useState, useEffect } from "react";
import { Download, Package, TrendingUp, AlertCircle, FileText, Printer, Search, Calendar } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { MaterialAccountingNavLink } from "../NavLink.js";
import { getPerpetualInventory } from "../../../Utils/api/materialAccounting.js";

export function PerpetualInventory() {
    const [inventoryData, setInventoryData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [selectedCategory, setSelectedCategory] = useState("");

    useEffect(() => {
        loadData();
    }, [selectedDate]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const data = await getPerpetualInventory(selectedDate);
            setInventoryData(data);
        } catch (error) {
            console.error("Error loading perpetual inventory:", error);
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

    const getCategoryTotal = (category) => {
        return category.articles.reduce((sum, art) => sum + art.value, 0);
    };

    const filteredCategories = (selectedCategory && inventoryData?.categories)
        ? inventoryData.categories.filter((cat) => cat.code === selectedCategory)
        : (inventoryData?.categories || []);

    return (
        <AccountantDashBoard linkList={MaterialAccountingNavLink} requiredRole={"MaterialAccountant"}>
            <AccountantNavBar />
            <div className="mx-auto p-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Inventaire Permanent</h1>
                        <p className="text-gray-600 mt-1">
                            État valorisé des stocks au {inventoryData ? new Date(inventoryData.date).toLocaleDateString("fr-FR") : "..."}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none"
                        />
                        <button className="flex items-center px-4 py-2 bg-primary-end text-white rounded-lg hover:bg-teal-700 transition-all">
                            <Download className="h-5 w-5 mr-2" />
                            Exporter
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-end mx-auto"></div>
                    </div>
                ) : inventoryData && (
                    <>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <p className="text-sm text-gray-600">Valeur Totale Stock</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">
                                    {formatCurrency(inventoryData.totalValue)}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <p className="text-sm text-gray-600">Catégories</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{inventoryData.categories.length}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <p className="text-sm text-gray-600">Articles</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">
                                    {inventoryData.categories.reduce((sum, cat) => sum + cat.articles.length, 0)}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <p className="text-sm text-gray-600">Méthode</p>
                                <p className="text-lg font-bold text-primary-end mt-1">PMP (OHADA)</p>
                            </div>
                        </div>

                        {/* Filter */}
                        <div className="mb-6">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none"
                            >
                                <option value="">Toutes les catégories</option>
                                {inventoryData.categories.map((cat) => (
                                    <option key={cat.code} value={cat.code}>
                                        {cat.code} - {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Inventory by Category */}
                        {filteredCategories.map((category) => (
                            <div key={category.code} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">
                                            Compte {category.code} - {category.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {category.articles.length} articles
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Valeur catégorie</p>
                                        <p className="text-xl font-bold text-primary-end">
                                            {formatCurrency(getCategoryTotal(category))}
                                        </p>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-4 py-3 text-left font-bold text-gray-700 border-b-2">Code</th>
                                                <th className="px-4 py-3 text-left font-bold text-gray-700 border-b-2">Désignation</th>
                                                <th className="px-4 py-3 text-right font-bold text-gray-700 border-b-2">Quantité</th>
                                                <th className="px-4 py-3 text-right font-bold text-gray-700 border-b-2">PMP</th>
                                                <th className="px-4 py-3 text-right font-bold text-gray-700 border-b-2 bg-green-50">
                                                    Valeur
                                                </th>
                                                <th className="px-4 py-3 text-right font-bold text-gray-700 border-b-2">% Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {category.articles.map((article, idx) => (
                                                <tr key={idx} className="border-b hover:bg-gray-50">
                                                    <td className="px-4 py-3 font-medium text-gray-900">{article.code}</td>
                                                    <td className="px-4 py-3 text-gray-800">{article.name}</td>
                                                    <td className="px-4 py-3 text-right text-gray-900">{article.qty}</td>
                                                    <td className="px-4 py-3 text-right text-gray-900">
                                                        {formatCurrency(article.pmp)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-gray-900 bg-green-50">
                                                        {formatCurrency(article.value)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-gray-600">
                                                        {((article.value / inventoryData.totalValue) * 100).toFixed(2)}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-gray-100 font-bold">
                                                <td colSpan="4" className="px-4 py-3 text-right border-t-2">
                                                    Total {category.code}:
                                                </td>
                                                <td className="px-4 py-3 text-right border-t-2 bg-green-100">
                                                    {formatCurrency(getCategoryTotal(category))}
                                                </td>
                                                <td className="px-4 py-3 text-right border-t-2">
                                                    {((getCategoryTotal(category) / inventoryData.totalValue) * 100).toFixed(2)}%
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        ))}

                        {/* Grand Total */}
                        <div className="bg-primary-end text-white rounded-lg shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white opacity-90 mb-1">TOTAL GÉNÉRAL STOCK</p>
                                    <p className="text-3xl font-bold">{formatCurrency(inventoryData.totalValue)}</p>
                                </div>
                                <Package className="h-16 w-16 opacity-50" />
                            </div>
                            <p className="mt-4 text-sm opacity-90">
                                Valorisation au Prix Moyen Pondéré (PMP) - Méthode OHADA
                            </p>
                        </div>

                        {/* Legal Note */}
                        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                            <div className="flex items-start">
                                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                                <div className="text-sm text-yellow-800">
                                    <p className="font-bold mb-1">Note de conformité OHADA</p>
                                    <p>
                                        Cet inventaire permanent doit être rapproché des comptes de la classe 3 de la comptabilité
                                        générale. Tout écart doit être justifié et régularisé par écriture comptable.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AccountantDashBoard>
    );
}
