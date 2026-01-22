import React, { useState, useEffect } from "react";
import { X, Eye, Check, RotateCcw, Plus, Trash2 } from "lucide-react";
import {
  journalEntryService,
  journalService,
  chartOfAccountsService,
} from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";
import Pagination from "../../../GlobalComponents/Pagination";
import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { SuccessModal } from "../../Modals/SuccessModal.jsx";
import { ErrorModal } from "../../Modals/ErrorModal.jsx";
import { ConfirmationModal } from "../../Modals/ConfirmAction.Modal.jsx";

export function JournalEntries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [journals, setJournals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [confirmConfig, setConfirmConfig] = useState({ title: "", message: "", onConfirm: () => {} });

  const [formData, setFormData] = useState({
    entry_number: "",
    entry_date: new Date().toISOString().split("T")[0],
    journal: "",
    description: "",
    reference: "",
    lines: [],
  });
  const [editingId, setEditingId] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [entriesData, journalsData, accountsData] = await Promise.all([
        journalEntryService.getAllEntries({ page: currentPage }),
        journalService.getAllJournals(),
        chartOfAccountsService.getAllAccounts(),
      ]);

      setEntries(entriesData.data.results || entriesData.data);
      setTotalPages(Math.ceil((entriesData.data.count || 0) / 10));
      setJournals(journalsData.data.results || journalsData.data);
      setAccounts(accountsData.data.results || accountsData.data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const handleAddLine = () => {
    setFormData({
      ...formData,
      lines: [
        ...formData.lines,
        { account: "", label: "", debit_amount: 0, credit_amount: 0 },
      ],
    });
  };

  const handleRemoveLine = (index) => {
    setFormData({
      ...formData,
      lines: formData.lines.filter((_, i) => i !== index),
    });
  };

  const handleLineChange = (index, field, value) => {
    const newLines = [...formData.lines];
    newLines[index][field] = value;
    setFormData({ ...formData, lines: newLines });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        lines: formData.lines.map((line, idx) => ({
          ...line,
          sequence: idx + 1,
        })),
      };

      if (editingId) {
        await journalEntryService.updateEntry(editingId, data);
        setModalMessage("L'écriture a été mise à jour avec succès.");
      } else {
        await journalEntryService.createEntry(data);
        setModalMessage("L'écriture a été créée avec succès.");
      }

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

  const handlePost = (id) => {
    setConfirmConfig({
      title: "Valider l'Écriture",
      message: "Voulez-vous vraiment valider cette écriture ? Une fois validée, elle ne pourra plus être modifiée.",
      onConfirm: async () => {
        try {
          await journalEntryService.postEntry(id, {});
          setModalMessage("L'écriture a été validée avec succès.");
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

  const handleReverse = (id) => {
    setConfirmConfig({
      title: "Contre-passer",
      message: "Voulez-vous vraiment contre-passer cette écriture ? Cela créera une écriture inverse pour annuler l'impact.",
      onConfirm: async () => {
        try {
          await journalEntryService.reverseEntry(id, {});
          setModalMessage("L'écriture a été contre-passée avec succès.");
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
      entry_number: "",
      entry_date: new Date().toISOString().split("T")[0],
      journal: "",
      description: "",
      reference: "",
      lines: [],
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-secondary">Écritures Comptables</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="ft-btn ft-btn-md ft-btn-primary"
          >
            + Nouvelle Écriture
          </button>
        </div>

        {/* Create/Edit Modal */}
        {showForm && (
          <div className="ft-modal-overlay">
            <div className="ft-modal max-w-5xl">
              <div className="ft-modal-header">
                <h2 className="ft-modal-title">
                  {editingId ? "Modifier l'Écriture" : "Nouvelle Écriture"}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="ft-modal-body space-y-6">
                  {/* Header Fields */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Date</label>
                      <input
                        type="date"
                        value={formData.entry_date}
                        onChange={(e) =>
                          setFormData({ ...formData, entry_date: e.target.value })
                        }
                        required
                        className="ft-input"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Journal</label>
                      <select
                        value={formData.journal}
                        onChange={(e) =>
                          setFormData({ ...formData, journal: e.target.value })
                        }
                        required
                        className="ft-select"
                      >
                        <option value="">Sélectionner</option>
                        {journals.map((j) => (
                          <option key={j.id} value={j.id}>
                            {j.code} - {j.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Référence</label>
                      <input
                        type="text"
                        placeholder="Ex: Fact-2026-001"
                        value={formData.reference}
                        onChange={(e) =>
                          setFormData({ ...formData, reference: e.target.value })
                        }
                        className="ft-input"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                      <input
                        type="text"
                        placeholder="Description de l'écriture"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        required
                        className="ft-input"
                      />
                    </div>
                  </div>

                  {/* Lines Section */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Lignes d'Écriture</h3>
                      <button
                        type="button"
                        onClick={handleAddLine}
                        className="ft-btn ft-btn-sm ft-btn-outline"
                      >
                        <Plus size={16} /> Ajouter une ligne
                      </button>
                    </div>
                    <div className="border border-gray-100 rounded-lg overflow-hidden">
                      <table className="ft-table">
                        <thead className="ft-thead">
                          <tr>
                            <th className="ft-th !py-2">Compte</th>
                            <th className="ft-th !py-2">Libellé</th>
                            <th className="ft-th !py-2 text-right">Débit</th>
                            <th className="ft-th !py-2 text-right">Crédit</th>
                            <th className="ft-th !py-2 text-right"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {formData.lines.map((line, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50">
                              <td className="px-3 py-2">
                                <select
                                  value={line.account}
                                  onChange={(e) =>
                                    handleLineChange(idx, "account", e.target.value)
                                  }
                                  required
                                  className="ft-select !py-1.5 text-xs font-mono"
                                >
                                  <option value="">Compte...</option>
                                  {accounts.map((a) => (
                                    <option key={a.id} value={a.id}>
                                      {a.code} - {a.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  value={line.label}
                                  onChange={(e) =>
                                    handleLineChange(idx, "label", e.target.value)
                                  }
                                  required
                                  className="ft-input !py-1.5 text-xs"
                                  placeholder="Libellé de la ligne"
                                />
                              </td>
                              <td className="px-3 py-2 w-32">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={line.debit_amount}
                                  onChange={(e) =>
                                    handleLineChange(
                                      idx,
                                      "debit_amount",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="ft-input !py-1.5 text-xs text-right font-mono"
                                />
                              </td>
                              <td className="px-3 py-2 w-32">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={line.credit_amount}
                                  onChange={(e) =>
                                    handleLineChange(
                                      idx,
                                      "credit_amount",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="ft-input !py-1.5 text-xs text-right font-mono"
                                />
                              </td>
                              <td className="px-3 py-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLine(idx)}
                                  className="text-red-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {formData.lines.length === 0 && (
                            <tr>
                              <td colSpan="5" className="px-3 py-6 text-center text-gray-400 text-sm">
                                Cliquez sur "+ Ajouter une ligne" pour commencer
                              </td>
                            </tr>
                          )}
                        </tbody>
                        {formData.lines.length > 0 && (
                          <tfoot className="bg-gray-50/50">
                            <tr className="font-bold">
                              <td colSpan="2" className="px-3 py-2 text-right text-xs uppercase text-gray-500">Totaux</td>
                              <td className="px-3 py-2 text-right font-mono text-secondary">
                                {formData.lines.reduce((sum, l) => sum + (parseFloat(l.debit_amount) || 0), 0).toFixed(2)}
                              </td>
                              <td className="px-3 py-2 text-right font-mono text-secondary">
                                {formData.lines.reduce((sum, l) => sum + (parseFloat(l.credit_amount) || 0), 0).toFixed(2)}
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
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
                    {editingId ? "Mettre à jour" : "Confirmer l'écriture"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Entries Table */}
        <div className="ft-card overflow-hidden">
          <table className="ft-table">
            <thead className="ft-thead">
              <tr>
                <th className="ft-th">N° Écriture</th>
                <th className="ft-th">Journal</th>
                <th className="ft-th">Date</th>
                <th className="ft-th">Description</th>
                <th className="ft-th text-right">Débit</th>
                <th className="ft-th text-right">Crédit</th>
                <th className="ft-th text-center">Statut</th>
                <th className="ft-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((entry) => (
                <tr key={entry.id} className="ft-tr">
                  <td className="ft-td font-bold text-secondary uppercase tracking-tighter">
                    {entry.entry_number}
                  </td>
                  <td className="ft-td text-xs font-semibold text-gray-600">
                    {entry.journal_name}
                  </td>
                  <td className="ft-td text-xs text-gray-500">
                    {entry.entry_date}
                  </td>
                  <td className="ft-td font-medium max-w-xs truncate">
                    {entry.description}
                  </td>
                  <td className="ft-td text-right font-mono text-gray-700">
                    {entry.total_debit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="ft-td text-right font-mono text-gray-700">
                    {entry.total_credit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="ft-td text-center">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        entry.state === "POSTED"
                          ? "bg-green-100 text-green-700"
                          : entry.state === "DRAFT"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {entry.state}
                    </span>
                  </td>
                  <td className="ft-td text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedEntry(entry);
                          setShowDetails(true);
                        }}
                        className="p-1.5 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                        title="Voir détails"
                      >
                        <Eye size={18} />
                      </button>
                      {entry.state === "DRAFT" && (
                        <button
                          onClick={() => handlePost(entry.id)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Valider"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      {entry.state === "POSTED" && (
                        <button
                          onClick={() => handleReverse(entry.id)}
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Contre-passer"
                        >
                          <RotateCcw size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan="8" className="ft-td text-center text-gray-500 py-16">
                    Aucune écriture enregistrée pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Details Modal Harmonized */}
        {showDetails && selectedEntry && (
          <div className="ft-modal-overlay">
            <div className="ft-modal max-w-4xl">
              <div className="ft-modal-header">
                <h2 className="ft-modal-title">Écriture {selectedEntry.entry_number}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="ft-modal-body space-y-6">
                <div className="grid grid-cols-3 gap-6 bg-gray-50 p-4 rounded-xl">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Date</span>
                    <span className="font-semibold text-gray-800">{selectedEntry.entry_date}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Journal</span>
                    <span className="font-semibold text-gray-800">{selectedEntry.journal_name}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Statut</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
                      selectedEntry.state === "POSTED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {selectedEntry.state}
                    </span>
                  </div>
                  <div className="col-span-3">
                    <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Description</span>
                    <span className="font-medium text-gray-700">{selectedEntry.description}</span>
                  </div>
                </div>

                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <table className="ft-table">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="ft-th">Compte</th>
                        <th className="ft-th">Libellé</th>
                        <th className="ft-th text-right">Débit</th>
                        <th className="ft-th text-right">Crédit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedEntry.lines?.map((line, idx) => (
                        <tr key={idx} className="ft-tr">
                          <td className="ft-td font-mono text-xs">{line.account_code}</td>
                          <td className="ft-td text-xs">{line.label}</td>
                          <td className="ft-td text-right font-mono text-xs">
                            {line.debit_amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="ft-td text-right font-mono text-xs">
                            {line.credit_amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-bold border-t-2">
                        <td colSpan="2" className="px-6 py-4 text-right text-xs uppercase text-gray-500">Total</td>
                        <td className="px-6 py-4 text-right font-mono text-secondary">
                          {selectedEntry.total_debit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-secondary">
                          {selectedEntry.total_credit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="ft-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowDetails(false)}
                  className="ft-btn ft-btn-md ft-btn-outline w-full"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
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
