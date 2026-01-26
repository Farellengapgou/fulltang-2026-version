import { useState, useEffect } from "react";
import { Plus, Search, Eye, Edit2, Trash2 } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { MaterialAccountingNavLink } from "../NavLink.js";
import { getGoodsReceipts, validateGoodsReceipt, deleteGoodsReceipt, postGoodsReceipt, getGoodsReceiptDetails } from "../../../Utils/api/materialAccounting.js";
import { GoodsReceiptModal } from "../Components/GoodsReceiptModal.jsx";
import { CheckCircle, FileCheck } from "lucide-react";
import { ErrorModal } from "../../Modals/ErrorModal.jsx";
import { SuccessModal } from "../../Modals/SuccessModal.jsx";
import { ConfirmationModal } from "../../Modals/ConfirmAction.Modal.jsx";

export function GoodsReceipts() {
    const [receipts, setReceipts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [canOpenSuccessModal, setCanOpenSuccessModal] = useState(false);
    const [canOpenErrorModal, setCanOpenErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: null
    });

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
            CONFIRMED: { label: "Confirmé", color: "bg-blue-100 text-blue-800" },
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
        return matchesSearch && matchesStatus;
    });

    const handleValidate = async (id) => {
        setConfirmModal({
            isOpen: true,
            title: "Valider le bon",
            message: "Voulez-vous vraiment valider ce bon ? Cette action est irréversible.",
            onConfirm: async () => {
                try {
                    await validateGoodsReceipt(id);
                    loadData();
                    setSuccessMessage("Bon d'entrée validé avec succès");
                    setCanOpenSuccessModal(true);
                } catch (error) {
                    console.error("Error validating receipt:", error);
                    setErrorMessage("Erreur lors de la validation: " + (error.detail || error.message));
                    setCanOpenErrorModal(true);
                }
            }
        });
    };

    const handlePost = async (id) => {
        setConfirmModal({
            isOpen: true,
            title: "Comptabiliser le bon",
            message: "Voulez-vous vraiment comptabiliser ce bon ? Une écriture comptable sera générée.",
            onConfirm: async () => {
                try {
                    await postGoodsReceipt(id);
                    loadData();
                    setSuccessMessage("Bon d'entrée comptabilisé avec succès");
                    setCanOpenSuccessModal(true);
                } catch (error) {
                    console.error("Error posting receipt:", error);
                    setErrorMessage("Erreur lors de la comptabilisation: " + (error.detail || error.message));
                    setCanOpenErrorModal(true);
                }
            }
        });
    };

    const handleEdit = async (receipt) => {
        try {
            setIsLoading(true);
            const fullData = await getGoodsReceiptDetails(receipt.id);
            setSelectedReceipt(fullData);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error loading receipt details:", error);
            alert("Erreur lors du chargement des détails");
        } finally {
            setIsLoading(false);
        }
    };

    const handleView = async (receipt) => {
        try {
            setIsLoading(true);
            const fullData = await getGoodsReceiptDetails(receipt.id);
            setSelectedReceipt(fullData);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error loading receipt details:", error);
            alert("Erreur lors du chargement des détails");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedReceipt(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        setConfirmModal({
            isOpen: true,
            title: "Supprimer le bon",
            message: "Voulez-vous vraiment supprimer ce bon d'entrée ? Cette action est irréversible.",
            onConfirm: async () => {
                try {
                    await deleteGoodsReceipt(id);
                    loadData();
                    setSuccessMessage("Bon d'entrée supprimé avec succès");
                    setCanOpenSuccessModal(true);
                } catch (error) {
                    console.error("Error deleting receipt:", error);
                    setErrorMessage("Erreur lors de la suppression: " + (error.detail || error.message));
                    setCanOpenErrorModal(true);
                }
            }
        });
    };

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
                        onClick={handleCreate}
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
                                <p className="text-sm text-blue-600">Confirmés</p>
                                <p className="text-2xl font-bold text-blue-800">
                                    {receipts.filter((r) => r.status === "CONFIRMED").length}
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
                                            <td className="px-6 py-4 bg-gray-50 text-right">
                                                <span className="font-bold text-gray-900">{formatCurrency(receipt.total_amount)}</span>
                                            </td>
                                            <td className="px-6 py-4 bg-gray-50 text-center">
                                                {getStatusBadge(receipt.status)}
                                            </td>
                                            <td className="px-6 py-4 bg-gray-50 rounded-r-xl">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleView(receipt)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="Voir"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </button>
                                                    {receipt.status === "DRAFT" && (
                                                        <>
                                                            <button
                                                                onClick={() => handleEdit(receipt)}
                                                                className="text-orange-600 hover:text-orange-800"
                                                                title="Modifier"
                                                            >
                                                                <Edit2 className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleValidate(receipt.id)}
                                                                className="text-green-600 hover:text-green-800"
                                                                title="Valider"
                                                            >
                                                                <CheckCircle className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(receipt.id)}
                                                                className="text-red-600 hover:text-red-800"
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {receipt.status === "CONFIRMED" && (
                                                        <button
                                                            onClick={() => handlePost(receipt.id)}
                                                            className="text-purple-600 hover:text-purple-800"
                                                            title="Comptabiliser"
                                                        >
                                                            <FileCheck className="h-5 w-5" />
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
                initialData={selectedReceipt}
            />
            <SuccessModal isOpen={canOpenSuccessModal} canOpenSuccessModal={setCanOpenSuccessModal} message={successMessage} />
            <ErrorModal isOpen={canOpenErrorModal} onCloseErrorModal={setCanOpenErrorModal} message={errorMessage} />
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
            />
        </AccountantDashBoard>
    );
}
