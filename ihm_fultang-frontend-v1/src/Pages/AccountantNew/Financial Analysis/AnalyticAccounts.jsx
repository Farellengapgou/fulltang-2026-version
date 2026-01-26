import { useState, useEffect } from "react";
import { X, Plus, Hash, FileText, LayoutGrid, CheckCircle, AlertCircle } from "lucide-react";
import { analyticAccountService } from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";

import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { SuccessModal } from "../../Modals/SuccessModal.jsx";
import { ErrorModal } from "../../Modals/ErrorModal.jsx";

export function AnalyticAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    analytic_type: "COST_CENTER",
    parent: null,
  });

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await analyticAccountService.getAllAnalyticAccounts();
      setAccounts(response.data.results || response.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await analyticAccountService.createAnalyticAccount(formData);
      setShowForm(false);
      setModalMessage("The analytic account was created successfully.");
      setIsSuccessModalOpen(true);
      setFormData({
        code: "",
        name: "",
        analytic_type: "COST_CENTER",
        parent: null,
      });
      fetchAccounts();
    } catch (error) {
      console.error("Error:", error);
      setModalMessage(error.response?.data ? JSON.stringify(error.response.data) : error.message);
      setIsErrorModalOpen(true);
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
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-secondary tracking-tight uppercase">Analytic Accounting</h1>
            <p className="text-gray-400 text-sm font-medium mt-1 uppercase tracking-widest">Sections and cost centers management</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="ft-btn ft-btn-md ft-btn-primary"
          >
            <Plus size={20} /> New Section
          </button>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="ft-modal-overlay">
            <div className="ft-modal max-w-xl">
              <div className="ft-modal-header">
                <h2 className="ft-modal-title">New Analytic Account</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={28} />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="ft-modal-body space-y-6">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Analytic Code</label>
                    <div className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="e.g. CC-MARK-2026"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            required
                            className="ft-input pl-12"
                        />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Section Name</label>
                    <div className="relative">
                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Center or project name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="ft-input pl-12"
                        />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Analytic Type</label>
                    <div className="relative">
                        <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                            value={formData.analytic_type}
                            onChange={(e) => setFormData({ ...formData, analytic_type: e.target.value })}
                            className="ft-select pl-12"
                        >
                            <option value="COST_CENTER">Cost Center</option>
                            <option value="PROJECT">Projet</option>
                            <option value="DEPARTMENT">Department</option>
                        </select>
                    </div>
                  </div>
                </div>
                <div className="ft-modal-footer">
                  <button type="button" onClick={() => setShowForm(false)} className="ft-btn ft-btn-md ft-btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="ft-btn ft-btn-md ft-btn-primary">
                    Save section
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
                <th className="ft-th">Section Code</th>
                <th className="ft-th">Analytic Name</th>
                <th className="ft-th">Section Type</th>
                <th className="ft-th text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id} className="ft-tr">
                  <td className="ft-td">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                            <Hash size={16} />
                        </div>
                        <span className="font-black text-secondary tracking-tight uppercase">{a.code}</span>
                    </div>
                  </td>
                  <td className="ft-td font-medium text-gray-700">{a.name}</td>
                  <td className="ft-td">
                    <span className="text-[10px] font-black px-3 py-1 bg-secondary/5 text-secondary rounded-lg uppercase tracking-wider">
                        {a.analytic_type ? a.analytic_type.replace('_', ' ') : 'UNDEFINED'}
                    </span>
                  </td>
                  <td className="ft-td text-center">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full flex items-center justify-center gap-1 mx-auto w-fit ${
                        a.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                        {a.is_active ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                        {a.is_active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr>
                    <td colSpan="4" className="ft-td text-center text-gray-400 py-20 font-medium italic uppercase tracking-widest">
                        No analytic account listed.
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
      </div>
    </CustomDashboard>
  );
}
