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
      <div className="p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Budget</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 text-white px-3 py-2 rounded text-sm"
          >
            + Nouveau Budget
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-4 rounded shadow mb-4"
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
                className="border rounded px-2 py-1"
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
                className="border rounded px-2 py-1"
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
                className="border rounded px-2 py-1"
              />
            </div>
            <button
              type="submit"
              className="bg-green-500 text-white px-3 py-1 rounded text-sm"
            >
              Créer
            </button>
          </form>
        )}

        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-200">
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
                <tr key={b.id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2">{b.name}</td>
                  <td className="px-3 py-2">{b.fiscal_year}</td>
                  <td className="px-3 py-2 text-right">
                    {b.total_amount.toFixed(2)}
                  </td>
                  <td className="px-3 py-2">{b.is_approved ? "✓" : "✗"}</td>
                  <td className="px-3 py-2 text-xs">
                    {!b.is_approved && (
                      <button
                        onClick={() => handleApprove(b.id)}
                        className="text-blue-500"
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
