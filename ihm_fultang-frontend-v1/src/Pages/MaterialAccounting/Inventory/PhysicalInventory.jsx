import { useState, useEffect } from "react";
import { Plus, Eye } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { MaterialAccountingNavLink } from "../NavLink.js";
import { getPhysicalInventories } from "../../../Utils/api/materialAccounting.js";

export function PhysicalInventory() {
    const [inventories, setInventories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const data = await getPhysicalInventories();
            setInventories(data.results || []);
        } catch (error) {
            console.error("Error loading physical inventories:", error);
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("fr-FR");
    };

    const getStatusBadge = (status) => {
        const badges = {
            DRAFT: { label: "Brouillon", color: "bg-gray-100 text-gray-800" },
            IN_PROGRESS: { label: "En cours", color: "bg-blue-100 text-blue-800" },
            VALIDATED: { label: "Validé", color: "bg-green-100 text-green-800" },
        };
        const badge = badges[status] || badges.DRAFT;
        return <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>{badge.label}</span>;
    };

    return (
        <AccountantDashBoard linkList={MaterialAccountingNavLink} requiredRole={"MaterialAccountant"}>
            <AccountantNavBar />
            <div className="mx-auto p-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Inventaires Physiques</h1>
                        <p className="text-gray-600 mt-1">Comptages et ajustements de stock</p>
                    </div>
                    <button className="flex items-center px-4 py-2 bg-primary-end text-white rounded-lg hover:bg-teal-700 transition-all">
                        <Plus className="h-5 w-5 mr-2" />
                        Nouvel inventaire
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-end mx-auto"></div>
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <p className="text-sm text-gray-600">Total Inventaires</p>
                                <p className="text-2xl font-bold text-gray-800">{inventories.length}</p>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-600">En cours</p>
                                <p className="text-2xl font-bold text-blue-800">
                                    {inventories.filter((i) => i.status === "IN_PROGRESS").length}
                                </p>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm text-green-600">Validés</p>
                                <p className="text-2xl font-bold text-green-800">
                                    {inventories.filter((i) => i.status === "VALIDATED").length}
                                </p>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-separate border-spacing-y-2">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 bg-primary-end rounded-l-xl text-left text-sm text-white font-bold">N° Inventaire</th>
                                        <th className="px-6 py-3 bg-primary-end text-left text-sm text-white font-bold">Date</th>
                                        <th className="px-6 py-3 bg-primary-end text-left text-sm text-white font-bold">Dépôt</th>
                                        <th className="px-6 py-3 bg-primary-end text-center text-sm text-white font-bold">Articles</th>
                                        <th className="px-6 py-3 bg-primary-end text-right text-sm text-white font-bold">Écart Valeur</th>
                                        <th className="px-6 py-3 bg-primary-end text-center text-sm text-white font-bold">Statut</th>
                                        <th className="px-6 py-3 bg-primary-end rounded-r-xl text-center text-sm text-white font-bold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventories.map((inventory) => (
                                        <tr key={inventory.id}>
                                            <td className="px-6 py-4 bg-gray-50 border-l-4 border-primary-end rounded-l-xl">
                                                <span className="font-bold text-gray-900">{inventory.number}</span>
                                            </td>
                                            <td className="px-6 py-4 bg-gray-50">
                                                <span className="text-sm text-gray-800">{formatDate(inventory.date)}</span>
                                            </td>
                                            <td className="px-6 py-4 bg-gray-50">
                                                <span className="text-sm font-medium text-gray-900">{inventory.warehouse}</span>
                                            </td>
                                            <td className="px-6 py-4 bg-gray-50 text-center">
                                                <span className="text-sm font-medium text-gray-800">{inventory.article_count}</span>
                                            </td>
                                            <td className="px-6 py-4 bg-gray-50 text-right">
                                                <span
                                                    className={`font-bold ${inventory.variance_value < 0 ? "text-red-600" : "text-green-600"
                                                        }`}
                                                >
                                                    {formatCurrency(inventory.variance_value)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 bg-gray-50 text-center">{getStatusBadge(inventory.status)}</td>
                                            <td className="px-6 py-4 bg-gray-50 rounded-r-xl">
                                                <div className="flex items-center justify-center">
                                                    <button className="text-blue-600 hover:text-blue-800" title="Voir">
                                                        <Eye className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </AccountantDashBoard>
    );
}
