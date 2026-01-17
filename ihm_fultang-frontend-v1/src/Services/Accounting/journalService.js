import axiosInstanceFinancial from "../../Utils/axiosInstancefinancial";

const API_BASE = "/api/v1/accounting/journals";

export const journalService = {
  getAllJournals: (params = {}) =>
    axiosInstanceFinancial.get(API_BASE, { params }),

  getJournal: (id) => axiosInstanceFinancial.get(`${API_BASE}/${id}/`),

  createJournal: (data) => axiosInstanceFinancial.post(API_BASE, data),
  updateJournal: (id, data) =>
    axiosInstanceFinancial.put(`${API_BASE}/${id}/`, data),

  deleteJournal: (id) => axiosInstanceFinancial.delete(`${API_BASE}/${id}/`),

  getActiveJournals: () =>
    axiosInstanceFinancial.get(`${API_BASE}/?is_active=true`),
};
