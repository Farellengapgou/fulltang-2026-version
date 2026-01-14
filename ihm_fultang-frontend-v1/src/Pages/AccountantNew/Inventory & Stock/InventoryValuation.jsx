import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { FinancialAccountantDashBoard } from "../DashBoard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { FinancialAccountantNavBar } from "../NavBar.jsx";

export function InventoryValuation() {
  const valuationData = [
    { method: "FIFO", value: 12500000, percentage: 35 },
    { method: "LIFO", value: 11800000, percentage: 33 },
    { method: "WAC", value: 12100000, percentage: 34 },
  ];

  const inventoryByCategory = [
    { category: "Médicaments", value: 8500000 },
    { category: "Fournitures Médicales", value: 6200000 },
    { category: "Équipements", value: 4800000 },
    { category: "Autres", value: 2600000 },
  ];

  const colors = ["#0ea5e9", "#06b6d4", "#10b981"];

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
            <h1 className="text-3xl font-bold mb-2">Évaluation des Stocks</h1>
            <p className="opacity-90">
              Comparaison des méthodes d'évaluation (FIFO, LIFO, WAC)
            </p>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Valuation Methods */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Comparaison des Méthodes
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={valuationData}
                    dataKey="value"
                    nameKey="method"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {valuationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) =>
                      `${(value / 1000000).toFixed(1)}M FCFA`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Inventory by Category */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Stocks par Catégorie
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={inventoryByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="category"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value) =>
                      `${(value / 1000000).toFixed(1)}M FCFA`
                    }
                  />
                  <Bar dataKey="value" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Valuation Methods Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Détails des Évaluations
            </h2>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Méthode
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Valeur Totale
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    % du Total
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Différence FIFO
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {valuationData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      {item.method}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                      {(item.value / 1000000).toFixed(1)}M FCFA
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600">
                      {item.percentage}%
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-primary-end">
                      {(
                        (item.value - valuationData[0].value) /
                        1000000
                      ).toFixed(1)}
                      M FCFA
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
