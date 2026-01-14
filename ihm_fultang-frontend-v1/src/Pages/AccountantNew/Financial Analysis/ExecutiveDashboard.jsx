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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { FinancialAccountantDashBoard } from "../DashBoard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { FinancialAccountantNavBar } from "../NavBar.jsx";

export function ExecutiveDashboard() {
  const kpis = [
    {
      label: "Revenu Total YTD",
      value: "48.5M FCFA",
      change: "+12.5%",
      trend: "up",
    },
    {
      label: "Profit Net YTD",
      value: "9.8M FCFA",
      change: "+18.2%",
      trend: "up",
    },
    { label: "Marge Nette", value: "20.2%", change: "+2.1%", trend: "up" },
    {
      label: "Cash Position",
      value: "78.0M FCFA",
      change: "+5.3%",
      trend: "up",
    },
  ];

  const monthlyRevenue = [
    { month: "Jan", revenue: 7500000, target: 7000000 },
    { month: "Fév", revenue: 7200000, target: 7000000 },
    { month: "Mar", revenue: 8500000, target: 8000000 },
    { month: "Avr", revenue: 8200000, target: 8000000 },
    { month: "Mai", revenue: 8100000, target: 8000000 },
    { month: "Jun", revenue: 7900000, target: 8000000 },
  ];

  const departmentPerformance = [
    { department: "Consultations", revenue: 20000000, target: 18000000 },
    { department: "Hospitalisations", revenue: 15000000, target: 14000000 },
    { department: "Analyses Lab", revenue: 8500000, target: 8000000 },
    { department: "Pharmacie", revenue: 5000000, target: 5500000 },
  ];

  const colors = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];

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
              Tableau de Bord Direction
            </h1>
            <p className="opacity-90">
              Vue d'ensemble des performances financières clés
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {kpis.map((kpi, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600 mb-2">{kpi.label}</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  {kpi.value}
                </p>
                <div className="flex items-center">
                  {kpi.trend === "up" ? (
                    <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600 mr-2" />
                  )}
                  <span
                    className={
                      kpi.trend === "up"
                        ? "text-green-600 text-sm font-semibold"
                        : "text-red-600 text-sm font-semibold"
                    }
                  >
                    {kpi.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Revenue Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Revenus vs Objectifs
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) =>
                      `${(value / 1000000).toFixed(1)}M FCFA`
                    }
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="Réalisé" />
                  <Bar dataKey="target" fill="#cbd5e1" name="Objectif" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Performance par Département
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="department" type="category" width={120} />
                  <Tooltip
                    formatter={(value) =>
                      `${(value / 1000000).toFixed(1)}M FCFA`
                    }
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#0ea5e9" name="Réalisé" />
                  <Bar dataKey="target" fill="#cbd5e1" name="Objectif" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Key Alerts & Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Alertes Importantes
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">
                      Révenu Pharmacie en baisse
                    </p>
                    <p className="text-sm text-red-700">
                      À 91% de l'objectif du mois
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">
                      Objectifs dépassés
                    </p>
                    <p className="text-sm text-green-700">
                      Consultations et Hospitalisations en hausse
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Indicateurs Clés
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border-b">
                  <span className="text-gray-600">Taux Croissance YoY</span>
                  <span className="text-lg font-bold text-green-600">
                    +14.2%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 border-b">
                  <span className="text-gray-600">Taux de Recouvrement</span>
                  <span className="text-lg font-bold text-primary-end">
                    94.5%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 border-b">
                  <span className="text-gray-600">Délai Moyen Paiement</span>
                  <span className="text-lg font-bold text-orange-600">
                    12 jours
                  </span>
                </div>
                <div className="flex justify-between items-center p-3">
                  <span className="text-gray-600">Cash Conversion Cycle</span>
                  <span className="text-lg font-bold text-blue-600">
                    35 jours
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FinancialAccountantDashBoard>
  );
}
