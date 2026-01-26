import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Play, CheckCircle, RefreshCcw } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { MaterialAccountingNavLink } from "../NavLink.js";
import {
    apiCall,
    getInventoryLines,
    updateInventoryLine,
    initializeInventory,
    startCountingInventory,
    validateInventory
} from "../../../Utils/api/materialAccounting.js";

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
    const [savedLines, setSavedLines] = useState({}); // Tracking saved state for feedback

    useEffect(() => {
        loadData();
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

    const handleAction = async (actionFn, successMsg) => {
        try {
            setIsActionLoading(true);
            await actionFn(id);
            alert(successMsg);
            loadData();
        } catch (error) {
            alert(`Erreur : ${error.detail || error.message || JSON.stringify(error)}`);
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
            alert("Erreur lors de la sauvegarde de la ligne");
        }
    };

    if (isLoading) {
        return (
            <AccountantDashBoard linkList={MaterialAccountingNavLink} requiredRole={"MaterialAccountant"}>
                <AccountantNavBar />
                <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
            </AccountantDashBoard>
        );
    }

    if (!inventory) return (
        <AccountantDashBoard linkList={MaterialAccountingNavLink} requiredRole={"MaterialAccountant"}>
            <AccountantNavBar />
            <div className="p-12 text-center text-red-500 font-bold">Inventaire non trouvé</div>
        </AccountantDashBoard>
    );

    return (
        <AccountantDashBoard linkList={MaterialAccountingNavLink} requiredRole={"MaterialAccountant"}>
            <AccountantNavBar />
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
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic font-medium">
                                            Aucune ligne générée. Veuillez initialiser l'inventaire.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AccountantDashBoard>
    );
}
