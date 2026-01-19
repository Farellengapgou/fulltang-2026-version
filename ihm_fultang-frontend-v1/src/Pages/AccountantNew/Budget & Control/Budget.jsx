import { useState, useEffect } from "react";
import {
  budgetService,
  chartOfAccountsService,
} from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";

import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";

export function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    fiscal_year: new Date().getFullYear(),
    total_amount: 0,
    is_approved: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [budgetsData, accountsData] = await Promise.all([
          budgetService.getAllBudgets(),
          chartOfAccountsService.getAllAccounts(),
        ]);
        setBudgets(budgetsData.data.results || budgetsData.data);
        setAccounts(accountsData.data.results || accountsData.data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await budgetService.createBudget(formData);
      setShowForm(false);
      const response = await budgetService.getAllBudgets();
      setBudgets(response.data.results || response.data);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm("Approuver ce budget?")) {
      try {
        await budgetService.approveBudget(id);
        const response = await budgetService.getAllBudgets();
        setBudgets(response.data.results || response.data);
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
          <h1 className="text-2xl font-bold">Budget</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="ft-btn ft-btn-sm ft-btn-primary"
          >
            + Nouveau Budget
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
                placeholder="Nom du Budget"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="ft-input"
              />
              <input
                type="number"
                placeholder="Exercice Fiscal"
                value={formData.fiscal_year}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fiscal_year: parseInt(e.target.value),
                  })
                }
                required
                className="ft-input"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Montant Total"
                value={formData.total_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    total_amount: parseFloat(e.target.value),
                  })
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
                <th className="px-3 py-2 text-left">Nom</th>
                <th className="px-3 py-2 text-left">Exercice</th>
                <th className="px-3 py-2 text-right">Montant</th>
                <th className="px-3 py-2">Approuvé</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((b) => (
                <tr key={b.id} className="ft-tr">
                  <td className="px-3 py-2">{b.name}</td>
                  <td className="px-3 py-2">{b.fiscal_year}</td>
                  <td className="px-3 py-2 text-right font-mono">
                    {b.total_amount.toFixed(2)}
                  </td>
                  <td className="px-3 py-2">{b.is_approved ? "✓" : "✗"}</td>
                  <td className="px-3 py-2 text-xs">
                    {!b.is_approved && (
                      <button
                        onClick={() => handleApprove(b.id)}
                        className="text-secondary hover:text-primary-end font-semibold"
                      >
                        Approuver
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
