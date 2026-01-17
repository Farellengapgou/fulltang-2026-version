import { useState, useEffect } from "react";
import {
  bankReconciliationService,
  bankAccountService,
} from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";

import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";

export function BankReconciliation() {
  const [reconciliations, setReconciliations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [formData, setFormData] = useState({
    bank_account: "",
    reconciliation_date: new Date().toISOString().split("T")[0],
    bank_balance: 0,
    book_balance: 0,
    variance: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
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
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await bankReconciliationService.createReconciliation(formData);
      setShowForm(false);
      setFormData({
        bank_account: "",
        reconciliation_date: new Date().toISOString().split("T")[0],
        bank_balance: 0,
        book_balance: 0,
        variance: 0,
      });
      const response = await bankReconciliationService.getAllReconciliations();
      setReconciliations(response.data.results || response.data);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleReconcile = async (id) => {
    if (window.confirm("Réconcilier ce compte?")) {
      try {
        await bankReconciliationService.reconcileBank(id);
        const response =
          await bankReconciliationService.getAllReconciliations();
        setReconciliations(response.data.results || response.data);
      } catch (error) {
        console.error("Erreur:", error);
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <CustomDashboard
      linkList={FinancialAccountantNavLink}
      requiredRole={"Accountant"}
    >
      <FinancialAccountantNavBar />
      <div className="p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Réconciliation Bancaire</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 text-white px-3 py-2 rounded text-sm"
          >
            + Nouvelle Réconciliation
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-4 rounded shadow mb-4"
          >
            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
              <select
                value={formData.bank_account}
                onChange={(e) =>
                  setFormData({ ...formData, bank_account: e.target.value })
                }
                required
                className="border rounded px-2 py-1"
              >
                <option value="">Sélectionner un compte</option>
                {bankAccounts.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bank_name} - {b.account_number}
                  </option>
                ))}
              </select>
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
                className="border rounded px-2 py-1"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Solde Banque"
                value={formData.bank_balance}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bank_balance: parseFloat(e.target.value),
                  })
                }
                required
                className="border rounded px-2 py-1"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Solde Livre"
                value={formData.book_balance}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    book_balance: parseFloat(e.target.value),
                  })
                }
                required
                className="border rounded px-2 py-1"
              />
            </div>
            <button
              type="submit"
              className="bg-green-500 text-white px-3 py-1 rounded text-sm"
            >
              Créer
            </button>
          </form>
        )}

        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-3 py-2 text-left">Compte</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-right">Solde Banque</th>
                <th className="px-3 py-2 text-right">Solde Livre</th>
                <th className="px-3 py-2 text-right">Écart</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {reconciliations.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm">{r.bank_account_name}</td>
                  <td className="px-3 py-2 text-sm">{r.reconciliation_date}</td>
                  <td className="px-3 py-2 text-right text-sm">
                    {r.bank_balance.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right text-sm">
                    {r.book_balance.toFixed(2)}
                  </td>
                  <td
                    className={`px-3 py-2 text-right text-sm font-bold ${
                      Math.abs(r.variance) < 0.01
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {r.variance.toFixed(2)}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-xs px-1 py-0 rounded ${
                        r.is_reconciled ? "bg-green-200" : "bg-yellow-200"
                      }`}
                    >
                      {r.is_reconciled ? "Réconciliée" : "En Attente"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {!r.is_reconciled && (
                      <button
                        onClick={() => handleReconcile(r.id)}
                        className="text-blue-500"
                      >
                        Réconcilier
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </CustomDashboard>
  );
}
