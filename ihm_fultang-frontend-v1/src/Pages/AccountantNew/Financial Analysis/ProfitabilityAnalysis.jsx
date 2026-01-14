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
  AreaChart,
  Area,
} from "recharts";
import { FinancialAccountantDashBoard } from "../DashBoard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { FinancialAccountantNavBar } from "../NavBar.jsx";

export function ProfitabilityAnalysis() {
  const profitData = [
    {
      month: "Janvier",
      revenue: 7500000,
      costs: 6000000,
      profit: 1500000,
      margin: 0.2,
    },
    {
      month: "Février",
      revenue: 7200000,
      costs: 5750000,
      profit: 1450000,
      margin: 0.2,
    },
    {
      month: "Mars",
      revenue: 8500000,
      costs: 6800000,
      profit: 1700000,
      margin: 0.2,
    },
    {
      month: "Avril",
      revenue: 8200000,
      costs: 6500000,
      profit: 1700000,
      margin: 0.21,
    },
    {
      month: "Mai",
      revenue: 8100000,
      costs: 6350000,
      profit: 1750000,
      margin: 0.22,
    },
    {
      month: "Juin",
      revenue: 7900000,
      costs: 6200000,
      profit: 1700000,
      margin: 0.21,
    },
  ];

  const costBreakdown = [
    { category: "Personnel", amount: 4500000, percentage: 60 },
    { category: "Fournitures", amount: 1500000, percentage: 20 },
    { category: "Utilities", amount: 750000, percentage: 10 },
    { category: "Autres", amount: 450000, percentage: 6 },
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm opacity-75 mb-1">Revenu Moyen</p>
                <p className="text-3xl font-bold">7.9M FCFA</p>
              </div>
              <div>
                <p className="text-sm opacity-75 mb-1">Profit Moyen</p>
                <p className="text-3xl font-bold">1.6M FCFA</p>
              </div>
              <div>
                <p className="text-sm opacity-75 mb-1">Marge Moyenne</p>
                <p className="text-3xl font-bold">21%</p>
              </div>
            </div>
          </div>

          {/* Profitability Trend */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tendance de Rentabilité
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `${(value / 1000000).toFixed(1)}M FCFA`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  fill="#10b981"
                  stroke="#10b981"
                  name="Revenus"
                />
                <Area
                  type="monotone"
                  dataKey="costs"
                  fill="#ef4444"
                  stroke="#ef4444"
                  name="Coûts"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  fill="#0ea5e9"
                  stroke="#0ea5e9"
                  name="Profit"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Cost Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Répartition des Coûts
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={costBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) =>
                      `${(value / 1000000).toFixed(1)}M FCFA`
                    }
                  />
                  <Bar dataKey="amount" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Détails des Coûts
              </h2>
              <div className="space-y-4">
                {costBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-gray-900 font-semibold">
                        {item.category}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="h-2 rounded-full bg-primary-end"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-gray-900 font-semibold">
                        {item.percentage}%
                      </p>
                      <p className="text-sm text-gray-600">
                        {(item.amount / 1000000).toFixed(2)}M
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Performance */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Performance Mensuelle
            </h2>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Mois
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Revenus
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Coûts
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Profit
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Marge
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {profitData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      {row.month}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                      {(row.revenue / 1000000).toFixed(1)}M FCFA
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-red-600">
                      {(row.costs / 1000000).toFixed(1)}M FCFA
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-green-600 font-semibold">
                      {(row.profit / 1000000).toFixed(1)}M FCFA
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-primary-end font-semibold">
                      {(row.margin * 100).toFixed(0)}%
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
