import { useState, useEffect, useCallback } from "react";
import { Search, Plus, RefreshCw, Download, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import financialReportService from "../../../Services/Accounting/financialReportService";

export function FinancialStatements() {
    const [isLoading, setIsLoading] = useState(false);
    const [balanceSheet, setBalanceSheet] = useState([]);
    const [incomeStatement, setIncomeStatement] = useState([]);
    const [activeTab, setActiveTab] = useState("BILAN"); // BILAN or COMPTE_DE_RESULTAT
    const [errorMessage, setErrorMessage] = useState("");

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Chargement parallèle
            const [bilan, compteResultat] = await Promise.all([
                 financialReportService.getBalanceSheet(),
                 financialReportService.getIncomeStatement()
            ]);

            // Structure de simulation si vide
            if (!bilan || !bilan.assets) {
                // Fallback simulation pour démo
                setBalanceSheet({
                     assets: [
                         { code: '21', label: 'Immobilisations Incorporelles', amount: 5000000 },
                         { code: '24', label: 'Matériel Mobilier', amount: 12000000 },
                         { code: '52', label: 'Banques', amount: 4500000 },
                         { code: '57', label: 'Caisse', amount: 850000 },
                     ],
                     liabilities: [
                         { code: '10', label: 'Capital', amount: 15000000 },
                         { code: '13', label: 'Résultat Net', amount: 3500000 },
                         { code: '40', label: 'Fournisseurs', amount: 3850000 },
                     ]
                });
            } else {
                 setBalanceSheet(bilan);
            }

            if (!compteResultat || !compteResultat.expenses) {
                 setIncomeStatement({
                     revenue: [
                         { code: '70', label: 'Ventes de marchandises', amount: 25000000 },
                         { code: '72', label: 'Production immobilisée', amount: 0 },
                     ],
                     expenses: [
                         { code: '60', label: 'Achats de marchandises', amount: 12000000 },
                         { code: '61', label: 'Transports', amount: 1500000 },
                         { code: '66', label: 'Charges de personnel', amount: 8000000 },
                     ],
                     netIncome: 3500000
                 });
            } else {
                setIncomeStatement(compteResultat);
            }

            setErrorMessage("");
        } catch (error) {
            console.error("Erreur:", error);
            setErrorMessage("Impossible de charger les états financiers.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(amount);
    };

    const renderBilan = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800 uppercase text-center">Actif</h3>
                </div>
                <div className="p-4">
                    <table className="w-full text-sm">
                        <tbody>
                            {balanceSheet.assets?.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-50 last:border-0">
                                    <td className="py-2 text-gray-500 w-16">{item.code}</td>
                                    <td className="py-2 text-gray-800">{item.label}</td>
                                    <td className="py-2 text-right font-medium">{formatCurrency(item.amount)}</td>
                                </tr>
                            ))}
                            <tr className="border-t-2 border-gray-200">
                                <td colSpan="2" className="py-3 font-bold text-gray-900">TOTAL ACTIF</td>
                                <td className="py-3 text-right font-bold text-gray-900">
                                    {formatCurrency(balanceSheet.assets?.reduce((a, b) => a + b.amount, 0) || 0)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                 <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800 uppercase text-center">Passif</h3>
                </div>
                <div className="p-4">
                     <table className="w-full text-sm">
                        <tbody>
                            {balanceSheet.liabilities?.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-50 last:border-0">
                                    <td className="py-2 text-gray-500 w-16">{item.code}</td>
                                    <td className="py-2 text-gray-800">{item.label}</td>
                                    <td className="py-2 text-right font-medium">{formatCurrency(item.amount)}</td>
                                </tr>
                            ))}
                            <tr className="border-t-2 border-gray-200">
                                <td colSpan="2" className="py-3 font-bold text-gray-900">TOTAL PASSIF</td>
                                <td className="py-3 text-right font-bold text-gray-900">
                                    {formatCurrency(balanceSheet.liabilities?.reduce((a, b) => a + b.amount, 0) || 0)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderCompteResultat = () => (
         <div className="bg-white rounded-lg border border-gray-200 shadow-sm max-w-4xl mx-auto">
             <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 uppercase">Compte de Résultat</h3>
                 <span className={`px-3 py-1 rounded-full text-sm font-bold ${incomeStatement.netIncome >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                     Résultat: {formatCurrency(incomeStatement.netIncome || 0)}
                 </span>
            </div>
            <div className="p-6">
                <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 border-b pb-2">Produits</h4>
                 <table className="w-full text-sm mb-6">
                    <tbody>
                        {incomeStatement.revenue?.map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                <td className="py-2 text-gray-500 w-16">{item.code}</td>
                                <td className="py-2 text-gray-800">{item.label}</td>
                                <td className="py-2 text-right font-medium text-green-600">+{formatCurrency(item.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 border-b pb-2">Charges</h4>
                 <table className="w-full text-sm mb-6">
                    <tbody>
                        {incomeStatement.expenses?.map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                <td className="py-2 text-gray-500 w-16">{item.code}</td>
                                <td className="py-2 text-gray-800">{item.label}</td>
                                <td className="py-2 text-right font-medium text-red-600">-{formatCurrency(item.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         </div>
    );

    return (
        <AccountantDashBoard linkList={FinancialAccountantNavLink} requiredRole={"Accountant"}>
            <AccountantNavBar />
            <div className="mx-auto p-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">États Financiers OHADA</h1>
                        <p className="text-gray-600 mt-1">Bilan et Compte de Résultat</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={loadData} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                            <RefreshCw className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Actualiser
                        </button>
                    </div>
                </div>

                <div className="flex space-x-4 border-b border-gray-200 mb-6">
                    <button
                        className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'BILAN' ? 'border-primary-end text-primary-end' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('BILAN')}
                    >
                        Bilan
                    </button>
                    <button
                        className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'COMPTE_DE_RESULTAT' ? 'border-primary-end text-primary-end' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('COMPTE_DE_RESULTAT')}
                    >
                        Compte de Résultat
                    </button>
                </div>

                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
                        {errorMessage}
                    </div>
                )}
                
                {isLoading ? (
                     <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-end"></div>
                    </div>
                ) : (
                    <div className="min-h-[400px]">
                        {activeTab === 'BILAN' ? renderBilan() : renderCompteResultat()}
                    </div>
                )}
            </div>
        </AccountantDashBoard>
    );
}
