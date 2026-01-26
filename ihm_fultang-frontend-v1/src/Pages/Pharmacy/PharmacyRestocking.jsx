import React, { useState, useEffect } from 'react';
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import { pharmacyNavLink } from "./lib/pharmacyNavLink.js";
import { PharmacyNavbar } from "./PharmacyNavBar.jsx";
import {
    Package, Plus, Search, Trash2, CheckCircle,
    AlertCircle, Loader2, ArrowLeft, Pill,
    Truck, DollarSign, Calendar
} from "lucide-react";
import axiosInstance from "../../Utils/axiosInstance.js";
import { SuccessModal } from "../Modals/SuccessModal.jsx";
import { ErrorModal } from "../Modals/ErrorModal.jsx";
import Select from 'react-select';
import { useAuthentication } from "../../Utils/Provider.jsx";

export function PharmacyRestocking() {
    const { userData } = useAuthentication();
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([
        { id: 1, name: "Laboratoires SALBI", code: "PH-001" },
        { id: 2, name: "Phénix Médical", code: "PH-002" },
        { id: 3, name: "PharmaCam Distribution", code: "PH-003" }
    ]);

    // Form state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [quantity, setQuantity] = useState(0);
    const [unitCost, setUnitCost] = useState(0);
    const [notes, setNotes] = useState("");

    // Cart/Purchase list
    const [purchaseList, setPurchaseList] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProducts();
        // Optionnel: fetchSuppliers() si l'API existe
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axiosInstance.get('/product/?page_size=100');
            const data = response.data.results || response.data;
            const options = data.map(p => ({
                value: p.id,
                label: `${p.name} (${p.brand || '---'}) - Stock: ${p.current_stock}`,
                name: p.name,
                current_stock: p.current_stock
            }));
            setProducts(options);
        } catch (err) {
            console.error(err);
        }
    };

    const addToPurchaseList = () => {
        if (!selectedProduct || quantity <= 0) return;

        setPurchaseList([...purchaseList, {
            id: selectedProduct.value,
            name: selectedProduct.name,
            quantity: Number(quantity),
            unitCost: Number(unitCost),
            total: Number(quantity) * Number(unitCost)
        }]);

        // Reset local item state
        setSelectedProduct(null);
        setQuantity(0);
        setUnitCost(0);
    };

    const removeFromList = (idx) => {
        const newList = [...purchaseList];
        newList.splice(idx, 1);
        setPurchaseList(newList);
    };

    const calculateGrandTotal = () => {
        return purchaseList.reduce((acc, item) => acc + item.total, 0);
    };

    const handleSavePurchase = async () => {
        if (purchaseList.length === 0) return;

        setIsSubmitting(true);
        setError(null);
        try {
            // Note: En backend, on doit créer des InventoryMovement de type 'purchase'
            // et mettre à jour le stock du produit.
            // On va itérer sur la liste pour envoyer les mouvements.

            for (const item of purchaseList) {
                const moveData = {
                    product: item.id,
                    movement_type: 'purchase',
                    quantity: item.quantity,
                    notes: `Achat auprès de ${selectedSupplier?.name || 'Inconnu'}. ${notes}`,
                    staff: userData?.id
                };
                await axiosInstance.post('/inventory-movement/', moveData);
            }

            setSuccess(true);
            setPurchaseList([]);
            setNotes("");
            setSelectedSupplier(null);
        } catch (err) {
            console.error(err);
            setError("Une erreur est survenue lors de l'enregistrement de l'achat.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <CustomDashboard linkList={pharmacyNavLink} requiredRole={"Pharmacist"}>
            <PharmacyNavbar />
            <div className="p-8 h-full bg-slate-50 flex flex-col font-sans overflow-hidden">

                <div className="mb-10 animate-in slide-in-from-top-4 duration-500">
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic">Réapprovisionnement</h2>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">Enregistrement des Achats & Entrées de Stock</p>
                </div>

                <div className="flex-1 grid lg:grid-cols-12 gap-10 overflow-hidden">

                    {/* Left Column: Form */}
                    <div className="lg:col-span-5 space-y-8 overflow-y-auto pr-4 custom-scrollbar">

                        {/* Supplier Info */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/30 blur-3xl -mr-16 -mt-16" />
                            <div className="relative z-10">
                                <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                                    <Truck size={24} className="text-indigo-400" />
                                    Source de l'Achat
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2 block">Fournisseur</label>
                                        <select
                                            className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500 text-white font-bold"
                                            onChange={(e) => setSelectedSupplier(suppliers.find(s => s.id === Number(e.target.value)))}
                                        >
                                            <option value="" className="text-slate-900">Sélectionner un fournisseur</option>
                                            {suppliers.map(s => (
                                                <option key={s.id} value={s.id} className="text-slate-900">{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2 block">Note / Référence Facture</label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500 text-white font-medium h-24"
                                            placeholder="Ex: Facture #INV-2025-001..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Add Item Form */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100">
                            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                                <Plus size={24} className="text-emerald-500" />
                                Ajouter un article
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Produit</label>
                                    <Select
                                        options={products}
                                        value={selectedProduct}
                                        onChange={setSelectedProduct}
                                        placeholder="Chercher dans l'inventaire..."
                                        styles={{
                                            control: (base) => ({ ...base, borderRadius: '16px', padding: '6px' }),
                                        }}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Quantité reçue</label>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-black outline-none focus:ring-2 focus:ring-indigo-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Prix d'achat unitaire</label>
                                        <input
                                            type="number"
                                            value={unitCost}
                                            onChange={(e) => setUnitCost(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-black outline-none focus:ring-2 focus:ring-indigo-600"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={addToPurchaseList}
                                    disabled={!selectedProduct || quantity <= 0}
                                    className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20"
                                >
                                    AJOUTER À LA LISTE
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Recap & Save */}
                    <div className="lg:col-span-7 flex flex-col overflow-hidden gap-6">
                        <div className="flex-1 bg-white rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden relative">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                <h3 className="font-black text-xl text-slate-800 flex items-center gap-3">
                                    <Package className="text-indigo-600" size={24} />
                                    Articles en réception
                                </h3>
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1 rounded-full uppercase tracking-widest">{purchaseList.length} ITEMS</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
                                {purchaseList.map((item, idx) => (
                                    <div key={idx} className="group bg-slate-50 hover:bg-white hover:shadow-xl hover:-translate-y-1 p-6 rounded-3xl border-2 border-transparent hover:border-indigo-100 transition-all duration-300 flex items-center gap-6">
                                        <div className="h-12 w-12 rounded-2xl bg-white text-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                                            <Pill size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-black text-slate-800 text-lg leading-tight uppercase">{item.name}</h4>
                                                <button onClick={() => removeFromList(idx)} className="p-2 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-[10px] font-black text-slate-400 bg-white/80 px-3 py-1 rounded-full border border-slate-100 shadow-sm uppercase">Cout: {item.unitCost.toLocaleString()} FCFA</span>
                                                <span className="text-[10px] font-black text-white bg-indigo-600 px-3 py-1 rounded-full uppercase">Qté: +{item.quantity}</span>
                                            </div>
                                        </div>
                                        <div className="text-right border-l border-slate-200 pl-6">
                                            <p className="text-xl font-black text-slate-900">{item.total.toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase italic">Sous-Total</p>
                                        </div>
                                    </div>
                                ))}
                                {purchaseList.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center p-20 opacity-20 text-slate-400">
                                        <Package size={80} strokeWidth={1} />
                                        <p className="mt-4 font-black uppercase tracking-[0.3em]">Aucun article ajouté</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-10 bg-slate-900 text-white rounded-t-[3rem] shadow-2xl">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">Montant Total de l'Achat</p>
                                        <p className="text-5xl font-black tracking-tighter text-emerald-400">{calculateGrandTotal().toLocaleString()} <span className="text-lg opacity-40 font-bold">FCFA</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">Impact Trésorerie</p>
                                        <p className="text-rose-400 font-black italic">Sortie de caisse</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSavePurchase}
                                    disabled={purchaseList.length === 0 || isSubmitting}
                                    className="w-full py-6 bg-white text-slate-900 rounded-3xl font-black text-xl flex items-center justify-center gap-4 hover:bg-emerald-400 hover:text-white transition-all shadow-2xl active:scale-95 disabled:opacity-20 flex-shrink-0"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <>ENREGISTRER L'ENTRÉE EN STOCK <CheckCircle size={28} /></>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <SuccessModal
                isOpen={success}
                canOpenSuccessModal={setSuccess}
                message="L'entrée en stock a été enregistrée avec succès. L'inventaire a été mis à jour."
                makeAction={() => window.location.reload()}
            />
            <ErrorModal
                isOpen={!!error}
                onCloseErrorModal={() => setError(null)}
                message={error}
            />

        </CustomDashboard>
    );
}

const Pill = ({ size, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path>
        <path d="m8.5 8.5 7 7"></path>
    </svg>
);
