import { useState } from "react";
import { AlertTriangle, AlertCircle, CheckCircle, Info } from "lucide-react";
import { FinancialAccountantDashBoard } from "../DashBoard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { FinancialAccountantNavBar } from "../NavBar.jsx";

export function BudgetAlerts() {
  const [alerts] = useState([
    {
      id: 1,
      level: "critical",
      category: "Maintenance",
      message: "Dépassement de 12.5% détecté",
      actualAmount: 13500000,
      budgetAmount: 12000000,
      action: "Réviser le budget ou réduire les dépenses",
    },
    {
      id: 2,
      level: "warning",
      category: "Fournitures",
      message: "Dépassement de 8% détecté",
      actualAmount: 16200000,
      budgetAmount: 15000000,
      action: "Monitorer de près",
    },
    {
      id: 3,
      level: "info",
      category: "Personnel",
      message: "Economie de 5.6% réalisée",
      actualAmount: 42500000,
      budgetAmount: 45000000,
      action: "Continue ainsi",
    },
  ]);

  const getAlertIcon = (level) => {
    switch (level) {
      case "critical":
        return <AlertTriangle className="w-5 h-5" />;
      case "warning":
        return <AlertCircle className="w-5 h-5" />;
      case "info":
        return <Info className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getAlertStyles = (level) => {
    switch (level) {
      case "critical":
        return "bg-red-50 border-red-200 text-red-900";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-900";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-900";
      default:
        return "bg-green-50 border-green-200 text-green-900";
    }
  };

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
            <h1 className="text-3xl font-bold mb-2">Alertes Budgétaires</h1>
            <p className="opacity-90">
              Suivi des dépassements et anomalies budgétaires
            </p>
          </div>

          {/* Alerts List */}
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-6 hover:shadow-md transition-shadow ${getAlertStyles(
                  alert.level
                )}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getAlertIcon(alert.level)}</div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        {alert.category}
                      </h3>
                      <p className="text-sm mb-3">{alert.message}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs opacity-75">Budget Prévu</p>
                          <p className="font-semibold">
                            {(alert.budgetAmount / 1000000).toFixed(1)}M FCFA
                          </p>
                        </div>
                        <div>
                          <p className="text-xs opacity-75">Montant Réalisé</p>
                          <p className="font-semibold">
                            {(alert.actualAmount / 1000000).toFixed(1)}M FCFA
                          </p>
                        </div>
                        <div>
                          <p className="text-xs opacity-75">Écart</p>
                          <p className="font-semibold">
                            {(
                              (alert.actualAmount - alert.budgetAmount) /
                              1000000
                            ).toFixed(1)}
                            M FCFA
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold">
                        Action: {alert.action}
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-primary-end text-white rounded-lg text-sm font-semibold hover:bg-teal-800">
                    Gérer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FinancialAccountantDashBoard>
  );
}
