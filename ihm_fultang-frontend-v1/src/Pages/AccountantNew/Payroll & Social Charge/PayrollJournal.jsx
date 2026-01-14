import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Eye, Download } from "lucide-react";
import { FinancialAccountantDashBoard } from "../DashBoard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { FinancialAccountantNavBar } from "../NavBar.jsx";

export function PayrollJournal() {
  const [payrolls, setPayrolls] = useState([
    {
      id: 1,
      period: "Juin 2025",
      employeeCount: 45,
      grossSalaries: 18500000,
      deductions: 2200000,
      netPayroll: 16300000,
      status: "processed",
      processedDate: "2025-06-28",
    },
    {
      id: 2,
      period: "Mai 2025",
      employeeCount: 45,
      grossSalaries: 18500000,
      deductions: 2150000,
      netPayroll: 16350000,
      status: "processed",
      processedDate: "2025-05-28",
    },
    {
      id: 3,
      period: "Avril 2025",
      employeeCount: 44,
      grossSalaries: 17800000,
      deductions: 2100000,
      netPayroll: 15700000,
      status: "processed",
      processedDate: "2025-04-28",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

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
                <h1 className="text-3xl font-bold mb-2">Journal de Paie</h1>
                <p className="opacity-90">
                  Enregistrement et suivi des paies mensuelles
                </p>
              </div>
              <button className="flex items-center px-6 py-3 bg-white text-teal-700 rounded-lg font-semibold hover:bg-gray-50">
                <Plus className="w-5 h-5 mr-2" />
                Nouvelle Paie
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-2">Paies Traitées</p>
              <p className="text-2xl font-bold text-primary-end">
                {payrolls.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-2">Nombre Employés</p>
              <p className="text-2xl font-bold text-primary-end">45</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-2">Salaires Bruts YTD</p>
              <p className="text-2xl font-bold text-primary-end">110.6M FCFA</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-2">Paie Nette YTD</p>
              <p className="text-2xl font-bold text-primary-end">97.4M FCFA</p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une paie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end"
              />
            </div>
          </div>

          {/* Payroll Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Période
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Nombre Employés
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Salaires Bruts
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Retenues
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Paie Nette
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
                {payrolls.map((payroll) => (
                  <tr key={payroll.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      {payroll.period}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900">
                      {payroll.employeeCount}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                      {(payroll.grossSalaries / 1000000).toFixed(1)}M FCFA
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-red-600">
                      {(payroll.deductions / 1000000).toFixed(1)}M FCFA
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-green-600 font-semibold">
                      {(payroll.netPayroll / 1000000).toFixed(1)}M FCFA
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        Traitée
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                        <Download className="w-4 h-4" />
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
