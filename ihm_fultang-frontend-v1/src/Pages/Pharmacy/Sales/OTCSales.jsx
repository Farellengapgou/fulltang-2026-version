import React, { useState, useEffect } from 'react';
import { FaSearch, FaShoppingCart, FaTrash, FaPlus, FaMinus, FaPrint, FaMoneyBillWave, FaCheckCircle, FaCreditCard, FaUniversity, FaMobileAlt } from 'react-icons/fa';
import axiosInstance from '../../../Utils/axiosInstance';
import axiosInstanceAccountant from '../../../Utils/axiosInstanceAccountant';
import { useAuthentication } from '../../../Utils/Provider';
import { SuccessModal } from '../../Modals/SuccessModal';

export function OTCSales() {
    const { userData } = useAuthentication();
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);

    // Payment
    const [financialOperations, setFinancialOperations] = useState([]);
    const [selectedOp, setSelectedOp] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bill, setBill] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        fetchFinancialOperations();
    }, []);

    // Debounced search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.length > 2) {
                searchProducts();
            } else {
                setProducts([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const fetchFinancialOperations = async () => {
        try {
            const response = await axiosInstanceAccountant.get('/financial-operation/');
            // Handle both paginated and non-paginated responses
            const data = response.data.results || response.data || [];
            setFinancialOperations(Array.isArray(data) ? data : []);
            
            // Try to auto-select a pharmacy/cash related operation
            const pharOp = data.find(op => 
                op.name.toLowerCase().includes('cash') || 
                op.name.toLowerCase().includes('espèces') ||
                op.name.toLowerCase().includes('pharmacie')
            );
            if (pharOp) setSelectedOp(pharOp.id);
        } catch (error) {
            console.error("Error fetching financial operations:", error);
        }
    };

    const getOpIcon = (name) => {
        const n = name.toLowerCase();
        if (n.includes('cash') || n.includes('espèces')) return <FaMoneyBillWave className="text-emerald-500" />;
        if (n.includes('orange') || n.includes('om')) return <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white text-[10px] font-bold shadow-sm">OM</div>;
        if (n.includes('mtn') || n.includes('momo')) return <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center text-blue-800 text-[10px] font-bold shadow-sm">MOMO</div>;
        if (n.includes('carte') || n.includes('visa') || n.includes('bank')) return <FaCreditCard className="text-blue-500" />;
        return <FaMobileAlt className="text-slate-400" />;
    };

    const searchProducts = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/product/?search=${searchTerm}`);
            setProducts(response.data.results || response.data || []);
        } catch (error) {
            console.error("Error searching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        if (product.requires_prescription) {
            alert(`⚠️ ATTENTION: ${product.name} nécessite une ordonnance ! Vente OTC interdite.`);
            return;
        }

        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            if (existing.quantity + 1 > product.current_stock) {
                alert("Stock insuffisant !");
                return;
            }
            setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price } : item));
        } else {
            if (product.current_stock < 1) {
                alert("Rupture de stock !");
                return;
            }
            setCart([...cart, {
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                max_stock: product.current_stock,
                total: product.price
            }]);
        }
        setSearchTerm(''); // Clear search on add
        setProducts([]);
    };

    const updateQuantity = (index, delta) => {
        const newCart = [...cart];
        const item = newCart[index];
        const newQty = item.quantity + delta;

        if (newQty > 0 && newQty <= item.max_stock) {
            item.quantity = newQty;
            item.total = item.price * newQty;
            setCart(newCart);
        }
    };

    const removeFromCart = (index) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const calculateTotal = () => {
        return cart.reduce((acc, item) => acc + item.total, 0);
    };

    const handlePayment = async () => {
        if (cart.length === 0) return;
        if (!selectedOp) {
            alert("Veuillez sélectionner un mode de paiement.");
            return;
        }

        setIsSubmitting(true);
        try {
            const billData = {
                operation: Number(selectedOp),
                operator: userData?.id ? Number(userData.id) : undefined,
                patient: undefined, // Anonyme
                bill_items: cart.map(item => ({
                    designation: item.name,
                    medicament: item.id,
                    quantity: item.quantity,
                    prescription: null
                }))
            };

            const response = await axiosInstance.post('/bill/', billData);
            if (response.status === 201) {
                setBill(response.data);
                setShowSuccessModal(true);
                setCart([]);
            }
        } catch (err) {
            console.error(err);
            alert("Erreur lors du traitement du paiement.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const printInvoice = () => {
        if (!bill) return;
        const userName = userData ? userData.username : 'Pharmacist';
        const html = `
            <html>
                <head>
                    <title>REÇU OTC #${bill.billCode}</title>
                    <style>
                        body { font-family: 'Courier New', monospace; padding: 20px; text-align: center; width: 300px; margin: 0 auto; }
                        .header { margin-bottom: 20px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                        h2 { margin: 0; font-size: 16px; }
                        p { margin: 5px 0; font-size: 12px; }
                        table { width: 100%; font-size: 12px; margin: 10px 0; }
                        th { text-align: left; }
                        .text-right { text-align: right; }
                        .total { font-weight: bold; font-size: 14px; border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>PHARMACIE FULTANG</h2>
                        <p>VENTE DIRECTE (OTC)</p>
                        <p>${new Date().toLocaleString()}</p>
                        <p>Op: ${userName} | #${bill.billCode}</p>
                    </div>
                    <table>
                        <thead><tr><th>Produit</th><th class="text-right">Qté</th><th class="text-right">Total</th></tr></thead>
                        <tbody>
                            ${bill.bill_items.map(item => `
                                <tr>
                                    <td>${item.designation}</td>
                                    <td class="text-right">${item.quantity}</td>
                                    <td class="text-right">${(item.total).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="total">
                        TOTAL: ${(bill.amount).toLocaleString()} FCFA
                    </div>
                    <p>Merci de votre confiance !</p>
                </body>
            </html>
        `;
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        win.onload = () => {
            win.focus();
            win.print();
        };
    };

    return (
        <div className="flex h-full gap-6 p-2">
            {/* LEFT: Product Search & Table */}
            <div className="w-2/3 flex flex-col">
                <div className="flex justify-between items-center mb-5 bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                     <p className="font-bold text-xl ml-2 text-primary-end">Vente Directe (OTC)</p>
                     <div className="flex w-[350px] h-10 border-2 border-secondary rounded-lg bg-white">
                        <FaSearch className="text-xl text-secondary m-2" />
                        <input
                            type="text"
                            placeholder="Rechercher médicament..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border-none focus:outline-none focus:ring-0 w-full bg-transparent p-2 text-sm"
                            autoFocus
                        />
                     </div>
                </div>

                <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden p-4">
                     {loading ? (
                         <div className="flex justify-center items-center h-full">
                             <span className="loading loading-spinner text-primary-end"></span>
                         </div>
                     ) : (
                         <table className="w-full border-separate border-spacing-y-2">
                             <thead>
                                 <tr className="bg-gradient-to-l from-primary-start to-primary-end">
                                     <th className="text-center text-white p-3 font-bold rounded-l-lg">Nom</th>
                                     <th className="text-center text-white p-3 font-bold">Marque</th>
                                     <th className="text-center text-white p-3 font-bold">Stock</th>
                                     <th className="text-center text-white p-3 font-bold">Prix</th>
                                     <th className="text-center text-white p-3 font-bold rounded-r-lg">Action</th>
                                 </tr>
                             </thead>
                             <tbody>
                                 {products.length > 0 ? (
                                     products.map((product) => (
                                         <tr key={product.id} className="bg-gray-50 hover:bg-indigo-50 transition-colors">
                                             <td className="p-3 text-center border-l-4 border-l-transparent hover:border-l-secondary font-medium">{product.name}</td>
                                             <td className="p-3 text-center text-gray-400 uppercase text-[10px] font-black tracking-widest">{product.brand || 'GÉNÉRIQUE'}</td>
                                             <td className={`p-3 text-center font-bold ${product.current_stock > 10 ? 'text-green-600' : 'text-rose-500'}`}>
                                                 {product.current_stock}
                                             </td>
                                             <td className="p-3 text-center font-bold text-gray-700">{product.price.toLocaleString()}</td>
                                             <td className="p-3 text-center">
                                                 <button
                                                     onClick={() => addToCart(product)}
                                                     className="bg-secondary text-white p-2 rounded-full hover:bg-primary-end transition-all shadow-md active:scale-90"
                                                 >
                                                     <FaPlus size={12} />
                                                 </button>
                                             </td>
                                         </tr>
                                     ))
                                 ) : (
                                     <tr>
                                         <td colSpan="5" className="text-center p-10 text-gray-400">
                                             {searchTerm.length > 2 ? 'Aucun produit trouvé.' : 'Recherchez un produit pour commencer.'}
                                         </td>
                                     </tr>
                                 )}
                             </tbody>
                         </table>
                     )}
                </div>
            </div>

            {/* RIGHT: Cart & Payment */}
            <div className="w-1/3 bg-white rounded-xl shadow-lg border border-slate-100 flex flex-col h-full max-h-[85vh]">
                <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                    <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                        <FaShoppingCart className="text-primary-end" /> Panier Actuel
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-300">
                            <FaShoppingCart size={40} className="mb-2" />
                            <p>Panier vide</p>
                        </div>
                    ) : (
                        cart.map((item, index) => (
                            <div key={index} className="flex flex-col p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-gray-800 line-clamp-1">{item.name}</span>
                                    <button onClick={() => removeFromCart(index)} className="text-red-300 hover:text-red-500 transition-colors"><FaTrash size={12} /></button>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2 bg-gray-100 rounded p-1">
                                        <button onClick={() => updateQuantity(index, -1)} className="p-1 hover:bg-white rounded text-gray-600"><FaMinus size={10} /></button>
                                        <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(index, 1)} className="p-1 hover:bg-white rounded text-green-600"><FaPlus size={10} /></button>
                                    </div>
                                    <span className="font-bold text-primary-end text-sm">{item.total.toLocaleString()} FCFA</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-xl overflow-y-auto">
                    <div className="flex justify-between items-end mb-4 border-b border-dashed border-gray-300 pb-2">
                        <span className="text-gray-400 font-bold text-xs">NET À PAYER</span>
                        <span className="text-2xl font-black text-slate-800">{calculateTotal().toLocaleString()} <span className="text-[10px] text-gray-400">FCFA</span></span>
                    </div>

                    {!bill ? (
                        <div className="space-y-4">
                             <div>
                                <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">
                                  Mode de Paiement
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {financialOperations.map((operation) => (
                                        <button
                                            key={operation.id}
                                            type="button"
                                            onClick={() => setSelectedOp(operation.id)}
                                            className={`p-2 rounded-lg border-2 flex items-center gap-2 transition-all text-xs font-bold ${
                                                selectedOp == operation.id 
                                                ? "border-primary-end bg-primary-end/5 text-primary-end" 
                                                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                                            }`}
                                        >
                                            <div className="text-lg opacity-80">{getOpIcon(operation.name)}</div>
                                            <span className="line-clamp-1 text-left uppercase truncate">{operation.name}</span>
                                        </button>
                                    ))}
                                    {financialOperations.length === 0 && (
                                        <div className="col-span-2 text-center text-gray-300 italic text-[10px]">Chargement des modes...</div>
                                    )}
                                </div>
                             </div>
                            
                            <button
                                onClick={handlePayment}
                                disabled={isSubmitting || cart.length === 0 || !selectedOp}
                                className={`w-full py-3 rounded-lg text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${isSubmitting || cart.length === 0 || !selectedOp ? "bg-gray-300 cursor-not-allowed shadow-none" : "bg-primary-end hover:bg-indigo-700 hover:scale-[1.02] active:scale-98"}`}
                            >
                                {isSubmitting ? 'Traitement...' : <><FaMoneyBillWave /> VALIDER LA VENTE</>}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg flex items-center gap-2 text-sm font-bold border border-emerald-100">
                                <FaCheckCircle /> Paiement Validé
                            </div>
                            <button
                                onClick={printInvoice}
                                className="w-full py-3 bg-slate-800 text-white rounded-lg font-bold flex items-center justify-center gap-2 text-sm hover:bg-slate-900 shadow-md transition-all active:scale-95"
                            >
                                <FaPrint /> Imprimer le Reçu
                            </button>
                            <button
                                onClick={() => { setBill(null); setCart([]); }}
                                className="w-full py-2 bg-white border border-gray-300 text-gray-600 rounded-lg font-bold text-sm hover:bg-gray-50"
                            >
                                Nouvelle Vente
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <SuccessModal isOpen={showSuccessModal} canOpenSuccessModal={setShowSuccessModal} message="Transaction Effectuée avec Succès" />
        </div >
    );
}

