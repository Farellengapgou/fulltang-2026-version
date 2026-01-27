import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Play, CheckCircle, RefreshCcw, Plus, X } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { MaterialAccountingNavLink } from "../NavLink.js";
import {
    apiCall,
    getInventoryLines,
    updateInventoryLine,
    initializeInventory,
    startCountingInventory,
    validateInventory,
    getArticles
} from "../../../Utils/api/materialAccounting.js";
import { ErrorModal } from "../../Modals/ErrorModal.jsx";
import { SuccessModal } from "../../Modals/SuccessModal.jsx";

const STATUS_MAP = {
    PLANNED: { label: "Planifié", color: "text-blue-700 bg-blue-50" },
    IN_PROGRESS: { label: "Planifié", color: "text-blue-600 bg-blue-100" },
    COMPLETED: { label: "Terminé", color: "text-purple-600 bg-purple-100" },
    VALIDATED: { label: "Terminé", color: "text-purple-600 bg-purple-100" },
    POSTED: { label: "Terminé", color: "text-purple-700 bg-purple-200" },
    CANCELLED: { label: "Annulé", color: "text-red-600 bg-red-100" },
};

export function InventoryDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [inventory, setInventory] = useState(null);
    const [lines, setLines] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [savedLines, setSavedLines] = useState({});
    const [canOpenSuccessModal, setCanOpenSuccessModal] = useState(false);
    const [canOpenErrorModal, setCanOpenErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Add Line Modal State
    const [isAddLineModalOpen, setIsAddLineModalOpen] = useState(false);
    const [articles, setArticles] = useState([]);
    const [newLineData, setNewLineData] = useState({ article: "", theoretical_quantity: 0 });

    useEffect(() => {
        loadData();
        loadArticles();
    }, [id]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const data = await apiCall(`/inventories/${id}/?t=${Date.now()}`); // Added cache busting
            console.log("Inventory 상세 (Detail) loaded:", data);
            setInventory(data);

            const linesData = await getInventoryLines(id);
            setLines(linesData.results || []);
        } catch (error) {
            console.error("Error loading inventory details:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadArticles = async () => {
        try {
            const data = await getArticles();
            setArticles(data.results || []);
        } catch (error) {
            console.error("Error loading articles:", error);
        }
    };

    const handleAction = async (actionFn, successMsg) => {
        try {
            setIsActionLoading(true);
            await actionFn(id);
            setSuccessMessage(successMsg);
            loadData();
            setCanOpenSuccessModal(true);
        } catch (error) {
            setErrorMessage(`Erreur : ${error.detail || error.message || JSON.stringify(error)}`);
            setCanOpenErrorModal(true);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleQuantityChange = (lineId, value) => {
        setLines(lines.map(l => l.id === lineId ? { ...l, physical_quantity: value } : l));
    };

    const saveLine = async (lineId, quantity) => {
        try {
            await updateInventoryLine(id, lineId, { physical_quantity: quantity });
            setSavedLines(prev => ({ ...prev, [lineId]: true }));
            setTimeout(() => {
                setSavedLines(prev => ({ ...prev, [lineId]: false }));
            }, 2000);
        } catch (error) {
            setErrorMessage("Erreur lors de la sauvegarde de la ligne");
            setCanOpenErrorModal(true);
        }
    };

    const handleAddLineSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsActionLoading(true);
            await apiCall(`/inventories/${id}/lines/`, {
                method: 'POST',
                body: JSON.stringify(newLineData)
            });
            alert("Ligne ajoutée avec succès");
            setIsAddLineModalOpen(false);
            setNewLineData({ article: "", theoretical_quantity: 0 });
            loadData();
        } catch (error) {
            alert(`Erreur lors de l'ajout: ${error.detail || error.message}`);
        } finally {
            setIsActionLoading(false);
        }
    };

    if (isLoading) {
        return (
            <AccountantDashBoard linkList={MaterialAccountingNavLink} requiredRole={"MaterialAccountant"}>
                <AccountantNavBar title="Material Accountant" />
                <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
            </AccountantDashBoard>
        );
    }

    if (!inventory) return (
        <AccountantDashBoard linkList={MaterialAccountingNavLink} requiredRole={"MaterialAccountant"}>
            <AccountantNavBar title="Material Accountant" />
            <div className="p-12 text-center text-red-500 font-bold">Inventaire non trouvé</div>
        </AccountantDashBoard>
    );

    return (
        <AccountantDashBoard linkList={MaterialAccountingNavLink} requiredRole={"MaterialAccountant"}>
            <AccountantNavBar title="Material Accountant" />
            <div className="mx-auto p-12">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-teal-600 hover:text-teal-800 mb-6 font-bold transition-all"
                >
                    <ArrowLeft className="h-5 w-5 mr-1" /> Retour à la liste
                </button>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row mb-8">
                    <div className="p-8 flex-1">
                        <div className="flex items-center gap-4 mb-2">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Inventaire {inventory.number}</h1>
                            <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${STATUS_MAP[inventory.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                                {STATUS_MAP[inventory.status]?.label || inventory.status}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Dépôt</p>
                                <p className="text-sm font-black text-gray-800">{inventory.warehouse || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Type</p>
                                <p className="text-sm font-black text-gray-800">{inventory.inventory_type}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Date</p>
                                <p className="text-sm font-black text-gray-800">{new Date(inventory.date).toLocaleDateString('fr-FR')}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Articles</p>
                                <p className="text-sm font-black text-gray-800">{lines.length} articles</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-8 border-t md:border-t-0 md:border-l border-gray-100 flex flex-col justify-center gap-4 min-w-[250px]">
                        {(inventory.status === 'PLANNED' || inventory.status === 'IN_PROGRESS') && (
                            <button
                                onClick={() => setIsAddLineModalOpen(true)}
                                className="w-full flex items-center justify-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm"
                            >
                                <Plus className="h-5 w-5 mr-2" /> Ajouter un article
                            </button>
                        )}
                        {inventory.status === 'PLANNED' && lines.length === 0 && (
                            <button
                                onClick={() => handleAction(initializeInventory, "Inventaire initialisé avec succès")}
                                disabled={isActionLoading}
                                className="w-full flex items-center justify-center px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg disabled:opacity-50"
                            >
                                <RefreshCcw className="h-5 w-5 mr-2" /> Initialiser les lignes
                            </button>
                        )}
                        {inventory.status === 'PLANNED' && lines.length > 0 && (
                            <button
                                onClick={() => handleAction(startCountingInventory, "Comptage démarré")}
                                disabled={isActionLoading}
                                className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50"
                            >
                                <Play className="h-5 w-5 mr-2" /> Démarrer le comptage
                            </button>
                        )}
                        {inventory.status === 'IN_PROGRESS' && (
                            <button
                                onClick={() => handleAction(validateInventory, "Inventaire validé et stock mis à jour")}
                                disabled={isActionLoading}
                                className="w-full flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg disabled:opacity-50"
                            >
                                <CheckCircle className="h-5 w-5 mr-2" /> Valider l'inventaire
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Lignes d'inventaire</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-gray-50/80">
                                    <th className="px-6 py-4 text-left text-[10px] uppercase font-black text-gray-500 tracking-widest border-b">Article</th>
                                    <th className="px-6 py-4 text-center text-[10px] uppercase font-black text-gray-500 tracking-widest border-b">Théorique</th>
                                    <th className="px-6 py-4 text-center text-[10px] uppercase font-black text-gray-500 tracking-widest border-b">Physique</th>
                                    <th className="px-6 py-4 text-center text-[10px] uppercase font-black text-gray-500 tracking-widest border-b">Écart</th>
                                    <th className="px-6 py-4 text-center text-[10px] uppercase font-black text-gray-500 tracking-widest border-b">Valeur Écart</th>
                                    <th className="px-6 py-4 text-right text-[10px] uppercase font-black text-gray-500 tracking-widest border-b">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lines.map(line => (
                                    <tr key={line.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 border-b border-gray-50">
                                            <p className="font-bold text-gray-900">{line.article_name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-tighter font-medium">{line.article_code}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center border-b border-gray-50 font-bold text-gray-600">
                                            {line.theoretical_quantity}
                                        </td>
                                        <td className="px-6 py-4 text-center border-b border-gray-50">
                                            <input
                                                type="number"
                                                disabled={inventory.status !== 'IN_PROGRESS'}
                                                value={line.physical_quantity}
                                                onChange={(e) => handleQuantityChange(line.id, e.target.value)}
                                                className="w-24 p-2 bg-white border border-gray-200 rounded-lg text-center font-bold text-gray-900 focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-gray-100"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-center border-b border-gray-50">
                                            <span className={`font-bold ${(parseFloat(line.physical_quantity || 0) - parseFloat(line.theoretical_quantity || 0)) < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                {(parseFloat(line.physical_quantity || 0) - parseFloat(line.theoretical_quantity || 0)).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center border-b border-gray-50">
                                            <span className={`font-bold ${(parseFloat(line.physical_quantity || 0) - parseFloat(line.theoretical_quantity || 0)) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {((parseFloat(line.physical_quantity || 0) - parseFloat(line.theoretical_quantity || 0)) * parseFloat(line.article_pmp || 0)).toLocaleString('fr-FR')} FCFA
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right border-b border-gray-50">
                                            {inventory.status === 'IN_PROGRESS' && (
                                                <button
                                                    onClick={() => saveLine(line.id, line.physical_quantity)}
                                                    className={`p-2 rounded-lg transition-all ${savedLines[line.id] ? 'bg-green-100 text-green-600' : 'text-teal-600 hover:bg-teal-50'}`}
                                                    title="Enregistrer"
                                                >
                                                    {savedLines[line.id] ? <CheckCircle className="h-5 w-5" /> : <Save className="h-5 w-5" />}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {lines.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic font-medium">
                                            Aucune ligne générée. Utilisez le bouton "Initialiser" pour charger les stocks existants ou "Ajouter un article" pour ajouter manuellement.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
{/* <<<<<<< HEAD
            <SuccessModal isOpen={canOpenSuccessModal} canOpenSuccessModal={setCanOpenSuccessModal} message={successMessage} />
            <ErrorModal isOpen={canOpenErrorModal} onCloseErrorModal={setCanOpenErrorModal} message={errorMessage} />
======= */}

            {/* Add Line Modal */}
            {isAddLineModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-teal-600 text-white">
                            <h3 className="font-bold text-lg">Ajouter une ligne</h3>
                            <button onClick={() => setIsAddLineModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full"><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleAddLineSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Article</label>
                                <select
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                    value={newLineData.article}
                                    onChange={(e) => setNewLineData({ ...newLineData, article: e.target.value })}
                                >
                                    <option value="">Sélectionner un article</option>
                                    {articles.map(a => <option key={a.id} value={a.id}>{a.name} ({a.code})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Quantité Théorique (Info)</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                    value={newLineData.theoretical_quantity}
                                    onChange={(e) => setNewLineData({ ...newLineData, theoretical_quantity: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-1">La quantité théorique sert de base de comparaison.</p>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsAddLineModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg font-bold text-gray-600"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isActionLoading}
                                    className="px-6 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 disabled:opacity-50"
                                >
                                    Ajouter
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
{/* >>>>>>> origin/feature/comptaMinv */}
        </AccountantDashBoard>
    );
}
