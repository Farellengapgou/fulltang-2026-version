import { useState, useEffect } from "react";
import { X, Save, Building, Phone, Mail, Globe, MapPin } from "lucide-react";
import { createSupplier, updateSupplier } from "../../../Utils/api/materialAccounting.js";

export function SupplierModal({ isOpen, onClose, onRefresh, editingSupplier }) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        supplier_type: "SUPPLIER",
        email: "",
        phone: "",
        address: "",
        website: "",
        tax_id: "",
        trade_register: "",
        is_active: true
    });

    const supplierTypes = [
        { value: "PHARMA", label: "Labo Pharma" },
        { value: "EQUIPMENT", label: "Équipementier" },
        { value: "SERVICE", label: "Prestataire" },
        { value: "SUPPLIER", label: "Général" },
    ];

    useEffect(() => {
        if (editingSupplier) {
            setFormData({
                code: editingSupplier.code || "",
                name: editingSupplier.name || "",
                supplier_type: editingSupplier.supplier_type || "SUPPLIER",
                email: editingSupplier.email || "",
                phone: editingSupplier.phone || "",
                address: editingSupplier.address || "",
                website: editingSupplier.website || "",
                tax_id: editingSupplier.tax_id || "",
                trade_register: editingSupplier.trade_register || "",
                is_active: editingSupplier.is_active ?? true
            });
        } else {
            setFormData({
                code: "",
                name: "",
                supplier_type: "SUPPLIER",
                email: "",
                phone: "",
                address: "",
                website: "",
                tax_id: "",
                trade_register: "",
                is_active: true
            });
        }
    }, [editingSupplier, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            if (editingSupplier) {
                await updateSupplier(editingSupplier.id, formData);
            } else {
                await createSupplier(formData);
            }
            onRefresh();
            onClose();
        } catch (error) {
            console.error("Error saving supplier:", error);
            alert("Erreur lors de l'enregistrement du fournisseur");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-primary-end text-white">
                    <h2 className="text-xl font-bold italic">
                        {editingSupplier ? "Modifier le Fournisseur" : "Nouveau Fournisseur"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Building className="h-4 w-4 text-gray-400" /> Code
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                placeholder="Ex: SUP-001"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Nom / Raison Sociale</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: PharmaPlus S.A."
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Type de Fournisseur</label>
                            <select
                                required
                                value={formData.supplier_type}
                                onChange={(e) => setFormData({ ...formData, supplier_type: e.target.value })}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                            >
                                {supplierTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" /> Téléphone
                            </label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+237 ..."
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" /> Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="contact@example.com"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Globe className="h-4 w-4 text-gray-400" /> Site Web
                            </label>
                            <input
                                type="url"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                placeholder="https://..."
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" /> Adresse Complète
                        </label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Rue, Quartier, Ville, Pays"
                            rows="2"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Numéro Fiscal (Tax ID)</label>
                            <input
                                type="text"
                                value={formData.tax_id}
                                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                                placeholder="Ex: M0123456789"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Registre du Commerce (RCCM)</label>
                            <input
                                type="text"
                                value={formData.trade_register}
                                onChange={(e) => setFormData({ ...formData, trade_register: e.target.value })}
                                placeholder="Ex: RC/DLA/2024/B/123"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-end outline-none"
                            />
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
                            Fournisseur actif
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
