import React, { useState, useEffect } from "react";
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

export function JournalEntries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [journals, setJournals] = useState([]);
  const [accounts, setAccounts] = useState([]);
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

  useEffect(() => {
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
      } else {
        await journalEntryService.createEntry(data);
      }

      setShowForm(false);
      resetForm();
      // Refresh list
      const response = await journalEntryService.getAllEntries({
        page: currentPage,
      });
      setEntries(response.data.results || response.data);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handlePost = async (id) => {
    if (window.confirm("Valider cette écriture?")) {
      try {
        await journalEntryService.postEntry(id, {});
        const response = await journalEntryService.getAllEntries({
          page: currentPage,
        });
        setEntries(response.data.results || response.data);
      } catch (error) {
        console.error("Erreur:", error);
      }
    }
  };

  const handleReverse = async (id) => {
    if (window.confirm("Contre-passer cette écriture?")) {
      try {
        await journalEntryService.reverseEntry(id, {});
        const response = await journalEntryService.getAllEntries({
          page: currentPage,
        });
        setEntries(response.data.results || response.data);
      } catch (error) {
        console.error("Erreur:", error);
      }
    }
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Écritures Comptables</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              resetForm();
            }}
            className="ft-btn ft-btn-md ft-btn-primary"
          >
            {showForm ? "Fermer" : "+ Nouvelle Écriture"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="ft-card-padded mb-6"
          >
            <div className="grid grid-cols-2 gap-4 mb-6">
              <input
                type="date"
                value={formData.entry_date}
                onChange={(e) =>
                  setFormData({ ...formData, entry_date: e.target.value })
                }
                required
                className="ft-input"
              />
              <select
                value={formData.journal}
                onChange={(e) =>
                  setFormData({ ...formData, journal: e.target.value })
                }
                required
                className="ft-select"
              >
                <option value="">Sélectionner un journal</option>
                {journals.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.code} - {j.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Référence"
                value={formData.reference}
                onChange={(e) =>
                  setFormData({ ...formData, reference: e.target.value })
                }
                className="ft-input"
              />
              <input
                type="text"
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                className="ft-input"
              />
            </div>

            {/* Lines */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Lignes d'Écriture</h3>
              <div className="overflow-x-auto">
                <table className="ft-table text-sm">
                  <thead className="ft-thead">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compte</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Libellé</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Débit</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Crédit</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.lines.map((line, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50 transition-colors">
                        <td className="px-2 py-2">
                          <select
                            value={line.account}
                            onChange={(e) =>
                              handleLineChange(idx, "account", e.target.value)
                            }
                            required
                            className="ft-select !px-3 !py-2 !text-sm"
                          >
                            <option value="">Sélectionner</option>
                            {accounts.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.code} - {a.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="text"
                            value={line.label}
                            onChange={(e) =>
                              handleLineChange(idx, "label", e.target.value)
                            }
                            required
                            className="ft-input !px-3 !py-2 !text-sm"
                          />
                        </td>
                        <td className="px-2 py-2">
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
                            className="ft-input !px-3 !py-2 !text-sm text-right"
                          />
                        </td>
                        <td className="px-2 py-2">
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
                            className="ft-input !px-3 !py-2 !text-sm text-right"
                          />
                        </td>
                        <td className="px-2 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(idx)}
                            className="text-red-600 hover:text-red-800 font-semibold text-sm"
                          >
                            Suppr.
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={handleAddLine}
                className="mt-2 ft-btn ft-btn-sm ft-btn-outline"
              >
                + Ajouter une ligne
              </button>
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
                <th className="ft-th">N° Écriture</th>
                <th className="ft-th">Journal</th>
                <th className="ft-th">Date</th>
                <th className="ft-th">Description</th>
                <th className="ft-th text-right">Débit</th>
                <th className="ft-th text-right">Crédit</th>
                <th className="ft-th">Statut</th>
                <th className="ft-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="ft-tr">
                  <td className="ft-td font-semibold">
                    {entry.entry_number}
                  </td>
                  <td className="ft-td">{entry.journal}</td>
                  <td className="ft-td">{entry.entry_date}</td>
                  <td className="ft-td">{entry.description}</td>
                  <td className="ft-td text-right font-mono">
                    {entry.total_debit.toFixed(2)}
                  </td>
                  <td className="ft-td text-right font-mono">
                    {entry.total_credit.toFixed(2)}
                  </td>
                  <td className="ft-td">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        entry.state === "POSTED"
                          ? "bg-green-200 text-green-800"
                          : entry.state === "DRAFT"
                          ? "bg-yellow-200 text-yellow-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {entry.state}
                    </span>
                  </td>
                  <td className="ft-td flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedEntry(entry);
                        setShowDetails(true);
                      }}
                      className="text-secondary hover:text-primary-end font-semibold text-sm"
                    >
                      Détails
                    </button>
                    {entry.state === "DRAFT" && (
                      <>
                        <button
                          onClick={() => handlePost(entry.id)}
                          className="text-emerald-700 hover:text-emerald-900 font-semibold text-sm"
                        >
                          Valider
                        </button>
                      </>
                    )}
                    {entry.state === "POSTED" && (
                      <button
                        onClick={() => handleReverse(entry.id)}
                        className="text-orange-700 hover:text-orange-900 font-semibold text-sm"
                      >
                        Contre-passer
                      </button>
                    )}
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

        {/* Details Modal */}
        {showDetails && selectedEntry && (
          <div className="ft-modal-overlay">
            <div className="ft-modal">
              <div className="ft-modal-header">
                <h2 className="ft-modal-title">Détails de l'Écriture</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="ft-btn ft-btn-sm ft-btn-outline"
                  type="button"
                >
                  Fermer
                </button>
              </div>
              <div className="ft-modal-body">
                <p>
                  <strong>N° Écriture:</strong> {selectedEntry.entry_number}
                </p>
                <p>
                  <strong>Date:</strong> {selectedEntry.entry_date}
                </p>
                <p>
                  <strong>Description:</strong> {selectedEntry.description}
                </p>
                <p>
                  <strong>Statut:</strong> {selectedEntry.state}
                </p>
              </div>
              <div className="ft-modal-body pt-0 overflow-x-auto">
                <table className="ft-table text-sm">
                  <thead className="ft-thead">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compte</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Libellé</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Débit</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Crédit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEntry.lines?.map((line, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2">{line.account_code}</td>
                        <td className="px-3 py-2">{line.label}</td>
                        <td className="px-3 py-2 text-right font-mono">
                          {line.debit_amount.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {line.credit_amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomDashboard>
  );
}
