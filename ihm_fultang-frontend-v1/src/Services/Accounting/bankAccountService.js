import axiosInstanceFinancial from "../../Utils/axiosInstancefinancial";

const API_BASE = "/api/v1/accounting/bank-accounts";

export const bankAccountService = {
  getAllBankAccounts: (params = {}) =>
    axiosInstanceFinancial.get(API_BASE, { params }),

  getBankAccount: (id) => axiosInstanceFinancial.get(`${API_BASE}/${id}/`),

  createBankAccount: (data) => axiosInstanceFinancial.post(API_BASE, data),
  updateBankAccount: (id, data) =>
    axiosInstanceFinancial.put(`${API_BASE}/${id}/`, data),

  deleteBankAccount: (id) =>
    axiosInstanceFinancial.delete(`${API_BASE}/${id}/`),

  getActiveBankAccounts: () =>
    axiosInstanceFinancial.get(`${API_BASE}/?is_active=true`),
};
