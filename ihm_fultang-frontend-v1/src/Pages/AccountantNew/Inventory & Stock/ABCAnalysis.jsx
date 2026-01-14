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

export function ABCAnalysis() {
  const abcData = [
    {
      category: "Classe A",
      items: 15,
      value: 15000000,
      percentage: 65,
      quantity: "20%",
    },
    {
      category: "Classe B",
      items: 35,
      value: 6000000,
      percentage: 25,
      quantity: "30%",
    },
    {
      category: "Classe C",
      items: 250,
      value: 2000000,
      percentage: 10,
      quantity: "50%",
    },
  ];

  const productsByClass = [
    {
      category: "Classe A",
      product: "Produits critiques",
      examples: "Médicaments essentiels, Équipements haute valeur",
    },
    {
      category: "Classe B",
      product: "Produits importants",
      examples: "Fournitures courantes, Consommables réguliers",
    },
    {
      category: "Classe C",
      product: "Produits secondaires",
      examples: "Fournitures diverses, Petits consommables",
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
            <h1 className="text-3xl font-bold mb-2">Analyse ABC des Stocks</h1>
            <p className="opacity-90">
              Classification et gestion des stocks par importance
            </p>
          </div>

          {/* ABC Charts */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Distribution par Classe
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={abcData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="items"
                  fill="#0ea5e9"
                  name="Nombre d'Articles"
                />
                <Bar
                  yAxisId="right"
                  dataKey="value"
                  fill="#f59e0b"
                  name="Valeur Totale"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ABC Details */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Détails des Classifications
            </h2>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Classe
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Nombre d'Articles
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Valeur Totale
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    % Valeur
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    % Quantité
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {abcData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      {row.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                      {row.items}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                      {(row.value / 1000000).toFixed(1)}M FCFA
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-primary-end font-semibold">
                      {row.percentage}%
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600">
                      {row.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Class Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {productsByClass.map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.category}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  <strong>{item.product}</strong>
                </p>
                <p className="text-sm text-gray-600">{item.examples}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FinancialAccountantDashBoard>
  );
}
