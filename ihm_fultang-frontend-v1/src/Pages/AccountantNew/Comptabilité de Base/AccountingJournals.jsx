import { useState, useEffect } from "react";
import { X, Plus, Book, Hash, Edit, Trash2, CheckCircle, AlertCircle, Info, Settings, ArrowRight } from "lucide-react";
import { journalService } from "../../../Services/Accounting/journalService.js";
import { chartOfAccountsService } from "../../../Services/Accounting/chartOfAccountsService.js";
import Loader from "../../../GlobalComponents/Loader.jsx";
import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { SuccessModal } from "../../Modals/SuccessModal.jsx";
import { ErrorModal } from "../../Modals/ErrorModal.jsx";
import { ConfirmationModal } from "../../Modals/ConfirmAction.Modal.jsx";

export function AccountingJournals() {
  const [journals, setJournals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [confirmConfig, setConfirmConfig] = useState({ title: "", message: "", onConfirm: () => {} });

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    journal_type: "GENERAL",
    default_debit_account: "",
    default_credit_account: "",
    is_active: true,
  });

  const journalTypes = [
    { value: 'SALES', label: 'Journal des ventes' },
    { value: 'PURCHASES', label: 'Journal des achats' },
    { value: 'BANK', label: 'Journal de banque' },
    { value: 'CASH', label: 'Journal de caisse' },
    { value: 'GENERAL', label: 'Journal général' },
    { value: 'MISC', label: 'Opérations diverses' },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [journalsRes, accountsRes] = await Promise.all([
        journalService.getAllJournals(),
        chartOfAccountsService.getActiveAccounts()
      ]);
      setJournals(journalsRes.data.results || journalsRes.data);
      setAccounts(accountsRes.data.results || accountsRes.data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await journalService.updateJournal(editingId, formData);
        setModalMessage("Le journal a été modifié avec succès.");
      } else {
        await journalService.createJournal(formData);
        setModalMessage("Le journal a été créé avec succès.");
      }
      setShowForm(false);
      resetForm();
      setIsSuccessModalOpen(true);
      fetchData();
    } catch (error) {
      console.error("Erreur:", error);
      setModalMessage(error.response?.data ? JSON.stringify(error.response.data) : error.message);
      setIsErrorModalOpen(true);
    }
  };

  const handleEdit = (journal) => {
    setFormData({
      code: journal.code,
      name: journal.name,
      journal_type: journal.journal_type,
      default_debit_account: journal.default_debit_account || "",
      default_credit_account: journal.default_credit_account || "",
      is_active: journal.is_active,
    });
    setEditingId(journal.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setConfirmConfig({
      title: "Supprimer le journal",
      message: "Êtes-vous sûr de vouloir supprimer ce journal ? Cette action est irréversible.",
      onConfirm: async () => {
        try {
          await journalService.deleteJournal(id);
          setModalMessage("Le journal a été supprimé avec succès.");
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
      code: "",
      name: "",
      journal_type: "GENERAL",
      default_debit_account: "",
      default_credit_account: "",
      is_active: true,
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
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-secondary tracking-tight uppercase">Journaux Comptables</h1>
            <p className="text-gray-400 text-sm font-medium mt-1 uppercase tracking-widest">Configuration des journaux de saisie</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="ft-btn ft-btn-md ft-btn-primary"
          >
            <Plus size={20} /> Nouveau Journal
          </button>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="ft-modal-overlay">
            <div className="ft-modal max-w-2xl">
              <div className="ft-modal-header">
                <h2 className="ft-modal-title">{editingId ? "Modifier le journal" : "Nouveau Journal"}</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={28} />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="ft-modal-body space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-gray-700 ml-1">Code Journal</label>
                      <div className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          placeholder="Ex: ACHAT, VENTE, BQ"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                          required
                          className="ft-input pl-12"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-gray-700 ml-1">Nom du Journal</label>
                      <div className="relative">
                        <Book className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          placeholder="Ex: Journal des achats"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="ft-input pl-12"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-gray-700 ml-1">Type de Journal</label>
                      <div className="relative">
                        <Settings className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                          value={formData.journal_type}
                          onChange={(e) => setFormData({ ...formData, journal_type: e.target.value })}
                          className="ft-select pl-12"
                        >
                          {journalTypes.map((type) => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-8 ml-1">
                        <input 
                            type="checkbox" 
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                            className="w-5 h-5 accent-secondary cursor-pointer"
                        />
                        <label htmlFor="is_active" className="text-sm font-bold text-gray-700 cursor-pointer">Journal Actif</label>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-2xl space-y-4 border border-gray-100">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <ArrowRight size={14} /> Contreparties par défaut
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Compte Débit (Optionnel)</label>
                            <select
                                value={formData.default_debit_account}
                                onChange={(e) => setFormData({ ...formData, default_debit_account: e.target.value })}
                                className="ft-select"
                            >
                                <option value="">Aucun</option>
                                {accounts.map((acc) => (
                                    <option key={acc.id} value={acc.id}>{acc.code} - {acc.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Compte Crédit (Optionnel)</label>
                            <select
                                value={formData.default_credit_account}
                                onChange={(e) => setFormData({ ...formData, default_credit_account: e.target.value })}
                                className="ft-select"
                            >
                                <option value="">Aucun</option>
                                {accounts.map((acc) => (
                                    <option key={acc.id} value={acc.id}>{acc.code} - {acc.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                  </div>
                </div>
                <div className="ft-modal-footer">
                  <button type="button" onClick={() => setShowForm(false)} className="ft-btn ft-btn-md ft-btn-outline">
                    Annuler
                  </button>
                  <button type="submit" className="ft-btn ft-btn-md ft-btn-primary">
                    {editingId ? "Enregistrer les modifications" : "Créer le journal"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 p-6 overflow-hidden">
          <table className="ft-table">
            <thead className="ft-thead">
              <tr>
                <th className="ft-th">Code & Nom</th>
                <th className="ft-th">Type</th>
                <th className="ft-th">Contreparties</th>
                <th className="ft-th text-center">Statut</th>
                <th className="ft-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {journals.map((journal) => (
                <tr key={journal.id} className="ft-tr">
                  <td className="ft-td">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary">
                            <Book size={20} />
                        </div>
                        <div>
                            <span className="font-black text-secondary tracking-tight uppercase leading-none">{journal.code}</span>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{journal.name}</div>
                        </div>
                    </div>
                  </td>
                  <td className="ft-td">
                    <span className="font-bold text-gray-600 text-xs italic">
                        {journalTypes.find(t => t.value === journal.journal_type)?.label || journal.journal_type}
                    </span>
                  </td>
                  <td className="ft-td">
                    <div className="space-y-1">
                        {journal.default_debit_account_name && (
                            <div className="text-[10px] flex items-center gap-1">
                                <span className="font-black text-indigo-600 uppercase tracking-tighter">DEBIT:</span>
                                <span className="font-bold text-gray-500 truncate max-w-[150px]">{journal.default_debit_account_name}</span>
                            </div>
                        )}
                        {journal.default_credit_account_name && (
                            <div className="text-[10px] flex items-center gap-1">
                                <span className="font-black text-emerald-600 uppercase tracking-tighter">CREDIT:</span>
                                <span className="font-bold text-gray-500 truncate max-w-[150px]">{journal.default_credit_account_name}</span>
                            </div>
                        )}
                        {!journal.default_debit_account_name && !journal.default_credit_account_name && (
                            <span className="text-[10px] font-bold text-gray-300 italic uppercase">Aucune contrepartie</span>
                        )}
                    </div>
                  </td>
                  <td className="ft-td text-center">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${
                        journal.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                        {journal.is_active ? "ACTIF" : "INACTIF"}
                    </span>
                  </td>
                  <td className="ft-td text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(journal)}
                        className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        title="Modifier"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(journal.id)}
                        className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {journals.length === 0 && (
                <tr>
                    <td colSpan="5" className="ft-td text-center text-gray-400 py-20 font-medium italic uppercase tracking-widest">
                        Aucun journal comptable configuré.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Info Box */}
        <div className="mt-10 bg-secondary/5 rounded-[2rem] p-8 border border-secondary/10 flex gap-6 items-start">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-white shrink-0 shadow-lg shadow-secondary/20">
                <Info size={24} />
            </div>
            <div className="space-y-3">
                <h3 className="text-sm font-black text-secondary uppercase tracking-widest">Guide des Journaux Comptables</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                    <p className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-secondary"></div> Utilisez des codes courts et explicites (ex: ACH, VEN, COQ).</p>
                    <p className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-secondary"></div> Les types Sales/Purchases automatisent certaines écritures TVA.</p>
                    <p className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-secondary"></div> Les contreparties par défaut accélèrent la saisie des écritures.</p>
                    <p className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-secondary"></div> Un journal inactif ne pourra plus recevoir de nouvelles écritures.</p>
                </div>
            </div>
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

