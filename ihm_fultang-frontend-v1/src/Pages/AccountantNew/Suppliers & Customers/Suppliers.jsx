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
      console.error("Erreur:", error);
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
        setModalMessage("Fournisseur mis à jour avec succès.");
      } else {
        await supplierService.createSupplier(formData);
        setModalMessage("Nouveau fournisseur créé avec succès.");
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

  const handleEdit = (supplier) => {
    setFormData(supplier);
    setEditingId(supplier.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setConfirmConfig({
      title: "Supprimer Fournisseur",
      message: "Êtes-vous sûr de vouloir supprimer ce fournisseur ? Cette action est irréversible.",
      onConfirm: async () => {
        try {
          await supplierService.deleteSupplier(id);
          setModalMessage("Le fournisseur a été supprimé.");
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

  const handleViewBalance = async (supplier) => {
    try {
      const response = await supplierService.getSupplierBalance(supplier.id);
      setSelectedSupplier(response.data);
      setShowBalance(true);
    } catch (error) {
      console.error("Erreur:", error);
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
          <h1 className="text-3xl font-black text-secondary tracking-tight uppercase">Base Fournisseurs</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="ft-btn ft-btn-md ft-btn-primary"
          >
            <Plus size={20} /> Nouveau Fournisseur
          </button>
        </div>

        {/* Search Bar - Stylisé */}
        <div className="flex justify-end mb-8">
            <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Rechercher par nom ou code..."
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
                <h2 className="ft-modal-title">{editingId ? "Modifier Fournisseur" : "Nouveau Fournisseur"}</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={28} />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="ft-modal-body grid grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Code Fournisseur</label>
                    <input
                        type="text"
                        placeholder="Ex: FRN-001"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        required
                        className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Raison Sociale</label>
                    <input
                        type="text"
                        placeholder="Nom de l'entreprise"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Catégorie</label>
                    <select
                        value={formData.supplier_type}
                        onChange={(e) => setFormData({ ...formData, supplier_type: e.target.value })}
                        className="ft-select"
                    >
                        <option value="PHARMA">Laboratoire pharmaceutique</option>
                        <option value="EQUIPMENT">Équipementier médical</option>
                        <option value="SERVICE">Prestataire de service</option>
                        <option value="SUPPLIER">Fournisseur général</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Compte Comptable Liaison</label>
                    <select
                        value={formData.account}
                        onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                        required
                        className="ft-select"
                    >
                        <option value="">Sélectionner un compte (Classe 4)</option>
                        {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                            {a.code} - {a.label}
                        </option>
                        ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Email de contact</label>
                    <input
                        type="email"
                        placeholder="fournisseur@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Téléphone</label>
                    <PhoneInput
                      value={formData.phone}
                      onChange={(value) => setFormData({ ...formData, phone: value })}
                      required={false}
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Adresse Complète</label>
                    <textarea
                        placeholder="Localisation géographique"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="ft-input"
                        rows="2"
                    ></textarea>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Délai de paiement (jours)</label>
                    <input
                        type="number"
                        value={formData.payment_terms}
                        onChange={(e) => setFormData({ ...formData, payment_terms: parseInt(e.target.value) })}
                        className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Limite de crédit (FCFA)</label>
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
                    Annuler
                  </button>
                  <button type="submit" className="ft-btn ft-btn-md ft-btn-primary">
                    {editingId ? "Enregistrer les modifications" : "Créer le fournisseur"}
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
                <th className="ft-th">Fiche Fournisseur</th>
                <th className="ft-th">Catégorie</th>
                <th className="ft-th">Coordonnées</th>
                <th className="ft-th text-center">Statut</th>
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
                            <Mail size={12} /> {s.email || "Non défini"}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Phone size={12} /> {s.phone || "Non défini"}
                        </div>
                    </div>
                  </td>
                  <td className="ft-td text-center">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full flex items-center justify-center gap-1 mx-auto w-fit ${
                        s.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                        {s.is_active ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                        {s.is_active ? "ACTIF" : "INACTIF"}
                    </span>
                  </td>
                  <td className="ft-td text-right">
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => handleViewBalance(s)}
                            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors shadow-sm"
                            title="Consulter le solde"
                        >
                            <Banknote size={16} />
                        </button>
                        <button
                            onClick={() => handleEdit(s)}
                            className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl transition-colors shadow-sm"
                            title="Modifier"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            onClick={() => handleDelete(s.id)}
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors shadow-sm"
                            title="Supprimer"
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
                        Aucun fournisseur enregistré pour le moment.
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
                <h2 className="ft-modal-title">ÉTAT DU COMPTE</h2>
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
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Solde actuel à payer</p>
                    <p className="text-5xl font-black text-secondary tracking-tighter">
                        {(selectedSupplier.balance || 0).toLocaleString()} <span className="text-xl font-bold opacity-50">FCFA</span>
                    </p>
                </div>
              </div>
              <div className="ft-modal-footer">
                <button onClick={() => setShowBalance(false)} className="ft-btn ft-btn-md ft-btn-primary w-full">
                    Fermer l'aperçu
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
