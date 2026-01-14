import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

const PAYROLL_ENDPOINT = "/payroll";

/**
 * Service pour la gestion de la paie
 */
const payrollService = {
  /**
   * Récupère tous les employés/bulletins
   * @param {Object} params
   * @returns {Promise}
   */
  getAllPayrolls: async (params = {}) => {
    try {
      const response = await axiosInstanceAccountant.get(PAYROLL_ENDPOINT, { params });
      return response.data;
    } catch (error) {
      console.error("Erreur paie:", error);
      throw error;
    }
  },

  /**
   * Génère les bulletins de paie
   */
  generatePayslips: async (period) => {
      try {
          const response = await axiosInstanceAccountant.post(`${PAYROLL_ENDPOINT}/generate/`, { period });
          return response.data;
      } catch (error) {
           console.error("Erreur génération paie:", error);
           throw error;
      }
  },

  /**
   * Récupère les déclarations sociales et fiscales
   */
  getDeclarations: async (params = {}) => {
       try {
          const response = await axiosInstanceAccountant.get(`${PAYROLL_ENDPOINT}/declarations/`, { params });
          return response.data;
      } catch (error) {
           console.warn("Déclarations API non dispo fallback");
           return [];
      }
  }
};

export default payrollService;
