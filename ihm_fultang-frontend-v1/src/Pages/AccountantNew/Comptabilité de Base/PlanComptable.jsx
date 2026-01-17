import { useState, useEffect } from "react";
import { chartOfAccountsService } from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";
import Pagination from "../../../GlobalComponents/Pagination";
import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";

export function ChartOfAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    label: "",
    account_class: "1",
    account_type: "ASSET",
    is_active: true,
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchAccounts();
  }, [currentPage, searchTerm]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await chartOfAccountsService.getAllAccounts({
        page: currentPage,
        search: searchTerm,
      });
      setAccounts(response.data.results || response.data);
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
        await chartOfAccountsService.updateAccount(editingId, formData);
      } else {
        await chartOfAccountsService.createAccount(formData);
      }
      setShowForm(false);
      setFormData({
        code: "",
        label: "",
        account_class: "1",
        account_type: "ASSET",
        is_active: true,
      });
      setEditingId(null);
      fetchAccounts();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleEdit = (account) => {
    setFormData(account);
    setEditingId(account.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr?")) {
      try {
        await chartOfAccountsService.deleteAccount(id);
        fetchAccounts();
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Plan Comptable</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({
                code: "",
                label: "",
                account_class: "1",
                account_type: "ASSET",
                is_active: true,
              });
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {showForm ? "Fermer" : "+ Nouveau Compte"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow mb-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                required
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Libellé"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                required
                className="border rounded px-3 py-2"
              />
              <select
                value={formData.account_class}
                onChange={(e) =>
                  setFormData({ ...formData, account_class: e.target.value })
                }
                className="border rounded px-3 py-2"
              >
                <option value="1">Capitaux</option>
                <option value="2">Immobilisations</option>
                <option value="3">Stocks</option>
                <option value="4">Tiers</option>
                <option value="5">Trésorerie</option>
                <option value="6">Charges</option>
                <option value="7">Produits</option>
                <option value="8">Spéciaux</option>
              </select>
              <select
                value={formData.account_type}
                onChange={(e) =>
                  setFormData({ ...formData, account_type: e.target.value })
                }
                className="border rounded px-3 py-2"
              >
                <option value="ASSET">Actif</option>
                <option value="LIABILITY">Passif</option>
                <option value="EQUITY">Capitaux Propres</option>
                <option value="REVENUE">Produit</option>
                <option value="EXPENSE">Charge</option>
              </select>
            </div>
            <div className="mt-4 flex gap-2">
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

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border rounded px-4 py-2"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">Code</th>
                <th className="px-6 py-3 text-left">Libellé</th>
                <th className="px-6 py-3 text-left">Classe</th>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-left">Statut</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">{account.code}</td>
                  <td className="px-6 py-4">{account.label}</td>
                  <td className="px-6 py-4">{account.account_class}</td>
                  <td className="px-6 py-4">{account.account_type}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded ${
                        account.is_active
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {account.is_active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(account)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="text-red-500 hover:text-red-700"
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
      </div>
    </CustomDashboard>
  );
}
