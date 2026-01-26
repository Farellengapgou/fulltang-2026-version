import { useState, useEffect } from "react";
import { X, Edit } from "lucide-react";
import {
  fixedAssetService,
  chartOfAccountsService,
} from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";
import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { SuccessModal } from "../../Modals/SuccessModal.jsx";
import { ErrorModal } from "../../Modals/ErrorModal.jsx";

export function Assets() {
  const [assets, setAssets] = useState([]);
  const [coa, setCoa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [formData, setFormData] = useState({
    asset_number: "",
    name: "",
    category: "MEDICAL_EQUIPMENT",
    acquisition_date: new Date().toISOString().split("T")[0],
    acquisition_cost: 0,
    depreciation_rate: 0,
    depreciation_method: "LINEAR",
    asset_account: "",
    useful_life_years: 5,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assetRes, coaRes] = await Promise.all([
        fixedAssetService.getAllAssets({ page: currentPage }),
        chartOfAccountsService.getAllAccounts(),
      ]);
      setAssets(assetRes.data.results || assetRes.data);
      setCoa(coaRes.data.results || coaRes.data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fixedAssetService.updateAsset(editingId, formData);
        setModalMessage("L'immobilisation a été mise à jour avec succès.");
      } else {
        await fixedAssetService.createAsset(formData);
        setModalMessage("L'immobilisation a été enregistrée avec succès.");
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
      asset_number: "",
      name: "",
      category: "MEDICAL_EQUIPMENT",
      acquisition_date: new Date().toISOString().split("T")[0],
      acquisition_cost: 0,
      depreciation_rate: 0,
      depreciation_method: "LINEAR",
      asset_account: "",
      useful_life_years: 5,
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
          <h1 className="text-2xl font-bold text-secondary">Immobilisations</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="ft-btn ft-btn-md ft-btn-primary"
          >
            + Nouveau
          </button>
        </div>

        {/* Modal pour le formulaire */}
        {showForm && (
          <div className="ft-modal-overlay">
            <div className="ft-modal max-w-2xl">
              <div className="ft-modal-header">
                <h2 className="ft-modal-title">
                  {editingId
                    ? "Modifier l'Immobilisation"
                    : "Nouvelle Immobilisation"}
                </h2>
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
                    <label className="text-sm font-semibold text-gray-700">
                      N° Immobilisation
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: IMM-2026-001"
                      value={formData.asset_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          asset_number: e.target.value,
                        })
                      }
                      required
                      className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Nom / Désignation
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Scanner IRM"
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
                      Catégorie
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="ft-select"
                    >
                      <option value="BUILDING">Bâtiment</option>
                      <option value="MEDICAL_EQUIPMENT">
                        Équipement médical
                      </option>
                      <option value="IT_EQUIPMENT">
                        Matériel informatique
                      </option>
                      <option value="FURNITURE">Mobilier</option>
                      <option value="VEHICLE">Véhicule</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Date d'acquisition
                    </label>
                    <input
                      type="date"
                      value={formData.acquisition_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          acquisition_date: e.target.value,
                        })
                      }
                      required
                      className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Coût d'acquisition (FCFA)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.acquisition_cost}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          acquisition_cost: parseFloat(e.target.value),
                        })
                      }
                      required
                      className="ft-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Vie utile (années)
                    </label>
                    <input
                      type="number"
                      value={formData.useful_life_years}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          useful_life_years: parseInt(e.target.value),
                        })
                      }
                      required
                      className="ft-input"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Compte d'Immobilisation
                    </label>
                    <select
                      value={formData.asset_account}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          asset_account: e.target.value,
                        })
                      }
                      required
                      className="ft-select"
                    >
                      <option value="">Sélectionner un compte...</option>
                      {coa.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} - {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="ft-modal-footer">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="ft-btn ft-btn-md ft-btn-outline"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="ft-btn ft-btn-md ft-btn-primary"
                  >
                    {editingId ? "Mettre à jour" : "Enregistrer"}
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
                <th className="ft-th">N° Immo</th>
                <th className="ft-th">Désignation</th>
                <th className="ft-th">Catégorie</th>
                <th className="ft-th text-right">V. Brute</th>
                <th className="ft-th text-right">V. Nette</th>
                <th className="ft-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assets.map((asset) => (
                <tr key={asset.id} className="ft-tr">
                  <td className="ft-td font-bold text-secondary uppercase tracking-tight text-xs">
                    {asset.asset_number}
                  </td>
                  <td className="ft-td font-medium">{asset.name}</td>
                  <td className="ft-td text-xs text-gray-500 uppercase">
                    {asset.category.replace("_", " ")}
                  </td>
                  <td className="ft-td text-right font-mono text-gray-600">
                    {(asset.acquisition_cost || 0).toLocaleString()}
                  </td>
                  <td className="ft-td text-right font-mono font-bold text-secondary">
                    {(asset.net_book_value || 0).toLocaleString()}
                  </td>
                  <td className="ft-td text-right">
                    <button
                      onClick={() => {
                        setFormData(asset);
                        setEditingId(asset.id);
                        setShowForm(true);
                      }}
                      className="text-secondary hover:text-primary-end font-semibold text-xs"
                    >
                      <Edit size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {assets.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="ft-td text-center text-gray-500 py-12"
                  >
                    Aucune immobilisation enregistrée.
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
