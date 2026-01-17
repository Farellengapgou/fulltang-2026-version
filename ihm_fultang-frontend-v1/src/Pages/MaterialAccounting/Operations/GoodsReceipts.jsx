import { useState, useEffect } from "react";
import { Plus, Search, Eye, Edit2 } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { MaterialAccountingNavLink } from "../NavLink.js";
import { getGoodsReceipts } from "../../../Utils/api/materialAccounting.js";
import { GoodsReceiptModal } from "../Components/GoodsReceiptModal.jsx";

export function GoodsReceipts() {
    const [receipts, setReceipts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const data = await getGoodsReceipts();
            setReceipts(data.results || []);
        } catch (error) {
            console.error("Error loading goods receipts:", error);
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
            VALIDATED: { label: "Validé", color: "bg-blue-100 text-blue-800" },
            POSTED: { label: "Comptabilisé", color: "bg-green-100 text-green-800" },
            CANCELLED: { label: "Annulé", color: "bg-red-100 text-red-800" },
        };
        const badge = badges[status] || badges.DRAFT;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                {badge.label}
            </span>
        );
    };

    const filteredReceipts = receipts.filter((receipt) => {
        const matchesSearch =
            !searchTerm ||
            receipt.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            receipt.supplier.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || receipt.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <AccountantDashBoard linkList={MaterialAccountingNavLink} requiredRole={"MaterialAccountant"}>
            <AccountantNavBar />
            <div className="mx-auto p-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Bons d'Entrée</h1>
                        <p className="text-gray-600 mt-1">Réception des marchandises</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center px-4 py-2 bg-primary-end text-white rounded-lg hover:bg-teal-700 transition-all font-bold"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Nouveau bon d'entrée
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-end mx-auto"></div>
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <p className="text-sm text-gray-600">Total Bons</p>
                                <p className="text-2xl font-bold text-gray-800">{receipts.length}</p>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <p className="text-sm text-gray-600">Brouillons</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {receipts.filter((r) => r.status === "DRAFT").length}
                                </p>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-600">Validés</p>
                                <p className="text-2xl font-bold text-blue-800">
                                    {receipts.filter((r) => r.status === "VALIDATED").length}
                                </p>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm text-green-600">Comptabilisés</p>
                                <p className="text-2xl font-bold text-green-800">
                                    {receipts.filter((r) => r.status === "POSTED").length}
                                </p>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Rechercher par n° ou fournisseur..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none"
                            >
                                <option value="">Tous les statuts</option>
                                <option value="DRAFT">Brouillon</option>
                                <option value="VALIDATED">Validé</option>
                                <option value="POSTED">Comptabilisé</option>
                            </select>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-separate border-spacing-y-2">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 bg-primary-end rounded-l-xl text-left text-sm text-white font-bold">
                                            N° Bon
                                        </th>
                                        <th className="px-6 py-3 bg-primary-end text-left text-sm text-white font-bold">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 bg-primary-end text-left text-sm text-white font-bold">
                                            Fournisseur
                                        </th>
                                        <th className="px-6 py-3 bg-primary-end text-left text-sm text-white font-bold">
                                            Dépôt
                                        </th>
                                        <th className="px-6 py-3 bg-primary-end text-center text-sm text-white font-bold">
                                            Lignes
                                        </th>
                                        <th className="px-6 py-3 bg-primary-end text-right text-sm text-white font-bold">
                                            Montant
                                        </th>
                                        <th className="px-6 py-3 bg-primary-end text-center text-sm text-white font-bold">
                                            Statut
                                        </th>
                                        <th className="px-6 py-3 bg-primary-end rounded-r-xl text-center text-sm text-white font-bold">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReceipts.map((receipt) => (
                                        <tr key={receipt.id}>
                                            <td className="px-6 py-4 bg-gray-50 border-l-4 border-primary-end rounded-l-xl">
                                                <span className="font-bold text-gray-900">{receipt.number}</span>
                                            </td>
                                            <td className="px-6 py-4 bg-gray-50">
                                                <span className="text-sm text-gray-800">{formatDate(receipt.date)}</span>
                                            </td>
                                            <td className="px-6 py-4 bg-gray-50">
                                                <span className="text-sm font-medium text-gray-900">{receipt.supplier}</span>
                                            </td>
                                            <td className="px-6 py-4 bg-gray-50">
                                                <span className="text-sm text-gray-800">{receipt.warehouse}</span>
                                            </td>
                                            <td className="px-6 py-4 bg-gray-50 text-center">
                                                <span className="text-sm font-medium text-gray-800">{receipt.line_count}</span>
                                            </td>
                                            <td className="px-6 py-4 bg-gray-50 text-right">
                                                <span className="font-bold text-gray-900">{formatCurrency(receipt.total_amount)}</span>
                                            </td>
                                            <td className="px-6 py-4 bg-gray-50 text-center">
                                                {getStatusBadge(receipt.status)}
                                            </td>
                                            <td className="px-6 py-4 bg-gray-50 rounded-r-xl">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button className="text-blue-600 hover:text-blue-800" title="Voir">
                                                        <Eye className="h-5 w-5" />
                                                    </button>
                                                    {receipt.status === "DRAFT" && (
                                                        <button className="text-green-600 hover:text-green-800" title="Modifier">
                                                            <Edit2 className="h-5 w-5" />
                                                        </button>
                                                    )}
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

            <GoodsReceiptModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onRefresh={loadData}
            />
        </AccountantDashBoard>
    );
}
