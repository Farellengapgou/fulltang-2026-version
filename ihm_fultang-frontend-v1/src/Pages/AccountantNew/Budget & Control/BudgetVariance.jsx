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
import { AlertTriangle, TrendingUp } from "lucide-react";
import { FinancialAccountantDashBoard } from "../DashBoard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { FinancialAccountantNavBar } from "../NavBar.jsx";

export function BudgetVariance() {
  const varianceData = [
    {
      category: "Personnel",
      budget: 45000000,
      actual: 42500000,
      variance: -2500000,
      variancePercent: -5.6,
    },
    {
      category: "Fournitures",
      budget: 15000000,
      actual: 16200000,
      variance: 1200000,
      variancePercent: 8.0,
    },
    {
      category: "Utilities",
      budget: 8000000,
      actual: 7800000,
      variance: -200000,
      variancePercent: -2.5,
    },
    {
      category: "Maintenance",
      budget: 12000000,
      actual: 13500000,
      variance: 1500000,
      variancePercent: 12.5,
    },
    {
      category: "Marketing",
      budget: 5000000,
      actual: 4500000,
      variance: -500000,
      variancePercent: -10.0,
    },
  ];

  const monthlyVariance = [
    { month: "Janvier", budget: 8000000, actual: 7800000, variance: -200000 },
    { month: "Février", budget: 7900000, actual: 8050000, variance: 150000 },
    { month: "Mars", budget: 8200000, actual: 8100000, variance: -100000 },
    { month: "Avril", budget: 8100000, actual: 8300000, variance: 200000 },
    { month: "Mai", budget: 8000000, actual: 7950000, variance: -50000 },
    { month: "Juin", budget: 8000000, actual: 8100000, variance: 100000 },
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
            <h1 className="text-3xl font-bold mb-2">Écarts Budgétaires</h1>
            <p className="opacity-90">
              Analyse des écarts entre budgets et réalisations
            </p>
          </div>

          {/* Monthly Variance */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Écarts Mensuels
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyVariance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `${(value / 1000000).toFixed(1)}M FCFA`}
                />
                <Legend />
                <Bar dataKey="budget" fill="#cbd5e1" name="Budget" />
                <Bar dataKey="actual" fill="#0ea5e9" name="Réalisé" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Variance Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Écarts par Catégorie
            </h2>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Catégorie
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Budget
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Réalisé
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Écart
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    % Écart
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {varianceData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                      {(item.budget / 1000000).toFixed(1)}M FCFA
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                      {(item.actual / 1000000).toFixed(1)}M FCFA
                    </td>
                    <td
                      className={`px-6 py-4 text-sm text-right font-semibold ${
                        item.variance < 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {item.variance < 0 ? "" : "+"}
                      {(item.variance / 1000000).toFixed(1)}M FCFA
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <span
                        className={`inline-flex items-center ${
                          item.variancePercent < 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.variancePercent < 0 ? "✓" : "⚠"}{" "}
                        {Math.abs(item.variancePercent).toFixed(1)}%
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
