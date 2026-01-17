import { useState, useEffect } from "react";
import { fixedAssetService } from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";

import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";

export function Assets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    asset_number: "",
    name: "",
    category: "",
    purchase_date: "",
    original_value: 0,
    depreciation_rate: 0,
    depreciation_method: "LINEAR",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchAssets();
  }, [currentPage]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await fixedAssetService.getAllAssets({
        page: currentPage,
      });
      setAssets(response.data.results || response.data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fixedAssetService.updateAsset(editingId, formData);
      } else {
        await fixedAssetService.createAsset(formData);
      }
      setShowForm(false);
      setFormData({
        asset_number: "",
        name: "",
        category: "",
        purchase_date: "",
        original_value: 0,
        depreciation_rate: 0,
        depreciation_method: "LINEAR",
      });
      setEditingId(null);
      fetchAssets();
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Immobilisations</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {showForm ? "Fermer" : "+ Nouveau"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-4 rounded shadow mb-4"
          >
            <div className="grid grid-cols-2 gap-2 mb-3">
              <input
                type="text"
                placeholder="N° Immobilisation"
                value={formData.asset_number}
                onChange={(e) =>
                  setFormData({ ...formData, asset_number: e.target.value })
                }
                required
                className="border rounded px-2 py-1 text-sm"
              />
              <input
                type="text"
                placeholder="Nom"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="border rounded px-2 py-1 text-sm"
              />
              <input
                type="text"
                placeholder="Catégorie"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
                className="border rounded px-2 py-1 text-sm"
              />
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) =>
                  setFormData({ ...formData, purchase_date: e.target.value })
                }
                required
                className="border rounded px-2 py-1 text-sm"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Valeur d'achat"
                value={formData.original_value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    original_value: parseFloat(e.target.value),
                  })
                }
                required
                className="border rounded px-2 py-1 text-sm"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Taux amortissement %"
                value={formData.depreciation_rate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    depreciation_rate: parseFloat(e.target.value),
                  })
                }
                required
                className="border rounded px-2 py-1 text-sm"
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

        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">N°</th>
                <th className="px-4 py-2 text-left">Nom</th>
                <th className="px-4 py-2 text-left">Catégorie</th>
                <th className="px-4 py-2 text-right">Valeur Brute</th>
                <th className="px-4 py-2 text-right">Valeur Nette</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{asset.asset_number}</td>
                  <td className="px-4 py-2">{asset.name}</td>
                  <td className="px-4 py-2">{asset.category}</td>
                  <td className="px-4 py-2 text-right">
                    {asset.original_value.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {asset.net_book_value?.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => {
                        setFormData(asset);
                        setEditingId(asset.id);
                        setShowForm(true);
                      }}
                      className="text-blue-500 text-xs"
                    >
                      Mod.
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
