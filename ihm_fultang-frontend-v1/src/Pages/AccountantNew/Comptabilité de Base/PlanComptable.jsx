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
      <div className="ft-page">
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
            className="ft-btn ft-btn-md ft-btn-primary"
          >
            {showForm ? "Fermer" : "+ Nouveau Compte"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="ft-card-padded mb-6"
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
                className="ft-input"
              />
              <input
                type="text"
                placeholder="Libellé"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                required
                className="ft-input"
              />
              <select
                value={formData.account_class}
                onChange={(e) =>
                  setFormData({ ...formData, account_class: e.target.value })
                }
                className="ft-select"
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
                className="ft-select"
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
            className="ft-input"
          />
        </div>

        {/* Table */}
        <div className="ft-card overflow-hidden">
          <table className="ft-table">
            <thead className="ft-thead">
              <tr>
                <th className="ft-th">Code</th>
                <th className="ft-th">Libellé</th>
                <th className="ft-th">Classe</th>
                <th className="ft-th">Type</th>
                <th className="ft-th">Statut</th>
                <th className="ft-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id} className="ft-tr">
                  <td className="ft-td font-semibold">{account.code}</td>
                  <td className="ft-td">{account.label}</td>
                  <td className="ft-td">{account.account_class}</td>
                  <td className="ft-td">{account.account_type}</td>
                  <td className="ft-td">
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
                  <td className="ft-td flex gap-2">
                    <button
                      onClick={() => handleEdit(account)}
                      className="text-secondary hover:text-primary-end font-semibold"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="text-red-600 hover:text-red-800 font-semibold"
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
