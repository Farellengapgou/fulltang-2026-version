import axiosInstanceFinancial from "../../Utils/axiosInstancefinancial";

const API_BASE = "/api/v1/accounting/journal-entries";

export const journalEntryService = {
  // Get all entries
  getAllEntries: (params = {}) =>
    axiosInstanceFinancial.get(API_BASE, { params }),

  // Get single entry
  getEntry: (id) => axiosInstanceFinancial.get(`${API_BASE}/${id}/`),

  // Create entry
  createEntry: (data) => axiosInstanceFinancial.post(API_BASE, data),

  // Update entry
  updateEntry: (id, data) =>
    axiosInstanceFinancial.put(`${API_BASE}/${id}/`, data),

  // Delete entry
  deleteEntry: (id) => axiosInstanceFinancial.delete(`${API_BASE}/${id}/`),
  // Post/Validate entry
  postEntry: (id, data) =>
    axiosInstanceFinancial.post(`${API_BASE}/${id}/post/`, data),

  // Reverse entry
  reverseEntry: (id, data) =>
    axiosInstanceFinancial.post(`${API_BASE}/${id}/reverse/`, data),
};
