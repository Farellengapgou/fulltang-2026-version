import { useState, useEffect } from "react";
import { X, CheckCircle } from "lucide-react";
import {
  budgetService,
  chartOfAccountsService,
} from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";

import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { SuccessModal } from "../../Modals/SuccessModal.jsx";
import { ErrorModal } from "../../Modals/ErrorModal.jsx";
import { ConfirmationModal } from "../../Modals/ConfirmAction.Modal.jsx";

export function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [accounts, setAccounts] = useState([]);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [confirmConfig, setConfirmConfig] = useState({ title: "", message: "", onConfirm: () => {} });

  const [formData, setFormData] = useState({
    name: "",
    budget_type: "ANNUAL",
    fiscal_year: new Date().getFullYear(),
    start_date: `${new Date().getFullYear()}-01-01`,
    end_date: `${new Date().getFullYear()}-12-31`,
    is_active: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const budgetsData = await budgetService.getAllBudgets();
      setBudgets(budgetsData.data.results || budgetsData.data);
    } catch (error) {
      console.error("Erreur récupération budgets:", error);
    }

    try {
      const accountsData = await chartOfAccountsService.getAllAccounts();
      setAccounts(accountsData.data.results || accountsData.data);
    } catch (error) {
      console.error("Erreur récupération comptes:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await budgetService.createBudget(formData);
      setModalMessage("Le budget a été créé avec succès.");
      setShowForm(false);
      setIsSuccessModalOpen(true);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Erreur:", error);
      setModalMessage(error.response?.data ? JSON.stringify(error.response.data) : error.message);
      setIsErrorModalOpen(true);
    }
  };

  const handleApprove = (id) => {
    setConfirmConfig({
      title: "Approuver le Budget",
      message: "Voulez-vous officiellement approuver ce budget ? Cette action fixera les objectifs pour l'exercice.",
      onConfirm: async () => {
        try {
          await budgetService.approveBudget(id);
          setModalMessage("Le budget a été approuvé avec succès.");
          setIsSuccessModalOpen(true);
          fetchData();
        } catch (error) {
          console.error("Erreur:", error);
          setModalMessage(error.response?.data ? JSON.stringify(error.response.data) : error.message);
          setIsErrorModalOpen(true);
        }
      }
    });
    setIsConfirmModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      budget_type: "ANNUAL",
      fiscal_year: new Date().getFullYear(),
      start_date: `${new Date().getFullYear()}-01-01`,
      end_date: `${new Date().getFullYear()}-12-31`,
      is_active: true,
    });
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
          <h1 className="text-2xl font-bold text-secondary">Prévisions Budgétaires</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="ft-btn ft-btn-md ft-btn-primary"
          >
            + Nouveau Budget
          </button>
        </div>

        {/* Modal pour le formulaire */}
        {showForm && (
          <div className="ft-modal-overlay">
            <div className="ft-modal max-w-2xl">
              <div className="ft-modal-header">
                <h2 className="ft-modal-title">Nouveau Budget</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="ft-modal-body grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Nom du Budget</label>
                    <input
                      type="text"
                      placeholder="Ex: Budget de Fonctionnement 2026"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Type de Budget</label>
                    <select
                      value={formData.budget_type}
                      onChange={(e) =>
                        setFormData({ ...formData, budget_type: e.target.value })
                      }
                      required
                      className="ft-select"
                    >
                      <option value="ANNUAL">Budget Annuel</option>
                      <option value="QUARTERLY">Budget Trimestriel</option>
                      <option value="MONTHLY">Budget Mensuel</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Exercice Fiscal</label>
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
                      className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Date de début</label>
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
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Date de fin</label>
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
                <div className="ft-modal-footer">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="ft-btn ft-btn-md ft-btn-outline"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="ft-btn ft-btn-md ft-btn-primary"
                  >
                    Créer le budget
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="ft-card overflow-hidden">
          <table className="ft-table">
            <thead className="ft-thead">
              <tr>
                <th className="ft-th">Désignation</th>
                <th className="ft-th">Type</th>
                <th className="ft-th text-center">Exercice</th>
                <th className="ft-th text-right">Montant Total</th>
                <th className="ft-th text-center">Approbation</th>
                <th className="ft-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {budgets.map((b) => (
                <tr key={b.id} className="ft-tr">
                  <td className="ft-td font-medium text-secondary">{b.name}</td>
                  <td className="ft-td">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 uppercase">
                        {b.budget_type}
                    </span>
                  </td>
                  <td className="ft-td text-center font-bold text-gray-600">{b.fiscal_year}</td>
                  <td className="ft-td text-right font-mono font-bold text-secondary">
                    {(b.total_budget || 0).toLocaleString()} <span className="text-[10px] text-gray-400">FCFA</span>
                  </td>
                  <td className="ft-td text-center">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        b.is_approved
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {b.is_approved ? "APPROUVÉ" : "EN ATTENTE"}
                    </span>
                  </td>
                  <td className="ft-td text-right">
                    {!b.is_approved && (
                      <button
                        onClick={() => handleApprove(b.id)}
                        className="p-1 px-3 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors text-xs font-bold border border-emerald-200"
                      >
                        Approuver
                      </button>
                    )}
                    {b.is_approved && (
                        <span className="text-gray-400 italic text-xs flex justify-end items-center gap-1">
                            Validé <CheckCircle size={14} />
                        </span>
                    )}
                  </td>
                </tr>
              ))}
              {budgets.length === 0 && (
                <tr>
                  <td colSpan="6" className="ft-td text-center text-gray-500 py-12">
                    Aucun budget enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SuccessModal 
        isOpen={isSuccessModalOpen} 
        canOpenSuccessModal={setIsSuccessModalOpen} 
        message={modalMessage} 
        makeAction={() => {}} 
      />
      <ErrorModal 
        isOpen={isErrorModalOpen} 
        onCloseErrorModal={setIsErrorModalOpen} 
        message={modalMessage} 
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
      />
    </CustomDashboard>
  );
}

