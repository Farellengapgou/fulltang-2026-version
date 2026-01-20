import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

const API_BASE = "journal-entries";

export const journalEntryService = {
  // Get all entries
  getAllEntries: (params = {}) =>
    axiosInstanceAccountant.get(API_BASE + "/", { params }),

  // Get single entry
  getEntry: (id) => axiosInstanceAccountant.get(`${API_BASE}/${id}/`),

  // Create entry
  createEntry: (data) => axiosInstanceAccountant.post(API_BASE + "/", data),

  // Update entry
  updateEntry: (id, data) =>
    axiosInstanceAccountant.put(`${API_BASE}/${id}/`, data),

  // Delete entry
  deleteEntry: (id) => axiosInstanceAccountant.delete(`${API_BASE}/${id}/`),
  // Post/Validate entry
  postEntry: (id, data) =>
    axiosInstanceAccountant.post(`${API_BASE}/${id}/post/`, data),

  // Reverse entry
  reverseEntry: (id, data) =>
    axiosInstanceAccountant.post(`${API_BASE}/${id}/reverse/`, data),
};
