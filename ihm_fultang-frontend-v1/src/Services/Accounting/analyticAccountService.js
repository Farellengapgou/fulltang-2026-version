import axiosInstanceFinancial from "../../Utils/axiosInstancefinancial";

const API_BASE = "/api/v1/accounting/analytic-accounts";

export const analyticAccountService = {
  getAllAnalyticAccounts: (params = {}) =>
    axiosInstanceFinancial.get(API_BASE, { params }),

  getAnalyticAccount: (id) => axiosInstanceFinancial.get(`${API_BASE}/${id}/`),

  createAnalyticAccount: (data) => axiosInstanceFinancial.post(API_BASE, data),

  updateAnalyticAccount: (id, data) =>
    axiosInstanceFinancial.put(`${API_BASE}/${id}/`, data),

  deleteAnalyticAccount: (id) =>
    axiosInstanceFinancial.delete(`${API_BASE}/${id}/`),

  getActiveAnalyticAccounts: () =>
    axiosInstanceFinancial.get(`${API_BASE}/?is_active=true`),
};
