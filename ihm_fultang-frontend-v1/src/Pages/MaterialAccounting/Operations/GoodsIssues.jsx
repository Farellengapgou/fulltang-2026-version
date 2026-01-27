import { useState, useEffect } from "react";
import { Plus, Search, Eye, Edit2, Trash2, CheckCircle, FileCheck } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { MaterialAccountingNavLink } from "../NavLink.js";
import { getGoodsIssues, validateGoodsIssue, confirmGoodsIssue, postGoodsIssue, deleteGoodsIssue, getGoodsIssueDetails } from "../../../Utils/api/materialAccounting.js";
import { GoodsIssueModal } from "../Components/GoodsIssueModal.jsx";

export function GoodsIssues() {
    const [issues, setIssues] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const data = await getGoodsIssues();
            setIssues(data.results || []);
        } catch (error) {
            console.error("Error loading goods issues:", error);
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
            VALIDATED: { label: "Validé (Réservé)", color: "bg-blue-100 text-blue-800" },
            CONFIRMED: { label: "Confirmé (Sorti)", color: "bg-purple-100 text-purple-800" },
            POSTED: { label: "Comptabilisé", color: "bg-green-100 text-green-800" },
            CANCELLED: { label: "Annulé", color: "bg-red-100 text-red-800" },
        };
        const badge = badges[status] || badges.DRAFT;
        return <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>{badge.label}</span>;
    };

    const getTypeLabel = (type) => {
        const types = {
            SALE: "Vente",
            CONSUMPTION: "Consommation",
            WASTE: "Casse/Perte",
            RETURN: "Retour",
        };
        return types[type] || type;
    };

    const handleView = async (issue) => {
        try {
            setIsLoading(true);
            const fullData = await getGoodsIssueDetails(issue.id);
            setSelectedIssue(fullData);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error loading issue details:", error);
            alert("Erreur lors du chargement des détails");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = async (issue) => {
        try {
            setIsLoading(true);
            const fullData = await getGoodsIssueDetails(issue.id);
            setSelectedIssue(fullData);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error loading issue details:", error);
            alert("Erreur lors du chargement des détails");
        } finally {
            setIsLoading(false);
        }
    };

    const handleValidate = async (id) => {
        if (window.confirm("Voulez-vous valider ce bon ? Les articles seront RÉSERVÉS dans le stock.")) {
            try {
                await validateGoodsIssue(id);
                loadData();
            } catch (error) {
                console.error("Error validating issue:", error);
                alert("Erreur lors de la validation: " + (error.detail || error.message));
            }
        }
    };

    const handleConfirm = async (id) => {
        if (window.confirm("Confirmer la sortie physique ? Le stock sera réellement DIMINUÉ.")) {
            try {
                await confirmGoodsIssue(id);
                loadData();
            } catch (error) {
                console.error("Error confirming issue:", error);
                alert("Erreur lors de la confirmation: " + (error.detail || error.message));
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Voulez-vous vraiment supprimer ce bon de sortie ?")) {
            try {
                await deleteGoodsIssue(id);
                loadData();
            } catch (error) {
                console.error("Error deleting issue:", error);
                alert("Erreur lors de la suppression: " + (error.detail || error.message));
            }
        }
    };

    const handlePost = async (id) => {
        if (window.confirm("Voulez-vous comptabiliser ce bon ? Cette action génèrera les écritures comptables.")) {
            try {
                await postGoodsIssue(id);
                loadData();
            } catch (error) {
                console.error("Error posting issue:", error);
                alert("Erreur lors de la comptabilisation: " + (error.detail || error.message));
            }
        }
    };

    return (
        <AccountantDashBoard linkList={MaterialAccountingNavLink} requiredRole={"MaterialAccountant"}>
            <AccountantNavBar title="Material Accountant" />
            <div className="mx-auto p-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Bons de Sortie</h1>
                        <p className="text-gray-600 mt-1">Sorties de stock</p>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedIssue(null);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center px-4 py-2 bg-primary-end text-white rounded-lg hover:bg-teal-700 transition-all font-bold"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Nouveau bon de sortie
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
                                <p className="text-2xl font-bold text-gray-800">{issues.length}</p>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-600">Ventes</p>
                                <p className="text-2xl font-bold text-blue-800">
                                    {issues.filter((i) => i.type === "SALE").length}
                                </p>
                            </div>
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <p className="text-sm text-orange-600">Consommations</p>
                                <p className="text-2xl font-bold text-orange-800">
                                    {issues.filter((i) => i.type === "CONSUMPTION").length}
                                </p>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm text-green-600">Comptabilisés</p>
                                <p className="text-2xl font-bold text-green-800">
                                    {issues.filter((i) => i.status === "POSTED").length}
                                </p>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="mb-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Rechercher par n°..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-separate border-spacing-y-2">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 bg-primary-end rounded-l-xl text-left text-sm text-white font-bold">N° Bon</th>
                                        <th className="px-6 py-3 bg-primary-end text-left text-sm text-white font-bold">Date</th>
                                        <th className="px-6 py-3 bg-primary-end text-left text-sm text-white font-bold">Type</th>
                                        <th className="px-6 py-3 bg-primary-end text-left text-sm text-white font-bold">Dépôt</th>
                                        <th className="px-6 py-3 bg-primary-end text-right text-sm text-white font-bold">Montant</th>
                                        <th className="px-6 py-3 bg-primary-end text-center text-sm text-white font-bold">Statut</th>
                                        <th className="px-6 py-3 bg-primary-end rounded-r-xl text-center text-sm text-white font-bold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {issues.map((issue) => (
                                        <tr key={issue.id}>
                                            <td className="px-6 py-4 bg-gray-50 border-l-4 border-primary-end rounded-l-xl">
                                                <span className="font-bold text-gray-900">{issue.number}</span>
                                            </td>
                                            <td className="px-6 py-4 bg-gray-50">
                                                <span className="text-sm text-gray-800">{formatDate(issue.date)}</span>
                                            </td>
                                            <td className="px-6 py-4 bg-gray-50">
                                                <span className="text-sm font-medium text-gray-900">{getTypeLabel(issue.type)}</span>
                                            </td>
                                            <td className="px-6 py-4 bg-gray-50">
                                                <span className="text-sm text-gray-800">{issue.warehouse}</span>
                                            </td>
                                            <td className="px-6 py-4 bg-gray-50 text-right">
                                                <span className="font-bold text-gray-900">{formatCurrency(issue.total_amount)}</span>
                                            </td>
                                            <td className="px-6 py-4 bg-gray-50 text-center">{getStatusBadge(issue.status)}</td>
                                            <td className="px-6 py-4 bg-gray-50 rounded-r-xl">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleView(issue)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="Voir"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </button>
                                                    {issue.status === "DRAFT" && (
                                                        <>
                                                            <button
                                                                onClick={() => handleEdit(issue)}
                                                                className="text-orange-600 hover:text-orange-800"
                                                                title="Modifier"
                                                            >
                                                                <Edit2 className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleValidate(issue.id)}
                                                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                                                                title="Valider et Réserver"
                                                            >
                                                                <CheckCircle className="h-5 w-5" /> Valider
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(issue.id)}
                                                                className="text-red-600 hover:text-red-800"
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {issue.status === "VALIDATED" && (
                                                        <button
                                                            onClick={() => handleConfirm(issue.id)}
                                                            className="text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1"
                                                            title="Confirmer la Sortie Physique"
                                                        >
                                                            <CheckCircle className="h-5 w-5" /> Confirmer Sortie
                                                        </button>
                                                    )}
                                                    {issue.status === "CONFIRMED" && (
                                                        <button
                                                            onClick={() => handlePost(issue.id)}
                                                            className="text-green-600 hover:text-green-800"
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

            <GoodsIssueModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onRefresh={loadData}
                initialData={selectedIssue}
            />
        </AccountantDashBoard>
    );
}
