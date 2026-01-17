import { useState, useEffect } from "react";
import { inventoryService } from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";

import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";

export function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    inventory_number: "",
    name: "",
    inventory_type: "",
    quantity: 0,
    unit_price: 0,
    reorder_level: 0,
    location: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await inventoryService.getAllInventory();
        setItems(response.data.results || response.data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await inventoryService.updateInventoryItem(editingId, formData);
      } else {
        await inventoryService.createInventoryItem(formData);
      }
      setShowForm(false);
      setFormData({
        inventory_number: "",
        name: "",
        inventory_type: "",
        quantity: 0,
        unit_price: 0,
        reorder_level: 0,
        location: "",
      });
      setEditingId(null);
      const response = await inventoryService.getAllInventory();
      setItems(response.data.results || response.data);
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
      <div className="p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Inventaire</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 text-white px-3 py-2 rounded text-sm"
          >
            + Nouvel Article
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-4 rounded shadow mb-4"
          >
            <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
              <input
                type="text"
                placeholder="N°"
                value={formData.inventory_number}
                onChange={(e) =>
                  setFormData({ ...formData, inventory_number: e.target.value })
                }
                required
                className="border rounded px-2 py-1"
              />
              <input
                type="text"
                placeholder="Nom"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="border rounded px-2 py-1"
              />
              <input
                type="text"
                placeholder="Type"
                value={formData.inventory_type}
                onChange={(e) =>
                  setFormData({ ...formData, inventory_type: e.target.value })
                }
                className="border rounded px-2 py-1"
              />
              <input
                type="number"
                placeholder="Quantité"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseFloat(e.target.value),
                  })
                }
                required
                className="border rounded px-2 py-1"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Prix unitaire"
                value={formData.unit_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unit_price: parseFloat(e.target.value),
                  })
                }
                required
                className="border rounded px-2 py-1"
              />
              <input
                type="number"
                placeholder="Seuil réappro"
                value={formData.reorder_level}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reorder_level: parseFloat(e.target.value),
                  })
                }
                className="border rounded px-2 py-1"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-500 text-white px-3 py-1 rounded text-sm"
              >
                Enregistrer
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-3 py-2 text-left">N°</th>
                <th className="px-3 py-2 text-left">Nom</th>
                <th className="px-3 py-2 text-right">Quantité</th>
                <th className="px-3 py-2 text-right">Prix Unit.</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2 text-left">Seuil</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2">{item.inventory_number}</td>
                  <td className="px-3 py-2">{item.name}</td>
                  <td className="px-3 py-2 text-right">{item.quantity}</td>
                  <td className="px-3 py-2 text-right">
                    {item.unit_price.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {(item.quantity * item.unit_price).toFixed(2)}
                  </td>
                  <td className="px-3 py-2">{item.reorder_level}</td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => {
                        setFormData(item);
                        setEditingId(item.id);
                        setShowForm(true);
                      }}
                      className="text-blue-500 text-xs"
                    >
                      Edit
                    </button>
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
