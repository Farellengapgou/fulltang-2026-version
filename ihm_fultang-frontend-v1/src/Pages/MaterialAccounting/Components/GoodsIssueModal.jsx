import { useState, useEffect } from "react";
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { X, Plus, Trash2, Save } from "lucide-react";
import { getWarehouses, getArticles, getStockLevels, createGoodsIssue, updateGoodsIssue } from "../../../Utils/api/materialAccounting.js";
import { ErrorModal } from "../../Modals/ErrorModal.jsx";

export function GoodsIssueModal({ isOpen, onClose, onRefresh, initialData }) {
    const [warehouses, setWarehouses] = useState([]);
    const [articles, setArticles] = useState([]);
    const [availableArticles, setAvailableArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [canOpenErrorModal, setCanOpenErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const isReadOnly = initialData && initialData.status !== 'DRAFT';

    const [formData, setFormData] = useState({
        type: "SALE",
        warehouse: "", // Should be ID
        date: new Date().toISOString().split('T')[0],
        reference: "",
        lines: [{ article: "", quantity: 1 }] // Article should be ID
    });

    useEffect(() => {
        if (formData.warehouse) {
            loadAvailableArticles(formData.warehouse);
        } else {
            setAvailableArticles([]); // Strictly empty if no warehouse selected
        }
    }, [formData.warehouse, articles]);

    const loadAvailableArticles = async (warehouseId) => {
        try {
            const stockData = await getStockLevels({ warehouse: warehouseId });
            // Extract articles from stock levels
            const articlesInDepot = stockData.results.map(s => ({
                ...s.article,
                physical_quantity: parseFloat(s.physical_quantity),
                available_quantity: parseFloat(s.physical_quantity) - parseFloat(s.reserved_quantity)
            }));
            setAvailableArticles(articlesInDepot); // No fallback to 'articles'
        } catch (error) {
            console.error("Error loading available articles:", error);
            setAvailableArticles([]);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadMetaData();
            if (initialData) {
                setFormData({
                    type: initialData.type || "SALE",
                    warehouse: initialData.depot_id || "",
                    date: initialData.date || new Date().toISOString().split('T')[0],
                    reference: initialData.external_reference || "",
                    lines: initialData.lines && initialData.lines.length > 0
                        ? initialData.lines.map(l => ({
                            article: l.article,
                            quantity: l.quantity
                        }))
                        : [{ article: "", quantity: 1 }]
                });
            } else {
                setFormData({
                    type: "SALE",
                    warehouse: "",
                    date: new Date().toISOString().split('T')[0],
                    reference: "",
                    lines: [{ article: "", quantity: 1 }]
                });
            }
        }
    }, [isOpen, initialData]);

    const loadMetaData = async () => {
        try {
            const [wData, aData] = await Promise.all([
                getWarehouses(),
                getArticles()
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
            if (initialData && initialData.id) {
                await updateGoodsIssue(initialData.id, formData);
            } else {
                await createGoodsIssue(formData);
            }
            onRefresh();
            onClose();
        } catch (error) {
            setErrorMessage(`Erreur lors de l'enregistrement : ${error.detail || error.message || error}`);
            setCanOpenErrorModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-red-600 text-white">
                    <h2 className="text-xl font-bold italic">
                        {isReadOnly ? `Détails du Bon de Sortie ${initialData.number || ''}` : initialData ? "Modifier le Bon de Sortie" : "Nouveau Bon de Sortie"}
                    </h2>
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
                                disabled={isReadOnly}
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none disabled:bg-gray-100 disabled:text-gray-600"
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
                                disabled={isReadOnly}
                                value={formData.warehouse}
                                onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none disabled:bg-gray-100 disabled:text-gray-600"
                            >
                                <option value="">Sélectionner un dépôt</option>
                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Date</label>
                            <DatePicker
                                placeholder="Date"
                                disabled={isReadOnly}
                                value={formData.date ? dayjs(formData.date) : null}
                                onChange={(date, dateString) => setFormData({ ...formData, date: dateString })}
                                disabledDate={(current) => {
                                    return current && current.isAfter(dayjs(), 'day');
                                }}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none disabled:bg-gray-100 disabled:text-gray-600 h-12"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Référence / Notes (Optionnel)</label>
                        <input
                            type="text"
                            disabled={isReadOnly}
                            placeholder="Ex: Sortie stock labo..."
                            value={formData.reference}
                            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none disabled:bg-gray-100 disabled:text-gray-600"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h3 className="font-bold text-gray-800">Articles à sortir</h3>
                            {!isReadOnly && (
                                <button
                                    type="button"
                                    onClick={handleAddLine}
                                    className="flex items-center text-sm font-bold text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg"
                                >
                                    <Plus className="h-4 w-4 mr-1" /> Ajouter une ligne
                                </button>
                            )}
                        </div>

                        {formData.lines.map((line, index) => (
                            <div key={index} className="grid grid-cols-12 gap-3 items-end bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <div className="col-span-12 md:col-span-5 space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-gray-500">Article</label>
                                    <select
                                        required
                                        disabled={isReadOnly}
                                        value={line.article}
                                        onChange={(e) => handleLineChange(index, 'article', e.target.value)}
                                        className="w-full p-2 bg-white border border-gray-200 rounded-lg outline-none disabled:bg-gray-100"
                                    >
                                        <option value="">Choisir un article</option>
                                        {availableArticles.map(a => (
                                            <option key={a.id} value={a.id} disabled={a.available_quantity <= 0}>
                                                {a.name} {a.available_quantity > 0
                                                    ? `(Disp: ${a.available_quantity})`
                                                    : '(Épuisé)'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-4 md:col-span-2 space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-gray-500">Quantité</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        disabled={isReadOnly}
                                        value={line.quantity}
                                        onChange={(e) => handleLineChange(index, 'quantity', e.target.value)}
                                        className="w-full p-2 bg-white border border-gray-200 rounded-lg outline-none disabled:bg-gray-100"
                                    />
                                </div>
                                {isReadOnly && (
                                    <>
                                        <div className="col-span-4 md:col-span-2 space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-gray-500">PMP (XAF)</label>
                                            <div className="w-full p-2 bg-gray-100 border border-gray-200 rounded-lg font-medium text-gray-700">
                                                {line.unit_price ? line.unit_price.toLocaleString() : '0'}
                                            </div>
                                        </div>
                                        <div className="col-span-4 md:col-span-2 space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-gray-500">Total (XAF)</label>
                                            <div className="w-full p-2 bg-gray-100 border border-gray-200 rounded-lg font-bold text-gray-900">
                                                {line.line_amount ? line.line_amount.toLocaleString() : '0'}
                                            </div>
                                        </div>
                                    </>
                                )}
                                {!isReadOnly && (
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
                                )}
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
                        {isReadOnly ? "Fermer" : "Annuler"}
                    </button>
                    {!isReadOnly && (
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
                    )}
                </div>
            </div>
            <ErrorModal isOpen={canOpenErrorModal} onCloseErrorModal={setCanOpenErrorModal} message={errorMessage} />
        </div>
    );
}
