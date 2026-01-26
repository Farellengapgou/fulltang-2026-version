import { useState, useEffect } from "react";
import { X, Edit } from "lucide-react";
import {
  inventoryService,
  chartOfAccountsService,
} from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";
import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { SuccessModal } from "../../Modals/SuccessModal.jsx";
import { ErrorModal } from "../../Modals/ErrorModal.jsx";

export function Inventory() {
  const [items, setItems] = useState([]);
  const [coa, setCoa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [formData, setFormData] = useState({
    inventory_number: "",
    name: "",
    inventory_type: "PHARMA",
    stock_account: "",
    quantity: 0,
    unit_cost: 0,
    reorder_level: 10,
    reorder_quantity: 50,
    location: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, coaRes] = await Promise.all([
        inventoryService.getAllInventory(),
        chartOfAccountsService.getAllAccounts(),
      ]);
      setItems(invRes.data.results || invRes.data);
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
      if (editingId) {
        await inventoryService.updateInventoryItem(editingId, formData);
        setModalMessage("The inventory item was updated successfully.");
      } else {
        await inventoryService.createInventoryItem(formData);
        setModalMessage("The inventory item was saved successfully.");
      }
      setShowForm(false);
      setIsSuccessModalOpen(true);
      resetForm();
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

  const resetForm = () => {
    setFormData({
      inventory_number: "",
      name: "",
      inventory_type: "PHARMA",
      stock_account: "",
      quantity: 0,
      unit_cost: 0,
      reorder_level: 10,
      reorder_quantity: 50,
      location: "",
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-secondary">
            Inventory Management
          </h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="ft-btn ft-btn-md ft-btn-primary"
          >
            + New Item
          </button>
        </div>

        {/* Form modal */}
        {showForm && (
          <div className="ft-modal-overlay">
            <div className="ft-modal max-w-4xl">
              <div className="ft-modal-header">
                <h2 className="ft-modal-title">
                  {editingId
                    ? "Edit Item"
                    : "New Inventory Item"}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="ft-modal-body grid grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Reference (No.)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: REF-INV-001"
                      value={formData.inventory_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          inventory_number: e.target.value,
                        })
                      }
                      required
                      className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Description
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Amoxicilline 500mg"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Item Type
                    </label>
                    <select
                      value={formData.inventory_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          inventory_type: e.target.value,
                        })
                      }
                      className="ft-select"
                    >
                      <option value="PRODUCT">Product</option>
                      <option value="SERVICE">Service</option>
                      <option value="RAW_MATERIAL">Raw Material</option>
                      <option value="PHARMA">Pharmaceutical</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Stock Account
                    </label>
                    <select
                      value={formData.stock_account}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stock_account: e.target.value,
                        })
                      }
                      required
                      className="ft-select"
                    >
                      <option value="">Select an account...</option>
                      {coa.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} - {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantity: parseFloat(e.target.value),
                        })
                      }
                      required
                      className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Unit Cost (FCFA)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.unit_cost}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          unit_cost: parseFloat(e.target.value),
                        })
                      }
                      required
                      className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Reorder Level
                    </label>
                    <input
                      type="number"
                      value={formData.reorder_level}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          reorder_level: parseInt(e.target.value),
                        })
                      }
                      className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Reorder Quantity
                    </label>
                    <input
                      type="number"
                      value={formData.reorder_quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          reorder_quantity: parseInt(e.target.value),
                        })
                      }
                      required
                      className="ft-input"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Shelf A-12 / Main Warehouse"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
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
                    {editingId ? "Update" : "Save"}
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
                <th className="ft-th">Ref</th>
                <th className="ft-th">Description</th>
                <th className="ft-th text-right">Stock</th>
                <th className="ft-th text-right">Unit Cost</th>
                <th className="ft-th text-right">Total Value</th>
                <th className="ft-th text-center">Threshold</th>
                <th className="ft-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="ft-tr">
                  <td className="ft-td font-bold text-secondary uppercase tracking-tight text-xs">
                    {item.inventory_number}
                  </td>
                  <td className="ft-td font-medium">{item.name}</td>
                  <td
                    className={`ft-td text-right font-mono ${item.quantity <= item.reorder_level ? "text-red-600 font-bold" : "text-gray-700"}`}
                  >
                    {item.quantity.toLocaleString()}
                  </td>
                  <td className="ft-td text-right font-mono text-gray-600">
                    {(item.unit_cost || 0).toLocaleString()}
                  </td>
                  <td className="ft-td text-right font-mono font-bold text-secondary">
                    {(item.quantity * item.unit_cost || 0).toLocaleString()}
                  </td>
                  <td className="ft-td text-center text-xs text-gray-500">
                    {item.reorder_level}
                  </td>
                  <td className="ft-td text-right">
                    <button
                      onClick={() => {
                        setFormData(item);
                        setEditingId(item.id);
                        setShowForm(true);
                      }}
                      className="text-secondary hover:text-primary-end font-semibold text-xs"
                    >
                      <Edit size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="ft-td text-center text-gray-500 py-12"
                  >
                    No inventory items.
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
