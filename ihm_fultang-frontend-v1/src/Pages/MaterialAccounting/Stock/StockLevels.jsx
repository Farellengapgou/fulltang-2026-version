import { useState, useEffect } from "react";
import { Search, Package, AlertTriangle, Download } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { MaterialAccountingNavLink } from "../NavLink.js";
import { getStockLevels } from "../../../Utils/api/materialAccounting.js";

export function StockLevels() {
    const [stockLevels, setStockLevels] = useState([]);
    const [filteredStock, setFilteredStock] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [alertFilter, setAlertFilter] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStockLevels();
    }, []);

    useEffect(() => {
        filterStock();
    }, [searchTerm, alertFilter, stockLevels]);

    const loadStockLevels = async () => {
        try {
            setIsLoading(true);
            const data = await getStockLevels();
            setStockLevels(data.results || []);
        } catch (error) {
            console.error("Error loading stock levels:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterStock = () => {
        let filtered = stockLevels;

        if (searchTerm) {
            filtered = filtered.filter(
                (stock) =>
                    stock.article?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    stock.article?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (alertFilter) {
            filtered = filtered.filter((stock) => stock.alert_level === alertFilter);
        }

        setFilteredStock(filtered);
    };

    const handleExport = () => {
        const headers = ["Article Code", "Article Name", "Dépôt", "Physique", "Réservé", "Disponible", "PMP (XAF)", "Valeur (XAF)"];
        const rows = filteredStock.map(s => [
            s.article?.code || 'N/A',
            s.article?.name || 'N/A',
            s.warehouse?.name || 'N/A',
            s.physical_quantity,
            s.reserved_quantity,
            s.physical_quantity - s.reserved_quantity,
            s.weighted_average_price,
            s.stock_value
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `stock_fultang_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "XAF",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getAlertBadge = (stock) => {
        const available = stock.physical_quantity - stock.reserved_quantity;

        if (available <= 0) {
            return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">Rupture</span>;
        } else if (available < stock.minimum_stock) {
            return <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">Stock faible</span>;
        } else if (stock.reserved_quantity > 0) {
            return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">Réservations</span>;
        }
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">Normal</span>;
    };

    if (isLoading) {
        return (
            <AccountantDashBoard linkList={MaterialAccountingNavLink} requiredRole={"MaterialAccountant"}>
                <AccountantNavBar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-end mx-auto mb-4"></div>
                        <p className="text-gray-600">Chargement...</p>
                    </div>
                </div>
            </AccountantDashBoard>
        );
    }

    return (
        <AccountantDashBoard linkList={MaterialAccountingNavLink} requiredRole={"MaterialAccountant"}>
            <AccountantNavBar />
            <div className="mx-auto p-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">États des Stocks</h1>
                        <p className="text-gray-600 mt-1">Niveaux de stock par article et dépôt</p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="flex items-center px-4 py-2 bg-primary-end text-white rounded-lg hover:bg-teal-700 transition-all duration-300"
                    >
                        <Download className="h-5 w-5 mr-2" />
                        Exporter (CSV)
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-gray-600">Valeur Totale</p>
                        <p className="text-2xl font-bold text-gray-800">
                            {formatCurrency(stockLevels.reduce((sum, s) => sum + Number(s.stock_value || 0), 0))}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-gray-600">Articles en Stock</p>
                        <p className="text-2xl font-bold text-gray-800">{stockLevels.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-orange-200 p-4 bg-orange-50">
                        <p className="text-sm text-orange-600">Stocks Faibles</p>
                        <p className="text-2xl font-bold text-orange-800">
                            {stockLevels.filter(s => (s.physical_quantity - s.reserved_quantity) < s.minimum_stock).length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-red-200 p-4 bg-red-50">
                        <p className="text-sm text-red-600">Ruptures</p>
                        <p className="text-2xl font-bold text-red-800">
                            {stockLevels.filter(s => (s.physical_quantity - s.reserved_quantity) <= 0).length}
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Rechercher un article..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none"
                        />
                    </div>
                    <select
                        value={alertFilter}
                        onChange={(e) => setAlertFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="LOW_STOCK">Stock faible</option>
                        <option value="OUT_OF_STOCK">Rupture</option>
                    </select>
                </div>

                {filteredStock.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-separate border-spacing-y-2">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 bg-primary-end rounded-l-xl text-left text-sm text-white font-bold">Article</th>
                                    <th className="px-6 py-3 bg-primary-end text-left text-sm text-white font-bold">Dépôt</th>
                                    <th className="px-6 py-3 bg-primary-end text-right text-sm text-white font-bold">Physique</th>
                                    <th className="px-6 py-3 bg-primary-end text-right text-sm text-white font-bold">Réservé</th>
                                    <th className="px-6 py-3 bg-primary-end text-right text-sm text-white font-bold">Disponible</th>
                                    <th className="px-6 py-3 bg-primary-end text-right text-sm text-white font-bold">PMP</th>
                                    <th className="px-6 py-3 bg-primary-end text-right text-sm text-white font-bold">Valeur</th>
                                    <th className="px-6 py-3 bg-primary-end rounded-r-xl text-center text-sm text-white font-bold">Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStock.map((stock) => (
                                    <tr key={stock.id}>
                                        <td className="px-6 py-4 bg-gray-50 border-l-4 border-primary-end rounded-l-xl">
                                            <div>
                                                <p className="font-bold text-gray-900">{stock.article?.code || 'N/A'}</p>
                                                <p className="text-sm text-gray-600">{stock.article?.name || 'Nom inconnu'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50">
                                            <p className="text-sm text-gray-800">{stock.warehouse?.name || 'Dépôt inconnu'}</p>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 text-right">
                                            <p className="font-medium text-gray-800">{stock.physical_quantity}</p>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 text-right">
                                            <p className="text-gray-600">{stock.reserved_quantity}</p>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 text-right">
                                            <p className="font-bold text-gray-900">{stock.physical_quantity - stock.reserved_quantity}</p>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 text-right">
                                            <p className="text-gray-800">{formatCurrency(stock.weighted_average_price)}</p>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 text-right">
                                            <p className="font-bold text-gray-900">{formatCurrency(stock.stock_value)}</p>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 rounded-r-xl text-center">
                                            {getAlertBadge(stock)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800">Aucun stock trouvé</h3>
                    </div>
                )}
            </div>
        </AccountantDashBoard>
    );
}
