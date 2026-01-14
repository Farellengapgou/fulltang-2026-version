import { useState } from "react";
import { TrendingUp, TrendingDown, Eye, RefreshCw } from "lucide-react";
import { FinancialAccountantDashBoard } from "../DashBoard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { FinancialAccountantNavBar } from "../NavBar.jsx";

export function CashPositions() {
  const [bankAccounts] = useState([
    {
      id: 1,
      bankName: "Banque BMCE",
      accountNumber: "****1234",
      balance: 45500000,
      lastUpdate: "2025-06-14 14:32",
      status: "active",
    },
    {
      id: 2,
      bankName: "Banque SG",
      accountNumber: "****5678",
      balance: 28300000,
      lastUpdate: "2025-06-14 14:32",
      status: "active",
    },
    {
      id: 3,
      bankName: "Caisse",
      accountNumber: "CASH-001",
      balance: 5200000,
      lastUpdate: "2025-06-14 15:00",
      status: "active",
    },
  ]);

  const totalCash = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);

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
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Positions de Trésorerie
                </h1>
                <p className="opacity-90">Soldes bancaires en temps réel</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-75">Total Trésorerie</p>
                <p className="text-4xl font-bold">
                  {(totalCash / 1000000).toFixed(1)}M FCFA
                </p>
              </div>
            </div>
          </div>

          {/* Bank Accounts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bankAccounts.map((account) => (
              <div
                key={account.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {account.bankName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {account.accountNumber}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    Actif
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Solde</p>
                  <p className="text-3xl font-bold text-primary-end">
                    {(account.balance / 1000000).toFixed(1)}M FCFA
                  </p>
                </div>

                <div className="border-t pt-4 text-sm text-gray-600">
                  <p>Mise à jour: {account.lastUpdate}</p>
                </div>

                <div className="flex gap-2 mt-4">
                  <button className="flex-1 p-2 border border-primary-end text-primary-end rounded-lg hover:bg-teal-50 font-semibold flex items-center justify-center">
                    <Eye className="w-4 h-4 mr-2" />
                    Détails
                  </button>
                  <button className="flex-1 p-2 bg-primary-end text-white rounded-lg hover:bg-teal-800 font-semibold flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualiser
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Dernières Transactions
            </h2>
            <div className="space-y-4">
              {[
                {
                  type: "in",
                  amount: 1250000,
                  description: "Facturation patients",
                  date: "14 juin",
                },
                {
                  type: "out",
                  amount: -850000,
                  description: "Paiement fournisseur",
                  date: "14 juin",
                },
                {
                  type: "in",
                  amount: 500000,
                  description: "Cotisations assurance",
                  date: "13 juin",
                },
              ].map((tx, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    {tx.type === "in" ? (
                      <TrendingUp className="w-5 h-5 text-green-600 mr-3" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600 mr-3" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">
                        {tx.description}
                      </p>
                      <p className="text-sm text-gray-600">{tx.date}</p>
                    </div>
                  </div>
                  <p
                    className={`font-semibold ${
                      tx.type === "in" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {tx.type === "in" ? "+" : ""}
                    {Math.abs(tx.amount).toLocaleString()} FCFA
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </FinancialAccountantDashBoard>
  );
}
