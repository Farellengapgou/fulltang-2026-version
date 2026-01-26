import { useState, useEffect } from "react";
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Truck,
    DollarSign,
    Calendar,
} from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { MaterialAccountingNavLink } from "../NavLink.js";
import {
    getSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
} from "../../../Utils/api/materialAccounting.js";
import { ErrorModal } from "../../Modals/ErrorModal.jsx";
import { ConfirmationModal } from "../../Modals/ConfirmAction.Modal.jsx";
import { SuccessModal } from "../../Modals/SuccessModal.jsx";
import { SupplierModal } from "../Components/SupplierModal.jsx";

export function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [filteredSuppliers, setFilteredSuppliers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: null
    });
    const [canOpenSuccessModal, setCanOpenSuccessModal] = useState(false);
    const [canOpenErrorModal, setCanOpenErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState(""); 
    const [successMessage, setSuccessMessage] = useState("");

    const supplierTypes = {
        PHARMA: "Pharmaceutique",
        EQUIPMENT: "Équipement médical",
        CONSUMABLE: "Consommables",
        SERVICE: "Services",
    };

    useEffect(() => {
        loadSuppliers();
    }, []);

    useEffect(() => {
        filterSuppliers();
    }, [searchTerm, typeFilter, suppliers]);

    const loadSuppliers = async () => {
        try {
            setIsLoading(true);
            const data = await getSuppliers();
            setSuppliers(data.results || []);
        } catch (error) {
            console.error("Error loading suppliers:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterSuppliers = () => {
        let filtered = suppliers;

        if (searchTerm) {
            filtered = filtered.filter(
                (sup) =>
                    sup.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    sup.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (typeFilter) {
            filtered = filtered.filter((sup) => sup.supplier_type === typeFilter);
        }

        setFilteredSuppliers(filtered);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "XAF",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        setConfirmModal({
            isOpen: true,
            title: "Supprimer le fournisseur",
            message: "Voulez-vous vraiment supprimer ce fournisseur ? Cette action est irréversible.",
            onConfirm: async () => {
                try {
                    await deleteSupplier(id);
                    loadSuppliers();
                    setSuccessMessage("Fournisseur supprimé avec succès");
                    setCanOpenSuccessModal(true);
                } catch (error) {
                    console.error("Error deleting supplier:", error);
                    setErrorMessage("Erreur lors de la suppression du fournisseur: " + (error.detail || error.message));
                    setCanOpenErrorModal(true);
                }
            }
        });
    };

    if (isLoading) {
        return (
            <AccountantDashBoard
                linkList={MaterialAccountingNavLink}
                requiredRole={"MaterialAccountant"}
            >
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
        <AccountantDashBoard
            linkList={MaterialAccountingNavLink}
            requiredRole={"MaterialAccountant"}
        >
            <AccountantNavBar />
            <div className="mx-auto p-12">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Fournisseurs</h1>
                        <p className="text-gray-600 mt-1">
                            Gestion des fournisseurs et partenaires
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingSupplier(null);
                            setShowModal(true);
                        }}
                        className="flex items-center px-4 py-2 bg-primary-end text-white rounded-lg hover:bg-teal-700 transition-all duration-300"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Nouveau fournisseur
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Fournisseurs</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">
                                    {suppliers.length}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Truck className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Achats</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">
                                    {formatCurrency(
                                        suppliers.reduce(
                                            (sum, s) => sum + (s.total_purchases || 0),
                                            0
                                        )
                                    )}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Fournisseurs Actifs</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">
                                    {suppliers.filter((s) => s.is_active).length}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Calendar className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Rechercher par code ou nom..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none"
                        />
                    </div>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none"
                    >
                        <option value="">Tous les types</option>
                        {Object.entries(supplierTypes).map(([key, value]) => (
                            <option key={key} value={key}>
                                {value}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                {filteredSuppliers.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-separate border-spacing-y-2">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 bg-primary-end rounded-l-xl text-left text-sm text-white font-bold uppercase">
                                        Code
                                    </th>
                                    <th className="px-6 py-3 bg-primary-end text-left text-sm text-white font-bold uppercase">
                                        Nom
                                    </th>
                                    <th className="px-6 py-3 bg-primary-end text-left text-sm text-white font-bold uppercase">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 bg-primary-end text-left text-sm text-white font-bold uppercase">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 bg-primary-end text-right text-sm text-white font-bold uppercase">
                                        Total Achats
                                    </th>
                                    <th className="px-6 py-3 bg-primary-end text-center text-sm text-white font-bold uppercase">
                                        Dernier Achat
                                    </th>
                                    <th className="px-6 py-3 bg-primary-end text-center text-sm text-white font-bold uppercase">
                                        Statut
                                    </th>
                                    <th className="px-6 py-3 bg-primary-end rounded-r-xl text-center text-sm text-white font-bold uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSuppliers.map((supplier) => (
                                    <tr key={supplier.id}>
                                        <td className="px-6 py-4 bg-gray-50 border-l-4 border-primary-end rounded-l-xl">
                                            <span className="font-bold text-gray-900">
                                                {supplier.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {supplier.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {supplier.city}, {supplier.country}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50">
                                            <span className="text-sm text-gray-600">
                                                {supplierTypes[supplier.supplier_type] ||
                                                    supplier.supplier_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50">
                                            <div className="text-sm">
                                                <p className="text-gray-800">{supplier.phone}</p>
                                                <p className="text-gray-500">{supplier.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 text-right">
                                            <span className="font-bold text-gray-800">
                                                {formatCurrency(supplier.total_purchases || 0)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 text-center">
                                            <span className="text-sm text-gray-600">
                                                {supplier.last_purchase_date
                                                    ? formatDate(supplier.last_purchase_date)
                                                    : "-"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 text-center">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${supplier.is_active
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {supplier.is_active ? "Actif" : "Inactif"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 rounded-r-xl">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => handleEdit(supplier)}
                                                    className="text-green-600 hover:text-green-800 transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Edit2 className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(supplier.id)}
                                                    className="text-red-600 hover:text-red-800 transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            Aucun fournisseur trouvé
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Créez votre premier fournisseur pour commencer
                        </p>
                        <button
                            onClick={() => {
                                setEditingSupplier(null);
                                setShowModal(true);
                            }}
                            className="px-4 py-2 bg-primary-end text-white rounded-lg hover:bg-teal-700 transition-all"
                        >
                            Créer un fournisseur
                        </button>
                    </div>
                )}
            </div>

            <SupplierModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onRefresh={loadSuppliers}
                editingSupplier={editingSupplier}
            />
            <ErrorModal isOpen={canOpenErrorModal} onCloseErrorModal={setCanOpenErrorModal} message={errorMessage} />
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
            />
            <SuccessModal 
                isOpen={canOpenSuccessModal} 
                canOpenSuccessModal={setCanOpenSuccessModal} 
                message={successMessage} 
            />
        </AccountantDashBoard>
    );
}
