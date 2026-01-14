import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

/**
 * Service pour la gestion des journaux comptables
 */

const JOURNAL_ENDPOINT = "/journals";

/**
 * Récupère tous les journaux comptables
 * @param {Object} params - Paramètres de filtrage optionnels
 * @returns {Promise} Liste des journaux
 */
export const getAllJournals = async (params = {}) => {
  try {
    const response = await axiosInstanceAccountant.get(JOURNAL_ENDPOINT, { params });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des journaux:", error);
    throw error;
  }
};

/**
 * Récupère un journal par son ID
 * @param {number} id - ID du journal
 * @returns {Promise} Détails du journal
 */
export const getJournalById = async (id) => {
  try {
    const response = await axiosInstanceAccountant.get(`${JOURNAL_ENDPOINT}/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du journal ${id}:`, error);
    throw error;
  }
};

/**
 * Récupère les écritures d'un journal spécifique
 * @param {number} journalId - ID du journal
 * @param {Object} filters - Filtres optionnels (date_from, date_to, state, etc.)
 * @returns {Promise} Liste des écritures du journal
 */
export const getJournalEntries = async (journalId, filters = {}) => {
  try {
    // On utilise le endpoint des écritures avec filtre sur le journal
    const params = { ...filters, journal: journalId };
    const response = await axiosInstanceAccountant.get("/journal-entries", { params });
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des écritures du journal ${journalId}:`, error);
    throw error;
  }
};

/**
 * Crée un nouveau journal
 * @param {Object} journalData - Données du journal à créer
 * @returns {Promise} Journal créé
 */
export const createJournal = async (journalData) => {
  try {
    const response = await axiosInstanceAccountant.post(`${JOURNAL_ENDPOINT}/`, journalData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la création du journal:", error);
    throw error;
  }
};

/**
 * Met à jour un journal existant
 * @param {number} id - ID du journal
 * @param {Object} journalData - Nouvelles données du journal
 * @returns {Promise} Journal mis à jour
 */
export const updateJournal = async (id, journalData) => {
  try {
    const response = await axiosInstanceAccountant.put(`${JOURNAL_ENDPOINT}/${id}/`, journalData);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du journal ${id}:`, error);
    throw error;
  }
};

/**
 * Met à jour partiellement un journal
 * @param {number} id - ID du journal
 * @param {Object} journalData - Données partielles du journal
 * @returns {Promise} Journal mis à jour
 */
export const patchJournal = async (id, journalData) => {
  try {
    const response = await axiosInstanceAccountant.patch(`${JOURNAL_ENDPOINT}/${id}/`, journalData);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour partielle du journal ${id}:`, error);
    throw error;
  }
};

/**
 * Supprime un journal
 * @param {number} id - ID du journal à supprimer
 * @returns {Promise}
 */
export const deleteJournal = async (id) => {
  try {
    const response = await axiosInstanceAccountant.delete(`${JOURNAL_ENDPOINT}/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la suppression du journal ${id}:`, error);
    throw error;
  }
};

export default {
  getAllJournals,
  getJournalById,
  getJournalEntries,
  createJournal,
  updateJournal,
  patchJournal,
  deleteJournal,
};
