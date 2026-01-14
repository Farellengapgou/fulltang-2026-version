import { useState, useEffect, useCallback } from "react";
import { Search, Plus, RefreshCw, Download, Eye, Edit2, Trash2, Filter } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, RefreshCw, Download, Eye, FileText, Calendar, Filter, ArrowLeft } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import chartOfAccountsService from "../../../Services/Accounting/chartOfAccountsService";

export function GrandLivre() {
    const [isLoading, setIsLoading] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [ledgerData, setLedgerData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    
    // Filtres de date
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const loadAccounts = useCallback(async () => {
        try {
            const data = await chartOfAccountsService.getDetailedAccounts();
            setAccounts(data);
        } catch (error) {
            console.error("Erreur chargement comptes:", error);
            setErrorMessage("Impossible de charger la liste des comptes.");
        }
    }, []);

    const loadLedger = useCallback(async (accountId) => {
        if (!accountId) return;
        setIsLoading(true);
        try {
            const data = await chartOfAccountsService.getAccountLedger(accountId, { start_date: startDate, end_date: endDate });
            setLedgerData(data);
        } catch (error) {
            console.error("Erreur chargement grand livre:", error);
            setErrorMessage("Impossible de charger le grand livre du compte.");
        } finally {
            setIsLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        loadAccounts();
    }, [loadAccounts]);

    useEffect(() => {
        if (selectedAccount) {
            loadLedger(selectedAccount.id);
        }
    }, [selectedAccount, loadLedger]);

    const filteredAccounts = accounts.filter(acc => 
        acc.code.includes(searchTerm) || acc.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    return (
        <AccountantDashBoard linkList={FinancialAccountantNavLink} requiredRole={"Accountant"}>
            <AccountantNavBar />
            <div className="mx-auto p-8 h-screen flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Grand Livre des Comptes</h1>
                        <p className="text-gray-600 mt-1">Consultation détaillée des mouvements par compte</p>
                    </div>
                </div>

                <div className="flex gap-6 flex-grow overflow-hidden">
                    {/* Liste des comptes (Sidebar) */}
                    <div className="w-1/3 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col">
                        <div className="p-4 border-b border-gray-100">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Chercher un compte..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2 space-y-2">
                            {filteredAccounts.map(account => (
                                <div 
                                    key={account.id}
                                    onClick={() => setSelectedAccount(account)}
                                    className={`p-3 rounded-lg cursor-pointer transition-all ${selectedAccount?.id === account.id ? 'bg-teal-50 border-l-4 border-teal-600 shadow-sm' : 'hover:bg-gray-50'}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-gray-800">{account.code}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${account.account_type === 'EXPENSE' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {account.account_type}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 truncate">{account.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Détail du compte (Main) */}
                    <div className="w-2/3 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col overflow-hidden">
                        {selectedAccount ? (
                            <>
                                <div className="p-6 border-b border-gray-100 bg-gray-50">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-teal-800">{selectedAccount.code} - {selectedAccount.label}</h2>
                                            <p className="text-sm text-gray-500">Classe {selectedAccount.account_class}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded p-1 text-sm"/>
                                            <span className="text-gray-400 self-center">-</span>
                                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded p-1 text-sm"/>
                                            <button onClick={() => loadLedger(selectedAccount.id)} className="p-1 bg-teal-600 text-white rounded hover:bg-teal-700">
                                                <RefreshCw size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-auto p-0">
                                    {isLoading ? (
                                        <div className="flex justify-center items-center h-full">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                                        </div>
                                    ) : ledgerData.length > 0 ? (
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-100 sticky top-0 z-10">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Journal</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Pièce</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Libellé</th>
                                                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Débit</th>
                                                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Crédit</th>
                                                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Solde</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {ledgerData.map((line, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 whitespace-nowrap">{formatDate(line.date)}</td>
                                                        <td className="px-4 py-3">{line.journal}</td>
                                                        <td className="px-4 py-3">{line.voucher || line.entry_number}</td>
                                                        <td className="px-4 py-3 max-w-xs truncate" title={line.label}>{line.label}</td>
                                                        <td className="px-4 py-3 text-right font-medium text-gray-600">{line.debit > 0 ? formatAmount(line.debit) : '-'}</td>
                                                        <td className="px-4 py-3 text-right font-medium text-gray-600">{line.credit > 0 ? formatAmount(line.credit) : '-'}</td>
                                                        <td className={`px-4 py-3 text-right font-bold ${line.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                            {formatAmount(line.balance)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                            <FileText size={48} className="mb-4 opacity-50"/>
                                            <p>Aucune écriture sur cette période</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50">
                                <ArrowLeft size={48} className="mb-4 opacity-50"/>
                                <p className="text-lg">Sélectionnez un compte pour voir son Grand Livre</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AccountantDashBoard>
    );
}
