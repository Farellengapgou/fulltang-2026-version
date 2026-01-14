import { useState } from "react";
import {
  Search,
  Filter,
  Eye,
  AlertCircle,
  Clock,
  CheckCircle,
} from "lucide-react";
import { FinancialAccountantDashBoard } from "../DashBoard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { FinancialAccountantNavBar } from "../NavBar.jsx";

export function AccountsReceivable() {
  const [receivables] = useState([
    {
      id: 1,
      patientName: "Jean Dupont",
      invoiceAmount: 125000,
      paidAmount: 0,
      remainingAmount: 125000,
      invoiceDate: "2025-05-15",
      dueDate: "2025-06-15",
      days: 45,
      status: "overdue",
    },
    {
      id: 2,
      patientName: "Marie Martin",
      invoiceAmount: 250000,
      paidAmount: 125000,
      remainingAmount: 125000,
      invoiceDate: "2025-06-01",
      dueDate: "2025-07-01",
      days: 5,
      status: "pending",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const totalReceivables = receivables.reduce(
    (sum, item) => sum + item.remainingAmount,
    0
  );
  const overdue = receivables.filter((item) => item.status === "overdue");

  const getStatusBadge = (status) => {
    switch (status) {
      case "overdue":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
            En Retard
          </span>
        );
      case "pending":
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
            En Attente
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
            Payée
          </span>
        );
    }
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm opacity-75 mb-1">Créances Totales</p>
                <p className="text-3xl font-bold">
                  {(totalReceivables / 1000000).toFixed(1)}M FCFA
                </p>
              </div>
              <div>
                <p className="text-sm opacity-75 mb-1">Montants en Retard</p>
                <p className="text-3xl font-bold text-red-300">
                  {overdue.length}
                </p>
              </div>
              <div>
                <p className="text-sm opacity-75 mb-1">Nombre de Patients</p>
                <p className="text-3xl font-bold">{receivables.length}</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un patient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end"
                />
              </div>
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                <Filter className="w-5 h-5 mr-2" />
                Filtrer
              </button>
            </div>
          </div>

          {/* Receivables Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Montant Facture
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Payé
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Restant
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Date Échéance
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
                {receivables.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.patientName}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                      {item.invoiceAmount.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-green-600">
                      {item.paidAmount.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                      {item.remainingAmount.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.dueDate}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4">
                      <button className="text-primary-end hover:text-teal-800">
                        <Eye className="w-4 h-4" />
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
