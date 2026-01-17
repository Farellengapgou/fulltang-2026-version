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
      <div className="p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Déclarations Fiscales</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 text-white px-3 py-2 rounded text-sm"
          >
            + Nouvelle Déclaration
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-4 rounded shadow mb-4"
          >
            <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
              <select
                value={formData.declaration_type}
                onChange={(e) =>
                  setFormData({ ...formData, declaration_type: e.target.value })
                }
                className="border rounded px-2 py-1"
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
                className="border rounded px-2 py-1"
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
                className="border rounded px-2 py-1"
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
                className="border rounded px-2 py-1 col-span-2"
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
                <tr key={d.id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2">{d.declaration_type}</td>
                  <td className="px-3 py-2">
                    {d.period_month}/{d.period_year}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {d.taxable_income.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right font-bold">
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
                        className="text-blue-500"
                      >
                        Soumettre
                      </button>
                    )}
                    {d.status === "SUBMITTED" && (
                      <button
                        onClick={() => handlePayDeclaration(d.id)}
                        className="text-green-500"
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
