import { useState } from "react";
import { FileText, Download, Eye, Send } from "lucide-react";
import { FinancialAccountantDashBoard } from "../DashBoard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { FinancialAccountantNavBar } from "../NavBar.jsx";

export function TaxDeclarations() {
  const [declarations] = useState([
    {
      id: 1,
      type: "Déclaration TVA",
      period: "Juin 2025",
      dueDate: "2025-07-20",
      amount: 8000000,
      status: "pending",
      lastUpdate: "2025-06-15",
    },
    {
      id: 2,
      type: "IR/Déclaration Revenus",
      period: "Trimestre Q2 2025",
      dueDate: "2025-07-31",
      amount: 2500000,
      status: "pending",
      lastUpdate: "2025-06-10",
    },
    {
      id: 3,
      type: "Déclaration Cotisations Sociales",
      period: "Juin 2025",
      dueDate: "2025-07-10",
      amount: 3200000,
      status: "submitted",
      lastUpdate: "2025-06-08",
    },
  ]);

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      submitted: "bg-blue-100 text-blue-800",
      filed: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    const labels = {
      pending: "En Attente",
      submitted: "Soumise",
      filed: "Déposée",
      rejected: "Rejetée",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          badges[status] || ""
        }`}
      >
        {labels[status]}
      </span>
    );
  };

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
            <h1 className="text-3xl font-bold mb-2">Déclarations Fiscales</h1>
            <p className="opacity-90">
              Suivi et gestion des déclarations TVA, IR, et cotisations sociales
            </p>
          </div>

          {/* Declarations Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Type de Déclaration
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Période
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Date Limite
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Montant
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {declarations.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      {item.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.period}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.dueDate}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 font-semibold">
                      {(item.amount / 1000000).toFixed(1)}M FCFA
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                        <Download className="w-4 h-4" />
                      </button>
                      {item.status === "pending" && (
                        <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg">
                          <Send className="w-4 h-4" />
                        </button>
                      )}
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
