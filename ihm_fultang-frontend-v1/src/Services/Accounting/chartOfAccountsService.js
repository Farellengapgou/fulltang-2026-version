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
    console.warn("API Plan Comptable non disponible, utilisation des données simulées.");
    return [
       { id: 1, code: "1011", label: "Capital social", account_type: "Passif", account_class: "1", balance: 10000000, is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
       { id: 2, code: "211", label: "Terrains", account_type: "Actif", account_class: "2", balance: 5000000, is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
       { id: 3, code: "311", label: "Marchandises", account_type: "Actif", account_class: "3", balance: 2500000, is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
       { id: 4, code: "4011", label: "Fournisseurs", account_type: "Passif", account_class: "4", balance: 1200000, is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
       { id: 5, code: "4111", label: "Clients", account_type: "Actif", account_class: "4", balance: 3400000, is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
       { id: 6, code: "521", label: "Banque locale", account_type: "Actif", account_class: "5", balance: 8000000, is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
       { id: 7, code: "571", label: "Caisse siège", account_type: "Actif", account_class: "5", balance: 500000, is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
       { id: 8, code: "6011", label: "Achats de marchandises", account_type: "Charge", account_class: "6", balance: 0, is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
       { id: 9, code: "7011", label: "Ventes de marchandises", account_type: "Produit", account_class: "7", balance: 0, is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
    ];
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
    return { id: id, code: "Simulé", label: "Compte Simulé", account_type: "Actif" };
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
    console.warn("API Hierarchie non disponible, fallback.");
    return [];
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
    console.warn("API Comptes détaillés non disponible, fallback.");
    return [
       { id: 1, code: "1011", label: "Capital social", account_type: "Passif", account_class: "1" },
       { id: 2, code: "211", label: "Terrains", account_type: "Actif", account_class: "2" },
       { id: 3, code: "311", label: "Marchandises", account_type: "Actif", account_class: "3" },
       { id: 6, code: "521", label: "Banque locale", account_type: "Actif", account_class: "5" },
       { id: 7, code: "571", label: "Caisse siège", account_type: "Actif", account_class: "5" },
       { id: 8, code: "6011", label: "Achats de marchandises", account_type: "Charge", account_class: "6" },
       { id: 9, code: "7011", label: "Ventes de marchandises", account_type: "Produit", account_class: "7" },
    ];
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
    console.warn(`Erreur lors de la récupération du solde du compte ${id}: fallback 0`);
    return 0;
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
  
  /**
   * Récupère le Grand Livre (historique) d'un compte
   * @param {number} id - ID du compte
   * @param {Object} params - Paramètres (start_date, end_date)
   * @returns {Promise} Liste des mouvements
   */
  getAccountLedger: async (id, params = {}) => {
    try {
      const response = await axiosInstanceAccountant.get(`${CHART_OF_ACCOUNTS_ENDPOINT}/${id}/ledger/`, { params });
      return response.data;
    } catch (error) {
      console.warn(`Erreur lors de la récupération du grand livre du compte ${id}: fallback simulation`);
      // Simulation data for demo
      return [
          { date: '2024-01-10', journal: 'VE', voucher: 'FACT-001', label: 'Vente marchandise A', debit: 0, credit: 500000, balance: -500000 },
          { date: '2024-01-15', journal: 'BQ', voucher: 'VIR-001', label: 'Paiement client', debit: 500000, credit: 0, balance: 0 }
      ];
    }
  },
};
