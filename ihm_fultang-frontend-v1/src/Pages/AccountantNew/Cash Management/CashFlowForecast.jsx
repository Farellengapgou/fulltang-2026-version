import {
  LineChart,
  Line,
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

export function CashFlowForecast() {
  const forecastData = [
    { month: "Juin", inflow: 5000000, outflow: 3500000, balance: 45500000 },
    { month: "Juillet", inflow: 4800000, outflow: 3200000, balance: 47100000 },
    { month: "Août", inflow: 5500000, outflow: 4000000, balance: 48600000 },
    {
      month: "Septembre",
      inflow: 5200000,
      outflow: 3800000,
      balance: 50000000,
    },
    { month: "Octobre", inflow: 5800000, outflow: 4200000, balance: 51600000 },
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
              Prévisions de Trésorerie
            </h1>
            <p className="opacity-90">
              Analyse des flux de trésorerie prévisionnels
            </p>
          </div>

          {/* Cash Flow Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Flux de Trésorerie Prévisionnels
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `${(value / 1000000).toFixed(1)}M FCFA`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="inflow"
                  stroke="#10b981"
                  name="Entrées"
                />
                <Line
                  type="monotone"
                  dataKey="outflow"
                  stroke="#ef4444"
                  name="Sorties"
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#0ea5e9"
                  name="Solde"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Forecast Table */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Détails Prévisionnels
            </h2>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Mois
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Entrées
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Sorties
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Solde Prévisionnel
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {forecastData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      {row.month}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-green-600 font-semibold">
                      {(row.inflow / 1000000).toFixed(1)}M FCFA
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-red-600 font-semibold">
                      {(row.outflow / 1000000).toFixed(1)}M FCFA
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-primary-end font-semibold">
                      {(row.balance / 1000000).toFixed(1)}M FCFA
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
