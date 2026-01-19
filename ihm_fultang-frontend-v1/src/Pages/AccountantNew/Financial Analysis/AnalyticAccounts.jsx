import { useState, useEffect } from "react";
import { analyticAccountService } from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";

import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";

export function AnalyticAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    analytic_type: "COST_CENTER",
    parent: null,
  });

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await analyticAccountService.getAllAnalyticAccounts();
        setAccounts(response.data.results || response.data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await analyticAccountService.createAnalyticAccount(formData);
      setShowForm(false);
      const response = await analyticAccountService.getAllAnalyticAccounts();
      setAccounts(response.data.results || response.data);
    } catch (error) {
      console.error("Erreur:", error);
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
          <h1 className="text-2xl font-bold">Comptes Analytiques</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="ft-btn ft-btn-sm ft-btn-primary"
          >
            + Nouveau Compte
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
                placeholder="Code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                required
                className="ft-input"
              />
              <input
                type="text"
                placeholder="Nom"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="ft-input"
              />
              <select
                value={formData.analytic_type}
                onChange={(e) =>
                  setFormData({ ...formData, analytic_type: e.target.value })
                }
                className="ft-select"
              >
                <option value="COST_CENTER">Centre de Coût</option>
                <option value="PROJECT">Projet</option>
                <option value="DEPARTMENT">Département</option>
              </select>
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
                <th className="px-3 py-2 text-left">Code</th>
                <th className="px-3 py-2 text-left">Nom</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id} className="ft-tr">
                  <td className="px-3 py-2 font-semibold">{a.code}</td>
                  <td className="px-3 py-2">{a.name}</td>
                  <td className="px-3 py-2">{a.analytic_type}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-xs px-1 rounded ${
                        a.is_active ? "bg-green-200" : "bg-red-200"
                      }`}
                    >
                      {a.is_active ? "Actif" : "Inactif"}
                    </span>
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
