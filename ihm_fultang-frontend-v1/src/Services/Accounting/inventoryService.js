import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

const INVENTORY_ENDPOINT = "/inventory";

/**
 * Service pour la gestion des stocks
 */
const inventoryService = {
  /**
   * Récupère l'état du stock (inventaire physique)
   * @param {Object} params
   * @returns {Promise}
   */
  getStockItems: async (params = {}) => {
    try {
      const response = await axiosInstanceAccountant.get(`${INVENTORY_ENDPOINT}/items/`, { params });
      return response.data;
    } catch (error) {
      console.error("Erreur stock:", error);
      throw error;
    }
  },

  /**
   * Récupère la valorisation du stock
   */
  getStockValuation: async (params = {}) => {
       try {
          const response = await axiosInstanceAccountant.get(`${INVENTORY_ENDPOINT}/valuation/`, { params });
          return response.data;
      } catch (error) {
          console.warn("Valorisation stock API non dispo fallback");
          return [];
      }
  },

  /**
   * Ajoute un ajustement de stock (inventaire physique)
   */
  adjustStock: async (data) => {
      try {
          const response = await axiosInstanceAccountant.post(`${INVENTORY_ENDPOINT}/adjust/`, data);
          return response.data;
      } catch (error) {
           console.error("Erreur ajustement stock:", error);
           throw error;
      }
  }
};

export default inventoryService;
