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
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../../../Utils/api/materialAccounting.js";

import { CategoryModal } from "../Components/CategoryModal.jsx";

export function Categories() {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        filterCategories();
    }, [searchTerm, categories]);

    const loadCategories = async () => {
        try {
            setIsLoading(true);
            const data = await getCategories();
            setCategories(data.results || []);
        } catch (error) {
            console.error("Error loading categories:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterCategories = () => {
        if (!searchTerm) {
            setFilteredCategories(categories);
            return;
        }
        const filtered = categories.filter(
            (cat) =>
                cat.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cat.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCategories(filtered);
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Voulez-vous vraiment supprimer cette catégorie ?")) {
            try {
                await deleteCategory(id);
                loadCategories();
            } catch (error) {
                console.error("Error deleting category:", error);
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
                            Catégories d'Articles
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Gestion des catégories pour la classification des articles
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingCategory(null);
                            setShowModal(true);
                        }}
                        className="flex items-center px-4 py-2 bg-primary-end text-white rounded-lg hover:bg-teal-700 transition-all duration-300"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Nouvelle catégorie
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Catégories</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">
                                    {categories.length}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Layers className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Catégories Actives</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">
                                    {categories.filter((c) => c.is_active).length}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <FolderTree className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Articles</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">
                                    {categories.reduce((sum, c) => sum + (c.article_count || 0), 0)}
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
                            placeholder="Rechercher par code ou nom..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none"
                        />
                    </div>
                </div>

                {/* Table */}
                {filteredCategories.length > 0 ? (
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
                                        Description
                                    </th>
                                    <th className="px-6 py-3 bg-primary-end text-center text-sm text-white font-bold uppercase">
                                        Articles
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
                                {filteredCategories.map((category) => (
                                    <tr key={category.id}>
                                        <td className="px-6 py-4 bg-gray-50 border-l-4 border-primary-end rounded-l-xl">
                                            <span className="font-bold text-gray-900">
                                                {category.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50">
                                            <span className="font-medium text-gray-900">
                                                {category.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50">
                                            <span className="text-sm text-gray-600">
                                                {category.description || "-"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 text-center">
                                            <span className="text-sm font-medium text-gray-800">
                                                {category.article_count || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 text-center">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${category.is_active
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {category.is_active ? "Actif" : "Inactif"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 rounded-r-xl">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => handleEdit(category)}
                                                    className="text-green-600 hover:text-green-800 transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Edit2 className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
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
                        <Layers className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            Aucune catégorie trouvée
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Créez votre première catégorie pour commencer
                        </p>
                        <button
                            onClick={() => {
                                setEditingCategory(null);
                                setShowModal(true);
                            }}
                            className="px-4 py-2 bg-primary-end text-white rounded-lg hover:bg-teal-700 transition-all"
                        >
                            Créer une catégorie
                        </button>
                    </div>
                )}
            </div>

            <CategoryModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onRefresh={loadCategories}
                editingCategory={editingCategory}
            />
        </AccountantDashBoard>
    );
}
