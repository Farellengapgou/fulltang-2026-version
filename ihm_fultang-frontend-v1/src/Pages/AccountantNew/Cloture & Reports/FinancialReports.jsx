import { useState, useEffect } from "react";
import { financialReportService } from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";

import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";

export function FinancialReports() {
  const [reportType, setReportType] = useState("balance_sheet");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params =
        startDate && endDate
          ? { start_date: startDate, end_date: endDate }
          : {};

      let response;
      if (reportType === "balance_sheet") {
        response = await financialReportService.getBalanceSheet(params);
      } else if (reportType === "income_statement") {
        response = await financialReportService.getIncomeStatement(params);
      } else {
        response = await financialReportService.getTrialBalance(params);
      }

      setData(response.data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  if (loading) return <Loader />;

  return (
    <CustomDashboard
      linkList={FinancialAccountantNavLink}
      requiredRole={"Accountant"}
    >
      <FinancialAccountantNavBar />
      <div className="ft-page">
        <h1 className="text-2xl font-bold mb-4">Rapports Financiers</h1>

        <div className="ft-card-padded mb-4">
          <div className="flex gap-4 mb-4 flex-wrap">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="ft-select w-auto"
            >
              <option value="balance_sheet">Bilan</option>
              <option value="income_statement">Compte de Résultat</option>
              <option value="trial_balance">Balance de Vérification</option>
            </select>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="ft-input w-auto"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="ft-input w-auto"
            />
            <button
              onClick={fetchReport}
              className="ft-btn ft-btn-sm ft-btn-primary"
            >
              Générer
            </button>
            <button
              onClick={() => window.print()}
              className="ft-btn ft-btn-sm ft-btn-outline"
            >
              Imprimer
            </button>
          </div>
        </div>

        {data && (
          <div className="ft-card-padded overflow-x-auto">
            {reportType === "balance_sheet" && (
              <div>
                <h2 className="text-lg font-bold mb-3">BILAN</h2>
                <table className="w-full text-sm mb-4">
                  <thead className="bg-gray-200">
                    <tr>
                      <th colSpan="2" className="px-3 py-1 text-left">
                        ACTIF
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.assets?.map((a) => (
                      <tr key={a.id} className="border-b">
                        <td className="px-3 py-1">
                          {a.code} - {a.label}
                        </td>
                        <td className="text-right px-3 py-1">
                          {a.balance.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-bold">
                      <td className="px-3 py-1">TOTAL ACTIF</td>
                      <td className="text-right px-3 py-1">
                        {data.assets
                          ?.reduce((s, a) => s + a.balance, 0)
                          .toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <table className="w-full text-sm mb-4">
                  <thead className="bg-gray-200">
                    <tr>
                      <th colSpan="2" className="px-3 py-1 text-left">
                        PASSIF
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.liabilities?.map((l) => (
                      <tr key={l.id} className="border-b">
                        <td className="px-3 py-1">
                          {l.code} - {l.label}
                        </td>
                        <td className="text-right px-3 py-1">
                          {l.balance.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-bold">
                      <td className="px-3 py-1">TOTAL PASSIF</td>
                      <td className="text-right px-3 py-1">
                        {data.liabilities
                          ?.reduce((s, l) => s + l.balance, 0)
                          .toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {reportType === "income_statement" && (
              <div>
                <h2 className="text-lg font-bold mb-3">COMPTE DE RÉSULTAT</h2>
                <table className="w-full text-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th colSpan="2" className="px-3 py-1 text-left">
                        PRODUITS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.revenues?.map((r) => (
                      <tr key={r.id} className="border-b">
                        <td className="px-3 py-1">
                          {r.code} - {r.label}
                        </td>
                        <td className="text-right px-3 py-1">
                          {r.balance.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-bold bg-blue-100">
                      <td className="px-3 py-1">TOTAL PRODUITS</td>
                      <td className="text-right px-3 py-1">
                        {data.total_revenue?.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table className="w-full text-sm mt-3">
                  <thead className="bg-gray-200">
                    <tr>
                      <th colSpan="2" className="px-3 py-1 text-left">
                        CHARGES
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.expenses?.map((e) => (
                      <tr key={e.id} className="border-b">
                        <td className="px-3 py-1">
                          {e.code} - {e.label}
                        </td>
                        <td className="text-right px-3 py-1">
                          {e.balance.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-bold bg-red-100">
                      <td className="px-3 py-1">TOTAL CHARGES</td>
                      <td className="text-right px-3 py-1">
                        {data.total_expense?.toFixed(2)}
                      </td>
                    </tr>
                    <tr
                      className={`font-bold text-lg ${
                        data.net_income >= 0 ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
                      <td className="px-3 py-2">RÉSULTAT NET</td>
                      <td className="text-right px-3 py-2">
                        {data.net_income?.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {reportType === "trial_balance" && (
              <table className="w-full text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-3 py-1 text-left">Compte</th>
                    <th className="px-3 py-1 text-right">Débit</th>
                    <th className="px-3 py-1 text-right">Crédit</th>
                  </tr>
                </thead>
                <tbody>
                  {data.accounts?.map((a) => (
                    <tr key={a.id} className="border-b">
                      <td className="px-3 py-1">
                        {a.code} - {a.label}
                      </td>
                      <td className="text-right px-3 py-1">
                        {a.debit.toFixed(2)}
                      </td>
                      <td className="text-right px-3 py-1">
                        {a.credit.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-gray-200">
                    <td className="px-3 py-1">TOTAUX</td>
                    <td className="text-right px-3 py-1">
                      {data.total_debit?.toFixed(2)}
                    </td>
                    <td className="text-right px-3 py-1">
                      {data.total_credit?.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </CustomDashboard>
  );
}
