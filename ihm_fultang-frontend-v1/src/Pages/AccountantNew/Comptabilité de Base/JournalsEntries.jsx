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
      <div className="p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Écritures Comptables</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              resetForm();
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {showForm ? "Fermer" : "+ Nouvelle Écriture"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow mb-6"
          >
            <div className="grid grid-cols-2 gap-4 mb-6">
              <input
                type="date"
                value={formData.entry_date}
                onChange={(e) =>
                  setFormData({ ...formData, entry_date: e.target.value })
                }
                required
                className="border rounded px-3 py-2"
              />
              <select
                value={formData.journal}
                onChange={(e) =>
                  setFormData({ ...formData, journal: e.target.value })
                }
                required
                className="border rounded px-3 py-2"
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
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                className="border rounded px-3 py-2"
              />
            </div>

            {/* Lines */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Lignes d'Écriture</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-2 py-2 text-left">Compte</th>
                      <th className="px-2 py-2 text-left">Libellé</th>
                      <th className="px-2 py-2 text-right">Débit</th>
                      <th className="px-2 py-2 text-right">Crédit</th>
                      <th className="px-2 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.lines.map((line, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-2 py-2">
                          <select
                            value={line.account}
                            onChange={(e) =>
                              handleLineChange(idx, "account", e.target.value)
                            }
                            required
                            className="border rounded px-2 py-1 text-sm w-full"
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
                            className="border rounded px-2 py-1 text-sm w-full"
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
                            className="border rounded px-2 py-1 text-sm w-full text-right"
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
                            className="border rounded px-2 py-1 text-sm w-full text-right"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(idx)}
                            className="text-red-500 text-sm"
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
                className="mt-2 bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
              >
                + Ajouter une ligne
              </button>
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
                <th className="px-6 py-3 text-left">N° Écriture</th>
                <th className="px-6 py-3 text-left">Journal</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Description</th>
                <th className="px-6 py-3 text-right">Débit</th>
                <th className="px-6 py-3 text-right">Crédit</th>
                <th className="px-6 py-3 text-left">Statut</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">
                    {entry.entry_number}
                  </td>
                  <td className="px-6 py-4">{entry.journal}</td>
                  <td className="px-6 py-4">{entry.entry_date}</td>
                  <td className="px-6 py-4">{entry.description}</td>
                  <td className="px-6 py-4 text-right">
                    {entry.total_debit.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {entry.total_credit.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedEntry(entry);
                        setShowDetails(true);
                      }}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Détails
                    </button>
                    {entry.state === "DRAFT" && (
                      <>
                        <button
                          onClick={() => handlePost(entry.id)}
                          className="text-green-500 hover:text-green-700 text-sm"
                        >
                          Valider
                        </button>
                      </>
                    )}
                    {entry.state === "POSTED" && (
                      <button
                        onClick={() => handleReverse(entry.id)}
                        className="text-orange-500 hover:text-orange-700 text-sm"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-4">Détails de l'Écriture</h2>
              <div className="mb-4">
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
              <div className="mb-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left">Compte</th>
                      <th className="px-3 py-2 text-left">Libellé</th>
                      <th className="px-3 py-2 text-right">Débit</th>
                      <th className="px-3 py-2 text-right">Crédit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEntry.lines?.map((line, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-3 py-2">{line.account_code}</td>
                        <td className="px-3 py-2">{line.label}</td>
                        <td className="px-3 py-2 text-right">
                          {line.debit_amount.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {line.credit_amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </CustomDashboard>
  );
}
