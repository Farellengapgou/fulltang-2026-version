import { useState, useEffect } from "react";
import { X, Plus, Calendar, Hash, CheckCircle, AlertCircle, Edit, Trash2, Lock, Unlock, Clock, Info } from "lucide-react";
import { accountingPeriodService } from "../../../Services/Accounting/index.js";
import Loader from "../../../GlobalComponents/Loader.jsx";
import Pagination from "../../../GlobalComponents/Pagination.jsx";

import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { SuccessModal } from "../../Modals/SuccessModal.jsx";
import { ErrorModal } from "../../Modals/ErrorModal.jsx";
import { ConfirmationModal } from "../../Modals/ConfirmAction.Modal.jsx";

export function Periods() {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [confirmConfig, setConfirmConfig] = useState({ title: "", message: "", onConfirm: () => {} });

  const [formData, setFormData] = useState({
    fiscal_year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    start_date: "",
    end_date: "",
    status: "OPEN",
  });
  const [dateError, setDateError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const response = await accountingPeriodService.getAllPeriods({
        page: currentPage,
      });
      setPeriods(response.data.results || response.data);
      setTotalPages(Math.ceil((response.data.count || 0) / 10));
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, [currentPage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate dates
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        setDateError("La date de clôture ne peut pas être antérieure à la date d'ouverture");
        return;
      }
    }
    setDateError("");
    
    try {
      // Map frontend fields to backend expected fields
      const payload = {
        year: formData.fiscal_year,
        month: formData.month,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
      };
      
      if (editingId) {
        await accountingPeriodService.updatePeriod(editingId, payload);
        setModalMessage("La période comptable a été modifiée avec succès.");
      } else {
        await accountingPeriodService.createPeriod(payload);
        setModalMessage("La période comptable a été créée avec succès.");
      }
      setShowForm(false);
      resetForm();
      setIsSuccessModalOpen(true);
      fetchPeriods();
    } catch (error) {
      console.error("Erreur:", error);
      setModalMessage(error.response?.data ? JSON.stringify(error.response.data) : error.message);
      setIsErrorModalOpen(true);
    }
  };

  const handleEdit = (period) => {
    setFormData(period);
    setEditingId(period.id);
    setShowForm(true);
  };

  const handleClosePeriod = (id) => {
    setConfirmConfig({
      title: "Clôturer la période",
      message: "Êtes-vous sûr de vouloir fermer cette période? Cette action est irréversible et verrouillera toutes les écritures.",
      onConfirm: async () => {
        try {
          await accountingPeriodService.closePeriod(id);
          setModalMessage("La période a été fermée avec succès.");
          setIsSuccessModalOpen(true);
          fetchPeriods();
        } catch (error) {
          console.error("Erreur:", error);
          setModalMessage(error.response?.data ? JSON.stringify(error.response.data) : error.message);
          setIsErrorModalOpen(true);
        }
      }
    });
    setIsConfirmModalOpen(true);
  };

  const handleOpenPeriod = (id) => {
    setConfirmConfig({
      title: "Rouvrir la période",
      message: "Voulez-vous vraiment rouvrir cette période? Cela autorisera de nouveau la saisie d'écritures.",
      onConfirm: async () => {
        try {
          await accountingPeriodService.openPeriod(id);
          setModalMessage("La période a été rouverte avec succès.");
          setIsSuccessModalOpen(true);
          fetchPeriods();
        } catch (error) {
          console.error("Erreur:", error);
          setModalMessage(error.response?.data ? JSON.stringify(error.response.data) : error.message);
          setIsErrorModalOpen(true);
        }
      }
    });
    setIsConfirmModalOpen(true);
  };

  const handleDelete = (id) => {
    setConfirmConfig({
      title: "Supprimer la période",
      message: "Voulez-vous vraiment supprimer cette période? Cette action est définitive.",
      onConfirm: async () => {
        try {
          await accountingPeriodService.deletePeriod(id);
          setModalMessage("La période a été supprimée avec succès.");
          setIsSuccessModalOpen(true);
          fetchPeriods();
        } catch (error) {
          console.error("Erreur:", error);
          setModalMessage(error.response?.data ? JSON.stringify(error.response.data) : error.message);
          setIsErrorModalOpen(true);
        }
      }
    });
    setIsConfirmModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      fiscal_year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      start_date: "",
      end_date: "",
      status: "OPEN",
    });
    setEditingId(null);
    setDateError("");
  };

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

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
            <h1 className="text-3xl font-black text-secondary tracking-tight uppercase">Périodes Comptables</h1>
            <p className="text-gray-400 text-sm font-medium mt-1 uppercase tracking-widest">Configuration des cycles d'exploitation</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="ft-btn ft-btn-md ft-btn-primary"
          >
            <Plus size={20} /> Nouvelle Période
          </button>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="ft-modal-overlay">
            <div className="ft-modal max-w-2xl">
              <div className="ft-modal-header">
                <h2 className="ft-modal-title">{editingId ? "Modifier la période" : "Nouvelle Période"}</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={28} />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="ft-modal-body space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700 ml-1">Année Fiscale</label>
                        <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="number"
                                value={formData.fiscal_year}
                                onChange={(e) => setFormData({ ...formData, fiscal_year: parseInt(e.target.value) })}
                                required
                                className="ft-input pl-12"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700 ml-1">Mois du Calendrier</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <select
                                value={formData.month}
                                onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                                className="ft-select pl-12"
                            >
                                {monthNames.map((name, idx) => (
                                    <option key={idx} value={idx + 1}>{name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700 ml-1">Date d'Ouverture</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                required
                                className="ft-input pl-12"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700 ml-1">Date de Clôture</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                required
                                className="ft-input pl-12"
                            />
                        </div>
                    </div>
                  </div>

                  {dateError && (
                    <div className="col-span-2 bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-600 font-medium flex items-center gap-2">
                        <AlertCircle size={16} />
                        {dateError}
                      </p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Statut Initial</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            {formData.status === 'OPEN' ? <Unlock size={18} /> : <Lock size={18} />}
                        </div>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="ft-select pl-12"
                        >
                            <option value="OPEN">OUVERTE - Saisie Autorisée</option>
                            <option value="CLOSED">FERMÉE - Consultation Uniquement</option>
                        </select>
                    </div>
                  </div>
                </div>
                <div className="ft-modal-footer">
                  <button type="button" onClick={() => setShowForm(false)} className="ft-btn ft-btn-md ft-btn-outline">
                    Annuler
                  </button>
                  <button type="submit" className="ft-btn ft-btn-md ft-btn-primary">
                    {editingId ? "Enregistrer les modifications" : "Créer la période"}
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
                <th className="ft-th">Cycle</th>
                <th className="ft-th">Calendrier</th>
                <th className="ft-th">Intervalle de Dates</th>
                <th className="ft-th text-center">Statut</th>
                <th className="ft-th text-right">Opérations</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period.id} className="ft-tr">
                  <td className="ft-td">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary">
                            <Hash size={20} />
                        </div>
                        <div>
                            <span className="font-black text-secondary tracking-tight uppercase">M{period.month}</span>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{period.fiscal_year}</div>
                        </div>
                    </div>
                  </td>
                  <td className="ft-td">
                    <span className="font-bold text-gray-700 uppercase italic text-xs">{monthNames[period.month-1]}</span>
                  </td>
                  <td className="ft-td">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <Calendar size={12} />
                        <span className="font-black text-gray-600 uppercase tracking-tighter">
                          {period.start_date ? new Date(period.start_date).toLocaleDateString('fr-FR') : 'N/A'}
                        </span>
                        <span className="opacity-30">→</span>
                        <span className="font-black text-gray-600 uppercase tracking-tighter">
                          {period.end_date ? new Date(period.end_date).toLocaleDateString('fr-FR') : 'N/A'}
                        </span>
                    </div>
                  </td>
                  <td className="ft-td text-center">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full flex items-center justify-center gap-1 mx-auto w-fit ${
                        period.status === "OPEN" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                        {period.status === "OPEN" ? <Unlock size={10} /> : <Lock size={10} />}
                        {period.status === "OPEN" ? "OUVERTE" : "CLÔTURÉE"}
                    </span>
                  </td>
                  <td className="ft-td text-right">
                    <div className="flex justify-end gap-2">
                        {period.status === "OPEN" ? (
                        <>
                            <button
                                onClick={() => handleEdit(period)}
                                className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                title="Modifier"
                            >
                                <Edit size={14} />
                            </button>
                            <button
                                onClick={() => handleClosePeriod(period.id)}
                                className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                                title="Clôturer"
                            >
                                <Lock size={14} />
                            </button>
                        </>
                        ) : (
                            <button
                                onClick={() => handleOpenPeriod(period.id)}
                                className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                title="Réouvrir"
                            >
                                <Unlock size={14} />
                            </button>
                        )}
                        <button
                            onClick={() => handleDelete(period.id)}
                            className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                            title="Supprimer"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
              {periods.length === 0 && (
                <tr>
                    <td colSpan="5" className="ft-td text-center text-gray-400 py-20 font-medium italic uppercase tracking-widest">
                        Aucune période comptable configurée.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>

        {/* Info Box */}
        <div className="mt-10 bg-secondary/5 rounded-[2rem] p-8 border border-secondary/10 flex gap-6 items-start">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-white shrink-0 shadow-lg shadow-secondary/20">
                <Info size={24} />
            </div>
            <div className="space-y-3">
                <h3 className="text-sm font-black text-secondary uppercase tracking-widest">Consignes de Gestion des Périodes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                    <p className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-secondary"></div> La clôture verrouille toutes les écritures du mois.</p>
                    <p className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-secondary"></div> Seule une période ouverte autorise la saisie comptable.</p>
                    <p className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-secondary"></div> Vérifiez les rapprochements banques avant clôture.</p>
                    <p className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-secondary"></div> La réouverture est tracée dans le journal d'audit.</p>
                </div>
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
        <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={confirmConfig.onConfirm}
            title={confirmConfig.title}
            message={confirmConfig.message}
        />
      </div>
    </CustomDashboard>
  );
}
