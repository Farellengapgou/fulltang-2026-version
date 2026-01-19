import { useState, useEffect } from "react";
import {
  customerService,
  chartOfAccountsService,
} from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";
import Pagination from "../../../GlobalComponents/Pagination";

import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";

export function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    customer_type: "INDIVIDUAL",
    address: "",
    phone: "",
    email: "",
    payment_terms: 0,
    credit_limit: 0,
    account: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showBalance, setShowBalance] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [customersData, accountsData] = await Promise.all([
          customerService.getAllCustomers({
            page: currentPage,
            search: searchTerm,
          }),
          chartOfAccountsService.getAllAccounts(),
        ]);

        setCustomers(customersData.data.results || customersData.data);
        setTotalPages(Math.ceil((customersData.data.count || 0) / 10));
        setAccounts(accountsData.data.results || accountsData.data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await customerService.updateCustomer(editingId, formData);
      } else {
        await customerService.createCustomer(formData);
      }
      setShowForm(false);
      resetForm();
      const response = await customerService.getAllCustomers({ page: 1 });
      setCustomers(response.data.results || response.data);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleEdit = (customer) => {
    setFormData(customer);
    setEditingId(customer.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr?")) {
      try {
        await customerService.deleteCustomer(id);
        const response = await customerService.getAllCustomers({
          page: currentPage,
        });
        setCustomers(response.data.results || response.data);
      } catch (error) {
        console.error("Erreur:", error);
      }
    }
  };

  const handleViewBalance = async (customer) => {
    try {
      const response = await customerService.getCustomerBalance(customer.id);
      setSelectedCustomer(response.data);
      setShowBalance(true);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      customer_type: "INDIVIDUAL",
      address: "",
      phone: "",
      email: "",
      payment_terms: 0,
      credit_limit: 0,
      account: "",
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
          <h1 className="text-3xl font-bold">Clients</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              resetForm();
            }}
            className="ft-btn ft-btn-md ft-btn-primary"
          >
            {showForm ? "Fermer" : "+ Nouveau Client"}
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
                placeholder="Nom"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="ft-input"
              />
              <select
                value={formData.customer_type}
                onChange={(e) =>
                  setFormData({ ...formData, customer_type: e.target.value })
                }
                className="ft-select"
              >
                <option value="INDIVIDUAL">Particulier</option>
                <option value="CORPORATE">Entreprise</option>
                <option value="INSURANCE">Assurance/Mutuelle</option>
                <option value="GOVERNMENT">Organisme Public</option>
              </select>
              <select
                value={formData.account}
                onChange={(e) =>
                  setFormData({ ...formData, account: e.target.value })
                }
                required
                className="ft-select"
              >
                <option value="">Sélectionner un compte</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} - {a.label}
                  </option>
                ))}
              </select>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="ft-input"
              />
              <input
                type="tel"
                placeholder="Téléphone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="ft-input"
              />
              <textarea
                placeholder="Adresse"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="ft-input col-span-2"
                rows="2"
              ></textarea>
              <input
                type="number"
                placeholder="Délai de paiement (jours)"
                value={formData.payment_terms}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    payment_terms: parseInt(e.target.value),
                  })
                }
                className="ft-input"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Limite de crédit"
                value={formData.credit_limit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    credit_limit: parseFloat(e.target.value),
                  })
                }
                className="ft-input"
              />
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
                <th className="ft-th">Nom</th>
                <th className="ft-th">Type</th>
                <th className="ft-th">Email</th>
                <th className="ft-th">Téléphone</th>
                <th className="ft-th">Statut</th>
                <th className="ft-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="ft-tr">
                  <td className="ft-td font-semibold">{customer.code}</td>
                  <td className="ft-td">{customer.name}</td>
                  <td className="ft-td">{customer.customer_type}</td>
                  <td className="ft-td">{customer.email}</td>
                  <td className="ft-td">{customer.phone}</td>
                  <td className="ft-td">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        customer.is_active
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {customer.is_active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="ft-td flex gap-3">
                    <button
                      onClick={() => handleViewBalance(customer)}
                      className="text-secondary hover:text-primary-end font-semibold text-sm"
                    >
                      Solde
                    </button>
                    <button
                      onClick={() => handleEdit(customer)}
                      className="text-secondary hover:text-primary-end font-semibold text-sm"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
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

        {/* Balance Modal */}
        {showBalance && selectedCustomer && (
          <div className="ft-modal-overlay">
            <div className="ft-modal">
              <div className="ft-modal-header">
                <h2 className="ft-modal-title">Solde du Client</h2>
                <button
                  onClick={() => setShowBalance(false)}
                  className="ft-btn ft-btn-sm ft-btn-outline"
                  type="button"
                >
                  Fermer
                </button>
              </div>
              <div className="ft-modal-body">
                <p className="mb-2">
                <strong>Code:</strong> {selectedCustomer.code}
                </p>
                <p className="mb-4">
                <strong>Nom:</strong> {selectedCustomer.name}
                </p>
                <p className="text-2xl font-bold text-secondary mb-6">
                Solde: {selectedCustomer.balance?.toFixed(2)} FCFA
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomDashboard>
  );
}
