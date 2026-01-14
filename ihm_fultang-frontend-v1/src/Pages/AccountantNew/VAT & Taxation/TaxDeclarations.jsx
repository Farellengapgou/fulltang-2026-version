import { useState, useEffect, useCallback } from "react";
import { Search, Plus, RefreshCw, Download, Eye, Edit2, Trash2 } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import taxService from "../../../Services/Accounting/taxService";

export function TaxDeclarations() {
    const [isLoading, setIsLoading] = useState(false);
    const [declarations, setDeclarations] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const loadDeclarations = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await taxService.getTaxDeclarations();
             // Simulation fallback
            if (!data || data.length === 0) {
                 setDeclarations([
                     { id: 1, date: '2024-02-15', reference: 'DEC-TVA-JAN24', type: 'TVA', amount: 600000, status: 'SUBMITTED' },
                     { id: 2, date: '2024-03-15', reference: 'DEC-IS-AC24', type: 'IS Acompte', amount: 1200000, status: 'PAID' },
                     { id: 3, date: '2024-02-15', reference: 'DEC-IRPP-JAN24', type: 'IRPP', amount: 45000, status: 'DRAFT' },
                 ]);
            } else {
                setDeclarations(data);
            }
            setErrorMessage("");
        } catch (error) {
            console.error("Erreur:", error);
             setDeclarations([
                     { id: 1, date: '2024-02-15', reference: 'DEC-TVA-JAN24', type: 'TVA', amount: 600000, status: 'SUBMITTED' },
                     { id: 2, date: '2024-03-15', reference: 'DEC-IS-AC24', type: 'IS Acompte', amount: 1200000, status: 'PAID' },
                     { id: 3, date: '2024-02-15', reference: 'DEC-IRPP-JAN24', type: 'IRPP', amount: 45000, status: 'DRAFT' },
                 ]);
            setErrorMessage("Mode simulation: Impossible de charger les déclarations.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDeclarations();
    }, [loadDeclarations]);

    const filteredDeclarations = declarations.filter(decl =>
        decl.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        decl.type?.toLowerCase().includes(searchTerm.toLowerCase())
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
                        <h1 className="text-2xl font-bold text-gray-800">Déclarations Fiscales</h1>
                        <p className="text-gray-600 mt-1">Suivi des déclarations de taxes (TVA, IR, IS)</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={loadDeclarations} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                            <RefreshCw className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Actualiser
                        </button>
                        <button className="flex items-center px-4 py-2 bg-primary-end text-white rounded-lg hover:bg-teal-700">
                            <Plus className="h-5 w-5 mr-2" />
                            Nouvelle Déclaration
                        </button>
                    </div>
                </div>
                
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Rechercher par référence ou type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none"
                        />
                    </div>
                </div>

                {errorMessage && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-yellow-700">
                        {errorMessage}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredDeclarations.length > 0 ? (
                                filteredDeclarations.map((decl) => (
                                    <tr key={decl.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(decl.date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{decl.reference}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{decl.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">{formatCurrency(decl.amount || 0)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${decl.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' : 
                                                  decl.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {decl.status === 'SUBMITTED' ? 'Soumise' : decl.status === 'PAID' ? 'Payée' : 'Brouillon'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <div className="flex justify-center space-x-2">
                                                <button className="text-teal-600 hover:text-teal-900" title="Voir"><Eye size={18} /></button>
                                                <button className="text-indigo-600 hover:text-indigo-900" title="Modifier"><Edit2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                        {isLoading ? "Chargement..." : "Aucune déclaration trouvée"}
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
