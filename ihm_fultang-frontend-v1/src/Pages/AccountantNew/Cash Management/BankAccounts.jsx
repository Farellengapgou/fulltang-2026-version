import { useState, useEffect } from "react";
import { bankAccountService } from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";

import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";

export function BankAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    bank_name: "",
    account_number: "",
    iban: "",
    swift: "",
    account_type: "CHECKING",
    currency: "XOF",
    balance: 0,
  });

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await bankAccountService.getAllBankAccounts();
        setAccounts(response.data.results || response.data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await bankAccountService.createBankAccount(formData);
      setShowForm(false);
      setFormData({
        bank_name: "",
        account_number: "",
        iban: "",
        swift: "",
        account_type: "CHECKING",
        currency: "XOF",
        balance: 0,
      });
      const response = await bankAccountService.getAllBankAccounts();
      setAccounts(response.data.results || response.data);
    } catch (error) {
      console.error("Erreur:", error);
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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Comptes Bancaires</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="ft-btn ft-btn-sm ft-btn-primary"
          >
            + Nouveau Compte
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="ft-card-padded mb-4"
          >
            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
              <input
                type="text"
                placeholder="Nom Banque"
                value={formData.bank_name}
                onChange={(e) =>
                  setFormData({ ...formData, bank_name: e.target.value })
                }
                required
                className="ft-input"
              />
              <input
                type="text"
                placeholder="N° Compte"
                value={formData.account_number}
                onChange={(e) =>
                  setFormData({ ...formData, account_number: e.target.value })
                }
                required
                className="ft-input"
              />
              <input
                type="text"
                placeholder="IBAN"
                value={formData.iban}
                onChange={(e) =>
                  setFormData({ ...formData, iban: e.target.value })
                }
                className="ft-input"
              />
              <input
                type="text"
                placeholder="SWIFT"
                value={formData.swift}
                onChange={(e) =>
                  setFormData({ ...formData, swift: e.target.value })
                }
                className="ft-input"
              />
            </div>
            <button
              type="submit"
              className="ft-btn ft-btn-sm ft-btn-success"
            >
              Créer
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((acc) => (
            <div key={acc.id} className="ft-card-padded">
              <h3 className="font-bold text-lg text-secondary">{acc.bank_name}</h3>
              <p className="text-sm text-gray-600">N°: {acc.account_number}</p>
              <p className="text-sm text-gray-600">IBAN: {acc.iban}</p>
              <p className="text-lg font-bold mt-2 text-secondary font-mono">
                {acc.balance.toFixed(2)} {acc.currency}
              </p>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                {acc.account_type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </CustomDashboard>
  );
}
