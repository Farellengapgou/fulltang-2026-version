import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

const SUPPLIER_ENDPOINT = "/suppliers";

/**
 * Service pour la gestion des fournisseurs et dettes
 */
const supplierService = {
  /**
   * Récupère tous les fournisseurs
   * @param {Object} params
   * @returns {Promise}
   */
  getAllSuppliers: async (params = {}) => {
    try {
      const response = await axiosInstanceAccountant.get(SUPPLIER_ENDPOINT, { params });
      return response.data;
    } catch (error) {
      console.error("Erreur fournisseur:", error);
      throw error;
    }
  },

  /**
   * Crée un fournisseur
   * @param {Object} data
   * @returns {Promise}
   */
  createSupplier: async (data) => {
    try {
      const response = await axiosInstanceAccountant.post(`${SUPPLIER_ENDPOINT}/`, data);
      return response.data;
    } catch (error) {
      console.error("Erreur création fournisseur:", error);
      throw error;
    }
  },

  /**
   * Récupère les factures fournisseurs
   */
  getInvoices: async (params = {}) => {
      try {
          const response = await axiosInstanceAccountant.get(`${SUPPLIER_ENDPOINT}/invoices/`, { params });
          return response.data;
      } catch (error) {
          console.warn("Factures fournisseurs API non dispo fallback");
          return [];
      }
  },

  /**
   * Récupère l'échéancier des paiements
   */
  getPaymentSchedule: async (params = {}) => {
      try {
          const response = await axiosInstanceAccountant.get(`${SUPPLIER_ENDPOINT}/payment_schedule/`, { params });
          return response.data;
      } catch (error) {
           console.warn("Echéancier API non dispo fallback");
           return [];
      }
  }
};

export default supplierService;
