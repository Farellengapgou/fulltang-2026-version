import { useState, useEffect } from "react";
import { accountingPeriodService } from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";
import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";

export function AccountingPeriods() {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fiscal_year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    start_date: "",
    end_date: "",
    is_closed: false,
  });

  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const response = await accountingPeriodService.getAllPeriods();
        setPeriods(response.data.results || response.data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPeriods();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await accountingPeriodService.createPeriod(formData);
      setShowForm(false);
      const response = await accountingPeriodService.getAllPeriods();
      setPeriods(response.data.results || response.data);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleClosePeriod = async (id) => {
    if (
      window.confirm("Fermer cette période? Cette action est irréversible.")
    ) {
      try {
        await accountingPeriodService.closePeriod(id);
        const response = await accountingPeriodService.getAllPeriods();
        setPeriods(response.data.results || response.data);
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
          <h1 className="text-2xl font-bold">Périodes Comptables</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 text-white px-3 py-2 rounded text-sm"
          >
            + Nouvelle Période
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-4 rounded shadow mb-4"
          >
            <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
              <input
                type="number"
                placeholder="Année"
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
                min="1"
                max="12"
                placeholder="Mois"
                value={formData.month}
                onChange={(e) =>
                  setFormData({ ...formData, month: parseInt(e.target.value) })
                }
                required
                className="border rounded px-2 py-1"
              />
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                required
                className="border rounded px-2 py-1"
              />
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
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
                <th className="px-3 py-2 text-left">Période</th>
                <th className="px-3 py-2 text-left">Début</th>
                <th className="px-3 py-2 text-left">Fin</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2">
                    {p.month}/{p.fiscal_year}
                  </td>
                  <td className="px-3 py-2 text-sm">{p.start_date}</td>
                  <td className="px-3 py-2 text-sm">{p.end_date}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-xs px-1 rounded ${
                        p.is_closed
                          ? "bg-red-200 text-red-800"
                          : "bg-green-200 text-green-800"
                      }`}
                    >
                      {p.is_closed ? "Fermée" : "Ouverte"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {!p.is_closed && (
                      <button
                        onClick={() => handleClosePeriod(p.id)}
                        className="text-red-500"
                      >
                        Fermer
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
