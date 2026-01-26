import { useState, useEffect } from "react";
import { X, Search, Trash2, Edit } from "lucide-react";
import { chartOfAccountsService } from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";
import Pagination from "../../../GlobalComponents/Pagination";
import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { SuccessModal } from "../../Modals/SuccessModal.jsx";
import { ErrorModal } from "../../Modals/ErrorModal.jsx";
import { ConfirmationModal } from "../../Modals/ConfirmAction.Modal.jsx";

export function ChartOfAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const [formData, setFormData] = useState({
    code: "",
    label: "",
    account_class: "1",
    account_type: "ASSET",
    is_active: true,
  });
  const [codeError, setCodeError] = useState("");

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

  useEffect(() => {
    fetchAccounts();
  }, [currentPage, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that code starts with the account class digit
    if (formData.code && formData.account_class) {
      if (!formData.code.startsWith(formData.account_class)) {
        setCodeError(`Le code doit commencer par ${formData.account_class} pour la classe sélectionnée`);
        return;
      }
    }
    setCodeError("");
    
    try {
      if (editingId) {
        await chartOfAccountsService.updateAccount(editingId, formData);
        setModalMessage("Le compte a été mis à jour avec succès.");
      } else {
        await chartOfAccountsService.createAccount(formData);
        setModalMessage("Le compte a été créé avec succès.");
      }
      setShowForm(false);
      setIsSuccessModalOpen(true);
      setEditingId(null);
      fetchAccounts();
    } catch (error) {
      console.error("Erreur:", error);
      setModalMessage(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : error.message,
      );
      setIsErrorModalOpen(true);
    }
  };

  const handleEdit = (account) => {
    setFormData(account);
    setEditingId(account.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setConfirmConfig({
      title: "Supprimer Compte",
      message:
        "Êtes-vous sûr de vouloir supprimer ce compte ? Cette action peut impacter vos écritures.",
      onConfirm: async () => {
        try {
          await chartOfAccountsService.deleteAccount(id);
          setModalMessage("Le compte a été supprimé avec succès.");
          setIsSuccessModalOpen(true);
          fetchAccounts();
        } catch (error) {
          console.error("Erreur:", error);
          setModalMessage(
            error.response?.data
              ? JSON.stringify(error.response.data)
              : error.message,
          );
          setIsErrorModalOpen(true);
        }
      },
    });
    setIsConfirmModalOpen(true);
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
          <h1 className="text-2xl font-bold text-secondary">Plan Comptable</h1>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({
                code: "",
                label: "",
                account_class: "1",
                account_type: "ASSET",
                is_active: true,
              });
              setShowForm(true);
            }}
            className="ft-btn ft-btn-md ft-btn-primary"
          >
            + Nouveau Compte
          </button>
        </div>

        {/* Search Bar Refined */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Rechercher par code ou libellé..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="ft-input pl-10"
            />
          </div>
        </div>

        {/* Modal pour le formulaire */}
        {showForm && (
          <div className="ft-modal-overlay">
            <div className="ft-modal">
              <div className="ft-modal-header">
                <h2 className="ft-modal-title">
                  {editingId ? "Modifier le Compte" : "Nouveau Compte"}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="ft-modal-body grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Code
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 101000"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      required
                      className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Libellé
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Capital social"
                      value={formData.label}
                      onChange={(e) =>
                        setFormData({ ...formData, label: e.target.value })
                      }
                      required
                      className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Classe de compte
                    </label>
                    <select
                      value={formData.account_class}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          account_class: e.target.value,
                        })
                      }
                      className="ft-select"
                    >
                      <option value="1">1 - Capitaux</option>
                      <option value="2">2 - Immobilisations</option>
                      <option value="3">3 - Stocks</option>
                      <option value="4">4 - Tiers</option>
                      <option value="5">5 - Trésorerie</option>
                      <option value="6">6 - Charges</option>
                      <option value="7">7 - Produits</option>
                      <option value="8">8 - Spéciaux</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Type de compte
                    </label>
                    <select
                      value={formData.account_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          account_type: e.target.value,
                        })
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

                  {codeError && (
                    <div className="col-span-2 bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-600 font-medium flex items-center gap-2">
                        <AlertCircle size={16} />
                        {codeError}
                      </p>
                    </div>
                  )}
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
                    {editingId ? "Mettre à jour" : "Créer le compte"}
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
                <th className="ft-th">Code</th>
                <th className="ft-th">Libellé</th>
                <th className="ft-th text-center">Classe</th>
                <th className="ft-th text-center">Type</th>
                <th className="ft-th text-center">Statut</th>
                <th className="ft-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {accounts.map((account) => (
                <tr key={account.id} className="ft-tr">
                  <td className="ft-td font-bold text-secondary uppercase tracking-tight">
                    {account.code}
                  </td>
                  <td className="ft-td font-medium">{account.label}</td>
                  <td className="ft-td text-center">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-mono">
                      {account.account_class}
                    </span>
                  </td>
                  <td className="ft-td text-center">
                    <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                      {account.account_type === 'ASSET' && 'Actif'}
                      {account.account_type === 'LIABILITY' && 'Passif'}
                      {account.account_type === 'EQUITY' && 'Capitaux'}
                      {account.account_type === 'REVENUE' && 'Produit'}
                      {account.account_type === 'EXPENSE' && 'Charge'}
                    </span>
                  </td>
                  <td className="ft-td text-center">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        account.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {account.is_active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="ft-td text-right">
                    <div className="flex justify-end gap-3 transition-opacity">
                      <button
                        onClick={() => handleEdit(account)}
                        className="text-secondary hover:text-primary-end font-semibold text-xs"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="text-red-600 hover:text-red-800 font-semibold text-xs"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="ft-td text-center text-gray-500 py-12"
                  >
                    Aucun compte trouvé.
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
