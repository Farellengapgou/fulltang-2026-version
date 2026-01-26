import { useState, useEffect } from "react";
import { X, Send, CreditCard, CheckCircle } from "lucide-react";
import { payrollService } from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";
import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { SuccessModal } from "../../Modals/SuccessModal.jsx";
import { ErrorModal } from "../../Modals/ErrorModal.jsx";
import { ConfirmationModal } from "../../Modals/ConfirmAction.Modal.jsx";

export function Payroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [confirmConfig, setConfirmConfig] = useState({ title: "", message: "", onConfirm: () => {} });

  const [formData, setFormData] = useState({
    payroll_number: "",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    period_start: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
    period_end: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-30`,
    total_gross: 0,
    total_deductions: 0,
    status: "DRAFT",
  });

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const response = await payrollService.getAllPayrolls();
      setPayrolls(response.data.results || response.data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        payroll_period: `${String(formData.month).padStart(2, '0')}/${formData.year}`
      };
      await payrollService.createPayroll(payload);
      setModalMessage("Le dossier de paie a été créé avec succès.");
      setShowForm(false);
      setIsSuccessModalOpen(true);
      resetForm();
      fetchPayrolls();
    } catch (error) {
      console.error("Erreur:", error);
      setModalMessage(error.response?.data ? JSON.stringify(error.response.data) : error.message);
      setIsErrorModalOpen(true);
    }
  };

  const handleApprove = (id) => {
    setConfirmConfig({
      title: "Approuver la Paie",
      message: "Voulez-vous officiellement approuver cette paie ? Cette action est nécessaire avant le paiement.",
      onConfirm: async () => {
        try {
          await payrollService.approvePayroll(id);
          setModalMessage("La paie a été approuvée avec succès.");
          setIsSuccessModalOpen(true);
          fetchPayrolls();
        } catch (error) {
          console.error("Erreur:", error);
          setModalMessage(error.response?.data ? JSON.stringify(error.response.data) : error.message);
          setIsErrorModalOpen(true);
        }
      }
    });
    setIsConfirmModalOpen(true);
  };

  const handlePay = (id) => {
    setConfirmConfig({
      title: "Confirmer Paiement",
      message: "Confirmer le paiement de cette paie ? Cette action enregistrera les sorties de fonds.",
      onConfirm: async () => {
        try {
          await payrollService.payPayroll(id);
          setModalMessage("Le paiement a été enregistré avec succès.");
          setIsSuccessModalOpen(true);
          fetchPayrolls();
        } catch (error) {
          console.error("Erreur:", error);
          setModalMessage(error.response?.data ? JSON.stringify(error.response.data) : error.message);
          setIsErrorModalOpen(true);
        }
      }
    });
    setIsConfirmModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      payroll_number: "",
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      period_start: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
      period_end: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-30`,
      total_gross: 0,
      total_deductions: 0,
      status: "DRAFT",
    });
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
          <h1 className="text-2xl font-bold text-secondary">Gestion de la Paie</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="ft-btn ft-btn-md ft-btn-primary"
          >
            + Nouvelle Paie
          </button>
        </div>

        {/* Modal pour le formulaire */}
        {showForm && (
          <div className="ft-modal-overlay">
            <div className="ft-modal max-w-4xl">
              <div className="ft-modal-header">
                <h2 className="ft-modal-title">Nouveau Dossier de Paie</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="ft-modal-body grid grid-cols-4 gap-4">
                  <div className="col-span-2 space-y-1">
                    <label className="text-sm font-semibold text-gray-700">N° Dossier Paie</label>
                    <input
                      type="text"
                      placeholder="Ex: PAY-2026-001"
                      value={formData.payroll_number}
                      onChange={(e) =>
                        setFormData({ ...formData, payroll_number: e.target.value })
                      }
                      required
                      className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Année</label>
                    <input
                        type="number"
                        value={formData.year}
                        onChange={(e) =>
                            setFormData({ ...formData, year: parseInt(e.target.value) })
                        }
                        required
                        className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Mois</label>
                    <input
                        type="number"
                        min="1"
                        max="12"
                        value={formData.month}
                        onChange={(e) =>
                            setFormData({ ...formData, month: parseInt(e.target.value) })
                        }
                        required
                        className="ft-input"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Début de Période</label>
                    <input
                        type="date"
                        value={formData.period_start}
                        onChange={(e) =>
                            setFormData({ ...formData, period_start: e.target.value })
                        }
                        required
                        className="ft-input"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Fin de Période</label>
                    <input
                        type="date"
                        value={formData.period_end}
                        onChange={(e) =>
                            setFormData({ ...formData, period_end: e.target.value })
                        }
                        required
                        className="ft-input"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Masse Salariale Brute (FCFA)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.total_gross}
                        onChange={(e) =>
                            setFormData({ ...formData, total_gross: parseFloat(e.target.value) })
                        }
                        required
                        className="ft-input font-mono font-bold"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Total Retenues (FCFA)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.total_deductions}
                        onChange={(e) =>
                            setFormData({ ...formData, total_deductions: parseFloat(e.target.value) })
                        }
                        required
                        className="ft-input font-mono font-bold text-red-600"
                    />
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
                    Créer le dossier
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
                <th className="ft-th">Réf.</th>
                <th className="ft-th">Période</th>
                <th className="ft-th text-right">Masse Brute</th>
                <th className="ft-th text-right">Retenues</th>
                <th className="ft-th text-right font-bold">Salaire Net</th>
                <th className="ft-th text-center">Statut</th>
                <th className="ft-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payrolls.map((p) => (
                <tr key={p.id} className="ft-tr">
                  <td className="ft-td">
                    <span className="font-mono text-xs font-bold text-gray-600">{p.payroll_number}</span>
                  </td>
                  <td className="ft-td font-bold text-secondary">{p.payroll_period}</td>
                  <td className="ft-td text-right font-mono text-xs">
                    {(p.total_gross || 0).toLocaleString()}
                  </td>
                  <td className="ft-td text-right font-mono text-xs text-red-500">
                    -{(p.total_deductions || 0).toLocaleString()}
                  </td>
                  <td className="ft-td text-right font-bold font-mono text-emerald-600">
                    {(p.total_net || 0).toLocaleString()} <span className="text-[10px] text-gray-400">FCFA</span>
                  </td>
                  <td className="ft-td text-center">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        p.status === "PAID"
                          ? "bg-green-100 text-green-700"
                          : p.status === "APPROVED"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {p.status === "PAID" ? "Payé" : p.status === "APPROVED" ? "Approuvé" : "Brouillon"}
                    </span>
                  </td>
                  <td className="ft-td text-right">
                    <div className="flex justify-end gap-2">
                        {p.status === "DRAFT" && (
                        <button
                            onClick={() => handleApprove(p.id)}
                            className="flex items-center gap-1 p-1 px-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs font-bold border border-blue-200"
                        >
                            <Send size={12} /> Approuver
                        </button>
                        )}
                        {p.status === "APPROVED" && (
                        <button
                            onClick={() => handlePay(p.id)}
                            className="flex items-center gap-1 p-1 px-3 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors text-xs font-bold border border-emerald-200"
                        >
                            <CreditCard size={12} /> Payer
                        </button>
                        )}
                        {p.status === "PAID" && (
                            <span className="text-gray-400 italic text-xs flex items-center gap-1">
                                Payé <CheckCircle size={14} />
                            </span>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
              {payrolls.length === 0 && (
                <tr>
                  <td colSpan="7" className="ft-td text-center text-gray-500 py-12">
                    Aucun dossier de paie enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

