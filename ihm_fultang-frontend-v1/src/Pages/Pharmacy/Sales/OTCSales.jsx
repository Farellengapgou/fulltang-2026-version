import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Trash2, Plus, Minus, AlertTriangle, CheckCircle, Printer } from 'lucide-react';
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
            setFinancialOperations(response.data || []);
            const pharOp = (response.data || []).find(op => op.name.toLowerCase().includes('pharmacie') || op.name.toLowerCase().includes('caisse'));
            if (pharOp) setSelectedOp(pharOp.id);
        } catch (error) {
            console.error(error);
        }
    };

    const searchProducts = async () => {
        setLoading(true);
        try {
            // Using search filter if available or just fetching list (optimization needed for large db)
            // Assuming /product/ supports ?search=
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
            alert(`⚠️ WARNING: ${product.name} requires a prescription! You cannot sell this Over-The-Counter.`);
            return;
        }

        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            if (existing.quantity + 1 > product.current_stock) {
                alert("Insufficient stock!");
                return;
            }
            setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price } : item));
        } else {
            if (product.current_stock < 1) {
                alert("Out of stock!");
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
            alert("Please select a payment method.");
            return;
        }

        setIsSubmitting(true);
        try {
            const billData = {
                operation: Number(selectedOp),
                operator: userData?.id ? Number(userData.id) : undefined,
                patient: undefined, // Anonymous / Walk-in
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
            alert("Error processing payment.");
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
                    <title>OTC RECEIPT #${bill.billCode}</title>
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
                        <h2>FULTANG PHARMACY</h2>
                        <p>OTC SALE</p>
                        <p>${new Date().toLocaleString()}</p>
                        <p>Op: ${userName} | #${bill.billCode}</p>
                    </div>
                    <table>
                        <thead><tr><th>Item</th><th class="text-right">Qty</th><th class="text-right">Total</th></tr></thead>
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
                    <p>Thank you!</p>
                </body>
            </html>
        `;
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        win.print();
    };

    return (
        <div className="flex h-full gap-6 p-6">
            {/* LEFT: Product Search */}
            <div className="w-2/3 flex flex-col gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Product Search</h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Type product name (min 3 chars)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-lg"
                            autoFocus
                        />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={24} />
                    </div>

                    {/* Results */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
                        {loading && <p className="text-slate-400 p-4">Searching...</p>}
                        {products.map(product => (
                            <div key={product.id} className="p-4 border border-slate-100 rounded-xl hover:shadow-md hover:border-indigo-100 transition-all bg-white group">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-slate-800">{product.name}</h3>
                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{product.brand}</p>
                                    </div>
                                    <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg text-sm">{product.price} FCFA</span>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                        <div className={`w-2 h-2 rounded-full ${product.current_stock > 10 ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                                        Stock: {product.current_stock}
                                    </div>
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-600 transition-colors flex items-center gap-2"
                                    >
                                        <Plus size={16} /> Add
                                    </button>
                                </div>
                                {product.requires_prescription && (
                                    <div className="mt-2 text-[10px] font-bold text-rose-500 flex items-center gap-1 bg-rose-50 p-1 rounded">
                                        <AlertTriangle size={10} /> Rx Required
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT: Cart */}
            <div className="w-1/3 bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col overflow-hidden">
                <div className="p-6 bg-slate-900 text-white">
                    <div className="flex items-center gap-3 mb-1">
                        <ShoppingCart className="text-indigo-400" />
                        <h2 className="text-xl font-bold">Current Cart</h2>
                    </div>
                    <p className="text-slate-400 text-sm">OTC Transaction</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                            <ShoppingCart size={48} className="mb-4" />
                            <p>Cart is empty</p>
                        </div>
                    ) : (
                        cart.map((item, index) => (
                            <div key={index} className="flex flex-col p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex justify-between mb-2">
                                    <span className="font-bold text-slate-700">{item.name}</span>
                                    <button onClick={() => removeFromCart(index)} className="text-rose-400 hover:text-rose-600"><Trash2 size={16} /></button>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center bg-white rounded-lg border border-slate-200">
                                        <button onClick={() => updateQuantity(index, -1)} className="p-1 hover:bg-slate-100"><Minus size={14} /></button>
                                        <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(index, 1)} className="p-1 hover:bg-slate-100"><Plus size={14} /></button>
                                    </div>
                                    <span className="font-bold text-indigo-600">{item.total.toLocaleString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100">
                    <div className="flex justify-between items-end mb-6">
                        <span className="text-slate-500 font-bold text-sm uppercase">Total Amount</span>
                        <span className="text-3xl font-black text-slate-800">{calculateTotal().toLocaleString()} <span className="text-sm text-slate-400 font-medium">FCFA</span></span>
                    </div>

                    {!bill ? (
                        <div className="space-y-3">
                            <select
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                value={selectedOp || ''}
                                onChange={(e) => setSelectedOp(e.target.value)}
                            >
                                <option value="">Select Payment Method...</option>
                                {financialOperations.map(op => (
                                    <option key={op.id} value={op.id}>{op.name}</option>
                                ))}
                            </select>
                            <button
                                onClick={handlePayment}
                                disabled={isSubmitting || cart.length === 0 || !selectedOp}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:shadow-none"
                            >
                                {isSubmitting ? 'Processing...' : 'CONFIRM PAYMENT'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
                            <div className="bg-emerald-100 text-emerald-700 p-3 rounded-xl flex items-center justify-center gap-2 font-bold mb-2">
                                <CheckCircle size={20} /> Paid Successfully
                            </div>
                            <button
                                onClick={printInvoice}
                                className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900"
                            >
                                <Printer size={18} /> Print Receipt
                            </button>
                            <button
                                onClick={() => { setBill(null); setCart([]); }}
                                className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                            >
                                New Sale
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <SuccessModal isOpen={showSuccessModal} canOpenSuccessModal={setShowSuccessModal} message="Transaction Completed Successfully" />
        </div >
    );
}
