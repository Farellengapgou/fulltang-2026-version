import { useState } from "react";
import { Download, Eye, Print } from "lucide-react";
import { FinancialAccountantDashBoard } from "../DashBoard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { FinancialAccountantNavBar } from "../NavBar.jsx";

export function FinancialStatements() {
  const [statements] = useState([
    {
      id: 1,
      name: "Bilan (Balance Sheet)",
      period: "30 Juin 2025",
      date: "2025-06-30",
      status: "approved",
      assets: 450000000,
      liabilities: 150000000,
      equity: 300000000,
    },
    {
      id: 2,
      name: "Compte de Résultat (Income Statement)",
      period: "30 Juin 2025",
      date: "2025-06-30",
      status: "approved",
      revenue: 85500000,
      expenses: 65400000,
      netIncome: 20100000,
    },
    {
      id: 3,
      name: "État des Flux de Trésorerie (Cash Flow)",
      period: "30 Juin 2025",
      date: "2025-06-30",
      status: "approved",
      operatingCash: 18000000,
      investingCash: -5000000,
      financingCash: 0,
    },
    {
      id: 4,
      name: "Annexes (Notes)",
      period: "30 Juin 2025",
      date: "2025-06-30",
      status: "pending",
      pages: 12,
    },
  ]);

  const balanceSheetData = [
    { section: "ACTIF", category: "Actifs Circulants", amount: 150000000 },
    { section: "ACTIF", category: "Immobilisations", amount: 250000000 },
    { section: "ACTIF", category: "Autres Actifs", amount: 50000000 },
    { section: "PASSIF", category: "Dettes Court Terme", amount: 80000000 },
    { section: "PASSIF", category: "Dettes Long Terme", amount: 70000000 },
    { section: "PASSIF", category: "Capitaux Propres", amount: 300000000 },
  ];

  const incomeStatementData = [
    { line: "Revenus de Consultations", amount: 35000000 },
    { line: "Revenus d'Hospitalisations", amount: 25000000 },
    { line: "Revenus Analyses Lab", amount: 15000000 },
    { line: "Autres Revenus", amount: 10500000 },
    { line: "Total Revenus", amount: 85500000, bold: true },
    { line: "", amount: 0 },
    { line: "Coût Personnel", amount: -42500000 },
    { line: "Coût Fournitures", amount: -16000000 },
    { line: "Coût Utilities", amount: -7200000 },
    { line: "Total Charges", amount: -65400000, bold: true },
    { line: "", amount: 0 },
    {
      line: "Résultat Net",
      amount: 20100000,
      bold: true,
      color: "text-green-600",
    },
  ];

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
            <h1 className="text-3xl font-bold mb-2">États Financiers</h1>
            <p className="opacity-90">
              Bilan, Compte de résultat et états de flux de trésorerie
            </p>
          </div>

          {/* Available Statements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {statements.map((statement) => (
              <div
                key={statement.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {statement.name}
                    </h3>
                    <p className="text-sm text-gray-600">{statement.period}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      statement.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {statement.status === "approved"
                      ? "Approuvé"
                      : "En Attente"}
                  </span>
                </div>

                {statement.revenue && (
                  <div className="mb-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenus</span>
                      <span className="font-semibold text-green-600">
                        {(statement.revenue / 1000000).toFixed(1)}M FCFA
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Charges</span>
                      <span className="font-semibold text-red-600">
                        {(statement.expenses / 1000000).toFixed(1)}M FCFA
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-900 font-semibold">
                        Résultat Net
                      </span>
                      <span className="font-bold text-primary-end">
                        {(statement.netIncome / 1000000).toFixed(1)}M FCFA
                      </span>
                    </div>
                  </div>
                )}

                {statement.assets && (
                  <div className="mb-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Actifs</span>
                      <span className="font-semibold">
                        {(statement.assets / 1000000).toFixed(1)}M FCFA
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Dettes</span>
                      <span className="font-semibold">
                        {(statement.liabilities / 1000000).toFixed(1)}M FCFA
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-900 font-semibold">
                        Capitaux Propres
                      </span>
                      <span className="font-bold text-primary-end">
                        {(statement.equity / 1000000).toFixed(1)}M FCFA
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="flex-1 p-2 border border-primary-end text-primary-end rounded-lg hover:bg-teal-50 font-semibold flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    Voir
                  </button>
                  <button className="flex-1 p-2 bg-primary-end text-white rounded-lg hover:bg-teal-800 font-semibold flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Balance Sheet Detail */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              BILAN AU 30 JUIN 2025
            </h2>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Désignation
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Montant (FCFA)
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    % Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {balanceSheetData.map((row, idx) => (
                  <tr
                    key={idx}
                    className={row.section === "PASSIF" ? "bg-blue-50" : ""}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {row.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                      {(row.amount / 1000000).toFixed(1)}M
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600">
                      {((row.amount / 450000000) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Income Statement Detail */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              COMPTE DE RÉSULTAT POUR LA PÉRIODE
            </h2>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Libellé
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Montant (FCFA)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {incomeStatementData.map((row, idx) => (
                  <tr
                    key={idx}
                    className={row.bold ? "bg-primary-start bg-opacity-10" : ""}
                  >
                    <td
                      className={`px-6 py-4 text-sm ${
                        row.bold ? "font-bold text-gray-900" : "text-gray-900"
                      }`}
                    >
                      {row.line}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm text-right ${
                        row.bold ? "font-bold" : ""
                      } ${row.color || ""}`}
                    >
                      {row.amount !== 0
                        ? `${row.amount > 0 ? "+" : ""}${(
                            row.amount / 1000000
                          ).toFixed(1)}M`
                        : ""}
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
