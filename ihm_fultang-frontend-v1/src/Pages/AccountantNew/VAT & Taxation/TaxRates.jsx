import { useState, useEffect } from "react";
import { taxService } from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";

import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";

export function TaxRates() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    tax_type: "VAT",
    rate: 0,
    effective_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await taxService.getAllTaxRates();
        setRates(response.data.results || response.data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await taxService.createTaxRate(formData);
      setShowForm(false);
      const response = await taxService.getAllTaxRates();
      setRates(response.data.results || response.data);
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
          <h1 className="text-2xl font-bold">Taux de Fiscalité</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="ft-btn ft-btn-sm ft-btn-primary"
          >
            + Nouveau Taux
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
                placeholder="Nom du Taux"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="ft-input"
              />
              <select
                value={formData.tax_type}
                onChange={(e) =>
                  setFormData({ ...formData, tax_type: e.target.value })
                }
                className="ft-select"
              >
                <option value="VAT">TVA</option>
                <option value="INCOME">Impôt sur Revenu</option>
                <option value="CORPORATE">Impôt Société</option>
                <option value="OTHER">Autre</option>
              </select>
              <input
                type="number"
                step="0.01"
                placeholder="Taux %"
                value={formData.rate}
                onChange={(e) =>
                  setFormData({ ...formData, rate: parseFloat(e.target.value) })
                }
                required
                className="ft-input"
              />
              <input
                type="date"
                value={formData.effective_date}
                onChange={(e) =>
                  setFormData({ ...formData, effective_date: e.target.value })
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
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-right">Taux %</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((r) => (
                <tr key={r.id} className="ft-tr">
                  <td className="px-3 py-2">{r.name}</td>
                  <td className="px-3 py-2">{r.tax_type}</td>
                  <td className="px-3 py-2 text-right font-bold font-mono">
                    {r.rate.toFixed(2)}%
                  </td>
                  <td className="px-3 py-2 text-sm">{r.effective_date}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-xs px-1 rounded ${
                        r.is_active ? "bg-green-200" : "bg-red-200"
                      }`}
                    >
                      {r.is_active ? "Actif" : "Inactif"}
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
