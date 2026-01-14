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
import { Calendar, DollarSign, TrendingDown } from "lucide-react";
import { FinancialAccountantDashBoard } from "../DashBoard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { FinancialAccountantNavBar } from "../NavBar.jsx";

export function PayablesManagement() {
  const paymentSchedule = [
    { month: "Juin", amount: 2500000 },
    { month: "Juillet", amount: 1800000 },
    { month: "Août", amount: 3200000 },
    { month: "Septembre", amount: 2100000 },
    { month: "Octobre", amount: 2800000 },
    { month: "Novembre", amount: 1900000 },
  ];

  const [payables] = useState([
    {
      id: 1,
      supplier: "Pharma Solutions",
      invoiceNumber: "FS-2025-001",
      amount: 850000,
      dueDate: "2025-07-01",
      status: "scheduled",
    },
    {
      id: 2,
      supplier: "Medical Supplies Ltd",
      invoiceNumber: "MS-2025-045",
      amount: 1200000,
      dueDate: "2025-06-30",
      status: "due",
    },
  ]);

  const totalPayables = payables.reduce((sum, item) => sum + item.amount, 0);

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
                <p className="text-sm opacity-75 mb-1">Total Créditeurs</p>
                <p className="text-3xl font-bold">
                  {(totalPayables / 1000000).toFixed(1)}M FCFA
                </p>
              </div>
              <div>
                <p className="text-sm opacity-75 mb-1">À Payer ce Mois</p>
                <p className="text-3xl font-bold">1.2M FCFA</p>
              </div>
              <div>
                <p className="text-sm opacity-75 mb-1">Nombre de Factures</p>
                <p className="text-3xl font-bold">{payables.length}</p>
              </div>
            </div>
          </div>

          {/* Payment Schedule Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Calendrier de Paiement
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentSchedule}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `${(value / 1000000).toFixed(1)}M FCFA`}
                />
                <Bar dataKey="amount" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Upcoming Payments */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Paiements à Effectuer
            </h2>
            <div className="space-y-4">
              {payables.map((payable) => (
                <div
                  key={payable.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {payable.supplier}
                    </p>
                    <p className="text-sm text-gray-600">
                      {payable.invoiceNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {payable.amount.toLocaleString()} FCFA
                    </p>
                    <p className="text-sm text-gray-600">{payable.dueDate}</p>
                  </div>
                  <button className="px-4 py-2 bg-primary-end text-white rounded-lg hover:bg-teal-800 font-semibold">
                    Payer
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </FinancialAccountantDashBoard>
  );
}
