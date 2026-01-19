import { useState, useEffect } from "react";
import { payrollService } from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";

import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";

export function Payroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    payroll_number: "",
    payroll_period: "",
    period_start: "",
    period_end: "",
    total_gross: 0,
    total_deductions: 0,
    total_net: 0,
    status: "DRAFT",
  });

  useEffect(() => {
    const fetchPayrolls = async () => {
      try {
        const response = await payrollService.getAllPayrolls();
        setPayrolls(response.data.results || response.data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayrolls();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await payrollService.createPayroll(formData);
      setShowForm(false);
      const response = await payrollService.getAllPayrolls();
      setPayrolls(response.data.results || response.data);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm("Approuver cette paie?")) {
      try {
        await payrollService.approvePayroll(id);
        const response = await payrollService.getAllPayrolls();
        setPayrolls(response.data.results || response.data);
      } catch (error) {
        console.error("Erreur:", error);
      }
    }
  };

  const handlePay = async (id) => {
    if (window.confirm("Marquer comme payée?")) {
      try {
        await payrollService.payPayroll(id);
        const response = await payrollService.getAllPayrolls();
        setPayrolls(response.data.results || response.data);
      } catch (error) {
        console.error("Erreur:", error);
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <CustomDashboard
      linkList={FinancialAccountantNavLink}
      requiredRole={"Accountant"}
    >
      <FinancialAccountantNavBar />
      <div className="ft-page">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Gestion de Paie</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="ft-btn ft-btn-sm ft-btn-primary"
          >
            + Nouvelle Paie
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="ft-card-padded mb-4"
          >
            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
              <input
                type="text"
                placeholder="N° Paie"
                value={formData.payroll_number}
                onChange={(e) =>
                  setFormData({ ...formData, payroll_number: e.target.value })
                }
                required
                className="ft-input"
              />
              <input
                type="text"
                placeholder="Période"
                value={formData.payroll_period}
                onChange={(e) =>
                  setFormData({ ...formData, payroll_period: e.target.value })
                }
                required
                className="ft-input"
              />
              <input
                type="date"
                value={formData.period_start}
                onChange={(e) =>
                  setFormData({ ...formData, period_start: e.target.value })
                }
                required
                className="ft-input"
              />
              <input
                type="date"
                value={formData.period_end}
                onChange={(e) =>
                  setFormData({ ...formData, period_end: e.target.value })
                }
                required
                className="ft-input"
              />
            </div>
            <button
              type="submit"
              className="ft-btn ft-btn-sm ft-btn-success"
            >
              Créer
            </button>
          </form>
        )}

        <div className="ft-card overflow-x-auto">
          <table className="ft-table text-sm">
            <thead className="ft-thead">
              <tr>
                <th className="px-3 py-2 text-left">N°</th>
                <th className="px-3 py-2 text-left">Période</th>
                <th className="px-3 py-2 text-right">Brut</th>
                <th className="px-3 py-2 text-right">Retenues</th>
                <th className="px-3 py-2 text-right">Net</th>
                <th className="px-3 py-2 text-left">Statut</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map((p) => (
                <tr key={p.id} className="ft-tr">
                  <td className="px-3 py-2">{p.payroll_number}</td>
                  <td className="px-3 py-2">{p.payroll_period}</td>
                  <td className="px-3 py-2 text-right font-mono">
                    {p.total_gross.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono">
                    {p.total_deductions.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right font-bold font-mono">
                    {p.total_net.toFixed(2)}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-1 py-0 rounded text-xs ${
                        p.status === "PAID"
                          ? "bg-green-200 text-green-800"
                          : p.status === "APPROVED"
                          ? "bg-blue-200 text-blue-800"
                          : "bg-yellow-200"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs flex gap-1">
                    {p.status === "DRAFT" && (
                      <button
                        onClick={() => handleApprove(p.id)}
                        className="text-secondary hover:text-primary-end font-semibold"
                      >
                        Approuver
                      </button>
                    )}
                    {p.status === "APPROVED" && (
                      <button
                        onClick={() => handlePay(p.id)}
                        className="text-emerald-700 hover:text-emerald-900 font-semibold"
                      >
                        Payer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </CustomDashboard>
  );
}
