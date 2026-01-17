import { useState, useEffect } from "react";
import { accountingPeriodService } from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";
import Pagination from "../../../GlobalComponents/Pagination";

import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";

export function Periods() {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fiscal_year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    start_date: "",
    end_date: "",
    status: "OPEN",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchPeriods();
  }, [currentPage]);

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const response = await accountingPeriodService.getAllPeriods({
        page: currentPage,
      });
      setPeriods(response.data.results || response.data);
      setTotalPages(Math.ceil((response.data.count || 0) / 10));
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await accountingPeriodService.updatePeriod(editingId, formData);
      } else {
        await accountingPeriodService.createPeriod(formData);
      }
      setShowForm(false);
      resetForm();
      fetchPeriods();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleEdit = (period) => {
    setFormData(period);
    setEditingId(period.id);
    setShowForm(true);
  };

  const handleClosePeriod = async (id) => {
    if (
      window.confirm("Fermer cette période? Cette action est irréversible.")
    ) {
      try {
        await accountingPeriodService.closePeriod(id);
        fetchPeriods();
      } catch (error) {
        console.error("Erreur:", error);
      }
    }
  };

  const handleOpenPeriod = async (id) => {
    if (window.confirm("Réouvrir cette période?")) {
      try {
        await accountingPeriodService.openPeriod(id);
        fetchPeriods();
      } catch (error) {
        console.error("Erreur:", error);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr?")) {
      try {
        await accountingPeriodService.deletePeriod(id);
        fetchPeriods();
      } catch (error) {
        console.error("Erreur:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      fiscal_year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      start_date: "",
      end_date: "",
      status: "OPEN",
    });
    setEditingId(null);
  };

  if (loading) return <Loader />;

  return (
    <CustomDashboard
      linkList={FinancialAccountantNavLink}
      requiredRole={"Accountant"}
    >
      <FinancialAccountantNavBar />
      <div className="p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Périodes Comptables</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              resetForm();
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {showForm ? "Fermer" : "+ Nouvelle Période"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow mb-6"
          >
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Année Fiscale
                </label>
                <input
                  type="number"
                  value={formData.fiscal_year}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fiscal_year: parseInt(e.target.value),
                    })
                  }
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Mois (1-12)
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.month}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      month: parseInt(e.target.value),
                    })
                  }
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="OPEN">Ouverte</option>
                  <option value="CLOSED">Fermée</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Date de Début
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Date de Fin
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                {editingId ? "Modifier" : "Créer"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">Période</th>
                <th className="px-6 py-3 text-left">Année</th>
                <th className="px-6 py-3 text-left">Date Début</th>
                <th className="px-6 py-3 text-left">Date Fin</th>
                <th className="px-6 py-3 text-left">Statut</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">
                    {period.month}/{period.fiscal_year}
                  </td>
                  <td className="px-6 py-4">{period.fiscal_year}</td>
                  <td className="px-6 py-4">{period.start_date}</td>
                  <td className="px-6 py-4">{period.end_date}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        period.status === "OPEN"
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {period.status === "OPEN" ? "Ouverte" : "Fermée"}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    {period.status === "OPEN" ? (
                      <>
                        <button
                          onClick={() => handleEdit(period)}
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleClosePeriod(period.id)}
                          className="text-orange-500 hover:text-orange-700 text-sm"
                        >
                          Fermer
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleOpenPeriod(period.id)}
                          className="text-green-500 hover:text-green-700 text-sm"
                        >
                          Réouvrir
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(period.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Information</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Une période ouverte permet les modifications d'écritures</li>
            <li>• Une période fermée protège les données comptables</li>
            <li>
              • Assurez-vous que toutes les écritures sont validées avant de
              fermer
            </li>
            <li>• La réouverture d'une période fermée doit être justifiée</li>
          </ul>
        </div>
      </div>
    </CustomDashboard>
  );
}
