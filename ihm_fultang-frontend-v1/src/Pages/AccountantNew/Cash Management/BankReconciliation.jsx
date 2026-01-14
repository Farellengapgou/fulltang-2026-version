import { useState } from "react";
import { CheckCircle, AlertCircle, Search } from "lucide-react";
import { FinancialAccountantDashBoard } from "../DashBoard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { FinancialAccountantNavBar } from "../NavBar.jsx";

export function BankReconciliation() {
  const [reconciliation] = useState({
    bankBalance: 45500000,
    bookBalance: 45300000,
    difference: 200000,
    lastReconciliation: "2025-05-31",
    status: "pending",
  });

  const [outstanding] = useState([
    {
      id: 1,
      date: "2025-05-28",
      description: "Chèque #1001",
      amount: 150000,
      status: "pending",
    },
    {
      id: 2,
      date: "2025-06-02",
      description: "Chèque #1002",
      amount: 50000,
      status: "pending",
    },
  ]);

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
            <h1 className="text-3xl font-bold mb-2">Rapprochement Bancaire</h1>
            <p className="opacity-90">
              Reconciliation des soldes bancaires et comptables
            </p>
          </div>

          {/* Reconciliation Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-2">Solde Bancaire</p>
              <p className="text-3xl font-bold text-primary-end">
                {(reconciliation.bankBalance / 1000000).toFixed(1)}M FCFA
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-2">Solde Comptable</p>
              <p className="text-3xl font-bold text-primary-end">
                {(reconciliation.bookBalance / 1000000).toFixed(1)}M FCFA
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-2">Différence</p>
              <p
                className={`text-3xl font-bold ${
                  reconciliation.difference === 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {(reconciliation.difference / 1000).toFixed(0)}K FCFA
              </p>
            </div>
          </div>

          {/* Outstanding Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Éléments en Suspens
            </h2>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Description
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Montant
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {outstanding.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                      {item.amount.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                        En Suspens
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </FinancialAccountantDashBoard>
  );
}
