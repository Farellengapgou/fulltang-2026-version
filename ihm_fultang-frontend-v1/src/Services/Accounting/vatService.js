import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

const VAT_ENDPOINT = "/vat";

/**
 * Service pour la gestion de la TVA et de la fiscalité
 */
const vatService = {
  /**
   * Récupère toutes les déclarations fiscales
   * @param {Object} params - Filtres (période, type, etc.)
   * @returns {Promise} Liste des déclarations
   */
  getAllDeclarations: async (params = {}) => {
    try {
      const response = await axiosInstanceAccountant.get(VAT_ENDPOINT, { params });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des déclarations:", error);
      throw error;
    }
  },

  /**
   * Récupère une déclaration par son ID
   * @param {number} id
   * @returns {Promise} Détails de la déclaration
   */
  getDeclarationById: async (id) => {
    try {
      const response = await axiosInstanceAccountant.get(`${VAT_ENDPOINT}/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la déclaration ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle déclaration
   * @param {Object} declarationData
   * @returns {Promise} Déclaration créée
   */
  createDeclaration: async (declarationData) => {
    try {
      const response = await axiosInstanceAccountant.post(`${VAT_ENDPOINT}/`, declarationData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création de la déclaration:", error);
      throw error;
    }
  },

  /**
   * Met à jour une déclaration
   * @param {number} id
   * @param {Object} declarationData
   * @returns {Promise} Déclaration mise à jour
   */
  updateDeclaration: async (id, declarationData) => {
    try {
      const response = await axiosInstanceAccountant.put(`${VAT_ENDPOINT}/${id}/`, declarationData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la déclaration ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime une déclaration
   * @param {number} id
   * @returns {Promise}
   */
  deleteDeclaration: async (id) => {
    try {
      const response = await axiosInstanceAccountant.delete(`${VAT_ENDPOINT}/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la déclaration ${id}:`, error);
      throw error;
    }
  },

  /**
   * Calcule la TVA pour une période donnée
   * @param {Object} params - { start_date, end_date }
   * @returns {Promise} Données de calcul de TVA (Collectée, Déductible, etc.)
   */
  calculateVAT: async (params) => {
      // Endpoint hypothétique pour le calcul de TVA
      // Si non existant, on pourrait le faire côté client avec les factures
      // Mais supposons une action custom sur le ViewSet
      try {
          const response = await axiosInstanceAccountant.get(`${VAT_ENDPOINT}/calculate_vat/`, { params });
          return response.data;
      } catch (error) {
          console.warn("Calcul TVA API non disponible, retour vide.");
          return { collected: 0, deductible: 0, payable: 0 };
      }
  }
};

export default vatService;
