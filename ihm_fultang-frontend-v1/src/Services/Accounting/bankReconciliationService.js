import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

const BANK_RECONCILIATION_ENDPOINT = "/bank_reconciliation";

/**
 * Service pour la gestion de la trésorerie et rapprochement bancaire
 */
const bankReconciliationService = {
  /**
   * Récupère toutes les opérations bancaires ou rapprochements
   * @param {Object} params
   * @returns {Promise}
   */
  getAllReconciliations: async (params = {}) => {
    try {
      const response = await axiosInstanceAccountant.get(BANK_RECONCILIATION_ENDPOINT, { params });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des rapprochements:", error);
      throw error;
    }
  },

  /**
   * Récupère les détails d'un rapprochement
   * @param {number} id
   * @returns {Promise}
   */
  getReconciliationById: async (id) => {
    try {
      const response = await axiosInstanceAccountant.get(`${BANK_RECONCILIATION_ENDPOINT}/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du rapprochement ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée un nouveau rapprochement
   * @param {Object} data
   * @returns {Promise}
   */
  createReconciliation: async (data) => {
    try {
      const response = await axiosInstanceAccountant.post(`${BANK_RECONCILIATION_ENDPOINT}/`, data);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création du rapprochement:", error);
      throw error;
    }
  },

  /**
   * Met à jour un rapprochement
   * @param {number} id
   * @param {Object} data
   * @returns {Promise}
   */
  updateReconciliation: async (id, data) => {
    try {
      const response = await axiosInstanceAccountant.put(`${BANK_RECONCILIATION_ENDPOINT}/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du rapprochement ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un rapprochement
   * @param {number} id
   * @returns {Promise}
   */
  deleteReconciliation: async (id) => {
    try {
      const response = await axiosInstanceAccountant.delete(`${BANK_RECONCILIATION_ENDPOINT}/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du rapprochement ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupère les prévisions de trésorerie
   * @param {Object} params
   * @returns {Promise}
   */
  getCashFlowForecast: async (params = {}) => {
      try {
          const response = await axiosInstanceAccountant.get(`${BANK_RECONCILIATION_ENDPOINT}/cash_flow_forecast/`, { params });
          return response.data;
      } catch (error) {
          console.warn("Prévisions de trésorerie API non disponible, fallback.");
          return [];
      }
  }
};

export default bankReconciliationService;
