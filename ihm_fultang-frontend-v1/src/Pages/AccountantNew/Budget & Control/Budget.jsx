import { useState, useEffect } from "react";
import { X, CheckCircle, Plus, Edit2, Trash2, DollarSign } from "lucide-react";
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
  const [showLinesModal, setShowLinesModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [budgetLines, setBudgetLines] = useState([]);
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

  const [lineFormData, setLineFormData] = useState({
    account: "",
    january: 0, february: 0, march: 0, april: 0, may: 0, june: 0,
    july: 0, august: 0, september: 0, october: 0, november: 0, december: 0,
    notes: "",
  });

  const months = ["january", "february", "march", "april", "may", "june", 
                  "july", "august", "september", "october", "november", "december"];
  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", 
                      "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];

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
      // Filter for expense accounts (class 6)
      const expenseAccounts = (accountsData.data.results || accountsData.data).filter(
        acc => acc.account_class === '6'
      );
      setAccounts(expenseAccounts);
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

  const handleManageLines = async (budget) => {
    setSelectedBudget(budget);
    try {
      const linesData = await budgetService.getBudgetLines(budget.id);
      setBudgetLines(linesData.data || []);
      setShowLinesModal(true);
    } catch (error) {
      console.error("Erreur récupération lignes:", error);
      setBudgetLines([]);
      setShowLinesModal(true);
    }
  };

  const handleAddLine = async (e) => {
    e.preventDefault();
    try {
      await budgetService.createBudgetLine(selectedBudget.id, {
        ...lineFormData,
        budget: selectedBudget.id,
      });
      setModalMessage("Ligne budgétaire ajoutée avec succès.");
      setIsSuccessModalOpen(true);
      resetLineForm();
      // Refresh lines
      const linesData = await budgetService.getBudgetLines(selectedBudget.id);
      setBudgetLines(linesData.data || []);
      fetchData(); // Refresh budgets to update totals
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

  const resetLineForm = () => {
    setLineFormData({
      account: "",
      january: 0, february: 0, march: 0, april: 0, may: 0, june: 0,
      july: 0, august: 0, september: 0, october: 0, november: 0, december: 0,
      notes: "",
    });
  };

  const calculateLineTotal = () => {
    return months.reduce((sum, month) => sum + (parseFloat(lineFormData[month]) || 0), 0);
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
            <Plus size={20} /> Nouveau Budget
          </button>
        </div>

        {/* Modal Budget Form */}
        {showForm && (
          <div className="ft-modal-overlay">
            <div className="ft-modal max-w-2xl">
              <div className="ft-modal-header">
                <h2 className="ft-modal-title">Nouveau Budget</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
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
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Type</label>
                    <select
                      value={formData.budget_type}
                      onChange={(e) => setFormData({ ...formData, budget_type: e.target.value })}
                      className="ft-select"
                    >
                      <option value="ANNUAL">Annuel</option>
                      <option value="QUARTERLY">Trimestriel</option>
                      <option value="MONTHLY">Mensuel</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Exercice Fiscal</label>
                    <input
                      type="number"
                      value={formData.fiscal_year}
                      onChange={(e) => setFormData({ ...formData, fiscal_year: parseInt(e.target.value) })}
                      required
                      className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Date de début</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                      className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Date de fin</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                      className="ft-input"
                    />
                  </div>
                </div>
                <div className="ft-modal-footer">
                  <button type="button" onClick={() => setShowForm(false)} className="ft-btn ft-btn-md ft-btn-outline">
                    Annuler
                  </button>
                  <button type="submit" className="ft-btn ft-btn-md ft-btn-primary">
                    Créer le budget
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Budget Lines */}
        {showLinesModal && selectedBudget && (
          <div className="ft-modal-overlay">
            <div className="ft-modal max-w-6xl">
              <div className="ft-modal-header">
                <div>
                  <h2 className="ft-modal-title">Lignes Budgétaires</h2>
                  <p className="ft-modal-subtitle">{selectedBudget.name}</p>
                </div>
                <button onClick={() => setShowLinesModal(false)} className="text-white/80 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              
              <div className="ft-modal-body max-h-[70vh] overflow-y-auto">
                {/* Add Line Form */}
                <form onSubmit={handleAddLine} className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="font-bold text-gray-700 mb-3">Ajouter une ligne budgétaire</h3>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-gray-600">Compte (Classe 6 - Charges)</label>
                      <select
                        value={lineFormData.account}
                        onChange={(e) => setLineFormData({ ...lineFormData, account: e.target.value })}
                        required
                        className="ft-select text-sm"
                      >
                        <option value="">Sélectionner un compte</option>
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.code} - {acc.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-2 mb-3">
                    {months.map((month, idx) => (
                      <div key={month}>
                        <label className="text-[10px] font-semibold text-gray-500 uppercase">{monthNames[idx]}</label>
                        <input
                          type="number"
                          value={lineFormData[month]}
                          onChange={(e) => setLineFormData({ ...lineFormData, [month]: parseFloat(e.target.value) || 0 })}
                          className="ft-input text-xs font-mono"
                          step="0.01"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-bold text-secondary">
                      Total annuel: {calculateLineTotal().toLocaleString()} FCFA
                    </div>
                    <button type="submit" className="ft-btn ft-btn-sm ft-btn-primary">
                      <Plus size={16} /> Ajouter
                    </button>
                  </div>
                </form>

                {/* Existing Lines */}
                <div className="space-y-2">
                  <h3 className="font-bold text-gray-700 mb-2">Lignes existantes ({budgetLines.length})</h3>
                  {budgetLines.map((line) => (
                    <div key={line.id} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-sm text-secondary">{line.account_code} - {line.account_label}</p>
                          <p className="text-xs text-gray-500">{line.notes}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-secondary">{(line.annual_total || 0).toLocaleString()} FCFA</p>
                          <p className="text-[10px] text-gray-400">Total annuel</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-12 gap-1 text-[10px]">
                        {months.map((month, idx) => (
                          <div key={month} className="text-center">
                            <div className="text-gray-400 uppercase">{monthNames[idx]}</div>
                            <div className="font-mono font-semibold">{(line[month] || 0).toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {budgetLines.length === 0 && (
                    <p className="text-center text-gray-400 py-8 italic">Aucune ligne budgétaire pour le moment</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Budgets Table */}
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
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleManageLines(b)}
                        className="p-1 px-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs font-bold border border-blue-200"
                        title="Gérer les lignes"
                      >
                        <DollarSign size={14} className="inline" /> Lignes
                      </button>
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
                    </div>
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
