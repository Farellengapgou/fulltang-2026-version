import { useState, useEffect } from "react";
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { FileText, Printer, Download } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { MaterialAccountingNavLink } from "../NavLink.js";
import { getStockCard, getArticles, getWarehouses, getStockLevels } from "../../../Utils/api/materialAccounting.js";

export function StockCard() {
    const [selectedArticleId, setSelectedArticleId] = useState("");
    const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
    const [articles, setArticles] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [stockCardData, setStockCardData] = useState(null);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const warehousesRes = await getWarehouses();
                setWarehouses(warehousesRes.results || []);
            } catch (error) {
                console.error("Error loading warehouses:", error);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                let articlesRes;
                if (selectedWarehouseId) {
                    // Fetch items only in this warehouse
                    const stockLevelsRes = await getStockLevels({ warehouse: selectedWarehouseId });
                    articlesRes = {
                        results: (stockLevelsRes.results || []).map(sl => sl.article)
                    };
                } else {
                    // Fetch all articles
                    articlesRes = await getArticles();
                }
                setArticles(articlesRes.results || []);
                // Reset selected article if it's no longer in the list (optional, but safer)
                if (selectedArticleId && !articlesRes.results.some(a => a.id === parseInt(selectedArticleId))) {
                    setSelectedArticleId("");
                }
            } catch (error) {
                console.error("Error loading articles:", error);
            }
        };
        fetchArticles();
    }, [selectedWarehouseId]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "XAF",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("fr-FR");
    };

    const handleGenerate = async () => {
        if (!selectedArticleId) {
            alert("Veuillez sélectionner un article");
            return;
        }
        setIsLoading(true);
        try {
            const data = await getStockCard(selectedArticleId, selectedWarehouseId, dateFrom, dateTo);
            setStockCardData({
                article: data.article,
                movements: data.results || [],
            });
        } catch (error) {
            console.error("Error generating stock card:", error);
            alert("Erreur lors de la génération de la fiche de stock");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = () => {
        alert("Export PDF - Fonctionnalité à implémenter avec jsPDF");
    };

    return (
        <AccountantDashBoard
            linkList={MaterialAccountingNavLink}
            requiredRole={"MaterialAccountant"}
        >
            <AccountantNavBar title="Material Accountant" />
            <div className="mx-auto p-12">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Fiche de Stock (OHADA)
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Document réglementaire - Art. 17-18 Acte Uniforme OHADA
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                        Critères de sélection
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dépôt
                            </label>
                            <select
                                value={selectedWarehouseId}
                                onChange={(e) => setSelectedWarehouseId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none"
                            >
                                <option value="">Tous les dépôts</option>
                                {warehouses.map(warehouse => (
                                    <option key={warehouse.id} value={warehouse.id}>
                                        {warehouse.code} - {warehouse.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Article
                            </label>
                            <select
                                value={selectedArticleId}
                                onChange={(e) => setSelectedArticleId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none"
                            >
                                <option value="">Sélectionner un article</option>
                                {articles.map(article => (
                                    <option key={article.id} value={article.id}>
                                        {article.code} - {article.name}
                                    </option>
                                ))}
                            </select>
                        </div>
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
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={handleGenerate}
                            className="flex items-center px-4 py-2 bg-primary-end text-white rounded-lg hover:bg-teal-700 transition-all"
                        >
                            <FileText className="h-5 w-5 mr-2" />
                            Générer la fiche
                        </button>
                        {stockCardData && (
                            <>
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                                >
                                    <Printer className="h-5 w-5 mr-2" />
                                    Imprimer
                                </button>
                                <button
                                    onClick={handleExportPDF}
                                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                                >
                                    <Download className="h-5 w-5 mr-2" />
                                    Export PDF
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Fiche de Stock */}
                {isLoading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-end mx-auto mb-4"></div>
                            <p className="text-gray-600">Génération en cours...</p>
                        </div>
                    </div>
                ) : stockCardData ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        {/* En-tête */}
                        <div className="border-b-2 border-gray-300 pb-4 mb-6">
                            <h2 className="text-xl font-bold text-center text-gray-800 mb-4 uppercase tracking-wider">
                                FICHE DE STOCK : {stockCardData.article.name}
                            </h2>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Code article:</p>
                                    <p className="font-bold">{stockCardData.article.code}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Désignation:</p>
                                    <p className="font-bold">{stockCardData.article.name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Catégorie:</p>
                                    <p className="font-bold">{stockCardData.article.category}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Unité:</p>
                                    <p className="font-bold">{stockCardData.article.unit}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Dépôt:</p>
                                    <p className="font-bold">{stockCardData.article.depot}</p>
                                </div>
                            </div>
                        </div>

                        {/* Table des mouvements */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 px-2 py-2 text-center" rowSpan="2">
                                            N°
                                        </th>
                                        <th className="border border-gray-300 px-2 py-2 text-left" rowSpan="2">
                                            Date
                                        </th>
                                        <th className="border border-gray-300 px-2 py-2 text-left" rowSpan="2">
                                            Référence
                                        </th>
                                        <th className="border border-gray-300 px-2 py-2 text-left" rowSpan="2">
                                            Libellé
                                        </th>
                                        <th className="border border-gray-300 px-2 py-2 text-center" colSpan="3">
                                            ENTRÉES
                                        </th>
                                        <th className="border border-gray-300 px-2 py-2 text-center" colSpan="3">
                                            SORTIES
                                        </th>
                                        <th className="border border-gray-300 px-2 py-2 text-center" colSpan="3">
                                            STOCK
                                        </th>
                                    </tr>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 px-2 py-1 text-right">Qté</th>
                                        <th className="border border-gray-300 px-2 py-1 text-right">PU</th>
                                        <th className="border border-gray-300 px-2 py-1 text-right">Total</th>
                                        <th className="border border-gray-300 px-2 py-1 text-right">Qté</th>
                                        <th className="border border-gray-300 px-2 py-1 text-right">PU</th>
                                        <th className="border border-gray-300 px-2 py-1 text-right">Total</th>
                                        <th className="border border-gray-300 px-2 py-1 text-right">Qté</th>
                                        <th className="border border-gray-300 px-2 py-1 text-right">PMP</th>
                                        <th className="border border-gray-300 px-2 py-1 text-right">Valeur</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stockCardData.movements.map((movement, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="border border-gray-300 px-2 py-2 text-center text-xs text-gray-500">
                                                {idx + 1}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2">
                                                {formatDate(movement.date)}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 font-medium">
                                                {movement.reference}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2">
                                                {movement.description}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 text-right">
                                                {movement.entry_qty}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 text-right">
                                                {movement.entry_price ? formatCurrency(movement.entry_price) : "-"}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 text-right">
                                                {movement.entry_value ? formatCurrency(movement.entry_value) : "-"}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 text-right">
                                                {movement.exit_qty}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 text-right">
                                                {movement.exit_price ? formatCurrency(movement.exit_price) : "-"}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 text-right">
                                                {movement.exit_value ? formatCurrency(movement.exit_value) : "-"}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 text-right font-bold">
                                                {movement.balance_qty}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 text-right font-bold">
                                                {formatCurrency(movement.pmp)}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 text-right font-bold bg-green-50">
                                                {formatCurrency(movement.balance_value)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-200 font-bold">
                                        <td colSpan="10" className="border border-gray-300 px-2 py-2 text-right">
                                            SOLDE FINAL:
                                        </td>
                                        <td className="border border-gray-300 px-2 py-2 text-right">
                                            {stockCardData.movements.length > 0
                                                ? stockCardData.movements[stockCardData.movements.length - 1].balance_qty
                                                : 0}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-2 text-right">
                                            {stockCardData.movements.length > 0
                                                ? formatCurrency(stockCardData.movements[stockCardData.movements.length - 1].pmp)
                                                : formatCurrency(0)}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-2 text-right bg-green-100">
                                            {stockCardData.movements.length > 0
                                                ? formatCurrency(stockCardData.movements[stockCardData.movements.length - 1].balance_value)
                                                : formatCurrency(0)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Mentions légales */}
                        <div className="mt-6 pt-4 border-t border-gray-300">
                            <p className="text-xs text-gray-600">
                                <strong>Note:</strong> Fiche de stock établie conformément à l'Acte Uniforme OHADA
                                relatif au droit comptable et à l'information financière (Articles 17-18).
                                Méthode de valorisation: Prix Moyen Pondéré (PMP).
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                            Aucune fiche générée
                        </h3>
                        <p className="text-gray-600">
                            Sélectionnez un article et cliquez sur "Générer la fiche" pour afficher les mouvements
                        </p>
                    </div>
                )}
            </div>
        </AccountantDashBoard>
    );
}
