import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FinancialAccountantDashBoard } from "../DashBoard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { FinancialAccountantNavBar } from "../NavBar.jsx";

export function DepreciationCalculation() {
  const depreciationData = [
    {
      year: "2023",
      depreciation: 1000000,
      accumulated: 1000000,
      netValue: 24000000,
    },
    {
      year: "2024",
      depreciation: 1000000,
      accumulated: 2000000,
      netValue: 23000000,
    },
    {
      year: "2025",
      depreciation: 1000000,
      accumulated: 3000000,
      netValue: 22000000,
    },
    {
      year: "2026",
      depreciation: 1000000,
      accumulated: 4000000,
      netValue: 21000000,
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
            <h1 className="text-3xl font-bold mb-2">
              Calcul des Amortissements
            </h1>
            <p className="opacity-90">
              Gestion des amortissements annuels et enregistrement comptable
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-2">Amortissement Annuel</p>
              <p className="text-2xl font-bold text-primary-end">1.0M FCFA</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-2">
                Amortissements Cumulés
              </p>
              <p className="text-2xl font-bold text-primary-end">4.0M FCFA</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-2">
                Valeur Nette Comptable
              </p>
              <p className="text-2xl font-bold text-primary-end">21.0M FCFA</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-2">Taux Moyen</p>
              <p className="text-2xl font-bold text-primary-end">20%</p>
            </div>
          </div>

          {/* Depreciation Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Évolution des Amortissements
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={depreciationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `${(value / 1000000).toFixed(1)}M FCFA`}
                />
                <Legend />
                <Bar
                  dataKey="depreciation"
                  fill="#ef4444"
                  name="Amortissement Annuel"
                />
                <Bar
                  dataKey="accumulated"
                  fill="#f59e0b"
                  name="Amortissements Cumulés"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Depreciation Schedule */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Plan d'Amortissement
            </h2>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Année
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Amortissement Annuel
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Amortissements Cumulés
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Valeur Nette
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {depreciationData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      {row.year}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                      {(row.depreciation / 1000000).toFixed(1)}M FCFA
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                      {(row.accumulated / 1000000).toFixed(1)}M FCFA
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-primary-end">
                      {(row.netValue / 1000000).toFixed(1)}M FCFA
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
