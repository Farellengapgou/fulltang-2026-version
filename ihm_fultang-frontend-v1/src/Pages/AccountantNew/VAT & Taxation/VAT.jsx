import { useState, useEffect } from "react";
import { vatService } from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";

import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";

export function VAT() {
  const [vats, setVats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    vat_number: "",
    period_year: new Date().getFullYear(),
    period_month: new Date().getMonth() + 1,
    vat_type: "NORMAL",
    total_sales: 0,
    vat_due: 0,
    vat_recoverable: 0,
    status: "DRAFT",
  });

  useEffect(() => {
    const fetchVATs = async () => {
      try {
        const response = await vatService.getAllVAT();
        setVats(response.data.results || response.data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVATs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await vatService.createVAT(formData);
      setShowForm(false);
      const response = await vatService.getAllVAT();
      setVats(response.data.results || response.data);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleDeclare = async (id) => {
    if (window.confirm("Déclarer cette TVA?")) {
      try {
        await vatService.declareVAT(id);
        const response = await vatService.getAllVAT();
        setVats(response.data.results || response.data);
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
          <h1 className="text-2xl font-bold">TVA</h1>
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
            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
              <input
                type="text"
                placeholder="N°"
                value={formData.vat_number}
                onChange={(e) =>
                  setFormData({ ...formData, vat_number: e.target.value })
                }
                required
                className="border rounded px-2 py-1"
              />
              <select
                value={formData.vat_type}
                onChange={(e) =>
                  setFormData({ ...formData, vat_type: e.target.value })
                }
                className="border rounded px-2 py-1"
              >
                <option value="NORMAL">Normal</option>
                <option value="SIMPLIFIED">Simplifié</option>
              </select>
              <input
                type="number"
                placeholder="Ventes Total"
                value={formData.total_sales}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    total_sales: parseFloat(e.target.value),
                  })
                }
                required
                className="border rounded px-2 py-1"
              />
              <input
                type="number"
                step="0.01"
                placeholder="TVA Collectée"
                value={formData.vat_due}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vat_due: parseFloat(e.target.value),
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
                <th className="px-3 py-2 text-left">N°</th>
                <th className="px-3 py-2 text-left">Période</th>
                <th className="px-3 py-2 text-right">Collectée</th>
                <th className="px-3 py-2 text-right">Récupérable</th>
                <th className="px-3 py-2 text-right">Net</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {vats.map((vat) => (
                <tr key={vat.id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2">{vat.vat_number}</td>
                  <td className="px-3 py-2">
                    {vat.period_month}/{vat.period_year}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {vat.vat_due.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {vat.vat_recoverable.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {(vat.vat_due - vat.vat_recoverable).toFixed(2)}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-1 rounded text-xs ${
                        vat.status === "DECLARED"
                          ? "bg-green-200"
                          : "bg-yellow-200"
                      }`}
                    >
                      {vat.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {vat.status === "DRAFT" && (
                      <button
                        onClick={() => handleDeclare(vat.id)}
                        className="text-blue-500"
                      >
                        Déclarer
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
