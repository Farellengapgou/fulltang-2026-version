import { useState, useEffect } from "react";
import {
  X,
  Plus,
  CheckCircle,
  AlertCircle,
  Calendar,
  Landmark,
  CreditCard,
  Banknote,
  History,
  ArrowRight,
} from "lucide-react";
import {
  bankReconciliationService,
  bankAccountService,
} from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";

import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { SuccessModal } from "../../Modals/SuccessModal.jsx";
import { ErrorModal } from "../../Modals/ErrorModal.jsx";
import { ConfirmationModal } from "../../Modals/ConfirmAction.Modal.jsx";

export function BankReconciliation() {
  const [reconciliations, setReconciliations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);

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
    bank_account: "",
    reconciliation_date: new Date().toISOString().split("T")[0],
    statement_balance: 0,
    book_balance: 0,
    variance: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reconcData, bankData] = await Promise.all([
        bankReconciliationService.getAllReconciliations(),
        bankAccountService.getAllBankAccounts(),
      ]);
      setReconciliations(reconcData.data.results || reconcData.data);
      setBankAccounts(bankData.data.results || bankData.data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await bankReconciliationService.createReconciliation(formData);
      setShowForm(false);
      setModalMessage("La demande de réconciliation a été créée avec succès.");
      setIsSuccessModalOpen(true);
      setFormData({
        bank_account: "",
        reconciliation_date: new Date().toISOString().split("T")[0],
        statement_balance: 0,
        book_balance: 0,
        variance: 0,
      });
      fetchData();
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

  const handleReconcile = (id) => {
    setConfirmConfig({
      title: "Finaliser la Réconciliation",
      message:
        "Voulez-vous finaliser cette réconciliation ? Cette action est irréversible et validera le solde bancaire.",
      onConfirm: async () => {
        try {
          await bankReconciliationService.reconcileBank(id);
          setModalMessage("Réconciliation finalisée avec succès.");
          setIsSuccessModalOpen(true);
          fetchData();
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
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-secondary tracking-tight uppercase">
              Réconciliation Bancaire
            </h1>
            <p className="text-gray-400 text-sm font-medium mt-1 uppercase tracking-widest">
              Ajustement des soldes banque et comptabilité
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="ft-btn ft-btn-md ft-btn-primary"
          >
            <Plus size={20} /> Nouvelle Opération
          </button>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="ft-modal-overlay">
            <div className="ft-modal max-w-2xl">
              <div className="ft-modal-header">
                <h2 className="ft-modal-title">Nouvelle Réconciliation</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={28} />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="ft-modal-body grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">
                      Compte Bancaire
                    </label>
                    <div className="relative">
                      <Landmark
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <select
                        value={formData.bank_account}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bank_account: e.target.value,
                          })
                        }
                        required
                        className="ft-select pl-12"
                      >
                        <option value="">Sélectionner un compte</option>
                        {bankAccounts.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.bank_name} - {b.account_number}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">
                      Date d'arrêté
                    </label>
                    <div className="relative">
                      <Calendar
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="date"
                        value={formData.reconciliation_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            reconciliation_date: e.target.value,
                          })
                        }
                        required
                        className="ft-input pl-12"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">
                      Solde Relevé Bancaire (FCFA)
                    </label>
                    <div className="relative">
                      <CreditCard
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.statement_balance}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            statement_balance: parseFloat(e.target.value),
                          })
                        }
                        required
                        className="ft-input pl-12 font-mono font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">
                      Solde Comptable (FCFA)
                    </label>
                    <div className="relative">
                      <Banknote
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.book_balance}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            book_balance: parseFloat(e.target.value),
                          })
                        }
                        required
                        className="ft-input pl-12 font-mono font-bold"
                      />
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
                    Lancer la Réconciliation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 p-6">
          <table className="ft-table">
            <thead className="ft-thead">
              <tr>
                <th className="ft-th">Information Compte</th>
                <th className="ft-th">Date Arrêté</th>
                <th className="ft-th text-right">Solde Banque</th>
                <th className="ft-th text-right">Solde Livre</th>
                <th className="ft-th text-right">Écart</th>
                <th className="ft-th text-center">Statut</th>
                <th className="ft-th text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {reconciliations.map((r) => (
                <tr key={r.id} className="ft-tr">
                  <td className="ft-td">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-secondary/10 text-secondary rounded-2xl">
                        <Landmark size={20} />
                      </div>
                      <div className="font-black text-secondary leading-tight uppercase tracking-tight">
                        {r.bank_account_name}
                      </div>
                    </div>
                  </td>
                  <td className="ft-td">
                    <div className="flex items-center gap-2 text-gray-500 font-medium">
                      <Calendar size={14} />
                      {new Date(r.reconciliation_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="ft-td text-right font-mono font-black text-gray-600">
                    {(r.variance || 0).toLocaleString()}
                  </td>
                  <td className="ft-td text-right font-mono font-black text-gray-600">
                    {r.book_balance.toLocaleString()}
                  </td>
                  <td
                    className={`ft-td text-right font-mono font-black ${
                      Math.abs(r.variance) < 0.01
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {r.variance.toLocaleString()}
                  </td>
                  <td className="ft-td text-center">
                    <span
                      className={`text-[10px] font-black px-3 py-1 rounded-full flex items-center justify-center gap-1 mx-auto w-fit ${
                        r.is_reconciled
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {r.is_reconciled ? (
                        <CheckCircle size={10} />
                      ) : (
                        <History size={10} />
                      )}
                      {r.is_reconciled ? "RÉCONCILIÉ" : "EN ATTENTE"}
                    </span>
                  </td>
                  <td className="ft-td text-right">
                    {!r.is_reconciled && (
                      <button
                        onClick={() => handleReconcile(r.id)}
                        className="ft-btn ft-btn-sm ft-btn-primary flex items-center gap-2 ml-auto"
                      >
                        Finaliser <ArrowRight size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {reconciliations.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="ft-td text-center text-gray-400 py-20 font-medium italic uppercase tracking-widest"
                  >
                    Aucune réconciliation enregistrée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
      </div>
    </CustomDashboard>
  );
}
