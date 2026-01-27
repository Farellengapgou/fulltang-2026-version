import React, { useState, useEffect } from 'react';
import { FaSearch, FaUser, FaCalendarAlt,FaCreditCard, FaMobileAlt, FaStethoscope, FaCheckCircle, FaPrint, FaTrash, FaArrowLeft, FaMoneyBillWave } from 'react-icons/fa';
import axiosInstance from '../../../Utils/axiosInstance';
import axiosInstanceAccountant from '../../../Utils/axiosInstanceAccountant';
import { useAuthentication } from '../../../Utils/Provider';
import { formatDateOnly } from "../../../Utils/formatDateMethods";
import { SuccessModal } from '../../Modals/SuccessModal';

export function PrescriptionSales() {
    const { userData } = useAuthentication();
    const [prescriptions, setPrescriptions] = useState([]);
    const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    // Cart / Validation
    const [cart, setCart] = useState([]);
    const [isListValidated, setIsListValidated] = useState(false);

    // Payment
    const [financialOperations, setFinancialOperations] = useState([]);
    const [selectedOp, setSelectedOp] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bill, setBill] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        fetchPrescriptions();
        fetchFinancialOperations();
    }, []);

    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = prescriptions.filter(
            (p) =>
                p.doctorName?.toLowerCase().includes(lowerTerm) ||
                p.patientName?.toLowerCase().includes(lowerTerm)
        );
        setFilteredPrescriptions(filtered);
    }, [searchTerm, prescriptions]);

    const fetchPrescriptions = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/prescription/');
            const rawData = response.data.results || response.data;

            const mapped = (Array.isArray(rawData) ? rawData : [])
                .map(item => {
                    const drugs = (item.prescriptionDrug || []).map(drug => {
                        const remaining = drug.quantity_remaining !== undefined ? drug.quantity_remaining : drug.quantity;
                        return {
                            id: drug.medicament?.id,
                            name: drug.medicament?.name,
                            price: drug.medicament?.price || 0,
                            quantity: drug.quantity, 
                            quantity_remaining: remaining,
                            dosage: drug.dosage || "",
                            frequency: drug.frequency || "",
                            duration: drug.duration || "",
                            instructions: drug.instructions || "",
                            total: (drug.medicament?.price || 0) * remaining
                        };
                    });

                    const isCompleted = drugs.every(d => d.quantity_remaining === 0);

                    return {
                        id: item.id,
                        doctorName: `${item.idMedicalStaff?.first_name || ''} ${item.idMedicalStaff?.last_name || ''}`,
                        patientName: `${item.idPatient?.firstName || ''} ${item.idPatient?.lastName || ''}`,
                        patientId: item.idPatient?.id,
                        date: item.addDate,
                        drugs: drugs,
                        isCompleted: isCompleted
                    };
                })
                .filter(p => !p.isCompleted);

            mapped.sort((a, b) => new Date(b.date) - new Date(a.date));

            setPrescriptions(mapped);
            setFilteredPrescriptions(mapped);
        } catch (error) {
            console.error("Error fetching prescriptions:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFinancialOperations = async () => {
        try {
            const response = await axiosInstanceAccountant.get('/financial-operation/');
            // Handle both paginated and non-paginated responses
            const data = response.data.results || response.data || [];
            setFinancialOperations(Array.isArray(data) ? data : []);
            
            // Try to auto-select a pharmacy/cash related operation
            const pharOp = data.find(op => 
                op.name.toLowerCase().includes('cash') || 
                op.name.toLowerCase().includes('pharmacie') || 
                op.name.toLowerCase().includes('caisse')
            );
            if (pharOp) setSelectedOp(pharOp.id);
        } catch (error) {
            console.error("Error fetching financial operations:", error);
        }
    };

    const handleSelectPrescription = (p) => {
        setSelectedPrescription(p);
        const activeDrugs = p.drugs.filter(d => d.quantity_remaining > 0).map(d => ({
            ...d,
            quantity: d.quantity_remaining, 
            total: d.price * d.quantity_remaining
        }));
        setCart(activeDrugs);
        setBill(null);
        setIsListValidated(false);
    };

    const removeFromCart = (index) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const calculateTotal = () => {
        return cart.reduce((acc, item) => acc + item.total, 0);
    };

    const handleValidateList = () => {
        if (cart.length === 0) {
            alert("The list is empty.");
            return;
        }
        setIsListValidated(true);
    };

    const handlePayment = async () => {
        if (!selectedOp) {
            alert("Please select a payment method.");
            return;
        }
        setIsSubmitting(true);
        try {
            const billData = {
                operation: Number(selectedOp),
                operator: userData?.id ? Number(userData.id) : undefined,
                patient: selectedPrescription.patientId ? Number(selectedPrescription.patientId) : undefined,
                bill_items: cart.map(item => ({
                    designation: item.name,
                    medicament: item.id,
                    quantity: item.quantity,
                    prescription: selectedPrescription.id
                }))
            };

            const response = await axiosInstance.post('/bill/', billData);
            if (response.status === 201) {
                setBill(response.data);
                setShowSuccessModal(true);
                fetchPrescriptions();
            }
        } catch (err) {
            console.error(err);
            alert("Error during payment processing.");
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
                    <title>INVOICE #${bill.billCode}</title>
                    <style>
                        body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; line-height: 1.4; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        th { text-align: left; padding: 12px 8px; border-bottom: 2px solid #eee; }
                        td { padding: 12px 8px; border-bottom: 1px solid #f5f5f5; }
                        .text-right { text-align: right; }
                        .text-center { text-align: center; }
                        .header { text-align: center; margin-bottom: 40px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>FULTANG CLINIC - PHARMACY</h1>
                        <p>Prescription Sale Receipt</p>
                    </div>
                    <p><strong>Patient:</strong> ${selectedPrescription?.patientName}</p>
                    <p><strong>Doctor:</strong> ${selectedPrescription?.doctorName}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                    <br/>
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th class="text-center">Qty</th>
                                <th class="text-right">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${bill.bill_items.map(item => `
                                <tr>
                                    <td>${item.designation}</td>
                                    <td class="text-center">${item.quantity}</td>
                                    <td class="text-right">${(item.total || 0).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="text-right">
                        <h3>TOTAL: ${(bill.amount || 0).toLocaleString()} FCFA</h3>
                    </div>
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

    const getOpIcon = (name) => {
        const n = name.toLowerCase();
        if (n.includes('cash') || n.includes('espèces')) return <FaMoneyBillWave className="text-emerald-500" />;
        if (n.includes('orange') || n.includes('om')) return <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white text-[10px] font-bold shadow-sm">OM</div>;
        if (n.includes('mtn') || n.includes('momo')) return <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center text-blue-800 text-[10px] font-bold shadow-sm">MOMO</div>;
        if (n.includes('carte') || n.includes('visa') || n.includes('bank')) return <FaCreditCard className="text-blue-500" />;
        return <FaMobileAlt className="text-slate-400" />;
    };

    return (
        <div className="mt-5 flex flex-col relative p-5"> 
            {!selectedPrescription ? (
                <>
                    {/* Header with Search */}
                    <div className="flex justify-between mb-5">
                        <p className="font-bold text-xl mt-2">Ventes sur Ordonnance</p>
                        <div className="flex w-[350px] h-10 border-2 border-secondary rounded-lg bg-white">
                            <FaSearch className="text-xl text-secondary m-2" />
                            <input
                                type="text"
                                placeholder="Rechercher prescription..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border-none focus:outline-none focus:ring-0 w-full bg-transparent"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                         <div className="flex justify-center p-10"><span className="loading loading-spinner text-primary-end"></span></div>
                    ) : (
                        <div className="overflow-hidden">
                            <table className="w-full border-separate border-spacing-y-2">
                                <thead>
                                    <tr className="bg-gradient-to-l from-primary-start to-primary-end">
                                        <th className="text-center text-white p-4 text-xl font-bold rounded-l-lg">Date</th>
                                        <th className="text-center text-white p-4 text-xl font-bold">Patient</th>
                                        <th className="text-center text-white p-4 text-xl font-bold">Docteur</th>
                                        <th className="text-center text-white p-4 text-xl font-bold rounded-r-lg">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPrescriptions.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center p-10 text-gray-500 font-bold">Aucune prescription trouvée.</td>
                                        </tr>
                                    ) : (
                                        filteredPrescriptions.map((p) => (
                                            <tr key={p.id} className="bg-gray-100 hover:bg-gray-200 transition-colors">
                                                <td className="p-4 text-center font-bold text-blue-900 rounded-l-lg">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <FaCalendarAlt className="text-gray-400" />
                                                        {formatDateOnly(p.date)}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center font-semibold text-gray-700">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <FaUser className="text-gray-400" />
                                                        {p.patientName}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center font-semibold text-gray-700">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <FaStethoscope className="text-gray-400" />
                                                        {p.doctorName}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center rounded-r-lg">
                                                    <button
                                                        onClick={() => handleSelectPrescription(p)}
                                                        className="bg-secondary text-white px-4 py-2 rounded-full font-bold hover:bg-primary-end transition-all shadow-md"
                                                    >
                                                        Consulter / Vendre
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            ) : (
                // DETAIL/PAYMENT VIEW
                <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6">
                    <div className="flex items-center mb-6">
                        <button
                            onClick={() => setSelectedPrescription(null)}
                            className="mr-4 p-3 rounded-full hover:bg-gray-100 text-gray-600 transition-colors bg-gray-50"
                        >
                            <FaArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Détails Prescription</h2>
                            <p className="text-sm text-gray-500">Traitement de la commande</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-3 rounded-full shadow-sm"><FaUser className="text-primary-end" size={20} /></div>
                            <div><p className="text-xs font-bold text-gray-400 uppercase">Patient</p><p className="font-bold">{selectedPrescription.patientName}</p></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-3 rounded-full shadow-sm"><FaStethoscope className="text-primary-end" size={20} /></div>
                            <div><p className="text-xs font-bold text-gray-400 uppercase">Docteur</p><p className="font-bold">{selectedPrescription.doctorName}</p></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-3 rounded-full shadow-sm"><FaCalendarAlt className="text-primary-end" size={20} /></div>
                            <div><p className="text-xs font-bold text-gray-400 uppercase">Date</p><p className="font-bold">{formatDateOnly(selectedPrescription.date)}</p></div>
                        </div>
                    </div>

                    {!bill ? (
                        <>
                             {/* Validated List */}
                             <div className="mb-8">
                                <h3 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2"><div className="w-1 h-6 bg-secondary rounded-full"></div> 1. Médicaments Prescrits</h3>
                                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
                                            <tr>
                                                <th className="p-4">Médicament</th>
                                                <th className="p-4">Dosage</th>
                                                <th className="p-4 text-center">Qté</th>
                                                <th className="p-4 text-right">Prix Unit.</th>
                                                <th className="p-4 text-right">Total</th>
                                                {!isListValidated && <th className="p-4 text-center">Action</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {cart.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50/50">
                                                    <td className="p-4 font-bold text-gray-700">{item.name}</td>
                                                    <td className="p-4 text-gray-500 text-sm">{item.dosage}</td>
                                                    <td className="p-4 text-center font-bold">{item.quantity}</td>
                                                    <td className="p-4 text-right text-gray-600">{item.price.toLocaleString()}</td>
                                                    <td className="p-4 text-right font-black text-primary-end">{item.total.toLocaleString()}</td>
                                                    {!isListValidated && (
                                                        <td className="p-4 text-center">
                                                            <button onClick={() => removeFromCart(index)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-all"><FaTrash /></button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                            <tr className="bg-gray-50">
                                                <td colSpan="4" className="p-4 text-right font-bold text-gray-500 uppercase">Total</td>
                                                <td className="p-4 text-right font-black text-xl text-gray-800">{calculateTotal().toLocaleString()} FCFA</td>
                                                {!isListValidated && <td></td>}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                             </div>

                             {/* Validation/Payment Area */}
                             {!isListValidated ? (
                                 <div className="flex justify-end">
                                     <button 
                                         onClick={handleValidateList}
                                         disabled={cart.length === 0}
                                         className="bg-primary-end text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-opacity-90 transition-all flex items-center gap-2"
                                     >
                                         <FaCheckCircle /> Valider la Liste
                                     </button>
                                 </div>
                             ) : (
                                 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-secondary/10 p-8 rounded-2xl border-2 border-primary-end/20 shadow-xl shadow-slate-200">
                                     <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><FaMoneyBillWave className="text-primary-end" /> 2. Mode de Paiement</h3>
                                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                         {financialOperations.map((operation) => (
                                             <button
                                                 key={operation.id}
                                                 type="button"
                                                 onClick={() => setSelectedOp(operation.id)}
                                                 className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 h-28 ${
                                                     selectedOp == operation.id 
                                                     ? "border-primary-end bg-white text-primary-end shadow-lg scale-105 shadow-primary-end/10" 
                                                     : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:shadow-md"
                                                 }`}
                                             >
                                                 <div className="text-3xl">{getOpIcon(operation.name)}</div>
                                                 <span className="text-xs font-black uppercase tracking-wider text-center">{operation.name}</span>
                                                 {selectedOp == operation.id && <div className="absolute -top-2 -right-2 bg-primary-end text-white rounded-full p-1 shadow-md"><FaCheckCircle size={12} /></div>}
                                             </button>
                                         ))}
                                     </div>
                                     <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                         <button onClick={() => setIsListValidated(false)} className="px-6 py-3 text-slate-400 font-bold rounded-xl hover:bg-slate-50 transition-all uppercase text-sm tracking-widest">Retour</button>
                                         <button 
                                             onClick={handlePayment} 
                                             disabled={isSubmitting || !selectedOp}
                                             className="px-10 py-4 bg-primary-end text-white font-black rounded-xl shadow-xl shadow-primary-end/30 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:bg-slate-300 disabled:shadow-none"
                                         >
                                             {isSubmitting ? 'Traitement...' : <><FaMoneyBillWave size={20} /> CONFIRMER LE PAIEMENT</>}
                                         </button>
                                     </div>
                                 </div>
                             )}
                        </>
                    ) : (
                        // Success View
                        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border border-gray-100 animate-in zoom-in-95 duration-300">
                             <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-200 animate-bounce"><FaCheckCircle size={48} /></div>
                             <h2 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">Paiement Réussi !</h2>
                             <p className="text-slate-500 mb-8 font-medium">La facture a été générée et le stock mis à jour.</p>
                             <div className="flex gap-6">
                                 <button onClick={printInvoice} className="px-10 py-4 bg-slate-800 text-white font-black rounded-xl shadow-xl shadow-slate-300 hover:bg-slate-900 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"><FaPrint /> IMPRIMER REÇU</button>
                                 <button onClick={() => setSelectedPrescription(null)} className="px-10 py-4 bg-white border-2 border-slate-200 text-slate-700 font-black rounded-xl hover:bg-slate-50 transition-all hover:scale-105 active:scale-95">RETOUR À LA LISTE</button>
                             </div>
                        </div>
                    )}
                </div>
            )}
            
            <SuccessModal isOpen={showSuccessModal} canOpenSuccessModal={setShowSuccessModal} message="Vente enregistrée avec succès !" />
        </div>
    );
}
