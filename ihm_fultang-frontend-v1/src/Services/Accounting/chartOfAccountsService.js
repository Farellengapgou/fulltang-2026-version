import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

const API_BASE = "chart-of-accounts";

export const chartOfAccountsService = {
  // Get all accounts
  getAllAccounts: (params = {}) =>
    axiosInstanceAccountant.get(API_BASE + "/", { params }),

  // Get single account
  getAccount: (id) => axiosInstanceAccountant.get(`${API_BASE}/${id}/`),

  // Create account
  createAccount: (data) => axiosInstanceAccountant.post(API_BASE + "/", data),

  // Update account
  updateAccount: (id, data) =>
    axiosInstanceAccountant.put(`${API_BASE}/${id}/`, data),

  // Delete account
  deleteAccount: (id) => axiosInstanceAccountant.delete(`${API_BASE}/${id}/`),
  // Get account balance
  getAccountBalance: (id, params = {}) =>
    axiosInstanceAccountant.get(`${API_BASE}/${id}/`, { params }),

  // Get active accounts
  getActiveAccounts: () =>
    axiosInstanceAccountant.get(`${API_BASE}/?is_active=true`),
};
