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
      <div className="ft-page">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Immobilisations</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="ft-btn ft-btn-md ft-btn-primary"
          >
            {showForm ? "Fermer" : "+ Nouveau"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="ft-card-padded mb-4"
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
                className="ft-input"
              />
              <input
                type="text"
                placeholder="Nom"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="ft-input"
              />
              <input
                type="text"
                placeholder="Catégorie"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
                className="ft-input"
              />
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) =>
                  setFormData({ ...formData, purchase_date: e.target.value })
                }
                required
                className="ft-input"
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
                className="ft-input"
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
                className="ft-input"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="ft-btn ft-btn-sm ft-btn-success"
              >
                Enregistrer
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="ft-btn ft-btn-sm ft-btn-outline"
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        <div className="ft-card overflow-hidden">
          <table className="ft-table text-sm">
            <thead className="ft-thead">
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
                <tr key={asset.id} className="ft-tr">
                  <td className="px-4 py-2">{asset.asset_number}</td>
                  <td className="px-4 py-2">{asset.name}</td>
                  <td className="px-4 py-2">{asset.category}</td>
                  <td className="px-4 py-2 text-right font-mono">
                    {asset.original_value.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono">
                    {asset.net_book_value?.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => {
                        setFormData(asset);
                        setEditingId(asset.id);
                        setShowForm(true);
                      }}
                      className="text-secondary hover:text-primary-end font-semibold text-xs"
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
