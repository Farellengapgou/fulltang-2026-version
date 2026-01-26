import { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  Printer,
  Play,
  Hash,
  ArrowDownRight,
  ArrowUpRight,
  Calculator,
  Landmark,
} from "lucide-react";
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
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-black text-secondary tracking-tight uppercase">
              Etats Financiers
            </h1>
            <p className="text-gray-400 text-sm font-medium mt-1 uppercase tracking-widest italic">
              Production des documents de synthèse comptable
            </p>
          </div>
          <div className="flex gap-3 no-print">
            <button
              onClick={() => window.print()}
              className="ft-btn ft-btn-md ft-btn-outl gap-2"
            >
              <Printer size={18} /> Imprimer l'Etat
            </button>
            <button
              onClick={fetchReport}
              className="ft-btn ft-btn-md ft-btn-primary gap-2"
            >
              <Play size={18} /> Générer
            </button>
          </div>
        </div>

        {/* Search & Filter Header */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50 mb-10 no-print">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Nature du document
              </label>
              <div className="relative">
                <FileText
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="ft-select pl-12"
                >
                  <option value="balance_sheet">Bilan de l'Exercice</option>
                  <option value="income_statement">
                    Compte de Résultat (SIG)
                  </option>
                  <option value="trial_balance">Balance de Vérification</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Période du
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="ft-input pl-12"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Au
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="ft-input pl-12"
                />
              </div>
            </div>
          </div>
        </div>

        {data && (
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-50 print:shadow-none print:border-0 print:rounded-none print:p-0">
            {reportType === "balance_sheet" && (
              <div className="space-y-12">
                <div className="text-center border-b pb-8">
                  <h2 className="text-2xl font-black text-secondary uppercase tracking-tight">
                    BILAN ACTIF / PASSIF
                  </h2>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mt-2">
                    Situation au {endDate || new Date().toLocaleDateString()}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                  {/* ACTIF */}
                  <div>
                    <div className="flex items-center gap-3 mb-6 border-l-4 border-emerald-500 pl-4">
                      <ArrowUpRight className="text-emerald-500" size={24} />
                      <h3 className="text-lg font-black text-gray-800 uppercase">
                        ACTIF
                      </h3>
                    </div>
                    <table className="w-full">
                      <tbody>
                        {data.assets?.map((a) => (
                          <tr
                            key={a.id}
                            className="border-b border-gray-50 group hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-4">
                              <div className="text-xs font-black text-secondary/30 uppercase tracking-widest mb-1">
                                {a.code}
                              </div>
                              <div className="font-bold text-gray-700">
                                {a.label}
                              </div>
                            </td>
                            <td className="py-4 text-right font-mono font-black text-gray-900">
                              {a.balance.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td className="py-6 font-black text-secondary uppercase">
                            Total Actif
                          </td>
                          <td className="py-6 text-right font-mono text-xl font-black text-secondary">
                            {data.assets
                              ?.reduce((s, a) => s + a.balance, 0)
                              .toLocaleString()}{" "}
                            <span className="text-xs opacity-40 ml-1">
                              FCFA
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* PASSIF */}
                  <div>
                    <div className="flex items-center gap-3 mb-6 border-l-4 border-amber-500 pl-4">
                      <ArrowDownRight className="text-amber-500" size={24} />
                      <h3 className="text-lg font-black text-gray-800 uppercase">
                        PASSIF
                      </h3>
                    </div>
                    <table className="w-full">
                      <tbody>
                        {data.liabilities?.map((l) => (
                          <tr
                            key={l.id}
                            className="border-b border-gray-50 group hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-4">
                              <div className="text-xs font-black text-secondary/30 uppercase tracking-widest mb-1">
                                {l.code}
                              </div>
                              <div className="font-bold text-gray-700">
                                {l.label}
                              </div>
                            </td>
                            <td className="py-4 text-right font-mono font-black text-gray-900">
                              {l.balance.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td className="py-6 font-black text-secondary uppercase">
                            Total Passif
                          </td>
                          <td className="py-6 text-right font-mono text-xl font-black text-secondary">
                            {data.liabilities
                              ?.reduce((s, l) => s + l.balance, 0)
                              .toLocaleString()}{" "}
                            <span className="text-xs opacity-40 ml-1">
                              FCFA
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {reportType === "income_statement" && (
              <div className="space-y-12">
                <div className="text-center border-b pb-8">
                  <h2 className="text-2xl font-black text-secondary uppercase tracking-tight">
                    COMPTE DE RÉSULTAT
                  </h2>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mt-2">
                    Période du {startDate || "N/A"} au {endDate || "N/A"}
                  </p>
                </div>

                <div className="max-w-4xl mx-auto space-y-10">
                  {/* PRODUITS */}
                  <div className="bg-emerald-50/30 rounded-[2rem] p-8 border border-emerald-100">
                    <h3 className="text-emerald-700 font-black uppercase text-sm tracking-widest mb-6">
                      Produits d'Exploitation
                    </h3>
                    <table className="w-full">
                      <tbody>
                        {data.revenues?.map((r) => (
                          <tr
                            key={r.id}
                            className="border-b border-emerald-100/30 last:border-0 group"
                          >
                            <td className="py-3 font-bold text-gray-700">
                              {r.label}
                            </td>
                            <td className="py-3 text-right font-mono font-black text-emerald-700">
                              {r.balance.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td className="pt-6 font-black text-emerald-800 uppercase italic">
                            Total des Produits
                          </td>
                          <td className="pt-6 text-right font-mono text-2xl font-black text-emerald-800">
                            {data.total_revenue?.toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* CHARGES */}
                  <div className="bg-rose-50/30 rounded-[2rem] p-8 border border-rose-100">
                    <h3 className="text-rose-700 font-black uppercase text-sm tracking-widest mb-6">
                      Charges d'Exploitation
                    </h3>
                    <table className="w-full">
                      <tbody>
                        {data.expenses?.map((e) => (
                          <tr
                            key={e.id}
                            className="border-b border-rose-100/30 last:border-0 group"
                          >
                            <td className="py-3 font-bold text-gray-700">
                              {e.label}
                            </td>
                            <td className="py-3 text-right font-mono font-black text-rose-700">
                              {e.balance.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td className="pt-6 font-black text-rose-800 uppercase italic">
                            Total des Charges
                          </td>
                          <td className="pt-6 text-right font-mono text-2xl font-black text-rose-800">
                            {data.total_expense?.toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* RESULTAT NET */}
                  <div
                    className={`rounded-[2rem] p-10 border-4 border-dashed flex items-center justify-between ${
                      data.net_income >= 0
                        ? "bg-secondary text-white border-secondary/20"
                        : "bg-red-600 text-white border-red-200"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <Calculator className="opacity-50" size={24} />
                        <h3 className="text-xl font-black uppercase tracking-tighter">
                          Résultat Net de l'Exercice
                        </h3>
                      </div>
                      <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">
                        Calculé après compensationProduits/Charges
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-5xl font-black tracking-tighter">
                        {data.net_income?.toLocaleString()}
                      </span>
                      <span className="ml-2 text-sm font-bold opacity-50 uppercase">
                        FCFA
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {reportType === "trial_balance" && (
              <div className="space-y-8">
                <div className="text-center border-b pb-8">
                  <h2 className="text-2xl font-black text-secondary uppercase tracking-tight">
                    BALANCE DE VÉRIFICATION
                  </h2>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mt-2">
                    Détails des écritures par compte
                  </p>
                </div>

                <table className="ft-table">
                  <thead className="ft-thead">
                    <tr>
                      <th className="ft-th">Compte G/L</th>
                      <th className="ft-th text-right">Mouvement Débit</th>
                      <th className="ft-th text-right">Mouvement Crédit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.accounts?.map((a) => (
                      <tr key={a.id} className="ft-tr">
                        <td className="ft-td">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-gray-100 rounded-lg text-gray-400">
                              <Hash size={14} />
                            </div>
                            <div className="font-bold text-secondary">
                              <span className="text-xs font-black opacity-30 mr-2 uppercase tracking-widest">
                                {a.code}
                              </span>
                              {a.label}
                            </div>
                          </div>
                        </td>
                        <td className="ft-td text-right font-mono font-black text-gray-600">
                          {a.debit.toLocaleString()}
                        </td>
                        <td className="ft-td text-right font-mono font-black text-gray-600">
                          {a.credit.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-secondary/5">
                      <td className="py-6 px-4 font-black text-secondary tracking-widest uppercase italic">
                        Totaux Généraux
                      </td>
                      <td className="py-6 px-4 text-right font-mono text-xl font-black text-secondary">
                        {data.total_debit?.toLocaleString()}
                      </td>
                      <td className="py-6 px-4 text-right font-mono text-xl font-black text-secondary">
                        {data.total_credit?.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </CustomDashboard>
  );
}
