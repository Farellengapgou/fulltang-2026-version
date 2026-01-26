import { useState, useEffect } from "react";
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Warehouse,
    DollarSign,
    Package,
} from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { MaterialAccountingNavLink } from "../NavLink.js";
import {
    getWarehouses,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
} from "../../../Utils/api/materialAccounting.js";

import { WarehouseModal } from "../Components/WarehouseModal.jsx";

export function Warehouses() {
    const [warehouses, setWarehouses] = useState([]);
    const [filteredWarehouses, setFilteredWarehouses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const warehouseTypes = {
        PHARMACY: "Pharmacie",
        CENTRAL: "Magasin central",
        OPERATING_ROOM: "Bloc opératoire",
        LABORATORY: "Laboratoire",
        EMERGENCY: "Urgences",
        WARD: "Service hospitalisation",
    };

    useEffect(() => {
        loadWarehouses();
    }, []);

    useEffect(() => {
        filterWarehouses();
    }, [searchTerm, typeFilter, warehouses]);

    const loadWarehouses = async () => {
        try {
            setIsLoading(true);
            const data = await getWarehouses();
            setWarehouses(data.results || []);
        } catch (error) {
            console.error("Error loading warehouses:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterWarehouses = () => {
        let filtered = warehouses;

        if (searchTerm) {
            filtered = filtered.filter(
                (wh) =>
                    wh.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    wh.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (typeFilter) {
            filtered = filtered.filter((wh) => wh.warehouse_type === typeFilter);
        }

        setFilteredWarehouses(filtered);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "XAF",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleEdit = (warehouse) => {
        setEditingWarehouse(warehouse);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Voulez-vous vraiment supprimer ce dépôt ?")) {
            try {
                await deleteWarehouse(id);
                loadWarehouses();
            } catch (error) {
                console.error("Error deleting warehouse:", error);
            }
        }
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
                        <h1 className="text-2xl font-bold text-gray-800">
                            Dépôts & Magasins
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Gestion des lieux de stockage
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingWarehouse(null);
                            setShowModal(true);
                        }}
                        className="flex items-center px-4 py-2 bg-primary-end text-white rounded-lg hover:bg-teal-700 transition-all duration-300"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Nouveau dépôt
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Dépôts</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">
                                    {warehouses.length}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Warehouse className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Valeur Totale</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">
                                    {formatCurrency(
                                        warehouses.reduce((sum, w) => sum + (w.total_value || 0), 0)
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
                                <p className="text-sm text-gray-600">Total Articles</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">
                                    {warehouses.reduce((sum, w) => sum + (w.article_count || 0), 0)}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Package className="h-6 w-6 text-purple-600" />
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
                        {Object.entries(warehouseTypes).map(([key, value]) => (
                            <option key={key} value={key}>
                                {value}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                {filteredWarehouses.length > 0 ? (
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
                                        Localisation
                                    </th>
                                    <th className="px-6 py-3 bg-primary-end text-right text-sm text-white font-bold uppercase">
                                        Valeur Stock
                                    </th>
                                    <th className="px-6 py-3 bg-primary-end text-center text-sm text-white font-bold uppercase">
                                        Articles
                                    </th>
                                    <th className="px-6 py-3 bg-primary-end rounded-r-xl text-center text-sm text-white font-bold uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredWarehouses.map((warehouse) => (
                                    <tr key={warehouse.id}>
                                        <td className="px-6 py-4 bg-gray-50 border-l-4 border-primary-end rounded-l-xl">
                                            <div>
                                                <span className="font-bold text-gray-900">
                                                    {warehouse.code}
                                                </span>
                                                {warehouse.is_main_warehouse && (
                                                    <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                                        Principal
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50">
                                            <span className="font-medium text-gray-900">
                                                {warehouse.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50">
                                            <span className="text-sm text-gray-600">
                                                {warehouseTypes[warehouse.warehouse_type] ||
                                                    warehouse.warehouse_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50">
                                            <span className="text-sm text-gray-600">
                                                {warehouse.location || "-"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 text-right">
                                            <span className="font-bold text-gray-800">
                                                {formatCurrency(warehouse.total_value || 0)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 text-center">
                                            <span className="text-sm font-medium text-gray-800">
                                                {warehouse.article_count || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 rounded-r-xl">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => handleEdit(warehouse)}
                                                    className="text-green-600 hover:text-green-800 transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Edit2 className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(warehouse.id)}
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
                        <Warehouse className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            Aucun dépôt trouvé
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Créez votre premier dépôt pour commencer
                        </p>
                        <button
                            onClick={() => {
                                setEditingWarehouse(null);
                                setShowModal(true);
                            }}
                            className="px-4 py-2 bg-primary-end text-white rounded-lg hover:bg-teal-700 transition-all"
                        >
                            Créer un dépôt
                        </button>
                    </div>
                )}
            </div>

            <WarehouseModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onRefresh={loadWarehouses}
                editingWarehouse={editingWarehouse}
            />
        </AccountantDashBoard>
    );
}
