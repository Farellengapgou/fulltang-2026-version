import { useState, useEffect, useCallback } from "react";
import { Search, Plus, RefreshCw, Calendar, CheckSquare, AlertTriangle } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import supplierService from "../../../Services/Accounting/supplierService";

export function PaymentSchedule() {
    const [isLoading, setIsLoading] = useState(false);
    const [payments, setPayments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const loadPayments = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await supplierService.getPaymentSchedule();
             // Simulation
            if (!data || data.length === 0) {
                 const today = new Date();
                 const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
                 const pastDue = new Date(today); pastDue.setDate(today.getDate() - 3);

                 setPayments([
                     { id: 1, number: 'INV-SUP-002', supplierName: 'Laborex', dueDate: nextWeek.toISOString(), totalAmount: 450000 },
                     { id: 2, number: 'INV-SUP-003', supplierName: 'Eneo', dueDate: pastDue.toISOString(), totalAmount: 150000 },
                 ]);
            } else {
                setPayments(data);
            }
            setErrorMessage("");
        } catch (error) {
            console.error("Erreur:", error);
            setErrorMessage("Impossible de charger l'échéancier.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPayments();
    }, [loadPayments]);

    const filteredPayments = payments.filter(payment =>
        payment.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(amount);
    };

    const formatDate = (dateString) => {
        return dateString ? new Date(dateString).toLocaleDateString('fr-FR') : '-';
    };

    const getDaysDue = (dueDate) => {
        if (!dueDate) return 0;
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    };

    return (
        <AccountantDashBoard linkList={FinancialAccountantNavLink} requiredRole={"Accountant"}>
            <AccountantNavBar />
            <div className="mx-auto p-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Échéancier Paiements</h1>
                        <p className="text-gray-600 mt-1">Suivi des dettes fournisseurs</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={loadPayments} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                            <RefreshCw className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Actualiser
                        </button>
                    </div>
                </div>
                
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Rechercher par fournisseur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none"
                        />
                    </div>
                </div>

                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
                        {errorMessage}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Échéance</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fournisseur</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facture</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Reste à Payer</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Jours Restants</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPayments.length > 0 ? (
                                filteredPayments.map((payment) => {
                                    const daysDue = getDaysDue(payment.dueDate);
                                    return (
                                        <tr key={payment.id} className="hover:bg-gray-50 text-sm">
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500 flex items-center">
                                                <Calendar size={14} className="mr-2 text-gray-400"/>
                                                {formatDate(payment.dueDate)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{payment.supplierName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{payment.number}</td>
                                            <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 text-right">{formatCurrency(payment.totalAmount)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${daysDue < 0 ? 'bg-red-100 text-red-800' : daysDue < 7 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                    {daysDue < 0 ? `${Math.abs(daysDue)} j retard` : `${daysDue} j restants`}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button className="text-teal-600 hover:text-teal-900 font-medium">Payer</button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                        {isLoading ? "Chargement..." : "Aucun paiement en attente"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AccountantDashBoard>
    );
}
