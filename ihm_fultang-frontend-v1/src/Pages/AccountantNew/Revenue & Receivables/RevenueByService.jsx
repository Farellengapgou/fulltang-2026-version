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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { FinancialAccountantDashBoard } from "../DashBoard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { TrendingUp } from "lucide-react";

export function RevenueByService() {
  const revenueData = [
    { service: "Consultations", revenue: 5200000, percentage: 35 },
    { service: "Hospitalisations", revenue: 3800000, percentage: 25 },
    { service: "Analyses Labo", revenue: 2900000, percentage: 19 },
    { service: "Pharmacie", revenue: 1800000, percentage: 12 },
    { service: "Imagerie", revenue: 1300000, percentage: 9 },
  ];

  const colors = ["#0ea5e9", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Revenus par Service</h1>
                <p className="opacity-90">
                  Analyse des revenus par type de service médical
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-75">Revenu Total</p>
                <p className="text-3xl font-bold">
                  {(totalRevenue / 1000000).toFixed(1)}M FCFA
                </p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Bar Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Revenus par Service
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="service"
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
                  <Bar dataKey="revenue" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Distribution des Revenus
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueData}
                    dataKey="revenue"
                    nameKey="service"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {revenueData.map((entry, index) => (
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
          </div>

          {/* Details Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                Détails par Service
              </h2>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Service
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Revenu
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    % du Total
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Croissance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {revenueData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      {item.service}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                      {item.revenue.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600">
                      {item.percentage}%
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <span className="flex items-center justify-end text-green-600 font-semibold">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        +12.5%
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
