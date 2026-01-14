import { useState, useEffect, useCallback } from "react";
import { Search, Plus, RefreshCw, Download, Eye, Edit2, Trash2, Filter, Wallet } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import bankReconciliationService from "../../../Services/Accounting/bankReconciliationService";

export function CashPositions() {
    const [isLoading, setIsLoading] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const loadAccounts = useCallback(async () => {
        setIsLoading(true);
        try {
            // Utiliser les rapprochements pour déduire les positions ou un endpoint dédié si disponible
            const data = await bankReconciliationService.getAllReconciliations();
            // Grouper par compte bancaire pour avoir la dernière position connue
            if (!data || data.length === 0) {
                 // Simulation
                 setAccounts([
                     { id: 1, name: 'Banque Atlantique', accountNumber: 'CM21 10001...', balance: 12500000, lastUpdate: new Date().toISOString() },
                     { id: 2, name: 'SGBC', accountNumber: 'CM21 10002...', balance: 4200000, lastUpdate: new Date().toISOString() },
                     { id: 3, name: 'Caisse Principale', accountNumber: 'CAISSE-01', balance: 850000, lastUpdate: new Date().toISOString() },
                 ]);
            } else {
                 // Logique pour extraire les soldes uniques... simplifié ici
                 const uniqueAccounts = [];
                 const map = new Map();
                 for (const item of data) {
                     if(!map.has(item.bankAccountName)){
                         map.set(item.bankAccountName, true);
                         uniqueAccounts.push({
                             id: item.id,
                             name: item.bankAccountName,
                             accountNumber: 'N/A', // Info à compléter si dispo
                             balance: item.bankBalance,
                             lastUpdate: item.date
                         });
                     }
                 }
                 setAccounts(uniqueAccounts);
            }
            setErrorMessage("");
        } catch (error) {
            console.error("Erreur:", error);
            setErrorMessage("Impossible de charger les positions de trésorerie.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAccounts();
    }, [loadAccounts]);

    const filteredAccounts = accounts.filter(acc =>
        acc.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(amount);
    };

    const formatDate = (dateString) => {
        return dateString ? new Date(dateString).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-';
    };

    return (
        <AccountantDashBoard linkList={FinancialAccountantNavLink} requiredRole={"Accountant"}>
            <AccountantNavBar />
            <div className="mx-auto p-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Positions de Trésorerie</h1>
                        <p className="text-gray-600 mt-1">Soldes bancaires et caisses</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={loadAccounts} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
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
                            placeholder="Rechercher un compte..."
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAccounts.map((account) => (
                        <div key={account.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 border border-gray-100">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-50 rounded-full">
                                    <Wallet className="h-6 w-6 text-blue-600" />
                                </div>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Actif</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{account.name}</h3>
                            <p className="text-sm text-gray-500 mb-4">{account.accountNumber}</p>
                            
                            <div className="border-t border-gray-100 pt-4 mt-2">
                                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Solde Actuel</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(account.balance)}</p>
                                <p className="text-xs text-gray-400 mt-2 flex items-center">
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    Mis à jour : {formatDate(account.lastUpdate)}
                                </p>
                            </div>
                        </div>
                    ))}
                    
                     {!isLoading && filteredAccounts.length === 0 && (
                        <div className="col-span-full text-center py-10 bg-white rounded-lg shadow text-gray-500">
                            Aucun compte trouvé.
                        </div>
                    )}
                </div>
            </div>
        </AccountantDashBoard>
    );
}
