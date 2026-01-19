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
      <div className="ft-page">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Périodes Comptables</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              resetForm();
            }}
            className="ft-btn ft-btn-md ft-btn-primary"
          >
            {showForm ? "Fermer" : "+ Nouvelle Période"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="ft-card-padded mb-6"
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
                  className="ft-input"
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
                  className="ft-input"
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
                  className="ft-select"
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
                  className="ft-input"
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
                  className="ft-input"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="ft-btn ft-btn-md ft-btn-success"
              >
                {editingId ? "Modifier" : "Créer"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="ft-btn ft-btn-md ft-btn-outline"
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        {/* Table */}
        <div className="ft-card overflow-hidden">
          <table className="ft-table">
            <thead className="ft-thead">
              <tr>
                <th className="ft-th">Période</th>
                <th className="ft-th">Année</th>
                <th className="ft-th">Date Début</th>
                <th className="ft-th">Date Fin</th>
                <th className="ft-th">Statut</th>
                <th className="ft-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period.id} className="ft-tr">
                  <td className="ft-td font-semibold">
                    {period.month}/{period.fiscal_year}
                  </td>
                  <td className="ft-td">{period.fiscal_year}</td>
                  <td className="ft-td">{period.start_date}</td>
                  <td className="ft-td">{period.end_date}</td>
                  <td className="ft-td">
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
                  <td className="ft-td flex gap-2">
                    {period.status === "OPEN" ? (
                      <>
                        <button
                          onClick={() => handleEdit(period)}
                          className="text-secondary hover:text-primary-end font-semibold text-sm"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleClosePeriod(period.id)}
                          className="text-orange-700 hover:text-orange-900 font-semibold text-sm"
                        >
                          Fermer
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleOpenPeriod(period.id)}
                          className="text-emerald-700 hover:text-emerald-900 font-semibold text-sm"
                        >
                          Réouvrir
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(period.id)}
                      className="text-red-600 hover:text-red-800 font-semibold text-sm"
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
