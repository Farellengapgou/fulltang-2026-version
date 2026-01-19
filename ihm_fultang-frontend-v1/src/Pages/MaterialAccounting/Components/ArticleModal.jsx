import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { createArticle, updateArticle, getCategories, getChartOfAccounts } from "../../../Utils/api/materialAccounting.js";

export function ArticleModal({ isOpen, onClose, onRefresh, editingArticle }) {
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [families, setFamilies] = useState([]);
    const [accounts, setAccounts] = useState([]);

    const [formData, setFormData] = useState({
        code: "",
        name: "",
        description: "",
        article_type: "DRUG",
        category: "",
        family: "",
        unit: "UNIT",
        units_per_package: 1,
        is_perishable: false,
        shelf_life_days: "",
        minimum_stock: 0,
        safety_stock: 0,
        reorder_quantity: 0,
        is_active: true,
        requires_batch: true,
        stock_account: "",
        purchase_account: "",
        sales_account: ""
    });

    useEffect(() => {
        if (isOpen) {
            loadCategories();
            loadChartOfAccounts();
        }
    }, [isOpen]);

    useEffect(() => {
        if (editingArticle) {
            setFormData({
                code: editingArticle.code || "",
                name: editingArticle.name || "",
                description: editingArticle.description || "",
                article_type: editingArticle.article_type || "DRUG",
                category: editingArticle.category?.id || "",
                family: editingArticle.family?.id || "",
                unit: editingArticle.unit || "UNIT",
                units_per_package: editingArticle.units_per_package || 1,
                is_perishable: editingArticle.is_perishable || false,
                shelf_life_days: editingArticle.shelf_life_days || "",
                minimum_stock: editingArticle.minimum_stock || 0,
                safety_stock: editingArticle.safety_stock || 0,
                reorder_quantity: editingArticle.reorder_quantity || 0,
                is_active: editingArticle.is_active ?? true,
                requires_batch: editingArticle.requires_batch ?? true,
                stock_account: editingArticle.stock_account?.id || "",
                purchase_account: editingArticle.purchase_account?.id || "",
                sales_account: editingArticle.sales_account?.id || ""
            });
        } else {
            setFormData({
                code: "",
                name: "",
                description: "",
                article_type: "DRUG",
                category: "",
                family: "",
                unit: "UNIT",
                units_per_package: 1,
                is_perishable: false,
                shelf_life_days: "",
                minimum_stock: 0,
                safety_stock: 0,
                reorder_quantity: 0,
                is_active: true,
                requires_batch: true,
                stock_account: "",
                purchase_account: "",
                sales_account: ""
            });
        }
    }, [editingArticle, isOpen]);

    const loadCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data.results || []);
        } catch (error) {
            console.error("Error loading categories:", error);
        }
    };

    const loadChartOfAccounts = async () => {
        try {
            console.log("Loading chart of accounts...");
            const data = await getChartOfAccounts();

            if (data && (data.results || Array.isArray(data))) {
                const rawAccounts = data.results || data;
                if (rawAccounts.length > 0) {
                    // Normalize data to support both API (code/label) and Fallback (account_number/account_name)
                    const normalizedAccounts = rawAccounts.map(acc => ({
                        ...acc,
                        account_number: acc.code || acc.account_number,
                        account_name: acc.label || acc.account_name
                    }));
                    setAccounts(normalizedAccounts);
                    return;
                }
            }
            console.warn("API returned empty/invalid accounts list. Switching to fallback mode.");
            throw new Error("Empty accounts list from API");
        } catch (error) {
            console.error("Error loading chart of accounts (using fallback):", error);

            // Fallback hardcoded list to UNBLOCK USER functionality
            // IDs are integers matching likely DB IDs from seeding script
            setAccounts([
                { id: 1, account_number: '3111', account_name: 'Marchandises A (Stock)' },
                { id: 2, account_number: '3211', account_name: 'Matières premières (Stock)' },
                { id: 3, account_number: '3311', account_name: 'Produits finis (Stock)' },
                { id: 4, account_number: '3811', account_name: 'Marchandises en cours' },
                { id: 5, account_number: '6011', account_name: 'Achats de Marchandises' },
                { id: 6, account_number: '6021', account_name: 'Achats de matières premières' },
                { id: 7, account_number: '6031', account_name: 'Var. Stocks de Marchandises' },
                { id: 8, account_number: '6032', account_name: 'Var. Stocks Mat. Premières' },
                { id: 9, account_number: '6033', account_name: 'Var. Stocks Produits Finis' },
                { id: 10, account_number: '7011', account_name: 'Ventes de marchandises' },
                { id: 11, account_number: '7021', account_name: 'Ventes de produits finis' }
            ]);
        }
    };

    useEffect(() => {
        if (formData.category) {
            const selectedCategory = categories.find(c => c.id === parseInt(formData.category));
            setFamilies(selectedCategory?.families || []);
        } else {
            setFamilies([]);
        }
    }, [formData.category, categories]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);

            // Prepare data with proper types - only send what's required
            const payload = {
                code: formData.code,
                name: formData.name,
                description: formData.description || "",
                article_type: formData.article_type,
                category: parseInt(formData.category),
                family: parseInt(formData.family),
                unit: formData.unit,
                units_per_package: parseInt(formData.units_per_package) || 1,
                is_perishable: formData.is_perishable,
                minimum_stock: parseFloat(formData.minimum_stock) || 0,
                safety_stock: parseFloat(formData.safety_stock) || 0,
                reorder_quantity: parseFloat(formData.reorder_quantity) || 0,
                is_active: formData.is_active,
                requires_batch: formData.requires_batch
            };

            // Add optional accounting fields only if provided
            if (formData.stock_account) {
                payload.stock_account = parseInt(formData.stock_account);
            }
            if (formData.purchase_account) {
                payload.purchase_account = parseInt(formData.purchase_account);
            }
            if (formData.sales_account) {
                payload.sales_account = parseInt(formData.sales_account);
            }

            // Add optional fields only if they have values
            if (formData.shelf_life_days) {
                payload.shelf_life_days = parseInt(formData.shelf_life_days);
            }

            if (editingArticle) {
                await updateArticle(editingArticle.id, payload);
            } else {
                await createArticle(payload);
            }
            onRefresh();
            onClose();
        } catch (error) {
            console.error("Error saving article:", error);
            const errorMessage = error.response?.data
                ? JSON.stringify(error.response.data, null, 2)
                : error.message || "Erreur inconnue";
            alert("Erreur lors de l'enregistrement de l'article:\n" + errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-primary-end text-white">
                    <h2 className="text-xl font-bold italic">
                        {editingArticle ? "Modifier l'Article" : "Nouvel Article"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Info banner */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Note :</strong> Les champs marqués avec <strong>*</strong> sont obligatoires. Les autres sont optionnels.
                        </p>
                    </div>

                    {/* Section: Identification */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-800 border-b pb-2">Identification</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Code *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="Ex: PARA500"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Nom *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Paracétamol 500mg"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Description <span className="text-gray-500 font-normal text-xs">(optionnel)</span></label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Description de l'article..."
                                rows="2"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                            />
                        </div>
                    </div>

                    {/* Section: Classification */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-800 border-b pb-2">Classification</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Type d'article *</label>
                                <select
                                    required
                                    value={formData.article_type}
                                    onChange={(e) => setFormData({ ...formData, article_type: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                                >
                                    <option value="DRUG">Médicament</option>
                                    <option value="CONSUMABLE">Consommable médical</option>
                                    <option value="EQUIPMENT">Équipement</option>
                                    <option value="REAGENT">Réactif laboratoire</option>
                                    <option value="SUPPLY">Fourniture</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Catégorie *</label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value, family: "" })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                                >
                                    <option value="">Sélectionner...</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Famille *</label>
                                <select
                                    required
                                    value={formData.family}
                                    onChange={(e) => setFormData({ ...formData, family: e.target.value })}
                                    disabled={!formData.category}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none disabled:opacity-50"
                                >
                                    <option value="">Sélectionner...</option>
                                    {families.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                                {!formData.category && (
                                    <p className="text-xs text-orange-600">Sélectionnez d'abord une catégorie</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section: Conditionnement */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-800 border-b pb-2">Conditionnement</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Unité *</label>
                                <select
                                    required
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                                >
                                    <option value="UNIT">Unité</option>
                                    <option value="BOX">Boîte</option>
                                    <option value="BOTTLE">Flacon</option>
                                    <option value="VIAL">Ampoule</option>
                                    <option value="BAG">Sachet</option>
                                    <option value="KG">Kilogramme</option>
                                    <option value="LITER">Litre</option>
                                    <option value="METER">Mètre</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Unités par conditionnement <span className="text-gray-500 font-normal text-xs">(optionnel)</span></label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.units_per_package}
                                    onChange={(e) => setFormData({ ...formData, units_per_package: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Péremption */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-800 border-b pb-2">Gestion de la Péremption</h3>
                        <div className="flex items-center gap-2 mb-4">
                            <input
                                type="checkbox"
                                id="is_perishable"
                                checked={formData.is_perishable}
                                onChange={(e) => setFormData({ ...formData, is_perishable: e.target.checked })}
                                className="w-4 h-4 text-primary-end focus:ring-primary-end border-gray-300 rounded"
                            />
                            <label htmlFor="is_perishable" className="text-sm font-medium text-gray-700">
                                Article périssable
                            </label>
                        </div>
                        {formData.is_perishable && (
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Durée de validité (jours) <span className="text-gray-500 font-normal text-xs">(optionnel)</span></label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.shelf_life_days}
                                    onChange={(e) => setFormData({ ...formData, shelf_life_days: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                                />
                            </div>
                        )}
                    </div>

                    {/* Section: Gestion Stock */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-800 border-b pb-2">Paramètres de Stock</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Stock minimum</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.001"
                                    value={formData.minimum_stock}
                                    onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Stock de sécurité</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.001"
                                    value={formData.safety_stock}
                                    onChange={(e) => setFormData({ ...formData, safety_stock: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Quantité de réappro. <span className="text-gray-500 font-normal text-xs">(optionnel)</span></label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.001"
                                    value={formData.reorder_quantity}
                                    onChange={(e) => setFormData({ ...formData, reorder_quantity: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Comptes Comptables OHADA */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-800 border-b pb-2">Comptes Comptables (OHADA) <span className="text-gray-500 font-normal text-xs">(optionnel)</span></h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Compte de stock (Classe 3) <span className="text-gray-500 font-normal text-xs">(optionnel)</span></label>
                                <select
                                    value={formData.stock_account}
                                    onChange={(e) => setFormData({ ...formData, stock_account: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                                >
                                    <option value="">Hérité de la catégorie</option>
                                    {accounts.filter(a => a.account_number.startsWith('3')).map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.account_number} - {a.account_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Compte d'achat (Classe 6) <span className="text-gray-500 font-normal text-xs">(optionnel)</span></label>
                                <select
                                    value={formData.purchase_account}
                                    onChange={(e) => setFormData({ ...formData, purchase_account: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                                >
                                    <option value="">Hérité de la catégorie</option>
                                    {accounts.filter(a => a.account_number.startsWith('6')).map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.account_number} - {a.account_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Compte de vente (Classe 7) <span className="text-gray-500 font-normal text-xs">(optionnel)</span></label>
                                <select
                                    value={formData.sales_account}
                                    onChange={(e) => setFormData({ ...formData, sales_account: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                                >
                                    <option value="">Non défini</option>
                                    {accounts.filter(a => a.account_number.startsWith('7')).map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.account_number} - {a.account_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
                            <p className="text-xs text-blue-800">
                                <strong>💡 Astuce :</strong> Si non spécifiés, les comptes seront automatiquement hérités de la <strong>Catégorie</strong> de cet article.
                                Configurez les comptes par défaut dans les catégories pour simplifier la création d'articles.
                            </p>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-800 border-b pb-2">Options</h3>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="requires_batch"
                                    checked={formData.requires_batch}
                                    onChange={(e) => setFormData({ ...formData, requires_batch: e.target.checked })}
                                    className="w-4 h-4 text-primary-end focus:ring-primary-end border-gray-300 rounded"
                                />
                                <label htmlFor="requires_batch" className="text-sm font-medium text-gray-700">
                                    Gestion par lots obligatoire
                                </label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 text-primary-end focus:ring-primary-end border-gray-300 rounded"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                    Article actif
                                </label>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-white transition-all"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-8 py-2 bg-primary-end text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg flex items-center disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        ) : (
                            <Save className="h-5 w-5 mr-2" />
                        )}
                        Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
}
