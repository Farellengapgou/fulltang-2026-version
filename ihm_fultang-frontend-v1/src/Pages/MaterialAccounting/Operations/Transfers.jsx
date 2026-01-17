import { useState, useEffect } from "react";
import { Plus, Eye } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { MaterialAccountingNavLink } from "../NavLink.js";
import { getTransfers } from "../../../Utils/api/materialAccounting.js";
import { TransferModal } from "../Components/TransferModal.jsx";

export function Transfers() {
    const [transfers, setTransfers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const data = await getTransfers();
            setTransfers(data.results || []);
        } catch (error) {
            console.error("Error loading transfers:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("fr-FR");
    };

    const getStatusBadge = (status) => {
        const badges = {
            DRAFT: { label: "Brouillon", color: "bg-gray-100 text-gray-800" },
            SENT: { label: "Envoyé", color: "bg-blue-100 text-blue-800" },
            RECEIVED: { label: "Reçu", color: "bg-green-100 text-green-800" },
            CANCELLED: { label: "Annulé", color: "bg-red-100 text-red-800" },
        };
        const badge = badges[status] || badges.DRAFT;
        return <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>{badge.label}</span>;
    };

    return (
        <AccountantDashBoard linkList={MaterialAccountingNavLink} requiredRole={"Accountant"}>
            <AccountantNavBar />
            <div className="mx-auto p-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Transferts Inter-Dépôts</h1>
                        <p className="text-gray-600 mt-1">Mouvements entre magasins</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center px-4 py-2 bg-primary-end text-white rounded-lg hover:bg-teal-700 transition-all font-bold"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Nouveau transfert
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-end mx-auto"></div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full border-separate border-spacing-y-2">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 bg-primary-end rounded-l-xl text-left text-sm text-white font-bold">N° Transfert</th>
                                        <th className="px-6 py-3 bg-primary-end text-left text-sm text-white font-bold">Date</th>
                                        <th className="px-6 py-3 bg-primary-end text-left text-sm text-white font-bold">Depuis</th>
                                        <th className="px-6 py-3 bg-primary-end text-left text-sm text-white font-bold">Vers</th>
                                        <th className="px-6 py-3 bg-primary-end text-center text-sm text-white font-bold">Lignes</th>
                                        <th className="px-6 py-3 bg-primary-end text-center text-sm text-white font-bold">Statut</th>
                                        <th className="px-6 py-3 bg-primary-end rounded-r-xl text-center text-sm text-white font-bold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transfers.map((transfer) => (
                                        <tr key={transfer.id}>
                                            <td className="px-6 py-4 bg-gray-50 border-l-4 border-primary-end rounded-l-xl">
                                                <span className="font-bold text-gray-900">{transfer.number}</span>
                                            </td>
                                            <td className="px-6 py-4 bg-gray-50">
                                                <span className="text-sm text-gray-800">{formatDate(transfer.date)}</span>
                                            </td>
                                            <td className="px-6 py-4 bg-gray-50">
                                                <span className="text-sm font-medium text-gray-900">{transfer.from_warehouse}</span>
                                            </td>
                                            <td className="px-6 py-4 bg-gray-50">
                                                <span className="text-sm font-medium text-gray-900">{transfer.to_warehouse}</span>
                                            </td>
                                            <td className="px-6 py-4 bg-gray-50 text-center">
                                                <span className="text-sm font-medium text-gray-800">{transfer.line_count}</span>
                                            </td>
                                            <td className="px-6 py-4 bg-gray-50 text-center">{getStatusBadge(transfer.status)}</td>
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
            <TransferModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onRefresh={loadData}
            />
        </AccountantDashBoard>
    );
}
