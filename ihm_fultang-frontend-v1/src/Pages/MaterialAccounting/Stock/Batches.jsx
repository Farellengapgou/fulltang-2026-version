import { useState, useEffect } from "react";
import { Search, Package, AlertCircle, Calendar } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { MaterialAccountingNavLink } from "../NavLink.js";
import { getBatches, getExpiringBatches } from "../../../Utils/api/materialAccounting.js";

export function Batches() {
    const [batches, setBatches] = useState([]);
    const [filteredBatches, setFilteredBatches] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [expiryFilter, setExpiryFilter] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadBatches();
    }, []);

    useEffect(() => {
        filterBatches();
    }, [searchTerm, expiryFilter, batches]);

    const loadBatches = async () => {
        try {
            setIsLoading(true);
            const data = await getBatches();
            setBatches(data.results || []);
        } catch (error) {
            console.error("Error loading batches:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterBatches = () => {
        let filtered = batches;

        if (searchTerm) {
            filtered = filtered.filter(
                (batch) =>
                    batch.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    batch.article.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (expiryFilter === "30") {
            filtered = filtered.filter((b) => b.days_until_expiry <= 30);
        } else if (expiryFilter === "90") {
            filtered = filtered.filter((b) => b.days_until_expiry <= 90);
        } else if (expiryFilter === "expired") {
            filtered = filtered.filter((b) => b.days_until_expiry < 0);
        }

        setFilteredBatches(filtered);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("fr-FR");
    };

    const getExpiryBadge = (days) => {
        if (days < 0) {
            return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">Périmé</span>;
        } else if (days <= 30) {
            return <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">Urgent</span>;
        } else if (days <= 90) {
            return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">Attention</span>;
        }
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">OK</span>;
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
                        <h1 className="text-2xl font-bold text-gray-800">Gestion des Lots</h1>
                        <p className="text-gray-600 mt-1">Traçabilité et alertes de péremption</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-gray-600">Total Lots</p>
                        <p className="text-2xl font-bold text-gray-800">{batches.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-green-200 p-4 bg-green-50">
                        <p className="text-sm text-green-600">Lots OK</p>
                        <p className="text-2xl font-bold text-green-800">
                            {batches.filter(b => b.days_until_expiry > 90).length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-orange-200 p-4 bg-orange-50">
                        <p className="text-sm text-orange-600">\u003c 90 jours</p>
                        <p className="text-2xl font-bold text-orange-800">
                            {batches.filter(b => b.days_until_expiry <= 90 && b.days_until_expiry > 0).length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-red-200 p-4 bg-red-50">
                        <p className="text-sm text-red-600">Périmés</p>
                        <p className="text-2xl font-bold text-red-800">
                            {batches.filter(b => b.days_until_expiry < 0).length}
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Rechercher par n° lot ou article..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none"
                        />
                    </div>
                    <select
                        value={expiryFilter}
                        onChange={(e) => setExpiryFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none"
                    >
                        <option value="">Toutes les péremptions</option>
                        <option value="30">\u003c 30 jours</option>
                        <option value="90">\u003c 90 jours</option>
                        <option value="expired">Périmés</option>
                    </select>
                </div>

                {filteredBatches.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-separate border-spacing-y-2">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 bg-primary-end rounded-l-xl text-left text-sm text-white font-bold">N° Lot</th>
                                    <th className="px-6 py-3 bg-primary-end text-left text-sm text-white font-bold">Article</th>
                                    <th className="px-6 py-3 bg-primary-end text-left text-sm text-white font-bold">Dépôt</th>
                                    <th className="px-6 py-3 bg-primary-end text-center text-sm text-white font-bold">Fabrication</th>
                                    <th className="px-6 py-3 bg-primary-end text-center text-sm text-white font-bold">Péremption</th>
                                    <th className="px-6 py-3 bg-primary-end text-right text-sm text-white font-bold">Qté Restante</th>
                                    <th className="px-6 py-3 bg-primary-end text-center text-sm text-white font-bold">Jours</th>
                                    <th className="px-6 py-3 bg-primary-end rounded-r-xl text-center text-sm text-white font-bold">Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBatches.map((batch) => (
                                    <tr key={batch.id}>
                                        <td className="px-6 py-4 bg-gray-50 border-l-4 border-primary-end rounded-l-xl">
                                            <span className="font-bold text-gray-900">{batch.batch_number}</span>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50">
                                            <div>
                                                <p className="font-medium text-gray-900">{batch.article.name}</p>
                                                <p className="text-xs text-gray-500">{batch.article.code}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50">
                                            <p className="text-sm text-gray-800">{batch.warehouse.name}</p>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 text-center">
                                            <p className="text-sm text-gray-600">{formatDate(batch.manufacturing_date)}</p>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 text-center">
                                            <p className="text-sm font-medium text-gray-800">{formatDate(batch.expiry_date)}</p>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 text-right">
                                            <p className="font-bold text-gray-900">{batch.remaining_quantity}</p>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 text-center">
                                            <p className={`font-bold ${batch.days_until_expiry < 30 ? 'text-red-600' : 'text-gray-800'}`}>
                                                {batch.days_until_expiry}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 rounded-r-xl text-center">
                                            {getExpiryBadge(batch.days_until_expiry)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800">Aucun lot trouvé</h3>
                    </div>
                )}
            </div>
        </AccountantDashBoard>
    );
}
