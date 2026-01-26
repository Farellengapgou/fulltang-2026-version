import React, { useState, useEffect } from 'react';
import { Search, Calendar, User, CheckCircle, Printer, Trash2, ArrowLeft, Stethoscope, AlertCircle } from 'lucide-react';
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
                        // Use quantity_remaining from backend, or default to quantity if not present
                        const remaining = drug.quantity_remaining !== undefined ? drug.quantity_remaining : drug.quantity;
                        return {
                            id: drug.medicament?.id,
                            name: drug.medicament?.name,
                            price: drug.medicament?.price || 0,
                            quantity: drug.quantity, // Original prescribed qty
                            quantity_remaining: remaining,
                            dosage: drug.dosage || "",
                            frequency: drug.frequency || "",
                            duration: drug.duration || "",
                            instructions: drug.instructions || "",
                            total: (drug.medicament?.price || 0) * remaining
                        };
                    });

                    // Filter out prescriptions where all drugs are fully paid (remaining == 0)
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
                .filter(p => !p.isCompleted); // Hide completed prescriptions

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
            setFinancialOperations(response.data || []);
            const pharOp = (response.data || []).find(op => op.name.toLowerCase().includes('pharmacie') || op.name.toLowerCase().includes('caisse'));
            if (pharOp) setSelectedOp(pharOp.id);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSelectPrescription = (p) => {
        setSelectedPrescription(p);
        // Only add items with remaining quantity > 0
        const activeDrugs = p.drugs.filter(d => d.quantity_remaining > 0).map(d => ({
            ...d,
            quantity: d.quantity_remaining, // Set cart qty to remaining (user can reduce this before payment potentially?)
            // Ideally we allow user to pay LESS than remaining, but for now we set it to remaining.
            // If we want to support partial of partial (e.g. pay 1 of 5 remaining), we need editable inputs.
            // For now, let's assume valid List means "Paying for these items in full remaining qty"
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
                // Refresh list
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
                        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                        .header h1 { margin: 0; color: #1A73A3; font-size: 24px; text-transform: uppercase; }
                        .header p { margin: 5px 0; color: #666; font-size: 12px; }
                        
                        .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
                        .info-box { width: 48%; }
                        .info-label { font-size: 10px; text-transform: uppercase; color: #999; font-weight: bold; }
                        .info-value { font-size: 14px; font-weight: bold; }

                        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        th { text-align: left; padding: 12px 8px; border-bottom: 2px solid #eee; font-size: 11px; text-transform: uppercase; color: #666; }
                        td { padding: 12px 8px; border-bottom: 1px solid #f5f5f5; font-size: 13px; }
                        .text-right { text-align: right; }
                        .text-center { text-align: center; }

                        .total-section { text-align: right; margin-top: 20px; }
                        .total-row { display: flex; justify-content: flex-end; align-items: center; margin-bottom: 5px; }
                        .total-label { font-size: 12px; margin-right: 20px; color: #666; }
                        .total-value { font-size: 18px; font-weight: bold; color: #000; }
                        
                        .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>FULTANG CLINIC</h1>
                        <p>Health Services & Pharmacy</p>
                    </div>

                    <div class="info-section">
                        <div class="info-box">
                            <div class="info-label">Patient</div>
                            <div class="info-value">${selectedPrescription?.patientName || ''}</div>
                            <div class="info-label" style="margin-top: 10px;">Prescribing Doctor</div>
                            <div class="info-value">${selectedPrescription?.doctorName || ''}</div>
                        </div>
                        <div class="info-box" style="text-align: right;">
                            <div class="info-label">Invoice No</div>
                            <div class="info-value">${bill.billCode}</div>
                            <div class="info-label" style="margin-top: 10px;">Date & Time</div>
                            <div class="info-value">${new Date().toLocaleString()}</div>
                            <div class="info-label" style="margin-top: 10px;">Operator</div>
                            <div class="info-value">${userName}</div>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th class="text-center">Qty</th>
                                <th class="text-right">U.P (FCFA)</th>
                                <th class="text-right">Total (FCFA)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${bill.bill_items.map(item => `
                                <tr>
                                    <td>${item.designation}</td>
                                    <td class="text-center">${item.quantity}</td>
                                    <td class="text-right">${(item.unityPrice || 0).toLocaleString()}</td>
                                    <td class="text-right">${(item.total || 0).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="total-section">
                        <div class="total-row">
                            <span class="total-label">Payment Method:</span>
                            <span>${displayOpName(selectedOp)}</span>
                        </div>
                        <div class="total-row" style="margin-top: 10px;">
                            <span class="total-label">NET TOTAL:</span>
                            <span class="total-value">${(bill.amount || 0).toLocaleString()} FCFA</span>
                        </div>
                    </div>

                    <div class="footer">
                        <p>Thank you for your trust. Get well soon!</p>
                        <p>Printed on ${new Date().toLocaleDateString()}</p>
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

    const displayOpName = (opId) => {
        const op = financialOperations.find(o => o.id == opId);
        return op ? op.name : 'Cash';
    };

    return (
        <div className="w-full mx-auto p-6 bg-slate-50 min-h-full">

            {selectedPrescription ? (
                // VIEW: DETAIL / PAYMENT
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full overflow-y-auto">
                    <div className="flex items-center mb-6">
                        <button
                            onClick={() => setSelectedPrescription(null)}
                            className="mr-4 p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Prescription Details</h2>
                            <p className="text-sm text-gray-500">Processing prescription</p>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-full border border-gray-200 shadow-sm">
                                <User size={20} className="text-primary-end" />
                            </div>
                            <div>
                                <p className="text-xs uppercase font-bold text-gray-400">Patient</p>
                                <p className="font-bold text-gray-700">{selectedPrescription.patientName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-full border border-gray-200 shadow-sm">
                                <Stethoscope size={20} className="text-primary-end" />
                            </div>
                            <div>
                                <p className="text-xs uppercase font-bold text-gray-400">Doctor</p>
                                <p className="font-bold text-gray-700">{selectedPrescription.doctorName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-full border border-gray-200 shadow-sm">
                                <Calendar size={20} className="text-primary-end" />
                            </div>
                            <div>
                                <p className="text-xs uppercase font-bold text-gray-400">Date</p>
                                <p className="font-bold text-gray-700">{formatDateOnly(selectedPrescription.date)}</p>
                            </div>
                        </div>
                    </div>

                    {!bill ? (
                        <>
                            {/* 1. Medication List */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-3 ml-2 border-l-4 border-primary-end pl-2">
                                    1. Prescribed Medications
                                </h3>
                                <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-100 border-b border-gray-200">
                                            <tr>
                                                <th className="p-4 font-bold text-gray-600">Medication Name</th>
                                                <th className="p-4 font-bold text-gray-600">Dosage</th>
                                                <th className="p-4 font-bold text-gray-600 text-center">Qty</th>
                                                <th className="p-4 font-bold text-gray-600 text-right">Unit Price</th>
                                                <th className="p-4 font-bold text-gray-600 text-right">Total</th>
                                                {!isListValidated && <th className="p-4 font-bold text-gray-600 text-center">Action</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {cart.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="p-4 font-medium text-gray-800">{item.name}</td>
                                                    <td className="p-4 text-gray-600">{item.dosage}</td>
                                                    <td className="p-4 text-center font-bold text-gray-800">{item.quantity}</td>
                                                    <td className="p-4 text-right text-gray-600">{item.price.toLocaleString()} FCFA</td>
                                                    <td className="p-4 text-right font-bold text-primary-end">{item.total.toLocaleString()} FCFA</td>
                                                    {!isListValidated && (
                                                        <td className="p-4 text-center">
                                                            <button
                                                                onClick={() => removeFromCart(index)}
                                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                                                title="Remove from list"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                            {cart.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" className="p-8 text-center text-gray-400 italic">No medications in list.</td>
                                                </tr>
                                            )}
                                            {cart.length > 0 && (
                                                <tr className="bg-gray-50 font-bold">
                                                    <td colSpan="4" className="p-4 text-right text-gray-700 uppercase">Grand Total</td>
                                                    <td className="p-4 text-right text-xl text-primary-end">{calculateTotal().toLocaleString()} FCFA</td>
                                                    {!isListValidated && <td></td>}
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* 2. Validation & Payment */}
                            {!isListValidated ? (
                                <div className="flex justify-end mt-6">
                                    <button
                                        onClick={handleValidateList}
                                        disabled={cart.length === 0}
                                        className="px-8 py-3 bg-primary-end text-white font-bold rounded-lg shadow hover:bg-opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CheckCircle size={20} /> Validate List
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h3 className="text-lg font-bold text-gray-800 mb-3 ml-2 border-l-4 border-primary-end pl-2">
                                        2. Payment
                                    </h3>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
                                        <div className="flex flex-col md:flex-row items-end gap-6">
                                            <div className="flex-1 w-full">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Select Payment Method</label>
                                                <select
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end outline-none bg-white"
                                                    value={selectedOp || ''}
                                                    onChange={(e) => setSelectedOp(e.target.value)}
                                                >
                                                    <option value="">-- Select --</option>
                                                    {financialOperations.map(op => (
                                                        <option key={op.id} value={op.id}>{op.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => setIsListValidated(false)}
                                                    className="px-6 py-3 border border-gray-300 text-gray-600 font-bold rounded-lg hover:bg-gray-100 transition-all"
                                                >
                                                    Edit List
                                                </button>
                                                <button
                                                    onClick={handlePayment}
                                                    disabled={isSubmitting || !selectedOp}
                                                    className="px-8 py-3 bg-secondary text-white font-bold rounded-lg shadow hover:bg-opacity-90 transition-all flex items-center gap-2 min-w-[200px] justify-center disabled:opacity-50"
                                                >
                                                    {isSubmitting ? "Processing..." : "Confirm Payment"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        // Success / Invoice State
                        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <CheckCircle size={40} />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
                            <p className="text-gray-500 mb-8 max-w-md text-center">The sale has been recorded successfully. You can now print the invoice for the customer.</p>

                            <div className="flex gap-4">
                                <button
                                    onClick={printInvoice}
                                    className="px-8 py-3 bg-primary-end text-white font-bold rounded-lg shadow hover:bg-opacity-90 transition-all flex items-center gap-2"
                                >
                                    <Printer size={20} /> Print Invoice
                                </button>
                                <button
                                    onClick={() => setSelectedPrescription(null)}
                                    className="px-8 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-all"
                                >
                                    Back to List
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                // VIEW: LIST
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[600px]">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Sales with Prescription (Pharmacy)</h1>

                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                        <div className="relative w-full md:w-1/3">
                            <input
                                type="text"
                                placeholder="Search prescription..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-10 font-bold text-gray-400">Loading Prescriptions...</div>
                    ) : (
                        <div className="overflow-hidden border border-gray-200 rounded-lg">
                            {prescriptions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10">
                                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                                        <AlertCircle className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <p className="text-lg font-semibold text-gray-600">
                                        No prescriptions available
                                    </p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-primary-end">
                                        <tr>
                                            <th className="px-6 py-5 text-center text-md font-bold text-white uppercase rounded-tl-lg">Date</th>
                                            <th className="px-6 py-5 text-center text-md font-bold text-white uppercase">Patient</th>
                                            <th className="px-6 py-5 text-center text-md font-bold text-white uppercase">Doctor</th>
                                            <th className="px-6 py-5 text-center text-md font-bold text-white uppercase rounded-tr-lg">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredPrescriptions.map((p) => (
                                            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-6 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                                                        <span className="font-semibold text-gray-700">{formatDateOnly(p.date)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <User className="h-5 w-5 text-gray-400 mr-2" />
                                                        <span className="font-semibold text-gray-900">{p.patientName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <Stethoscope className="h-5 w-5 text-gray-400 mr-2" />
                                                        <span className="font-semibold text-gray-700">{p.doctorName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    <button
                                                        onClick={() => handleSelectPrescription(p)}
                                                        className="text-primary-end hover:text-green-700 font-bold transition-colors border border-primary-end px-4 py-2 rounded-full hover:bg-green-50"
                                                    >
                                                        View / Sell
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    <SuccessModal
                        isOpen={showSuccessModal}
                        canOpenSuccessModal={setShowSuccessModal}
                        message="Payment successful! Invoice ready."
                    />
                </div>
            )}
        </div>
    );
}
