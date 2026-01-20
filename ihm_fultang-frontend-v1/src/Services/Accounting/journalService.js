import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

const API_BASE = "journals";

export const journalService = {
  getAllJournals: (params = {}) =>
    axiosInstanceAccountant.get(API_BASE + "/", { params }),

  getJournal: (id) => axiosInstanceAccountant.get(`${API_BASE}/${id}/`),

  createJournal: (data) => axiosInstanceAccountant.post(API_BASE + "/", data),
  updateJournal: (id, data) =>
    axiosInstanceAccountant.put(`${API_BASE}/${id}/`, data),

  deleteJournal: (id) => axiosInstanceAccountant.delete(`${API_BASE}/${id}/`),

  getActiveJournals: () =>
    axiosInstanceAccountant.get(`${API_BASE}/?is_active=true`),
};
