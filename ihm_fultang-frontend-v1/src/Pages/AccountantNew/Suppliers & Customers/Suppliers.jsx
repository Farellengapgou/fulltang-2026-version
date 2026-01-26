import { useState, useEffect } from "react";
import { X, Search, Plus, Edit, Trash2, Home, Phone, Mail, CreditCard, Banknote, CheckCircle, AlertCircle } from "lucide-react";
import {
  supplierService,
  chartOfAccountsService,
} from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";
import Pagination from "../../../GlobalComponents/Pagination";

import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { SuccessModal } from "../../Modals/SuccessModal.jsx";
import { ErrorModal } from "../../Modals/ErrorModal.jsx";
import { ConfirmationModal } from "../../Modals/ConfirmAction.Modal.jsx";
import { PhoneInput } from "../../../GlobalComponents/PhoneInput.jsx";

export function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [accounts, setAccounts] = useState([]);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [confirmConfig, setConfirmConfig] = useState({ title: "", message: "", onConfirm: () => {} });

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    supplier_type: "SUPPLIER",
    address: "",
    phone: "",
    email: "",
    payment_terms: 30,
    credit_limit: 0,
    discount_rate: 0,
    account: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showBalance, setShowBalance] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [suppliersData, accountsData] = await Promise.all([
        supplierService.getAllSuppliers({
          page: currentPage,
          search: searchTerm,
        }),
        chartOfAccountsService.getAllAccounts(),
      ]);

      setSuppliers(suppliersData.data.results || suppliersData.data);
      setTotalPages(Math.ceil((suppliersData.data.count || 0) / 10));
      // Filter accounts to show only class 4 (Tiers)
      const allAccounts = accountsData.data.results || accountsData.data;
      const class4Accounts = allAccounts.filter(acc => acc.account_class === '4');
      setAccounts(class4Accounts);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await supplierService.updateSupplier(editingId, formData);
        setModalMessage("Supplier updated successfully.");
      } else {
        await supplierService.createSupplier(formData);
        setModalMessage("New supplier created successfully.");
      }
      setShowForm(false);
      setIsSuccessModalOpen(true);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error:", error);
      setModalMessage(error.response?.data ? JSON.stringify(error.response.data) : error.message);
      setIsErrorModalOpen(true);
    }
  };

  const handleEdit = (supplier) => {
    setFormData(supplier);
    setEditingId(supplier.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setConfirmConfig({
      title: "Delete Supplier",
      message: "Are you sure you want to delete this supplier? This action is irreversible.",
      onConfirm: async () => {
        try {
          await supplierService.deleteSupplier(id);
          setModalMessage("The supplier was deleted.");
          setIsSuccessModalOpen(true);
          fetchData();
        } catch (error) {
          console.error("Error:", error);
          setModalMessage(error.response?.data ? JSON.stringify(error.response.data) : error.message);
          setIsErrorModalOpen(true);
        }
      }
    });
    setIsConfirmModalOpen(true);
  };

  const handleViewBalance = async (supplier) => {
    try {
      const response = await supplierService.getSupplierBalance(supplier.id);
      setSelectedSupplier(response.data);
      setShowBalance(true);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      supplier_type: "SUPPLIER",
      address: "",
      phone: "",
      email: "",
      payment_terms: 30,
      credit_limit: 0,
      discount_rate: 0,
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-secondary tracking-tight uppercase">Supplier Directory</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="ft-btn ft-btn-md ft-btn-primary"
          >
            <Plus size={20} /> New Supplier
          </button>
        </div>

        {/* Search Bar - Styled */}
        <div className="flex justify-end mb-8">
            <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by name or code..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="ft-input pl-12"
                />
            </div>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="ft-modal-overlay">
            <div className="ft-modal max-w-3xl">
              <div className="ft-modal-header">
                <h2 className="ft-modal-title">{editingId ? "Edit Supplier" : "New Supplier"}</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={28} />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="ft-modal-body grid grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Supplier Code</label>
                    <input
                        type="text"
                        placeholder="e.g. SUP-001"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        required
                        className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Company Name</label>
                    <input
                        type="text"
                        placeholder="Company name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Category</label>
                    <select
                        value={formData.supplier_type}
                        onChange={(e) => setFormData({ ...formData, supplier_type: e.target.value })}
                        className="ft-select"
                    >
                        <option value="PHARMA">Pharmaceutical Lab</option>
                        <option value="EQUIPMENT">Medical Equipment Supplier</option>
                        <option value="SERVICE">Service Provider</option>
                        <option value="SUPPLIER">General Supplier</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Ledger Link Account</label>
                    <select
                        value={formData.account}
                        onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                        required
                        className="ft-select"
                    >
                        <option value="">Select an account (Class 4)</option>
                        {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                            {a.code} - {a.label}
                        </option>
                        ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Contact Email</label>
                    <input
                        type="email"
                        placeholder="supplier@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Phone</label>
                    <PhoneInput
                      value={formData.phone}
                      onChange={(value) => setFormData({ ...formData, phone: value })}
                      required={false}
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Full Address</label>
                    <textarea
                        placeholder="Location"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="ft-input"
                        rows="2"
                    ></textarea>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Payment terms (days)</label>
                    <input
                        type="number"
                        value={formData.payment_terms}
                        onChange={(e) => setFormData({ ...formData, payment_terms: parseInt(e.target.value) })}
                        className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Credit limit (FCFA)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.credit_limit}
                        onChange={(e) => setFormData({ ...formData, credit_limit: parseFloat(e.target.value) })}
                        className="ft-input font-mono font-bold"
                    />
                  </div>
                </div>
                <div className="ft-modal-footer">
                  <button type="button" onClick={() => setShowForm(false)} className="ft-btn ft-btn-md ft-btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="ft-btn ft-btn-md ft-btn-primary">
                    {editingId ? "Save changes" : "Create supplier"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 p-6">
          <table className="ft-table">
            <thead className="ft-thead">
              <tr>
                <th className="ft-th">Supplier Record</th>
                <th className="ft-th">Category</th>
                <th className="ft-th">Contact</th>
                <th className="ft-th text-center">Status</th>
                <th className="ft-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className="ft-tr">
                  <td className="ft-td">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-secondary/10 text-secondary rounded-2xl">
                            <Home size={22} />
                        </div>
                        <div>
                            <div className="font-black text-secondary leading-tight">{s.name}</div>
                            <div className="text-xs font-mono text-gray-400 mt-1 uppercase tracking-widest">{s.code}</div>
                        </div>
                    </div>
                  </td>
                  <td className="ft-td">
                    <span className="text-[10px] font-black px-3 py-1 bg-gray-200 text-gray-600 rounded-lg uppercase tracking-wider">
                        {s.supplier_type}
                    </span>
                  </td>
                  <td className="ft-td">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Mail size={12} /> {s.email || "Not provided"}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Phone size={12} /> {s.phone || "Not provided"}
                        </div>
                    </div>
                  </td>
                  <td className="ft-td text-center">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full flex items-center justify-center gap-1 mx-auto w-fit ${
                        s.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                        {s.is_active ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                        {s.is_active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="ft-td text-right">
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => handleViewBalance(s)}
                            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors shadow-sm"
                            title="View balance"
                        >
                            <Banknote size={16} />
                        </button>
                        <button
                            onClick={() => handleEdit(s)}
                            className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl transition-colors shadow-sm"
                            title="Edit"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            onClick={() => handleDelete(s.id)}
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors shadow-sm"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr>
                    <td colSpan="5" className="ft-td text-center text-gray-400 py-20 font-medium italic">
                        No suppliers recorded yet.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-center">
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>

        {/* Balance Modal */}
        {showBalance && selectedSupplier && (
          <div className="ft-modal-overlay">
            <div className="ft-modal">
              <div className="ft-modal-header">
                <h2 className="ft-modal-title">ACCOUNT STATUS</h2>
                <button onClick={() => setShowBalance(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={28} />
                </button>
              </div>
              <div className="ft-modal-body text-center py-10">
                <div className="inline-p-6 bg-secondary/10 text-secondary rounded-[2rem] p-6 mb-6">
                    <CreditCard size={48} className="mx-auto" />
                </div>
                <h3 className="text-xl font-black text-gray-800 mb-2">{selectedSupplier.name}</h3>
                <p className="text-sm font-mono text-gray-400 mb-8 tracking-widest uppercase">{selectedSupplier.code}</p>
                
                <div className="bg-gray-50 rounded-3xl p-8 border-2 border-dashed border-gray-200">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Current balance due</p>
                    <p className="text-5xl font-black text-secondary tracking-tighter">
                        {(selectedSupplier.balance || 0).toLocaleString()} <span className="text-xl font-bold opacity-50">FCFA</span>
                    </p>
                </div>
              </div>
              <div className="ft-modal-footer">
                <button onClick={() => setShowBalance(false)} className="ft-btn ft-btn-md ft-btn-primary w-full">
                    Close overview
                </button>
              </div>
            </div>
          </div>
        )}

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
      </div>
    </CustomDashboard>
  );
}
