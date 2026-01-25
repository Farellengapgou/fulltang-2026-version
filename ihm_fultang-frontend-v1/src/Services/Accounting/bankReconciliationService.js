import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

const API_BASE = "bank-reconciliation";

export const bankReconciliationService = {
  getAllReconciliations: (params = {}) =>
    axiosInstanceAccountant.get(API_BASE + "/", { params }),

  getReconciliation: (id) => axiosInstanceAccountant.get(`${API_BASE}/${id}/`),

  createReconciliation: (data) => axiosInstanceAccountant.post(API_BASE + "/", data),
  updateReconciliation: (id, data) =>
    axiosInstanceAccountant.put(`${API_BASE}/${id}/`, data),

  deleteReconciliation: (id) =>
    axiosInstanceAccountant.delete(`${API_BASE}/${id}/`),

  reconcileBank: (id) =>
    axiosInstanceAccountant.post(`${API_BASE}/${id}/reconcile/`, {}),

  getReconciliationsByBankAccount: (bankAccountId) =>
    axiosInstanceAccountant.get(`${API_BASE}/?bank_account=${bankAccountId}`),
};
