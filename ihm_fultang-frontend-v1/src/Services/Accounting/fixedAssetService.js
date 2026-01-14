import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

const FIXED_ASSET_ENDPOINT = "/fixed_assets";

/**
 * Service pour la gestion des immobilisations
 */
const fixedAssetService = {
  /**
   * Récupère toutes les immobilisations
   * @param {Object} params
   * @returns {Promise}
   */
  getAllAssets: async (params = {}) => {
    try {
      const response = await axiosInstanceAccountant.get(FIXED_ASSET_ENDPOINT, { params });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des immobilisations:", error);
      throw error;
    }
  },

  /**
   * Récupère les détails d'une immobilisation
   * @param {number} id
   * @returns {Promise}
   */
  getAssetById: async (id) => {
    try {
      const response = await axiosInstanceAccountant.get(`${FIXED_ASSET_ENDPOINT}/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'immobilisation ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle immobilisation
   * @param {Object} data
   * @returns {Promise}
   */
  createAsset: async (data) => {
    try {
      const response = await axiosInstanceAccountant.post(`${FIXED_ASSET_ENDPOINT}/`, data);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création de l'immobilisation:", error);
      throw error;
    }
  },

  /**
   * Met à jour une immobilisation
   * @param {number} id
   * @param {Object} data
   * @returns {Promise}
   */
  updateAsset: async (id, data) => {
    try {
      const response = await axiosInstanceAccountant.put(`${FIXED_ASSET_ENDPOINT}/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'immobilisation ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime une immobilisation
   * @param {number} id
   * @returns {Promise}
   */
  deleteAsset: async (id) => {
    try {
      const response = await axiosInstanceAccountant.delete(`${FIXED_ASSET_ENDPOINT}/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'immobilisation ${id}:`, error);
      throw error;
    }
  },

  /**
   * Calcule les amortissements
   * @param {Object} params - { year, period, asset_id (optional) }
   * @returns {Promise}
   */
  calculateDepreciation: async (params = {}) => {
      try {
          const response = await axiosInstanceAccountant.post(`${FIXED_ASSET_ENDPOINT}/calculate_depreciation/`, params);
          return response.data;
      } catch (error) {
          console.warn("Calcul amortissement API non disponible, fallback vide.");
          return [];
      }
  },

  /**
   * Récupère l'historique des amortissements
   */
  getDepreciationHistory: async (params = {}) => {
       try {
          const response = await axiosInstanceAccountant.get(`${FIXED_ASSET_ENDPOINT}/depreciation_history/`, { params });
          return response.data;
      } catch (error) {
          console.warn("Historique amortissement API non disponible.");
          return [];
      }
  }
};

export default fixedAssetService;
