import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Save } from "lucide-react";
import { FinancialAccountantDashBoard } from "../DashBoard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { FinancialAccountantNavBar } from "../NavBar.jsx";

export function BudgetEntry() {
  const [budgets, setBudgets] = useState([
    {
      id: 1,
      category: "Personnel",
      amount: 45000000,
      period: "2025",
      department: "RH",
      status: "approved",
    },
    {
      id: 2,
      category: "Fournitures",
      amount: 15000000,
      period: "2025",
      department: "Opérations",
      status: "pending",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

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
                <h1 className="text-3xl font-bold mb-2">Saisie des Budgets</h1>
                <p className="opacity-90">
                  Création et modification des budgets annuels et mensuels
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center px-6 py-3 bg-white text-teal-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nouveau Budget
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un budget..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end"
              />
            </div>
          </div>

          {/* Budgets Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Catégorie
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Montant Budgété
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Période
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Département
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
                {budgets.map((budget) => (
                  <tr key={budget.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      {budget.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                      {(budget.amount / 1000000).toFixed(1)}M FCFA
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {budget.period}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {budget.department}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          budget.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {budget.status === "approved"
                          ? "Approuvé"
                          : "En Attente"}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
