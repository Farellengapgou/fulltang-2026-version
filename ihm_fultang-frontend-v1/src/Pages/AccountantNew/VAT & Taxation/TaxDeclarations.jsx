import { useState, useEffect } from "react";
import { X, Send, CreditCard, CheckCircle } from "lucide-react";
import { taxService } from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";
import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { SuccessModal } from "../../Modals/SuccessModal.jsx";
import { ErrorModal } from "../../Modals/ErrorModal.jsx";
import { ConfirmationModal } from "../../Modals/ConfirmAction.Modal.jsx";

export function TaxDeclarations() {
  const [declarations, setDeclarations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [confirmConfig, setConfirmConfig] = useState({ title: "", message: "", onConfirm: () => {} });

  const [formData, setFormData] = useState({
    declaration_type: "VAT_MONTHLY",
    period_year: new Date().getFullYear(),
    period_month: new Date().getMonth() + 1,
    period_quarter: 1,
    tax_base: 0,
    tax_amount: 0,
    due_date: new Date().toISOString().split("T")[0],
    status: "DRAFT",
  });

  const fetchDeclarations = async () => {
    try {
      setLoading(true);
      const response = await taxService.getAllTaxDeclarations();
      setDeclarations(response.data.results || response.data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeclarations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await taxService.createTaxDeclaration(formData);
      setModalMessage("La déclaration fiscale a été créé avec succès.");
      setShowForm(false);
      setIsSuccessModalOpen(true);
      resetForm();
      fetchDeclarations();
    } catch (error) {
      console.error("Erreur:", error);
      setModalMessage(error.response?.data ? JSON.stringify(error.response.data) : error.message);
      setIsErrorModalOpen(true);
    }
  };

  const handleSubmitDeclaration = (id) => {
    setConfirmConfig({
      title: "Soumission Fiscale",
      message: "Soumettre cette déclaration aux autorités fiscales ? Cette action est irréversible.",
      onConfirm: async () => {
        try {
          await taxService.submitTaxDeclaration(id);
          setModalMessage("La déclaration a été soumise avec succès.");
          setIsSuccessModalOpen(true);
          fetchDeclarations();
        } catch (error) {
          console.error("Erreur:", error);
          setModalMessage(error.response?.data ? JSON.stringify(error.response.data) : error.message);
          setIsErrorModalOpen(true);
        }
      }
    });
    setIsConfirmModalOpen(true);
  };

  const handlePayDeclaration = (id) => {
    setConfirmConfig({
      title: "Paiement Taxe",
      message: "Marquer cette déclaration comme payée ? Assurez-vous que le règlement a bien été effectué.",
      onConfirm: async () => {
        try {
          await taxService.payTaxDeclaration(id);
          setModalMessage("La déclaration a été marquée comme payée.");
          setIsSuccessModalOpen(true);
          fetchDeclarations();
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
      declaration_type: "VAT_MONTHLY",
      period_year: new Date().getFullYear(),
      period_month: new Date().getMonth() + 1,
      period_quarter: 1,
      tax_base: 0,
      tax_amount: 0,
      due_date: new Date().toISOString().split("T")[0],
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
          <h1 className="text-2xl font-bold text-secondary">Déclarations Fiscales</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="ft-btn ft-btn-md ft-btn-primary"
          >
            + Nouvelle Déclaration
          </button>
        </div>

        {/* Modal pour le formulaire */}
        {showForm && (
          <div className="ft-modal-overlay">
            <div className="ft-modal max-w-4xl">
              <div className="ft-modal-header">
                <h2 className="ft-modal-title">Nouvelle Déclaration Fiscale</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="ft-modal-body grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Type de Déclaration</label>
                    <select
                      value={formData.declaration_type}
                      onChange={(e) =>
                        setFormData({ ...formData, declaration_type: e.target.value })
                      }
                      className="ft-select"
                    >
                      <option value="VAT_MONTHLY">TVA Mensuelle</option>
                      <option value="VAT_QUARTERLY">TVA Trimestrielle</option>
                      <option value="INCOME_TAX">Impôt sur Bénéfices</option>
                      <option value="PAYROLL_TAX">Charges Sociales</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Année fiscale</label>
                    <input
                      type="number"
                      placeholder="Ex: 2026"
                      value={formData.period_year}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          period_year: parseInt(e.target.value),
                        })
                      }
                      required
                      className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      {formData.declaration_type === "VAT_QUARTERLY" ? "Trimestre" : "Mois"}
                    </label>
                    {formData.declaration_type === "VAT_QUARTERLY" ? (
                      <select
                        value={formData.period_quarter}
                        onChange={(e) => setFormData({...formData, period_quarter: parseInt(e.target.value)})}
                        className="ft-select"
                      >
                        <option value={1}>T1 (Jan-Mar)</option>
                        <option value={2}>T2 (Avr-Juin)</option>
                        <option value={3}>T3 (Juil-Sept)</option>
                        <option value={4}>T4 (Oct-Déc)</option>
                      </select>
                    ) : (
                      <input
                        type="number"
                        min="1"
                        max="12"
                        placeholder="Mois (1-12)"
                        value={formData.period_month}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            period_month: parseInt(e.target.value),
                          })
                        }
                        required
                        className="ft-input"
                      />
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Base Imposable (FCFA)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.tax_base}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tax_base: parseFloat(e.target.value),
                        })
                      }
                      required
                      className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Montant de Taxe (FCFA)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.tax_amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tax_amount: parseFloat(e.target.value),
                        })
                      }
                      required
                      className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Date d'échéance</label>
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) =>
                        setFormData({ ...formData, due_date: e.target.value })
                      }
                      required
                      className="ft-input"
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
                    Enregistrer la déclaration
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
                <th className="ft-th">Type</th>
                <th className="ft-th text-center">Période</th>
                <th className="ft-th text-right">Base Imposable</th>
                <th className="ft-th text-right">Montant Taxe</th>
                <th className="ft-th text-center">Statut</th>
                <th className="ft-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {declarations.map((d) => (
                <tr key={d.id} className="ft-tr">
                  <td className="ft-td">
                    <div className="font-bold text-secondary text-xs uppercase tracking-tight">
                        {d.declaration_type.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="ft-td text-center font-medium">
                    {d.declaration_type === "VAT_QUARTERLY" 
                      ? `T${d.period_quarter} ${d.period_year}` 
                      : `${d.period_month.toString().padStart(2, '0')}/${d.period_year}`}
                  </td>
                  <td className="ft-td text-right font-mono text-gray-600">
                    {(d.tax_base || 0).toLocaleString()}
                  </td>
                  <td className="ft-td text-right font-bold font-mono text-secondary">
                    {(d.tax_amount || 0).toLocaleString()} <span className="text-[10px] text-gray-400">FCFA</span>
                  </td>
                  <td className="ft-td text-center">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        d.status === "PAID"
                          ? "bg-green-100 text-green-700"
                          : d.status === "SUBMITTED"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {d.status === "PAID" ? "Payé" : d.status === "SUBMITTED" ? "Soumis" : "Brouillon"}
                    </span>
                  </td>
                  <td className="ft-td text-right">
                    <div className="flex justify-end gap-2">
                        {d.status === "DRAFT" && (
                        <button
                            onClick={() => handleSubmitDeclaration(d.id)}
                            className="flex items-center gap-1 p-1 px-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs font-bold border border-blue-200"
                        >
                            <Send size={12} /> Soumettre
                        </button>
                        )}
                        {d.status === "SUBMITTED" && (
                        <button
                            onClick={() => handlePayDeclaration(d.id)}
                            className="flex items-center gap-1 p-1 px-3 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors text-xs font-bold border border-emerald-200"
                        >
                            <CreditCard size={12} /> Payer
                        </button>
                        )}
                        {d.status === "PAID" && (
                            <span className="text-gray-400 italic text-xs flex items-center gap-1">
                                Validé <CheckCircle size={14} />
                            </span>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
              {declarations.length === 0 && (
                <tr>
                  <td colSpan="6" className="ft-td text-center text-gray-500 py-12">
                    Aucune déclaration fiscale enregistrée.
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
