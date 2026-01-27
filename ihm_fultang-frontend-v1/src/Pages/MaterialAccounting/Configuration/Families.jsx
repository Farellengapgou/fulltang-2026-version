import { useState, useEffect } from "react";
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Layers,
    FolderTree,
} from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { MaterialAccountingNavLink } from "../NavLink.js";
import {
    getFamilies,
    deleteFamily,
} from "../../../Utils/api/materialAccounting.js";

import { FamilyModal } from "../Components/FamilyModal.jsx";

export function Families() {
    const [families, setFamilies] = useState([]);
    const [filteredFamilies, setFilteredFamilies] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingFamily, setEditingFamily] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadFamilies();
    }, []);

    useEffect(() => {
        filterFamilies();
    }, [searchTerm, families]);

    const loadFamilies = async () => {
        try {
            setIsLoading(true);
            const data = await getFamilies();
            console.log("📦 Families data received:", data.results);
            console.log("📊 Categories:", data.results?.map(f => ({ id: f.category?.id, name: f.category?.name })));
            setFamilies(data.results || []);
        } catch (error) {
            console.error("Error loading families:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterFamilies = () => {
        if (!searchTerm) {
            setFilteredFamilies(families);
            return;
        }
        const filtered = families.filter(
            (fam) =>
                fam.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                fam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (fam.category?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredFamilies(filtered);
    };

    const handleEdit = (family) => {
        setEditingFamily(family);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Voulez-vous vraiment supprimer cette famille ?")) {
            try {
                await deleteFamily(id);
                loadFamilies();
            } catch (error) {
                console.error("Error deleting family:", error);
            }
        }
    };

    if (isLoading) {
        return (
            <AccountantDashBoard
                linkList={MaterialAccountingNavLink}
                requiredRole={"MaterialAccountant"}
            >
                <AccountantNavBar title="Material Accountant" />
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
            <AccountantNavBar title="Material Accountant" />
            <div className="mx-auto p-12">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Familles d'Articles
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Gestion des sous-catégories pour une classification fine
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingFamily(null);
                            setShowModal(true);
                        }}
                        className="flex items-center px-4 py-2 bg-primary-end text-white rounded-lg hover:bg-teal-700 transition-all duration-300"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Nouvelle famille
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Familles</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">
                                    {families.length}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <FolderTree className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Familles Actives</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">
                                    {families.filter((c) => c.is_active).length}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Layers className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        {/* Placeholder or other stats */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Catégories Parentes</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">
                                    {new Set(families.map(f => f.category?.id)).size}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Layers className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Rechercher par code, nom ou catégorie..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none"
                        />
                    </div>
                </div>

                {/* Table */}
                {filteredFamilies.length > 0 ? (
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
                                        Catégorie
                                    </th>
                                    <th className="px-6 py-3 bg-primary-end text-left text-sm text-white font-bold uppercase">
                                        Description
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
                                {filteredFamilies.map((family) => (
                                    <tr key={family.id}>
                                        <td className="px-6 py-4 bg-gray-50 border-l-4 border-primary-end rounded-l-xl">
                                            <span className="font-bold text-gray-900">
                                                {family.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50">
                                            <span className="font-medium text-gray-900">
                                                {family.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {family.category?.name || "Non défini"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50">
                                            <span className="text-sm text-gray-600">
                                                {family.description || "-"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 text-center">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${family.is_active
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {family.is_active ? "Actif" : "Inactif"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 rounded-r-xl">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => handleEdit(family)}
                                                    className="text-green-600 hover:text-green-800 transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Edit2 className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(family.id)}
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
                        <FolderTree className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            Aucune famille trouvée
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Créez votre première famille pour commencer
                        </p>
                        <button
                            onClick={() => {
                                setEditingFamily(null);
                                setShowModal(true);
                            }}
                            className="px-4 py-2 bg-primary-end text-white rounded-lg hover:bg-teal-700 transition-all"
                        >
                            Créer une famille
                        </button>
                    </div>
                )}
            </div>

            <FamilyModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onRefresh={loadFamilies}
                editingFamily={editingFamily}
            />
        </AccountantDashBoard>
    );
}
