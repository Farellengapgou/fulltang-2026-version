import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

const TAX_ENDPOINT = "/taxation";

/**
 * Service pour la gestion fiscale (TVA et impôts)
 */
const taxService = {
  /**
   * Calcul la TVA pour une période
   */
  calculateVAT: async (params) => {
    try {
      const response = await axiosInstanceAccountant.post(`${TAX_ENDPOINT}/vat_calculation/`, params);
      return response.data;
    } catch (error) {
      console.error("Erreur calcul TVA:", error);
      throw error;
    }
  },

  /**
   * Récupère les déclarations fiscales
   */
  getTaxDeclarations: async (params = {}) => {
      try {
          // Utilise le même endpoint que SocialCharges si c'est le même modèle, ou un endpoint dédié
          const response = await axiosInstanceAccountant.get(`${TAX_ENDPOINT}/declarations/`, { params });
          return response.data;
      } catch (error) {
          console.warn("Déclarations fiscales API non disponible, fallback.");
          return [];
      }
  },

  /**
   * Récupère le calendrier fiscal
   */
  getTaxCalendar: async () => {
       try {
          const response = await axiosInstanceAccountant.get(`${TAX_ENDPOINT}/calendar/`);
          return response.data;
      } catch (error) {
          console.warn("Calendrier fiscal API non disponible, fallback.");
          return [];
      }
  }
};

export default taxService;
