import { useState, useEffect } from "react";
import { X, CheckCircle } from "lucide-react";
import { vatService } from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";
import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { SuccessModal } from "../../Modals/SuccessModal.jsx";
import { ErrorModal } from "../../Modals/ErrorModal.jsx";
import { ConfirmationModal } from "../../Modals/ConfirmAction.Modal.jsx";

export function VAT() {
  const [vats, setVats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [confirmConfig, setConfirmConfig] = useState({ title: "", message: "", onConfirm: () => {} });

  const [formData, setFormData] = useState({
    vat_number: "",
    period_year: new Date().getFullYear(),
    period_month: new Date().getMonth() + 1,
    vat_type: "COLLECTED",
    amount: 0,
    status: "PENDING",
  });

  const fetchVATs = async () => {
    try {
      setLoading(true);
      const response = await vatService.getAllVAT();
      setVats(response.data.results || response.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVATs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await vatService.createVAT(formData);
      setModalMessage("The VAT declaration was recorded successfully.");
      setShowForm(false);
      setIsSuccessModalOpen(true);
      resetForm();
      fetchVATs();
    } catch (error) {
      console.error("Error:", error);
      setModalMessage(error.response?.data ? JSON.stringify(error.response.data) : error.message);
      setIsErrorModalOpen(true);
    }
  };

  const handleDeclare = (id) => {
    setConfirmConfig({
      title: "Confirm Declaration",
      message: "Confirm declaring this VAT? This action will validate the amounts for the period.",
      onConfirm: async () => {
        try {
          await vatService.declareVAT(id);
          setModalMessage("The VAT was declared successfully.");
          setIsSuccessModalOpen(true);
          fetchVATs();
        } catch (error) {
          console.error("Error:", error);
          setModalMessage(error.response?.data ? JSON.stringify(error.response.data) : error.message);
          setIsErrorModalOpen(true);
        }
      }
    });
    setIsConfirmModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      vat_number: "",
      period_year: new Date().getFullYear(),
      period_month: new Date().getMonth() + 1,
      vat_type: "COLLECTED",
      amount: 0,
      status: "PENDING",
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
          <h1 className="text-2xl font-bold text-secondary">VAT Management</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="ft-btn ft-btn-md ft-btn-primary"
          >
            + New Declaration
          </button>
        </div>

        {/* Form modal */}
        {showForm && (
          <div className="ft-modal-overlay">
            <div className="ft-modal max-w-2xl">
              <div className="ft-modal-header">
                <h2 className="ft-modal-title">New VAT Declaration</h2>
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
                    <label className="text-sm font-semibold text-gray-700">VAT No. / Reference</label>
                    <input
                      type="text"
                      placeholder="e.g. VAT-2026-001"
                      value={formData.vat_number}
                      onChange={(e) =>
                        setFormData({ ...formData, vat_number: e.target.value })
                      }
                      required
                      className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">VAT Type</label>
                    <select
                      value={formData.vat_type}
                      onChange={(e) =>
                        setFormData({ ...formData, vat_type: e.target.value })
                      }
                      className="ft-select"
                    >
                      <option value="COLLECTED">Collected VAT</option>
                      <option value="DEDUCTIBLE">Deductible VAT</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Fiscal year</label>
                    <input
                      type="number"
                      value={formData.period_year}
                      onChange={(e) =>
                        setFormData({ ...formData, period_year: parseInt(e.target.value) })
                      }
                      required
                      className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Mois (1-12)</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.period_month}
                      onChange={(e) =>
                        setFormData({ ...formData, period_month: parseInt(e.target.value) })
                      }
                      required
                      className="ft-input"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Total amount (FCFA)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          amount: parseFloat(e.target.value),
                        })
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
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="ft-btn ft-btn-md ft-btn-primary"
                  >
                    Save
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
                <th className="ft-th">VAT No.</th>
                <th className="ft-th">Period</th>
                <th className="ft-th">Type</th>
                <th className="ft-th text-right">Montant</th>
                <th className="ft-th text-center">Status</th>
                <th className="ft-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vats.map((vat) => (
                <tr key={vat.id} className="ft-tr">
                  <td className="ft-td font-bold text-secondary uppercase tracking-tighter text-xs">{vat.vat_number}</td>
                  <td className="ft-td font-medium">
                    {vat.period_month.toString().padStart(2, '0')}/{vat.period_year}
                  </td>
                  <td className="ft-td">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        vat.vat_type === "COLLECTED" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                    }`}>
                        {vat.vat_type === "COLLECTED" ? "Collected" : "Deductible"}
                    </span>
                  </td>
                  <td className="ft-td text-right font-mono font-bold text-gray-700">
                    {(vat.amount || 0).toLocaleString()} <span className="text-[10px] text-gray-400">FCFA</span>
                  </td>
                  <td className="ft-td text-center">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        vat.status === "DECLARED"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {vat.status === "DECLARED" ? "Declared" : "Pending"}
                    </span>
                  </td>
                  <td className="ft-td text-right">
                    {vat.status !== "DECLARED" && (
                      <button
                        onClick={() => handleDeclare(vat.id)}
                        className="p-1 px-3 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors text-xs font-bold border border-emerald-200"
                      >
                        Declare
                      </button>
                    )}
                    {vat.status === "DECLARED" && (
                        <span className="text-gray-400 italic text-xs flex justify-end items-center gap-1">
                            Validated <CheckCircle size={14} />
                        </span>
                    )}
                  </td>
                </tr>
              ))}
              {vats.length === 0 && (
                <tr>
                  <td colSpan="6" className="ft-td text-center text-gray-500 py-12">
                    No VAT entries recorded.
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
