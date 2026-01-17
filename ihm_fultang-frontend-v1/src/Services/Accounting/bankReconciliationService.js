import axiosInstanceFinancial from "../../Utils/axiosInstancefinancial";

const API_BASE = "/api/v1/accounting/bank-reconciliation";

export const bankReconciliationService = {
  getAllReconciliations: (params = {}) =>
    axiosInstanceFinancial.get(API_BASE, { params }),

  getReconciliation: (id) => axiosInstanceFinancial.get(`${API_BASE}/${id}/`),

  createReconciliation: (data) => axiosInstanceFinancial.post(API_BASE, data),
  updateReconciliation: (id, data) =>
    axiosInstanceFinancial.put(`${API_BASE}/${id}/`, data),

  deleteReconciliation: (id) =>
    axiosInstanceFinancial.delete(`${API_BASE}/${id}/`),

  reconcileBank: (id) =>
    axiosInstanceFinancial.post(`${API_BASE}/${id}/reconcile/`, {}),

  getReconciliationsByBankAccount: (bankAccountId) =>
    axiosInstanceFinancial.get(`${API_BASE}/?bank_account=${bankAccountId}`),
};
