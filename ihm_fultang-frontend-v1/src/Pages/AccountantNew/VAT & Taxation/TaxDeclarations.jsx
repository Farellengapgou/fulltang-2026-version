import { useState, useEffect } from "react";
import { taxService } from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";

import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";

export function TaxDeclarations() {
  const [declarations, setDeclarations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    declaration_type: "QUARTERLY",
    period_year: new Date().getFullYear(),
    period_month: new Date().getMonth() + 1,
    taxable_income: 0,
    tax_due: 0,
  });

  useEffect(() => {
    const fetchDeclarations = async () => {
      try {
        const response = await taxService.getAllTaxDeclarations();
        setDeclarations(response.data.results || response.data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeclarations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await taxService.createTaxDeclaration(formData);
      setShowForm(false);
      const response = await taxService.getAllTaxDeclarations();
      setDeclarations(response.data.results || response.data);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleSubmitDeclaration = async (id) => {
    if (window.confirm("Soumettre cette déclaration?")) {
      try {
        await taxService.submitTaxDeclaration(id);
        const response = await taxService.getAllTaxDeclarations();
        setDeclarations(response.data.results || response.data);
      } catch (error) {
        console.error("Erreur:", error);
      }
    }
  };

  const handlePayDeclaration = async (id) => {
    if (window.confirm("Marquer comme payée?")) {
      try {
        await taxService.payTaxDeclaration(id);
        const response = await taxService.getAllTaxDeclarations();
        setDeclarations(response.data.results || response.data);
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
          <h1 className="text-2xl font-bold">Déclarations Fiscales</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="ft-btn ft-btn-sm ft-btn-primary"
          >
            + Nouvelle Déclaration
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="ft-card-padded mb-4"
          >
            <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
              <select
                value={formData.declaration_type}
                onChange={(e) =>
                  setFormData({ ...formData, declaration_type: e.target.value })
                }
                className="ft-select"
              >
                <option value="QUARTERLY">Trimestrielle</option>
                <option value="ANNUAL">Annuelle</option>
              </select>
              <input
                type="number"
                placeholder="Année"
                value={formData.period_year}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    period_year: parseInt(e.target.value),
                  })
                }
                required
                className="ft-input"
              />
              <input
                type="number"
                min="1"
                max="12"
                placeholder="Mois"
                value={formData.period_month}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    period_month: parseInt(e.target.value),
                  })
                }
                required
                className="ft-input"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Revenus Imposables"
                value={formData.taxable_income}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    taxable_income: parseFloat(e.target.value),
                  })
                }
                required
                className="ft-input col-span-2"
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
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Période</th>
                <th className="px-3 py-2 text-right">Imposable</th>
                <th className="px-3 py-2 text-right">Impôt dû</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {declarations.map((d) => (
                <tr key={d.id} className="ft-tr">
                  <td className="px-3 py-2">{d.declaration_type}</td>
                  <td className="px-3 py-2">
                    {d.period_month}/{d.period_year}
                  </td>
                  <td className="px-3 py-2 text-right font-mono">
                    {d.taxable_income.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right font-bold font-mono">
                    {d.tax_due.toFixed(2)}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-xs px-1 rounded ${
                        d.status === "PAID"
                          ? "bg-green-200"
                          : d.status === "SUBMITTED"
                          ? "bg-blue-200"
                          : "bg-yellow-200"
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs flex gap-1">
                    {d.status === "DRAFT" && (
                      <button
                        onClick={() => handleSubmitDeclaration(d.id)}
                        className="text-secondary hover:text-primary-end font-semibold"
                      >
                        Soumettre
                      </button>
                    )}
                    {d.status === "SUBMITTED" && (
                      <button
                        onClick={() => handlePayDeclaration(d.id)}
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
