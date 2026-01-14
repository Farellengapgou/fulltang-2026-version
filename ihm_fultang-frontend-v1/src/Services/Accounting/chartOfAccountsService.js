import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

/**
 * Service pour la gestion du plan comptable OHADA
 */

const CHART_OF_ACCOUNTS_ENDPOINT = "/chart-of-accounts";

/**
 * Récupère tous les comptes du plan comptable
 * @param {Object} params - Paramètres de filtrage optionnels
 * @returns {Promise} Liste des comptes
 */
export const getAllAccounts = async (params = {}) => {
  try {
    const response = await axiosInstanceAccountant.get(CHART_OF_ACCOUNTS_ENDPOINT, { params });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des comptes:", error);
    throw error;
  }
};

/**
 * Récupère un compte par son ID
 * @param {number} id - ID du compte
 * @returns {Promise} Détails du compte
 */
export const getAccountById = async (id) => {
  try {
    const response = await axiosInstanceAccountant.get(`${CHART_OF_ACCOUNTS_ENDPOINT}/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du compte ${id}:`, error);
    throw error;
  }
};

/**
 * Récupère la hiérarchie complète des comptes
 * @param {string} startDate - Date de début (optionnel)
 * @param {string} endDate - Date de fin (optionnel)
 * @returns {Promise} Hiérarchie des comptes
 */
export const getAccountHierarchy = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await axiosInstanceAccountant.get(`${CHART_OF_ACCOUNTS_ENDPOINT}/hierarchy/`, { params });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de la hiérarchie:", error);
    throw error;
  }
};

/**
 * Récupère uniquement les comptes détaillés (is_detailed=True)
 * @returns {Promise} Liste des comptes détaillés
 */
export const getDetailedAccounts = async () => {
  try {
    const response = await axiosInstanceAccountant.get(`${CHART_OF_ACCOUNTS_ENDPOINT}/detailed_accounts/`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des comptes détaillés:", error);
    throw error;
  }
};

/**
 * Crée un nouveau compte
 * @param {Object} accountData - Données du compte à créer
 * @returns {Promise} Compte créé
 */
export const createAccount = async (accountData) => {
  try {
    const response = await axiosInstanceAccountant.post(`${CHART_OF_ACCOUNTS_ENDPOINT}/`, accountData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la création du compte:", error);
    throw error;
  }
};

/**
 * Met à jour un compte existant
 * @param {number} id - ID du compte
 * @param {Object} accountData - Nouvelles données du compte
 * @returns {Promise} Compte mis à jour
 */
export const updateAccount = async (id, accountData) => {
  try {
    const response = await axiosInstanceAccountant.put(`${CHART_OF_ACCOUNTS_ENDPOINT}/${id}/`, accountData);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du compte ${id}:`, error);
    throw error;
  }
};

/**
 * Met à jour partiellement un compte
 * @param {number} id - ID du compte
 * @param {Object} accountData - Données partielles du compte
 * @returns {Promise} Compte mis à jour
 */
export const patchAccount = async (id, accountData) => {
  try {
    const response = await axiosInstanceAccountant.patch(`${CHART_OF_ACCOUNTS_ENDPOINT}/${id}/`, accountData);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour partielle du compte ${id}:`, error);
    throw error;
  }
};

/**
 * Supprime un compte
 * @param {number} id - ID du compte à supprimer
 * @returns {Promise}
 */
export const deleteAccount = async (id) => {
  try {
    const response = await axiosInstanceAccountant.delete(`${CHART_OF_ACCOUNTS_ENDPOINT}/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la suppression du compte ${id}:`, error);
    throw error;
  }
};

/**
 * Récupère le solde d'un compte sur une période
 * @param {number} id - ID du compte
 * @param {string} startDate - Date de début (format: YYYY-MM-DD)
 * @param {string} endDate - Date de fin (format: YYYY-MM-DD)
 * @returns {Promise} Solde du compte
 */
export const getAccountBalance = async (id, startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await axiosInstanceAccountant.get(`${CHART_OF_ACCOUNTS_ENDPOINT}/${id}/`, { params });
    return response.data.balance;
  } catch (error) {
    console.error(`Erreur lors de la récupération du solde du compte ${id}:`, error);
    throw error;
  }
};

export default {
  getAllAccounts,
  getAccountById,
  getAccountHierarchy,
  getDetailedAccounts,
  createAccount,
  updateAccount,
  patchAccount,
  deleteAccount,
  getAccountBalance,
};
