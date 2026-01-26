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
      console.error("Error:", error);
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
        setCodeError(`The code must start with ${formData.account_class} for the selected class`);
        return;
      }
    }
    setCodeError("");
    
    try {
      if (editingId) {
        await chartOfAccountsService.updateAccount(editingId, formData);
        setModalMessage("The account was updated successfully.");
      } else {
        await chartOfAccountsService.createAccount(formData);
        setModalMessage("The account was created successfully.");
      }
      setShowForm(false);
      setIsSuccessModalOpen(true);
      setEditingId(null);
      fetchAccounts();
    } catch (error) {
      console.error("Error:", error);
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
      title: "Delete Account",
      message:
        "Are you sure you want to delete this account? This action may affect your entries.",
      onConfirm: async () => {
        try {
          await chartOfAccountsService.deleteAccount(id);
          setModalMessage("The account was deleted successfully.");
          setIsSuccessModalOpen(true);
          fetchAccounts();
        } catch (error) {
          console.error("Error:", error);
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
          <h1 className="text-2xl font-bold text-secondary">Chart of Accounts</h1>
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
            + New Account
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
              placeholder="Search by code or label..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="ft-input pl-10"
            />
          </div>
        </div>

        {/* Form modal */}
        {showForm && (
          <div className="ft-modal-overlay">
            <div className="ft-modal">
              <div className="ft-modal-header">
                <h2 className="ft-modal-title">
                  {editingId ? "Edit Account" : "New Account"}
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
                      placeholder="e.g. 101000"
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
                      Label
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Share capital"
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
                      Account Class
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
                      <option value="1">1 - Equity</option>
                      <option value="2">2 - Fixed Assets</option>
                      <option value="3">3 - Inventory</option>
                      <option value="4">4 - Third Parties</option>
                      <option value="5">5 - Cash</option>
                      <option value="6">6 - Expenses</option>
                      <option value="7">7 - Revenue</option>
                      <option value="8">8 - Special</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Account Type
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
                      <option value="ASSET">Asset</option>
                      <option value="LIABILITY">Liability</option>
                      <option value="EQUITY">Equity</option>
                      <option value="REVENUE">Revenue</option>
                      <option value="EXPENSE">Expense</option>
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
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="ft-btn ft-btn-md ft-btn-primary"
                  >
                    {editingId ? "Update" : "Create Account"}
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
                <th className="ft-th">Label</th>
                <th className="ft-th text-center">Class</th>
                <th className="ft-th text-center">Type</th>
                <th className="ft-th text-center">Status</th>
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
                      {account.account_type === 'ASSET' && 'Asset'}
                      {account.account_type === 'LIABILITY' && 'Liability'}
                      {account.account_type === 'EQUITY' && 'Equity'}
                      {account.account_type === 'REVENUE' && 'Revenue'}
                      {account.account_type === 'EXPENSE' && 'Expense'}
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
                      {account.is_active ? "Active" : "Inactive"}
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
                    No accounts found.
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
