import { useState, useEffect } from "react";
import { X, Plus, Trash2, Save } from "lucide-react";
import { getWarehouses, getStockLevels, createGoodsIssue } from "../../../Utils/api/materialAccounting.js";

export function GoodsIssueModal({ isOpen, onClose, onRefresh }) {
    const [warehouses, setWarehouses] = useState([]);
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        type: "SALE",
        warehouse: "",
        date: new Date().toISOString().split('T')[0],
        lines: [{ article: "", quantity: 1 }]
    });

    useEffect(() => {
        if (isOpen) {
            loadMetaData();
        }
    }, [isOpen]);

    const loadMetaData = async () => {
        try {
            const [wData, aData] = await Promise.all([
                getWarehouses(),
                getStockLevels()
            ]);
            setWarehouses(wData.results || []);
            setArticles(aData.results || []);
        } catch (error) {
            console.error("Error loading metadata:", error);
        }
    };

    const handleAddLine = () => {
        setFormData({
            ...formData,
            lines: [...formData.lines, { article: "", quantity: 1 }]
        });
    };

    const handleRemoveLine = (index) => {
        const newLines = formData.lines.filter((_, i) => i !== index);
        setFormData({ ...formData, lines: newLines });
    };

    const handleLineChange = (index, field, value) => {
        const newLines = [...formData.lines];
        newLines[index][field] = value;
        setFormData({ ...formData, lines: newLines });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await createGoodsIssue(formData);
            onRefresh();
            onClose();
        } catch (error) {
            alert("Erreur lors de la création du bon de sortie");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-red-600 text-white">
                    <h2 className="text-xl font-bold italic">Nouveau Bon de Sortie</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Type de sortie</label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                            >
                                <option value="SALE">Vente</option>
                                <option value="CONSUMPTION">Consommation interne</option>
                                <option value="WASTE">Casse / Perte / Périmé</option>
                                <option value="RETURN">Retour fournisseur</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Dépôt source</label>
                            <select
                                required
                                value={formData.warehouse}
                                onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                            >
                                <option value="">Sélectionner un dépôt</option>
                                {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Date</label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h3 className="font-bold text-gray-800">Articles à sortir</h3>
                            <button
                                type="button"
                                onClick={handleAddLine}
                                className="flex items-center text-sm font-bold text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg"
                            >
                                <Plus className="h-4 w-4 mr-1" /> Ajouter une ligne
                            </button>
                        </div>

                        {formData.lines.map((line, index) => (
                            <div key={index} className="grid grid-cols-12 gap-3 items-end bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <div className="col-span-12 md:col-span-7 space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-gray-500">Article</label>
                                    <select
                                        required
                                        value={line.article}
                                        onChange={(e) => handleLineChange(index, 'article', e.target.value)}
                                        className="w-full p-2 bg-white border border-gray-200 rounded-lg outline-none"
                                    >
                                        <option value="">Choisir un article</option>
                                        {articles.map(a => (
                                            <option key={a.id} value={a.article.name}>
                                                {a.article.name} (Dispo: {a.physical_quantity})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-10 md:col-span-4 space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-gray-500">Quantité</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={line.quantity}
                                        onChange={(e) => handleLineChange(index, 'quantity', parseInt(e.target.value))}
                                        className="w-full p-2 bg-white border border-gray-200 rounded-lg outline-none"
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveLine(index)}
                                        disabled={formData.lines.length === 1}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </form>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-white transition-all shadow-sm"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-8 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        ) : (
                            <Save className="h-5 w-5 mr-2" />
                        )}
                        Enregistrer la sortie
                    </button>
                </div>
            </div>
        </div>
    );
}
