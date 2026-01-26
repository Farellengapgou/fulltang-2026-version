import { useState, useEffect } from "react";
import { Plus, Eye, Send, CheckCircle, Trash2 } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { MaterialAccountingNavLink } from "../NavLink.js";
import { getTransfers, sendTransfer, receiveTransfer, deleteTransfer } from "../../../Utils/api/materialAccounting.js";
import { TransferModal } from "../Components/TransferModal.jsx";
import { TransferDetailModal } from "../Components/TransferDetailModal.jsx";

export function Transfers() {
    const [transfers, setTransfers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTransferId, setSelectedTransferId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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

    const handleViewDetails = (id) => {
        setSelectedTransferId(id);
        setIsDetailModalOpen(true);
    };

    const handleSendTransfer = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Voulez-vous expédier ce transfert ?")) return;
        try {
            await sendTransfer(id);
            loadData();
        } catch (error) {
            const msg = error.detail || (error.errors ? error.errors.join("\n") : "Erreur lors de l'expédition");
            alert(msg);
        }
    };

    const handleReceiveTransfer = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Voulez-vous confirmer la réception ?")) return;
        try {
            await receiveTransfer(id);
            loadData();
        } catch (error) {
            const msg = error.detail || "Erreur lors de la réception";
            alert(msg);
        }
    };

    const handleDeleteTransfer = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Voulez-vous supprimer ce transfert ?")) return;
        try {
            await deleteTransfer(id);
            loadData();
        } catch (error) {
            alert(error.detail || "Erreur lors de la suppression");
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
        return <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${badge.color}`}>{badge.label}</span>;
    };

    return (
        <AccountantDashBoard linkList={MaterialAccountingNavLink} requiredRole={"MaterialAccountant"}>
            <AccountantNavBar />
            <div className="mx-auto p-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 uppercase italic">Transferts Inter-Dépôts</h1>
                        <p className="text-gray-600 mt-1">Mouvements entre magasins</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center px-6 py-2 bg-primary-end text-white rounded-xl hover:bg-teal-700 transition-all font-bold shadow-lg"
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
                                        <th className="px-6 py-3 bg-primary-end rounded-l-xl text-left text-sm text-white font-bold italic">N° Transfert</th>
                                        <th className="px-6 py-3 bg-primary-end text-left text-sm text-white font-bold italic">Date</th>
                                        <th className="px-6 py-3 bg-primary-end text-left text-sm text-white font-bold italic">Origine</th>
                                        <th className="px-6 py-3 bg-primary-end text-left text-sm text-white font-bold italic">Destination</th>
                                        <th className="px-6 py-3 bg-primary-end text-center text-sm text-white font-bold italic">Statut</th>
                                        <th className="px-6 py-3 bg-primary-end rounded-r-xl text-center text-sm text-white font-bold italic">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transfers.map((transfer) => (
                                        <tr key={transfer.id} className="hover:translate-x-1 transition-transform group">
                                            <td className="px-6 py-4 bg-gray-50 border-l-4 border-primary-end rounded-l-xl">
                                                <span className="font-bold text-gray-900">{transfer.number}</span>
                                            </td>
                                            <td className="px-6 py-4 bg-gray-50">
                                                <span className="text-sm text-gray-800">{formatDate(transfer.date)}</span>
                                            </td>
                                            <td className="px-6 py-4 bg-gray-50">
                                                <span className="text-sm font-bold text-gray-900 uppercase">{transfer.from_warehouse}</span>
                                            </td>
                                            <td className="px-6 py-4 bg-gray-50">
                                                <span className="text-sm font-bold text-gray-900 uppercase">{transfer.to_warehouse}</span>
                                            </td>
                                            <td className="px-6 py-4 bg-gray-50 text-center">{getStatusBadge(transfer.status)}</td>
                                            <td className="px-6 py-4 bg-gray-50 rounded-r-xl">
                                                <div className="flex items-center justify-center gap-4">
                                                    <button
                                                        onClick={() => handleViewDetails(transfer.id)}
                                                        className="text-gray-400 hover:text-primary-end transition-colors"
                                                        title="Voir"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </button>

                                                    {transfer.status === 'DRAFT' && (
                                                        <button
                                                            onClick={(e) => handleSendTransfer(e, transfer.id)}
                                                            className="text-blue-500 hover:text-blue-700 transition-colors"
                                                            title="Valider & Expédier"
                                                        >
                                                            <Send className="h-5 w-5" />
                                                        </button>
                                                    )}

                                                    {transfer.status === 'SENT' && (
                                                        <button
                                                            onClick={(e) => handleReceiveTransfer(e, transfer.id)}
                                                            className="text-green-500 hover:text-green-700 transition-colors"
                                                            title="Confirmer Réception"
                                                        >
                                                            <CheckCircle className="h-5 w-5" />
                                                        </button>
                                                    )}

                                                    {transfer.status === 'DRAFT' && (
                                                        <button
                                                            onClick={(e) => handleDeleteTransfer(e, transfer.id)}
                                                            className="text-red-400 hover:text-red-600 transition-colors"
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {transfers.length === 0 && (
                                <div className="text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 mt-4">
                                    <p className="text-gray-500 font-bold italic">Aucun transfert trouvé.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            <TransferModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onRefresh={loadData}
            />
            <TransferDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedTransferId(null);
                }}
                transferId={selectedTransferId}
                onRefresh={loadData}
            />
        </AccountantDashBoard>
    );
}
