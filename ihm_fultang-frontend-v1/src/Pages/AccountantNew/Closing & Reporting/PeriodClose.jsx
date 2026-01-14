import { useState } from "react";
import { CheckCircle, AlertCircle, Clock, Lock } from "lucide-react";
import { FinancialAccountantDashBoard } from "../DashBoard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { FinancialAccountantNavBar } from "../NavBar.jsx";

export function PeriodClose() {
  const [closingSteps, setClosingSteps] = useState([
    {
      id: 1,
      step: "Vérification des Transactions",
      description:
        "Vérifier que toutes les transactions ont été saisies et validées",
      status: "completed",
      date: "2025-06-25",
    },
    {
      id: 2,
      step: "Rapprochement Bancaire",
      description: "Reconcilier tous les comptes bancaires",
      status: "completed",
      date: "2025-06-28",
    },
    {
      id: 3,
      step: "Enregistrements d'Ajustement",
      description:
        "Enregistrer les écritures d'ajustement (amortissements, provisions)",
      status: "in_progress",
      date: null,
    },
    {
      id: 4,
      step: "Clôture des Comptes",
      description: "Clôturer les comptes de charges et produits",
      status: "pending",
      date: null,
    },
    {
      id: 5,
      step: "Génération des États Financiers",
      description: "Générer le bilan et compte de résultat",
      status: "pending",
      date: null,
    },
    {
      id: 6,
      step: "Approbation et Publication",
      description: "Obtenir l'approbation et publier les états financiers",
      status: "pending",
      date: null,
    },
  ]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "pending":
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: "bg-green-100 text-green-800",
      in_progress: "bg-blue-100 text-blue-800",
      pending: "bg-gray-100 text-gray-800",
    };
    const labels = {
      completed: "Complété",
      in_progress: "En Cours",
      pending: "En Attente",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          badges[status] || ""
        }`}
      >
        {labels[status]}
      </span>
    );
  };

  const completedSteps = closingSteps.filter(
    (s) => s.status === "completed"
  ).length;
  const progressPercent = (completedSteps / closingSteps.length) * 100;

  return (
    <FinancialAccountantDashBoard
      linkList={FinancialAccountantNavLink}
      requiredRole={"Accountant"}
    >
      <FinancialAccountantNavBar />
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-end to-primary-start rounded-xl text-white p-8 mb-8 shadow-lg">
            <h1 className="text-3xl font-bold mb-2">Clôture de Période</h1>
            <p className="opacity-90">
              Processus de clôture mensuelle/annuelle et ajustements
            </p>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Progression de Clôture
              </h2>
              <span className="text-2xl font-bold text-primary-end">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="h-4 rounded-full bg-gradient-to-r from-primary-end to-teal-600"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {completedSteps} sur {closingSteps.length} étapes complétées
            </p>
          </div>

          {/* Closing Steps */}
          <div className="space-y-4">
            {closingSteps.map((step, idx) => (
              <div
                key={step.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">{getStatusIcon(step.status)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {step.step}
                        </h3>
                        <span className="text-sm text-gray-500">
                          #{idx + 1}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{step.description}</p>
                      {step.date && (
                        <p className="text-sm text-gray-500">
                          Complété le {step.date}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(step.status)}
                    {step.status === "pending" && (
                      <button className="px-4 py-2 text-sm font-semibold text-primary-end border border-primary-end rounded-lg hover:bg-teal-50">
                        Commencer
                      </button>
                    )}
                    {step.status === "in_progress" && (
                      <button className="px-4 py-2 text-sm font-semibold text-white bg-primary-end rounded-lg hover:bg-teal-800">
                        Continuer
                      </button>
                    )}
                    {step.status === "completed" && (
                      <button className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Revoir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Closing Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Résumé de Clôture
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Période</p>
                <p className="text-2xl font-bold text-gray-900">Juin 2025</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  Total Transactions Clôturées
                </p>
                <p className="text-2xl font-bold text-gray-900">1,250</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Montant Total</p>
                <p className="text-2xl font-bold text-primary-end">
                  85.5M FCFA
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FinancialAccountantDashBoard>
  );
}
