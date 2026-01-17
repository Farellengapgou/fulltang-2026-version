import axiosInstanceFinancial from "../../Utils/axiosInstancefinancial";

const API_BASE = "/api/v1/accounting/chart-of-accounts";

export const chartOfAccountsService = {
  // Get all accounts
  getAllAccounts: (params = {}) =>
    axiosInstanceFinancial.get(API_BASE, { params }),

  // Get single account
  getAccount: (id) => axiosInstanceFinancial.get(`${API_BASE}/${id}/`),

  // Create account
  createAccount: (data) => axiosInstanceFinancial.post(API_BASE, data),

  // Update account
  updateAccount: (id, data) =>
    axiosInstanceFinancial.put(`${API_BASE}/${id}/`, data),

  // Delete account
  deleteAccount: (id) => axiosInstanceFinancial.delete(`${API_BASE}/${id}/`),
  // Get account balance
  getAccountBalance: (id, params = {}) =>
    axiosInstanceFinancial.get(`${API_BASE}/${id}/`, { params }),

  // Get active accounts
  getActiveAccounts: () =>
    axiosInstanceFinancial.get(`${API_BASE}/?is_active=true`),
};
