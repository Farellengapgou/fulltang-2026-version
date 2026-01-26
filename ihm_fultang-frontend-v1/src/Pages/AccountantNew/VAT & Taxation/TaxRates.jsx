import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { taxService } from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";
import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { SuccessModal } from "../../Modals/SuccessModal.jsx";
import { ErrorModal } from "../../Modals/ErrorModal.jsx";

export function TaxRates() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    tax_type: "VAT",
    rate: 0,
    start_date: new Date().toISOString().split("T")[0],
  });

  const fetchRates = async () => {
    try {
      setLoading(true);
      const response = await taxService.getAllTaxRates();
      setRates(response.data.results || response.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await taxService.createTaxRate(formData);
      setModalMessage("The tax rate was created successfully.");
      setShowForm(false);
      setIsSuccessModalOpen(true);
      resetForm();
      fetchRates();
    } catch (error) {
      console.error("Error:", error);
      setModalMessage(error.response?.data ? JSON.stringify(error.response.data) : error.message);
      setIsErrorModalOpen(true);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      tax_type: "VAT",
      rate: 0,
      start_date: new Date().toISOString().split("T")[0],
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
          <h1 className="text-2xl font-bold text-secondary">Tax Rates</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="ft-btn ft-btn-md ft-btn-primary"
          >
            + New Rate
          </button>
        </div>

        {/* Form modal */}
        {showForm && (
          <div className="ft-modal-overlay">
            <div className="ft-modal max-w-xl">
              <div className="ft-modal-header">
                <h2 className="ft-modal-title">New Tax Rate</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="ft-modal-body grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Rate Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Standard VAT 18%"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Tax Type</label>
                    <select
                      value={formData.tax_type}
                      onChange={(e) =>
                        setFormData({ ...formData, tax_type: e.target.value })
                      }
                      className="ft-select"
                    >
                      <option value="VAT">VAT</option>
                      <option value="WITHHOLDING">Withholding</option>
                      <option value="EXCISE">Accise</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Rate (%)</label>
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="e.g. 0.18 for 18%"
                      value={formData.rate}
                      onChange={(e) =>
                        setFormData({ ...formData, rate: parseFloat(e.target.value) })
                      }
                      required
                      className="ft-input"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Effective date</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, start_date: e.target.value })
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
                    Create rate
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
                <th className="ft-th">Name</th>
                <th className="ft-th">Type</th>
                <th className="ft-th text-right">Rate (%)</th>
                <th className="ft-th">Effective Date</th>
                <th className="ft-th text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rates.map((r) => (
                <tr key={r.id} className="ft-tr">
                  <td className="ft-td font-medium">{r.name}</td>
                  <td className="ft-td">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase">
                        {r.tax_type}
                    </span>
                  </td>
                  <td className="ft-td text-right font-mono font-bold text-secondary">
                    {( (typeof r.rate === "number" ? r.rate : parseFloat(r.rate)) * 100).toFixed(2)}%
                  </td>
                  <td className="ft-td text-sm text-gray-500">
                    {new Date(r.start_date).toLocaleDateString('en-US')}
                  </td>
                  <td className="ft-td text-center">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        r.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {r.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
              {rates.length === 0 && (
                <tr>
                  <td colSpan="5" className="ft-td text-center text-gray-500 py-12">
                    No tax rates configured.
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
    </CustomDashboard>
  );
}
