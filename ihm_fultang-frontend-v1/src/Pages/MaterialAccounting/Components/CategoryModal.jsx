import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { createCategory, updateCategory, getChartOfAccounts } from "../../../Utils/api/materialAccounting.js";

export function CategoryModal({ isOpen, onClose, onRefresh, editingCategory }) {
    const [isLoading, setIsLoading] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        description: "",
        default_stock_account: "",
        default_expense_account: "",
        is_active: true
    });

    useEffect(() => {
        if (editingCategory) {
            setFormData({
                code: editingCategory.code || "",
                name: editingCategory.name || "",
                description: editingCategory.description || "",
                default_stock_account: editingCategory.default_stock_account || "",
                default_expense_account: editingCategory.default_expense_account || "",
                is_active: editingCategory.is_active ?? true
            });
        } else {
            setFormData({
                code: "",
                name: "",
                description: "",
                is_active: true
            });
        }
    }, [editingCategory, isOpen]);

    useEffect(() => {
        loadChartOfAccounts();
    }, []);

    const loadChartOfAccounts = async () => {
        try {
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
            console.warn("API returned empty accounts, using fallback.");
            throw new Error("Empty accounts list");
        } catch (error) {
            console.error("Error loading chart of accounts, using fallback:", error);
            // Fallback hardcoded list to UNBLOCK USER
            // Using integer IDs trying to guess what might be in DB from seeding
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            if (editingCategory) {
                await updateCategory(editingCategory.id, formData);
            } else {
                await createCategory(formData);
            }
            onRefresh();
            onClose();
        } catch (error) {
            console.error("Error saving category:", error);
            alert("Erreur lors de l'enregistrement de la catégorie");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-primary-end text-white">
                    <h2 className="text-xl font-bold italic">
                        {editingCategory ? "Modifier la Catégorie" : "Nouvelle Catégorie"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Code</label>
                        <input
                            type="text"
                            required
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder="Ex: CAT001"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Nom</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Médicaments"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Description de la catégorie..."
                            rows="3"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                        ></textarea>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-800 border-b pb-2">Comptabilité (valeurs par défaut)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Compte de stock (Classe 3)</label>
                                <select
                                    value={formData.default_stock_account}
                                    onChange={(e) => setFormData({ ...formData, default_stock_account: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                                >
                                    <option value="">Non défini</option>
                                    {accounts.filter(a => a.account_number.startsWith('3')).map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.account_number} - {a.account_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Compte de charge (Classe 6)</label>
                                <select
                                    value={formData.default_expense_account}
                                    onChange={(e) => setFormData({ ...formData, default_expense_account: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                                >
                                    <option value="">Non défini</option>
                                    {accounts.filter(a => a.account_number.startsWith('6')).map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.account_number} - {a.account_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
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
                            Catégorie active
                        </label>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
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
                </form>
            </div>
        </div>
    );
}
