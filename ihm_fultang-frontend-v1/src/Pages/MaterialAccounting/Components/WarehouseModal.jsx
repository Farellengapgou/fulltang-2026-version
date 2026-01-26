import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { createWarehouse, updateWarehouse } from "../../../Utils/api/materialAccounting.js";

export function WarehouseModal({ isOpen, onClose, onRefresh, editingWarehouse }) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        depot_type: "CENTRAL",
        location: "",
        is_active: true
    });

    const warehouseTypes = [
        { value: "CENTRAL", label: "Magasin Central" },
        { value: "PHARMACY", label: "Pharmacie" },
        { value: "OPERATING_ROOM", label: "Bloc Opératoire" },
        { value: "LABORATORY", label: "Laboratoire" },
        { value: "EMERGENCY", label: "Urgences" },
        { value: "WARD", label: "Service Hospitalisation" },
    ];

    useEffect(() => {
        if (editingWarehouse) {
            setFormData({
                code: editingWarehouse.code || "",
                name: editingWarehouse.name || "",
                depot_type: editingWarehouse.depot_type || "CENTRAL",
                location: editingWarehouse.location || "",
                is_active: editingWarehouse.is_active ?? true
            });
        } else {
            setFormData({
                code: "",
                name: "",
                depot_type: "CENTRAL",
                location: "",
                is_active: true
            });
        }
    }, [editingWarehouse, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            if (editingWarehouse) {
                await updateWarehouse(editingWarehouse.id, formData);
            } else {
                await createWarehouse(formData);
            }
            onRefresh();
            onClose();
        } catch (error) {
            console.error("Error saving warehouse:", error);
            alert("Erreur lors de l'enregistrement du dépôt");
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
                        {editingWarehouse ? "Modifier le Dépôt" : "Nouveau Dépôt"}
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
                            placeholder="Ex: DEP-001"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Nom du Dépôt</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Pharmacie Centrale"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Type de Dépôt</label>
                        <select
                            required
                            value={formData.depot_type}
                            onChange={(e) => setFormData({ ...formData, depot_type: e.target.value })}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                        >
                            {warehouseTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Localisation / Emplacement</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="Ex: Bâtiment A, RDC"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                        />
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
                            Dépôt actif
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
