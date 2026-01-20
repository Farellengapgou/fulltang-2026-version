import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

const API_BASE = "bank-accounts";

export const bankAccountService = {
  getAllBankAccounts: (params = {}) =>
    axiosInstanceAccountant.get(API_BASE + "/", { params }),

  getBankAccount: (id) => axiosInstanceAccountant.get(`${API_BASE}/${id}/`),

  createBankAccount: (data) => axiosInstanceAccountant.post(API_BASE + "/", data),
  updateBankAccount: (id, data) =>
    axiosInstanceAccountant.put(`${API_BASE}/${id}/`, data),

  deleteBankAccount: (id) =>
    axiosInstanceAccountant.delete(`${API_BASE}/${id}/`),

  getActiveBankAccounts: () =>
    axiosInstanceAccountant.get(`${API_BASE}/?is_active=true`),
};
