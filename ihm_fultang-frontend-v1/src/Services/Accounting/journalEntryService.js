import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

/**
 * Service pour la gestion des écritures comptables
 */

const JOURNAL_ENTRY_ENDPOINT = "/journal-entries";

/**
 * Récupère toutes les écritures comptables avec filtres optionnels
 * @param {Object} filters - Filtres (journal, state, date_from, date_to, etc.)
 * @returns {Promise} Liste des écritures
 */
export const getAllEntries = async (filters = {}) => {
  try {
    const response = await axiosInstanceAccountant.get(JOURNAL_ENTRY_ENDPOINT, { params: filters });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des écritures:", error);
    throw error;
  }
};

/**
 * Récupère une écriture par son ID
 * @param {number} id - ID de l'écriture
 * @returns {Promise} Détails de l'écriture
 */
export const getEntryById = async (id) => {
  try {
    const response = await axiosInstanceAccountant.get(`${JOURNAL_ENTRY_ENDPOINT}/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'écriture ${id}:`, error);
    throw error;
  }
};

/**
 * Récupère les écritures en brouillon
 * @returns {Promise} Liste des écritures en brouillon
 */
export const getDraftEntries = async () => {
  try {
    const response = await axiosInstanceAccountant.get(`${JOURNAL_ENTRY_ENDPOINT}/draft_entries/`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des écritures en brouillon:", error);
    throw error;
  }
};

/**
 * Crée une nouvelle écriture comptable
 * @param {Object} entryData - Données de l'écriture
 * @returns {Promise} Écriture créée
 */
export const createEntry = async (entryData) => {
  try {
    const response = await axiosInstanceAccountant.post(`${JOURNAL_ENTRY_ENDPOINT}/`, entryData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la création de l'écriture:", error);
    throw error;
  }
};

/**
 * Met à jour une écriture existante
 * @param {number} id - ID de l'écriture
 * @param {Object} entryData - Nouvelles données de l'écriture
 * @returns {Promise} Écriture mise à jour
 */
export const updateEntry = async (id, entryData) => {
  try {
    const response = await axiosInstanceAccountant.put(`${JOURNAL_ENTRY_ENDPOINT}/${id}/`, entryData);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'écriture ${id}:`, error);
    throw error;
  }
};

/**
 * Met à jour partiellement une écriture
 * @param {number} id - ID de l'écriture
 * @param {Object} entryData - Données partielles de l'écriture
 * @returns {Promise} Écriture mise à jour
 */
export const patchEntry = async (id, entryData) => {
  try {
    const response = await axiosInstanceAccountant.patch(`${JOURNAL_ENTRY_ENDPOINT}/${id}/`, entryData);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour partielle de l'écriture ${id}:`, error);
    throw error;
  }
};

/**
 * Supprime une écriture (uniquement si en brouillon)
 * @param {number} id - ID de l'écriture à supprimer
 * @returns {Promise}
 */
export const deleteEntry = async (id) => {
  try {
    const response = await axiosInstanceAccountant.delete(`${JOURNAL_ENTRY_ENDPOINT}/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'écriture ${id}:`, error);
    throw error;
  }
};

/**
 * Valide une écriture comptable (passe de DRAFT à POSTED)
 * @param {number} id - ID de l'écriture à valider
 * @returns {Promise} Écriture validée
 */
export const validateEntry = async (id) => {
  try {
    const response = await axiosInstanceAccountant.post(`${JOURNAL_ENTRY_ENDPOINT}/${id}/validate_entry/`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la validation de l'écriture ${id}:`, error);
    throw error;
  }
};

/**
 * Contre-passe une écriture (crée une écriture inverse)
 * @param {number} id - ID de l'écriture à contre-passer
 * @param {string} description - Description de la contre-passation
 * @returns {Promise} Nouvelle écriture de contre-passation
 */
export const reverseEntry = async (id, description = null) => {
  try {
    const payload = description ? { description } : {};
    const response = await axiosInstanceAccountant.post(`${JOURNAL_ENTRY_ENDPOINT}/${id}/reverse/`, payload);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la contre-passation de l'écriture ${id}:`, error);
    throw error;
  }
};

export default {
  getAllEntries,
  getEntryById,
  getDraftEntries,
  createEntry,
  updateEntry,
  patchEntry,
  deleteEntry,
  validateEntry,
  reverseEntry,
};
