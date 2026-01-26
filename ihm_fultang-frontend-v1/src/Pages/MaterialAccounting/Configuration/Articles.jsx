import { useState, useEffect } from "react";
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Package,
    TrendingUp,
    AlertCircle,
} from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { MaterialAccountingNavLink } from "../NavLink.js";
import {
    getArticles,
    deleteArticle,
} from "../../../Utils/api/materialAccounting.js";
import { ErrorModal } from "../../Modals/ErrorModal.jsx";
import { ArticleModal } from "../Components/ArticleModal.jsx";

export function Articles() {
    const [articles, setArticles] = useState([]);
    const [filteredArticles, setFilteredArticles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [canOpenErrorModal, setCanOpenErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        loadArticles();
    }, []);

    useEffect(() => {
        filterArticles();
    }, [searchTerm, typeFilter, articles]);

    const loadArticles = async () => {
        try {
            setIsLoading(true);
            const data = await getArticles();
            setArticles(data.results || []);
        } catch (error) {
            console.error("Error loading articles:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterArticles = () => {
        let filtered = articles;

        if (searchTerm) {
            filtered = filtered.filter(
                (art) =>
                    art.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    art.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (typeFilter) {
            filtered = filtered.filter((art) => art.article_type === typeFilter);
        }

        setFilteredArticles(filtered);
    };

    const handleEdit = (article) => {
        setEditingArticle(article);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Voulez-vous vraiment supprimer cet article ?")) {
            try {
                await deleteArticle(id);
                loadArticles();
            } catch (error) {
                console.error("Error deleting article:", error);
                setErrorMessage("Erreur lors de la suppression de l'article");
                setCanOpenErrorModal(true);
            }
        }
    };

    const getUnitLabel = (unit) => {
        const units = {
            UNIT: "Unité",
            BOX: "Boîte",
            BOTTLE: "Flacon",
            VIAL: "Ampoule",
            STRIP: "Plaquette",
            KG: "Kg",
            LITER: "Litre",
            METER: "Mètre",
            PACK: "Paquet"
        };
        return units[unit] || unit;
    };

    const getArticleTypeBadge = (type) => {
        const badges = {
            DRUG: { label: "Médicament", color: "bg-blue-100 text-blue-800" },
            CONSUMABLE: { label: "Consommable", color: "bg-green-100 text-green-800" },
            EQUIPMENT: { label: "Équipement", color: "bg-purple-100 text-purple-800" },
            REAGENT: { label: "Réactif", color: "bg-orange-100 text-orange-800" },
            SUPPLY: { label: "Fourniture", color: "bg-gray-100 text-gray-800" },
        };
        const badge = badges[type] || badges.SUPPLY;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                {badge.label}
            </span>
        );
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
                            Articles
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Gestion du catalogue des articles
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingArticle(null);
                            setShowModal(true);
                        }}
                        className="flex items-center px-4 py-2 bg-primary-end text-white rounded-lg hover:bg-teal-700 transition-all duration-300 font-bold"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Nouvel article
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Articles</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">
                                    {articles.length}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Package className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Articles Actifs</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">
                                    {articles.filter((a) => a.is_active).length}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Périssables</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">
                                    {articles.filter((a) => a.is_perishable).length}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <AlertCircle className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Médicaments</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">
                                    {articles.filter((a) => a.article_type === "DRUG").length}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Package className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-4 mb-6">
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
                        <option value="DRUG">Médicaments</option>
                        <option value="CONSUMABLE">Consommables</option>
                        <option value="EQUIPMENT">Équipements</option>
                        <option value="REAGENT">Réactifs</option>
                        <option value="SUPPLY">Fournitures</option>
                    </select>
                </div>

                {/* Table */}
                {filteredArticles.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-separate border-spacing-y-2">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 bg-primary-end rounded-l-xl text-left text-sm text-white font-bold">
                                        Code
                                    </th>
                                    <th className="px-6 py-3 bg-primary-end text-left text-sm text-white font-bold">
                                        Nom
                                    </th>
                                    <th className="px-6 py-3 bg-primary-end text-left text-sm text-white font-bold">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 bg-primary-end text-left text-sm text-white font-bold">
                                        Catégorie
                                    </th>
                                    <th className="px-6 py-3 bg-primary-end text-center text-sm text-white font-bold">
                                        Unité
                                    </th>
                                    <th className="px-6 py-3 bg-primary-end text-center text-sm text-white font-bold">
                                        Stock Min.
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
                                {filteredArticles.map((article) => (
                                    <tr key={article.id}>
                                        <td className="px-6 py-4 bg-gray-50 border-l-4 border-primary-end rounded-l-xl">
                                            <span className="font-bold text-gray-900">
                                                {article.code}
                                            </span>
                                            {article.is_perishable && (
                                                <span className="ml-2 text-orange-500" title="Périssable">
                                                    <AlertCircle className="h-4 w-4 inline" />
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50">
                                            <span className="font-medium text-gray-900">
                                                {article.name}
                                            </span>
                                            {article.description && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {article.description.substring(0, 50)}
                                                    {article.description.length > 50 && "..."}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50">
                                            {getArticleTypeBadge(article.article_type)}
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50">
                                            <span className="text-sm text-gray-800">
                                                {article.category?.name || "-"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 text-center">
                                            <span className="text-sm text-gray-800">
                                                {getUnitLabel(article.unit)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 text-center">
                                            <span className="text-sm font-medium text-gray-800">
                                                {article.minimum_stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 text-center">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${article.is_active
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {article.is_active ? "Actif" : "Inactif"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 rounded-r-xl">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => handleEdit(article)}
                                                    className="text-green-600 hover:text-green-800 transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Edit2 className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(article.id)}
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
                        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            Aucun article trouvé
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Créez votre premier article pour commencer
                        </p>
                        <button
                            onClick={() => {
                                setEditingArticle(null);
                                setShowModal(true);
                            }}
                            className="px-4 py-2 bg-primary-end text-white rounded-lg hover:bg-teal-700 transition-all font-bold"
                        >
                            Créer un article
                        </button>
                    </div>
                )}
            </div>

            <ArticleModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingArticle(null);
                }}
                onRefresh={loadArticles}
                editingArticle={editingArticle}
            />
            <ErrorModal isOpen={canOpenErrorModal} onCloseErrorModal={setCanOpenErrorModal} message={errorMessage} />
        </AccountantDashBoard>
    );
}
