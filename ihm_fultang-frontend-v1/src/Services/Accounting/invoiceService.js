import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

const INVOICE_ENDPOINT = "/facture";

/**
 * Service pour la gestion des factures (Clients et Fournisseurs)
 */
const invoiceService = {
  /**
   * Récupère toutes les factures
   * @param {Object} params - Filtres (type, status, date, etc.)
   * @returns {Promise} Liste des factures
   */
  getAllInvoices: async (params = {}) => {
    try {
      const response = await axiosInstanceAccountant.get(INVOICE_ENDPOINT, { params });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des factures:", error);
      throw error;
    }
  },

  /**
   * Récupère une facture par son ID
   * @param {number} id
   * @returns {Promise} Détails de la facture
   */
  getInvoiceById: async (id) => {
    try {
      const response = await axiosInstanceAccountant.get(`${INVOICE_ENDPOINT}/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la facture ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle facture
   * @param {Object} invoiceData
   * @returns {Promise} Facture créée
   */
  createInvoice: async (invoiceData) => {
    try {
      const response = await axiosInstanceAccountant.post(`${INVOICE_ENDPOINT}/`, invoiceData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création de la facture:", error);
      throw error;
    }
  },

  /**
   * Met à jour une facture
   * @param {number} id
   * @param {Object} invoiceData
   * @returns {Promise} Facture mise à jour
   */
  updateInvoice: async (id, invoiceData) => {
    try {
      const response = await axiosInstanceAccountant.put(`${INVOICE_ENDPOINT}/${id}/`, invoiceData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la facture ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime une facture
   * @param {number} id
   * @returns {Promise}
   */
  deleteInvoice: async (id) => {
    try {
      const response = await axiosInstanceAccountant.delete(`${INVOICE_ENDPOINT}/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la facture ${id}:`, error);
      throw error;
    }
  }
};

export default invoiceService;
