import { useState } from "react";
import {
  Plus,
  Search,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { FinancialAccountantDashBoard } from "../DashBoard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { FinancialAccountantNavBar } from "../NavBar.jsx";

export function SupplierInvoices() {
  const [invoices, setInvoices] = useState([
    {
      id: 1,
      supplier: "Pharma Solutions",
      invoiceNumber: "FS-2025-001",
      amount: 850000,
      date: "2025-06-01",
      dueDate: "2025-07-01",
      status: "pending",
      description: "Médicaments et fournitures",
    },
    {
      id: 2,
      supplier: "Medical Supplies Ltd",
      invoiceNumber: "MS-2025-045",
      amount: 1200000,
      date: "2025-05-15",
      dueDate: "2025-06-30",
      status: "validated",
      description: "Équipements médicaux",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "validated":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "overdue":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      validated: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
    };
    const labels = {
      pending: "En attente",
      validated: "Validée",
      overdue: "En retard",
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
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Factures Fournisseurs
                </h1>
                <p className="opacity-90">
                  Gestion des factures reçues et validation
                </p>
              </div>
              <button className="flex items-center px-6 py-3 bg-white text-teal-700 rounded-lg font-semibold hover:bg-gray-50">
                <Plus className="w-5 h-5 mr-2" />
                Nouvelle Facture
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une facture..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end"
              />
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Fournisseur
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    N° Facture
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Montant
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Échéance
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
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      {invoice.supplier}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 font-semibold">
                      {invoice.amount.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {invoice.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {invoice.dueDate}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-primary-end hover:text-teal-800">
                        <FileText className="w-4 h-4" />
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
