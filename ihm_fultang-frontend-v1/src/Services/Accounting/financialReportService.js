import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

/**
 * Service pour la génération des rapports financiers
 */

const REPORTS_ENDPOINT = "/reports";

/**
 * Récupère le bilan OHADA
 * @param {string} startDate - Date de début (format: YYYY-MM-DD)
 * @param {string} endDate - Date de fin (format: YYYY-MM-DD)
 * @returns {Promise} Données du bilan
 */
export const getBalanceSheet = async (startDate, endDate) => {
  try {
    const params = {
      start_date: startDate,
      end_date: endDate,
    };
    const response = await axiosInstanceAccountant.get(`${REPORTS_ENDPOINT}/balance_sheet/`, { params });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du bilan:", error);
    throw error;
  }
};

/**
 * Récupère le compte de résultat OHADA
 * @param {string} startDate - Date de début (format: YYYY-MM-DD)
 * @param {string} endDate - Date de fin (format: YYYY-MM-DD)
 * @returns {Promise} Données du compte de résultat
 */
export const getIncomeStatement = async (startDate, endDate) => {
  try {
    const params = {
      start_date: startDate,
      end_date: endDate,
    };
    const response = await axiosInstanceAccountant.get(`${REPORTS_ENDPOINT}/income_statement/`, { params });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du compte de résultat:", error);
    throw error;
  }
};

/**
 * Récupère la balance générale
 * @param {string} date - Date de la balance (format: YYYY-MM-DD)
 * @returns {Promise} Données de la balance
 */
export const getTrialBalance = async (date) => {
  try {
    const params = { date };
    const response = await axiosInstanceAccountant.get(`${REPORTS_ENDPOINT}/trial_balance/`, { params });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de la balance:", error);
    throw error;
  }
};

/**
 * Récupère le grand livre d'un compte
 * @param {number} accountId - ID du compte
 * @param {string} startDate - Date de début (format: YYYY-MM-DD)
 * @param {string} endDate - Date de fin (format: YYYY-MM-DD)
 * @param {number} page - Numéro de page pour la pagination
 * @param {number} pageSize - Taille de la page
 * @returns {Promise} Données du grand livre
 */
export const getGeneralLedger = async (accountId, startDate, endDate, page = 1, pageSize = 50) => {
  try {
    const params = {
      account: accountId,
      start_date: startDate,
      end_date: endDate,
      page,
      page_size: pageSize,
    };
    const response = await axiosInstanceAccountant.get(`${REPORTS_ENDPOINT}/general_ledger/`, { params });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du grand livre:", error);
    throw error;
  }
};

/**
 * Récupère tous les rapports disponibles
 * @returns {Promise} Liste des rapports
 */
export const getAllReports = async () => {
  try {
    const response = await axiosInstanceAccountant.get(REPORTS_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des rapports:", error);
    throw error;
  }
};

/**
 * Génère un rapport personnalisé
 * @param {Object} reportConfig - Configuration du rapport
 * @returns {Promise} Données du rapport
 */
export const generateCustomReport = async (reportConfig) => {
  try {
    const response = await axiosInstanceAccountant.post(`${REPORTS_ENDPOINT}/custom/`, reportConfig);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la génération du rapport personnalisé:", error);
    throw error;
  }
};

export default {
  getBalanceSheet,
  getIncomeStatement,
  getTrialBalance,
  getGeneralLedger,
  getAllReports,
  generateCustomReport,
};
