import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { createFamily, updateFamily, getCategories } from "../../../Utils/api/materialAccounting.js";
import { ErrorModal } from "../../Modals/ErrorModal.jsx";

export function FamilyModal({ isOpen, onClose, onRefresh, editingFamily }) {
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        description: "",
        category: "",
        is_active: true
    });
    const [canOpenErrorModal, setCanOpenErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data.results || []);
        } catch (error) {
            console.error("Error loading categories:", error);
        }
    };

    useEffect(() => {
        if (editingFamily) {
            setFormData({
                code: editingFamily.code || "",
                name: editingFamily.name || "",
                description: editingFamily.description || "",
                category: editingFamily.category?.id || editingFamily.category || "",
                is_active: editingFamily.is_active ?? true
            });
        } else {
            setFormData({
                code: "",
                name: "",
                description: "",
                category: "",
                is_active: true
            });
        }
    }, [editingFamily, isOpen]);

    const generateCode = (name) => {
        if (!name) return "";
        return name
            .substring(0, 3)
            .toUpperCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
            .replace(/[^A-Z0-9]/g, ""); // Keep only alphanumeric
    };

    const handleNameChange = (e) => {
        const newName = e.target.value;
        const currentCode = formData.code;

        // Only auto-generate if code is empty or looks like a previous auto-generation (len <= 3)
        // For simplicity, let's just do it if code is empty to avoid overwriting user custom code
        if (!currentCode) {
            setFormData({
                ...formData,
                name: newName,
                code: generateCode(newName)
            });
        } else {
            setFormData({ ...formData, name: newName });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const payload = {
                ...formData,
                category: parseInt(formData.category)
            };

            if (editingFamily) {
                await updateFamily(editingFamily.id, payload);
            } else {
                await createFamily(payload);
            }
            onRefresh();
            onClose();
        } catch (error) {
            console.error("Error saving family:", error);
            if (error.response) {
                console.error("Server Response:", error.response.data);
                console.error("Status:", error.response.status);
            }
            setErrorMessage("Erreur lors de l'enregistrement de la famille: " + (error.response?.data?.detail || error.message));
            setCanOpenErrorModal(true);
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
                        {editingFamily ? "Modifier la Famille" : "Nouvelle Famille"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Catégorie Parente</label>
                        <select
                            required
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                        >
                            <option value="">Sélectionner une catégorie</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.code} - {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Code</label>
                        <input
                            type="text"
                            required
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder="Ex: FAM001"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Nom</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleNameChange} // Changed from inline to handler
                            placeholder="Ex: Antibiotiques"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Description de la famille..."
                            rows="3"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                        ></textarea>
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
                            Famille active
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
            <ErrorModal isOpen={canOpenErrorModal} onCloseErrorModal={setCanOpenErrorModal} message={errorMessage} />
        </div>
    );
}
