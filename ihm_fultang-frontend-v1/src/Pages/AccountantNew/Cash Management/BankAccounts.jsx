import { useState, useEffect } from "react";
import { X, CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import {
  bankAccountService,
  chartOfAccountsService,
} from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";
import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { SuccessModal } from "../../Modals/SuccessModal.jsx";
import { ErrorModal } from "../../Modals/ErrorModal.jsx";

export function BankAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [coa, setCoa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [formData, setFormData] = useState({
    account: "",
    bank_name: "",
    account_number: "",
    iban: "",
    swift_code: "",
    balance_amount: 0,
    is_active: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bankRes, coaRes] = await Promise.all([
        bankAccountService.getAllBankAccounts(),
        chartOfAccountsService.getAllAccounts(),
      ]);
      setAccounts(bankRes.data.results || bankRes.data);
      setCoa(coaRes.data.results || coaRes.data);
    } catch (error) {
      console.error("Error:", error);
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
      await bankAccountService.createBankAccount(formData);
      setModalMessage("The bank account was created successfully.");
      setShowForm(false);
      setIsSuccessModalOpen(true);
      resetForm();
      fetchData();
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

  const resetForm = () => {
    setFormData({
      account: "",
      bank_name: "",
      account_number: "",
      iban: "",
      swift_code: "",
      balance_amount: 0,
      is_active: true,
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
          <h1 className="text-2xl font-bold text-secondary">
            Bank Accounts
          </h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="ft-btn ft-btn-md ft-btn-primary"
          >
            + New Account
          </button>
        </div>

        {/* Form modal */}
        {showForm && (
          <div className="ft-modal-overlay">
            <div className="ft-modal max-w-2xl">
              <div className="ft-modal-header">
                <h2 className="ft-modal-title">New Bank Account</h2>
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
                    <label className="text-sm font-semibold text-gray-700">
                      Ledger Account
                    </label>
                    <select
                      value={formData.account}
                      onChange={(e) =>
                        setFormData({ ...formData, account: e.target.value })
                      }
                      required
                      className="ft-select"
                    >
                      <option value="">
                        Select an account (Class 5)
                      </option>
                      {coa.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} - {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UBA, Ecobank..."
                      value={formData.bank_name}
                      onChange={(e) =>
                        setFormData({ ...formData, bank_name: e.target.value })
                      }
                      required
                      className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Account Number
                    </label>
                    <input
                      type="text"
                      placeholder="National number"
                      value={formData.account_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          account_number: e.target.value,
                        })
                      }
                      required
                      className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      IBAN
                    </label>
                    <input
                      type="text"
                      placeholder="Format international"
                      value={formData.iban}
                      onChange={(e) =>
                        setFormData({ ...formData, iban: e.target.value })
                      }
                      className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Code SWIFT/BIC
                    </label>
                    <input
                      type="text"
                      placeholder="SWIFT code"
                      value={formData.swift_code}
                      onChange={(e) =>
                        setFormData({ ...formData, swift_code: e.target.value })
                      }
                      className="ft-input"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Opening Balance (FCFA)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.balance_amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          balance_amount: parseFloat(e.target.value),
                        })
                      }
                      className="ft-input font-mono font-bold"
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
                    Create account
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
                <th className="ft-th">Bank & Account No.</th>
                <th className="ft-th">Ledger Account</th>
                <th className="ft-th">IBAN / SWIFT</th>
                <th className="ft-th text-right">Current Balance</th>
                <th className="ft-th text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {accounts.map((acc) => (
                <tr key={acc.id} className="ft-tr">
                  <td className="ft-td">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-secondary">
                          {acc.bank_name}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {acc.account_number}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="ft-td">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase">
                      {acc.account_details?.code}
                    </span>
                    <span className="ml-2 text-xs text-gray-600">
                      {acc.account_details?.label}
                    </span>
                  </td>
                  <td className="ft-td">
                    <div className="text-xs text-gray-600">
                      <span className="font-semibold">IBAN:</span>{" "}
                      {acc.iban || "N/A"}
                    </div>
                    <div className="text-xs text-gray-600">
                      <span className="font-semibold">SWIFT:</span>{" "}
                      {acc.swift_code || "N/A"}
                    </div>
                  </td>
                  <td className="ft-td text-right">
                    <div className="font-bold font-mono text-secondary">
                      {(acc.balance_amount || 0).toLocaleString()}{" "}
                      <span className="text-[10px] text-gray-400 font-normal">
                        FCFA
                      </span>
                    </div>
                  </td>
                  <td className="ft-td text-center">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase flex items-center justify-center gap-1 mx-auto w-fit ${
                        acc.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {acc.is_active ? (
                        <CheckCircle size={10} />
                      ) : (
                        <AlertCircle size={10} />
                      )}
                      {acc.is_active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="ft-td text-center text-gray-500 py-12"
                  >
                    No bank accounts configured.
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
