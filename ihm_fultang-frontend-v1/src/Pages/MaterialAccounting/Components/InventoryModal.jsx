import { useState, useEffect } from "react";
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { X, Save } from "lucide-react";
import { getWarehouses, createPhysicalInventory } from "../../../Utils/api/materialAccounting.js";
import { ErrorModal } from "../../Modals/ErrorModal.jsx";

export function InventoryModal({ isOpen, onClose, onRefresh }) {
    const [warehouses, setWarehouses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        inventory_type: "PERIODIC",
        depot: "",
        inventory_date: new Date().toISOString().split('T')[0],
        notes: ""
    });
    const [canOpenErrorModal, setCanOpenErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (isOpen) {
            loadMetaData();
            setFormData({
                inventory_type: "PERIODIC",
                depot: "",
                inventory_date: new Date().toISOString().split('T')[0],
                notes: ""
            });
        }
    }, [isOpen]);

    const loadMetaData = async () => {
        try {
            const wData = await getWarehouses();
            setWarehouses(wData.results || []);
        } catch (error) {
            console.error("Error loading warehouses:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await createPhysicalInventory(formData);
            onRefresh();
            onClose();
        } catch (error) {
            setErrorMessage(`Erreur lors de la création : ${error.detail || error.message || JSON.stringify(error)}`);
            setCanOpenErrorModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-teal-600 text-white">
                    <h2 className="text-xl font-bold italic text-white">Nouvelle Session d'Inventaire</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors text-white">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Dépôt à inventorié</label>
                            <select
                                required
                                value={formData.depot}
                                onChange={(e) => setFormData({ ...formData, depot: e.target.value })}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                            >
                                <option value="">Sélectionner un dépôt</option>
                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Type d'inventaire</label>
                                <select
                                    required
                                    value={formData.inventory_type}
                                    onChange={(e) => setFormData({ ...formData, inventory_type: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                                >
                                    <option value="ANNUAL">Annuel</option>
                                    <option value="PERIODIC">Périodique</option>
                                    <option value="ROTATING">Tournant</option>
                                    <option value="EXCEPTIONAL">Exceptionnel</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Date</label>
                                <DatePicker
                                    placeholder="Inventory Date"
                                    value={formData.inventory_date ? dayjs(formData.inventory_date) : null}
                                    onChange={(date, dateString) => setFormData({ ...formData, inventory_date: dateString })}
                                    disabledDate={(current) => {
                                        return current && current.isAfter(dayjs(), 'day');
                                    }}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none h-12"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Notes (Optionnel)</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Objectif de l'inventaire..."
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none h-24 resize-none"
                            />
                        </div>
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
                            className="px-8 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg flex items-center disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            ) : (
                                <Save className="h-5 w-5 mr-2" />
                            )}
                            Créer l'inventaire
                        </button>
                    </div>
                </form>
            </div>
            <ErrorModal isOpen={canOpenErrorModal} onCloseErrorModal={setCanOpenErrorModal} message={errorMessage} />
        </div>
    );
}
