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
  LineChart,
  Line,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { FinancialAccountantDashBoard } from "../DashBoard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { FinancialAccountantNavBar } from "../NavBar.jsx";

export function FinancialRatios() {
  const [ratios] = useState([
    {
      category: "Liquidité",
      ratios: [
        {
          name: "Ratio de Liquidité Générale",
          value: 1.85,
          benchmark: 1.5,
          status: "good",
        },
        {
          name: "Ratio de Liquidité Immédiate",
          value: 0.92,
          benchmark: 1.0,
          status: "warning",
        },
        {
          name: "Ratio de Solvabilité",
          value: 0.65,
          benchmark: 0.5,
          status: "good",
        },
      ],
    },
    {
      category: "Rentabilité",
      ratios: [
        {
          name: "ROA (Rendement Actifs)",
          value: 0.18,
          benchmark: 0.15,
          status: "good",
        },
        {
          name: "ROE (Rendement Capitaux)",
          value: 0.28,
          benchmark: 0.2,
          status: "good",
        },
        { name: "Marge Nette", value: 0.12, benchmark: 0.1, status: "good" },
      ],
    },
    {
      category: "Efficacité",
      ratios: [
        { name: "Rotation Actifs", value: 1.5, benchmark: 1.2, status: "good" },
        { name: "Rotation Stocks", value: 8.5, benchmark: 8.0, status: "good" },
        {
          name: "Délai Recouvrement",
          value: 28,
          benchmark: 30,
          status: "good",
        },
      ],
    },
  ]);

  const trendData = [
    { period: "Q1 2025", roe: 0.25, roa: 0.16, margin: 0.1 },
    { period: "Q2 2025", roe: 0.26, roa: 0.17, margin: 0.11 },
    { period: "Q3 2025", roe: 0.27, roa: 0.17, margin: 0.11 },
    { period: "Q4 2025", roe: 0.28, roa: 0.18, margin: 0.12 },
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
            <h1 className="text-3xl font-bold mb-2">Ratios Financiers</h1>
            <p className="opacity-90">
              Analyse des ratios de liquidité, rentabilité et efficacité
            </p>
          </div>

          {/* Ratio Trend Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Évolution des Ratios
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => value.toFixed(2)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="roe"
                  stroke="#0ea5e9"
                  name="ROE"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="roa"
                  stroke="#10b981"
                  name="ROA"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="margin"
                  stroke="#f59e0b"
                  name="Marge Nette"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Ratios by Category */}
          {ratios.map((category, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {category.category}
              </h2>
              <div className="space-y-4">
                {category.ratios.map((ratio, ridx) => (
                  <div
                    key={ridx}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-gray-900 font-semibold">
                        {ratio.name}
                      </h3>
                      <div className="flex gap-4">
                        <div>
                          <p className="text-xs text-gray-600">Valeur</p>
                          <p className="text-lg font-bold text-primary-end">
                            {ratio.value}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Benchmark</p>
                          <p className="text-lg font-semibold text-gray-600">
                            {ratio.benchmark}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              ratio.status === "good"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {ratio.status === "good" ? "Bon" : "À Surveiller"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          ratio.value > ratio.benchmark
                            ? "bg-green-600"
                            : "bg-orange-600"
                        }`}
                        style={{
                          width: `${Math.min(
                            (ratio.value / ratio.benchmark) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </FinancialAccountantDashBoard>
  );
}
