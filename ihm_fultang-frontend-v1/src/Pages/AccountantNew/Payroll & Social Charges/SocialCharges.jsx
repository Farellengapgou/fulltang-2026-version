import { useState, useEffect, useCallback } from "react";
import { Search, Plus, RefreshCw, Download, Eye, Edit2, Trash2, FileText } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import payrollService from "../../../Services/Accounting/payrollService";

export function SocialCharges() {
    const [isLoading, setIsLoading] = useState(false);
    const [charges, setCharges] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const loadCharges = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await payrollService.getAllPayrolls();
            // Simuler l'extraction des charges sociales depuis les bulletins si API dédiée non dispo
            let extractedCharges = [];
            
            if (data && data.length > 0) {
                 extractedCharges = data.map(payslip => ({
                    id: payslip.id,
                    period: payslip.periodStart,
                    reference: `CHG-${payslip.reference}`,
                    type: 'CNPS/Charges',
                    baseAmount: payslip.grossSalary,
                    employerShare: (payslip.grossSalary || 0) * 0.16, // Exemple 16% part patronale
                    employeeShare: (payslip.grossSalary || 0) * 0.04, // Exemple 4% part salariale
                    status: payslip.status === 'PAID' ? 'PAID' : 'PENDING'
                }));
            } else {
                 // Simulation si aucune donnée
                  extractedCharges = [
                     { id: 1, period: '2024-01-01', reference: 'CHG-JAN-001', type: 'CNPS', baseAmount: 1000000, employerShare: 160000, employeeShare: 40000, status: 'PAID' },
                     { id: 2, period: '2024-01-01', reference: 'CHG-JAN-002', type: 'IRPP', baseAmount: 1000000, employerShare: 0, employeeShare: 50000, status: 'PENDING' },
                 ];
            }

            setCharges(extractedCharges);
            setErrorMessage("");
        } catch (error) {
            console.error("Erreur:", error);
            setErrorMessage("Impossible de charger les charges sociales.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCharges();
    }, [loadCharges]);

    const filteredCharges = charges.filter(charge =>
        charge.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        charge.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(amount);
    };

    const formatDate = (dateString) => {
        return dateString ? new Date(dateString).toLocaleDateString('fr-FR') : '-';
    };

    return (
        <AccountantDashBoard linkList={FinancialAccountantNavLink} requiredRole={"Accountant"}>
            <AccountantNavBar />
            <div className="mx-auto p-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Charges Sociales</h1>
                        <p className="text-gray-600 mt-1">Suivi CNPS et charges fiscales sur salaires</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={loadCharges} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
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
                            placeholder="Rechercher..."
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Part Patronale</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Part Salariale</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total à Reverser</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCharges.length > 0 ? (
                                filteredCharges.map((charge) => (
                                    <tr key={charge.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(charge.period)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{charge.reference}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{charge.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{formatCurrency(charge.employerShare)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{formatCurrency(charge.employeeShare)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                                            {formatCurrency(charge.employerShare + charge.employeeShare)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${charge.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {charge.status === 'PAID' ? 'Déclaré & Payé' : 'À payer'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                                        {isLoading ? "Chargement..." : "Aucune charge sociale trouvée"}
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
