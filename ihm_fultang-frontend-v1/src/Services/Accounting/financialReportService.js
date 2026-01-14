import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

const FINANCIAL_REPORT_ENDPOINT = "/financial_reports";

/**
 * Service pour la gestion des rapports financiers et de la clôture
 */
const financialReportService = {
  /**
   * Récupère le bilan (Balance Sheet)
   * @param {Object} params - { start_date, end_date }
   * @returns {Promise} Données du bilan
   */
  getBalanceSheet: async (params = {}) => {
    try {
      const response = await axiosInstanceAccountant.get(`${FINANCIAL_REPORT_ENDPOINT}/balance_sheet/`, { params });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération du bilan:", error);
      throw error;
    }
  },

  /**
   * Récupère le compte de résultat (Income Statement)
   * @param {Object} params - { start_date, end_date }
   * @returns {Promise} Données du compte de résultat
   */
  getIncomeStatement: async (params = {}) => {
    try {
      const response = await axiosInstanceAccountant.get(`${FINANCIAL_REPORT_ENDPOINT}/income_statement/`, { params });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération du compte de résultat:", error);
      throw error;
    }
  },

  /**
   * Récupère les données de facturation (Revenue)
   * @param {Object} params
   * @returns {Promise}
   */
  getRevenueData: async (params = {}) => {
      // Endpoint hypothétique pour obtenir les revenus par service
      try {
          const response = await axiosInstanceAccountant.get(`${FINANCIAL_REPORT_ENDPOINT}/revenue_analysis/`, { params });
          return response.data;
      } catch (error) {
           console.warn("Analyse revenus non disponible");
           return [];
      }
  },

  /**
   * Récupère les factures clients (Receivables)
   * @param {Object} params
   * @returns {Promise}
   */
  getInvoices: async (params = {}) => {
       // Endpoint pour lister les factures émises
       try {
           const response = await axiosInstanceAccountant.get(`/client_invoices/`, { params });
           return response.data;
       } catch (error) {
            console.warn("Factures clients endpoint non disponible, fallback.");
            return [];
       }
  }
};

export default financialReportService;
