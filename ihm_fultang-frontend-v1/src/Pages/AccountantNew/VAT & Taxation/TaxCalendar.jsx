import { useState } from "react";
import { Calendar, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { FinancialAccountantDashBoard } from "../DashBoard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { FinancialAccountantNavBar } from "../NavBar.jsx";

export function TaxCalendar() {
  const [taxEvents] = useState([
    {
      id: 1,
      date: "2025-07-10",
      deadline: "Cotisations Sociales Juin",
      status: "upcoming",
      days: 26,
    },
    {
      id: 2,
      date: "2025-07-20",
      deadline: "Déclaration TVA Juin",
      status: "upcoming",
      days: 36,
    },
    {
      id: 3,
      date: "2025-07-31",
      deadline: "IR/Revenus Q2",
      status: "upcoming",
      days: 47,
    },
    {
      id: 4,
      date: "2025-08-10",
      deadline: "Cotisations Sociales Juillet",
      status: "upcoming",
      days: 57,
    },
    {
      id: 5,
      date: "2025-08-20",
      deadline: "Déclaration TVA Juillet",
      status: "upcoming",
      days: 67,
    },
    {
      id: 6,
      date: "2025-10-31",
      deadline: "Déclaration Annuelle",
      status: "future",
      days: 139,
    },
  ]);

  const getIcon = (status, days) => {
    if (days <= 7) return <AlertCircle className="w-5 h-5 text-red-600" />;
    if (days <= 14) return <Clock className="w-5 h-5 text-yellow-600" />;
    return <CheckCircle className="w-5 h-5 text-green-600" />;
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
            <div className="flex items-center">
              <Calendar className="w-12 h-12 mr-4" />
              <div>
                <h1 className="text-3xl font-bold mb-2">Calendrier Fiscal</h1>
                <p className="opacity-90">
                  Dates limites et rappels d'obligations fiscales
                </p>
              </div>
            </div>
          </div>

          {/* Tax Events Timeline */}
          <div className="space-y-4">
            {taxEvents.map((event, idx) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <div className="mt-1 mr-4">
                      {getIcon(event.status, event.days)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {event.deadline}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Date: {event.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {event.days <= 7 ? (
                      <span className="px-4 py-2 bg-red-100 text-red-800 rounded-lg font-semibold text-sm">
                        {event.days} jours
                      </span>
                    ) : event.days <= 14 ? (
                      <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-semibold text-sm">
                        {event.days} jours
                      </span>
                    ) : (
                      <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold text-sm">
                        {event.days} jours
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FinancialAccountantDashBoard>
  );
}
