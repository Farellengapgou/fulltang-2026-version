import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

const BUDGET_ENDPOINT = "/budget";

/**
 * Service pour la gestion budgétaire
 */
const budgetService = {
  /**
   * Récupère toutes les entrées budgétaires
   * @param {Object} params - Filtres (année, département, etc.)
   * @returns {Promise} Liste des budgets
   */
  getAllBudgets: async (params = {}) => {
    try {
      const response = await axiosInstanceAccountant.get(BUDGET_ENDPOINT, { params });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des budgets:", error);
      throw error;
    }
  },

  /**
   * Récupère un budget par son ID
   * @param {number} id
   * @returns {Promise} Détails du budget
   */
  getBudgetById: async (id) => {
    try {
      const response = await axiosInstanceAccountant.get(`${BUDGET_ENDPOINT}/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du budget ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée un nouveau budget (ou entrée budgétaire)
   * @param {Object} budgetData
   * @returns {Promise} Budget créé
   */
  createBudget: async (budgetData) => {
    try {
      const response = await axiosInstanceAccountant.post(`${BUDGET_ENDPOINT}/`, budgetData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création du budget:", error);
      throw error;
    }
  },

  /**
   * Met à jour un budget
   * @param {number} id
   * @param {Object} budgetData
   * @returns {Promise} Budget mis à jour
   */
  updateBudget: async (id, budgetData) => {
    try {
      const response = await axiosInstanceAccountant.put(`${BUDGET_ENDPOINT}/${id}/`, budgetData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du budget ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un budget
   * @param {number} id
   * @returns {Promise}
   */
  deleteBudget: async (id) => {
    try {
      const response = await axiosInstanceAccountant.delete(`${BUDGET_ENDPOINT}/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du budget ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupère l'analyse des écarts (Variance Analysis)
   * @param {Object} params
   * @returns {Promise} Données d'analyse
   */
  getVarianceAnalysis: async (params = {}) => {
      try {
          const response = await axiosInstanceAccountant.get(`${BUDGET_ENDPOINT}/variance_analysis/`, { params });
          return response.data;
      } catch (error) {
          console.warn("Analyse budget API non disponible, fallback.");
          return [];
      }
  }
};

export default budgetService;
