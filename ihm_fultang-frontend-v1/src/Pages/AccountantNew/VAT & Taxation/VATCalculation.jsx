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
import { Calculator, Download } from "lucide-react";
import { FinancialAccountantDashBoard } from "../DashBoard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { FinancialAccountantNavBar } from "../NavBar.jsx";

export function VATCalculation() {
  const [vatData] = useState({
    salesExclVAT: 85000000,
    vatOnSales: 17000000,
    purchasesExclVAT: 45000000,
    vatOnPurchases: 9000000,
    netVAT: 8000000,
    paid: 2000000,
    balance: 6000000,
  });

  const monthlyVAT = [
    { month: "Janvier", sales: 7500000, purchases: 4000000, net: 3500000 },
    { month: "Février", sales: 7200000, purchases: 3800000, net: 3400000 },
    { month: "Mars", sales: 8500000, purchases: 4500000, net: 4000000 },
    { month: "Avril", sales: 8200000, purchases: 4200000, net: 4000000 },
    { month: "Mai", sales: 8100000, purchases: 4100000, net: 4000000 },
    { month: "Juin", sales: 7900000, purchases: 4400000, net: 3500000 },
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
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">Calcul de TVA</h1>
                <p className="opacity-90">
                  Gestion de la TVA mensuelle et déclarations
                </p>
              </div>
              <button className="flex items-center px-6 py-3 bg-white text-teal-700 rounded-lg font-semibold hover:bg-gray-50">
                <Download className="w-5 h-5 mr-2" />
                Exporter
              </button>
            </div>
          </div>

          {/* VAT Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-2">Ventes HT</p>
              <p className="text-2xl font-bold text-primary-end">
                {(vatData.salesExclVAT / 1000000).toFixed(1)}M FCFA
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-2">TVA Collectée</p>
              <p className="text-2xl font-bold text-green-600">
                {(vatData.vatOnSales / 1000000).toFixed(1)}M FCFA
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-2">TVA Déductible</p>
              <p className="text-2xl font-bold text-blue-600">
                {(vatData.vatOnPurchases / 1000000).toFixed(1)}M FCFA
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-2">TVA Nette à Payer</p>
              <p className="text-2xl font-bold text-red-600">
                {(vatData.netVAT / 1000000).toFixed(1)}M FCFA
              </p>
            </div>
          </div>

          {/* Monthly VAT Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              TVA Mensuelle
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyVAT}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `${(value / 1000000).toFixed(1)}M FCFA`}
                />
                <Legend />
                <Bar dataKey="sales" fill="#10b981" name="TVA Collectée" />
                <Bar dataKey="purchases" fill="#ef4444" name="TVA Déductible" />
                <Bar dataKey="net" fill="#0ea5e9" name="TVA Nette" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Calculation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Calcul Détaillé
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-gray-900">Ventes HT</span>
                <span className="font-semibold">
                  {(vatData.salesExclVAT / 1000000).toFixed(1)}M FCFA
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-gray-900">TVA 20% sur Ventes</span>
                <span className="text-green-600 font-semibold">
                  + {(vatData.vatOnSales / 1000000).toFixed(1)}M FCFA
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-gray-900">Achats HT</span>
                <span className="font-semibold">
                  {(vatData.purchasesExclVAT / 1000000).toFixed(1)}M FCFA
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-gray-900">TVA 20% sur Achats</span>
                <span className="text-red-600 font-semibold">
                  - {(vatData.vatOnPurchases / 1000000).toFixed(1)}M FCFA
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-3 pt-3 text-lg">
                <span className="text-gray-900 font-semibold">TVA Nette</span>
                <span className="text-primary-end font-bold">
                  {(vatData.netVAT / 1000000).toFixed(1)}M FCFA
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-gray-900">
                  Dont Payée le Mois Dernier
                </span>
                <span className="font-semibold">
                  - {(vatData.paid / 1000000).toFixed(1)}M FCFA
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 text-lg bg-teal-50 p-3 rounded-lg">
                <span className="text-gray-900 font-bold">
                  À Payer/Récupérer
                </span>
                <span className="text-primary-end font-bold">
                  {(vatData.balance / 1000000).toFixed(1)}M FCFA
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FinancialAccountantDashBoard>
  );
}
