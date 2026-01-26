import { useState, useEffect } from "react";
import { X, Send, CheckCircle, Package, Trash2, Printer } from "lucide-react";
import { getTransferDetails, sendTransfer, receiveTransfer, deleteTransfer } from "../../../Utils/api/materialAccounting.js";

export function TransferDetailModal({ isOpen, onClose, transferId, onRefresh }) {
    const [transfer, setTransfer] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        if (isOpen && transferId) {
            loadDetails();
        }
    }, [isOpen, transferId]);

    const loadDetails = async () => {
        try {
            setIsLoading(true);
            const data = await getTransferDetails(transferId);
            setTransfer(data);
        } catch (error) {
            console.error("Error loading transfer details:", error);
            alert("Erreur lors du chargement des détails");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!window.confirm("Voulez-vous expédier ce transfert ?")) return;
        try {
            setIsActionLoading(true);
            await sendTransfer(transferId);
            await loadDetails();
            onRefresh();
        } catch (error) {
            const msg = error.detail || (error.errors ? error.errors.join("\n") : "Erreur lors de l'expédition");
            alert(msg);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleReceive = async () => {
        if (!window.confirm("Voulez-vous confirmer la réception de ce transfert ?")) return;
        try {
            setIsActionLoading(true);
            await receiveTransfer(transferId);
            await loadDetails();
            onRefresh();
        } catch (error) {
            const msg = error.detail || "Erreur lors de la réception";
            alert(msg);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Voulez-vous supprimer ce transfert ?")) return;
        try {
            setIsActionLoading(true);
            await deleteTransfer(transferId);
            onRefresh();
            onClose();
        } catch (error) {
            alert(error.detail || "Erreur lors de la suppression");
        } finally {
            setIsActionLoading(false);
        }
    };

    if (!isOpen) return null;

    const getStatusInfo = (status) => {
        const statuses = {
            DRAFT: { label: "Brouillon", color: "bg-gray-100 text-gray-800" },
            SENT: { label: "En Transit / Envoyé", color: "bg-blue-100 text-blue-800" },
            RECEIVED: { label: "Réceptionné", color: "bg-green-100 text-green-800" },
            CANCELLED: { label: "Annulé", color: "bg-red-100 text-red-800" }
        };
        return statuses[status] || statuses.DRAFT;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-primary-end text-white">
                    <div>
                        <h2 className="text-xl font-bold italic">Détails du Transfert</h2>
                        {transfer && <p className="text-sm opacity-90">{transfer.number}</p>}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex justify-center p-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-end"></div>
                        </div>
                    ) : transfer ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-2xl">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500">Date prévue</label>
                                    <p className="font-bold text-gray-800">{new Date(transfer.date).toLocaleDateString("fr-FR")}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500">Origine</label>
                                    <p className="font-bold text-gray-800 uppercase">{transfer.from_warehouse}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500">Destination</label>
                                    <p className="font-bold text-gray-800 uppercase">{transfer.to_warehouse}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500">Statut</label>
                                    <div className="mt-1">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusInfo(transfer.status).color}`}>
                                            {getStatusInfo(transfer.status).label}
                                        </span>
                                    </div>
                                </div>
                                {transfer.notes && (
                                    <div className="col-span-2">
                                        <label className="text-[10px] uppercase font-bold text-gray-500">Notes / Référence</label>
                                        <p className="text-sm text-gray-700">{transfer.notes}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center">
                                    <Package className="h-5 w-5 mr-2 text-primary-end" />
                                    Articles transférés
                                </h3>
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-[10px] uppercase text-gray-400 font-bold border-b">
                                            <th className="pb-2">Article</th>
                                            <th className="pb-2 text-center">Quantité</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {transfer.lines?.map((line, idx) => (
                                            <tr key={idx} className="text-gray-700">
                                                <td className="py-3">
                                                    <p className="font-bold text-sm uppercase">{line.article_name || line.article_code}</p>
                                                    <p className="text-[10px] text-gray-400">{line.article_code}</p>
                                                </td>
                                                <td className="py-3 text-center font-medium">
                                                    {line.quantity}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-between gap-3 bg-gray-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-white transition-all shadow-sm"
                    >
                        Fermer
                    </button>

                    <div className="flex gap-2">
                        {transfer?.status === 'DRAFT' && (
                            <button
                                onClick={handleDelete}
                                disabled={isActionLoading}
                                className="px-6 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center disabled:opacity-50"
                            >
                                <Trash2 className="h-5 w-5 mr-2" />
                                Supprimer
                            </button>
                        )}
                        <button
                            onClick={() => window.print()}
                            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center"
                        >
                            <Printer className="h-5 w-5 mr-2" />
                            Imprimer
                        </button>
                        {transfer?.status === 'DRAFT' && (
                            <button
                                onClick={handleSend}
                                disabled={isActionLoading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center disabled:opacity-50"
                            >
                                <Send className="h-5 w-5 mr-2" />
                                Valider & Expédier
                            </button>
                        )}
                        {transfer?.status === 'SENT' && (
                            <button
                                onClick={handleReceive}
                                disabled={isActionLoading}
                                className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all flex items-center disabled:opacity-50"
                            >
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Confirmer Réception
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
