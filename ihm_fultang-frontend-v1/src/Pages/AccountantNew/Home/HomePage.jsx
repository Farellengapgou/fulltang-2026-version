import {
    FaChartLine,
    FaCalculator,
    FaEdit,
    FaChartBar,
    FaUserTie,
} from 'react-icons/fa';
import {
    TrendingUp,
    FileText,
    Calendar,
    PieChart
} from 'lucide-react';

import { useNavigate } from "react-router-dom";
import { AppRoutesPaths as AppRouterPaths } from "../../../Router/appRouterPaths.js";
import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import StatCard from "../../../GlobalComponents/StatCard.jsx";
import QuickActionButton from "../../../GlobalComponents/QuickActionButton.jsx";
import { useState, useEffect } from 'react';
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";

export function FinancialAccountantHomePage() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalRevenue: 0,
        monthlyExpenses: 0,
        pendingInvoices: 0,
        cashBalance: 0,
        journalEntries: 0,
        payrollCost: 0,
        budgetVariance: 0,
        pendingReconciliations: 0
    });

    const [recentActivities, setRecentActivities] = useState([]);
    const expenseBreakdown = [];
    const currentPeriodLabel = new Date().toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric'
    });

    useEffect(() => {
        async function fetchFinancialStats() {
            try {
                setStats((prev) => prev);
                setRecentActivities([]);
            } catch (error) {
                console.error("Erreur lors de la récupération des statistiques financières:", error);
            }
        }
        fetchFinancialStats();
    }, []);

    // Fonction pour formater les montants en FCFA
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount) + ' FCFA';
    };

    return (
        <CustomDashboard linkList={FinancialAccountantNavLink} requiredRole={"Accountant"}>
            <FinancialAccountantNavBar />
            <div className="p-6 space-y-6">
                {/* En-tête du dashboard */}
                <div className="bg-gradient-to-r from-primary-end to-primary-start rounded-lg p-6 text-white">
                    <h1 className="text-3xl font-bold mb-2">Tableau de Bord Comptabilité Financière</h1>
                    <p className="opacity-90 font-semibold text-xl">
                        Pilotez la santé financière de votre établissement médical avec des indicateurs en temps réel.
                    </p>
                    <div className="mt-4 text-sm opacity-80">
                        Période : {currentPeriodLabel} | Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
                    </div>
                </div>

                {/* Indicateurs financiers clés */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={TrendingUp}
                        title="Résultat d'Exploitation"
                        value={formatCurrency(stats.totalRevenue - stats.monthlyExpenses)}
                        description="Bénéfice mensuel"
                        color="bg-blue-500"
                    />
                    <StatCard
                        icon={FaUserTie}
                        title="Masse Salariale"
                        value={formatCurrency(stats.payrollCost)}
                        description="Coût du personnel"
                        color="bg-orange-500"
                    />
                    <StatCard
                        icon={FaEdit}
                        title="Écritures Comptables"
                        value={stats.journalEntries}
                        description="Saisies du mois"
                        color="bg-indigo-500"
                    />
                    <StatCard
                        icon={FileText}
                        title="Factures en Attente"
                        value={stats.pendingInvoices}
                        description="À valider"
                        color="bg-yellow-500"
                    />
                </div>


                {/* Actions rapides */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <FaChartBar className="mr-2" />
                        Accès Rapide - Comptabilité
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <QuickActionButton
                            icon={FaEdit}
                            label="Nouvelle Écriture"
                            onClick={() => navigate(AppRouterPaths.financialAccountantJournalEntries)}
                        />
                        <QuickActionButton
                            icon={FaChartLine}
                            label="Analyse Financière"
                            onClick={() => navigate(AppRouterPaths.financialRatios)}
                        />
                        <QuickActionButton
                            icon={FaUserTie}
                            label="Comptabilité Paie"
                            onClick={() => navigate(AppRouterPaths.financialAccountPayroll)}
                        />
                        <QuickActionButton
                            icon={FaCalculator}
                            label="Budget & Contrôle"
                            onClick={() => navigate(AppRouterPaths.budgetEntry)}
                        />
                    </div>
                </div>

                {/* Tableaux de bord et activités récentes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Répartition des dépenses */}
                    <div className="bg-gray-100 rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <PieChart className="mr-2" />
                            Répartition des Charges
                        </h3>
                        <div className="space-y-3">
                            {expenseBreakdown.length === 0 ? (
                                <p className="text-sm text-gray-600">Aucune donnée disponible.</p>
                            ) : (
                                expenseBreakdown.map((item) => (
                                    <div key={item.label} className="flex justify-between items-center">
                                        <span className="text-sm font-medium">{item.label}</span>
                                        <div className="flex items-center">
                                            <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                                                <div className={`${item.color} h-2 rounded-full`} style={{width: item.value}}></div>
                                            </div>
                                            <span className="text-sm text-gray-600">{item.value}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Activités récentes */}
                    <div className="bg-gray-100 rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <Calendar className="mr-2" />
                            Activités Récentes
                        </h3>
                        <div className="space-y-3">
                            {recentActivities.map((activity) => (
                                <div key={activity.id} className="bg-white flex items-start p-3  rounded-lg">
                                    <div className={`p-2 rounded-full mr-3 ${
                                        activity.type === 'journal' ? 'bg-blue-100 text-blue-600' :
                                            activity.type === 'reconciliation' ? 'bg-green-100 text-green-600' :
                                                activity.type === 'payroll' ? 'bg-purple-100 text-purple-600' :
                                                    'bg-orange-100 text-orange-600'
                                    }`}>
                                        {activity.type === 'journal' && <FaEdit className="w-3 h-3" />}
                                        {activity.type === 'reconciliation' && <FaCalculator className="w-3 h-3" />}
                                        {activity.type === 'payroll' && <FaUserTie className="w-3 h-3" />}
                                        {activity.type === 'analysis' && <FaChartLine className="w-3 h-3" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                        <p className="text-xs text-gray-600">{activity.description}</p>
                                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </CustomDashboard>
    );
}
