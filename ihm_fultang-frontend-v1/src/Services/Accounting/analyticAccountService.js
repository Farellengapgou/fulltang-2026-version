import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

const API_BASE = "analytic-accounts";

export const analyticAccountService = {
  getAllAnalyticAccounts: (params = {}) =>
    axiosInstanceAccountant.get(API_BASE + "/", { params }),

  getAnalyticAccount: (id) => axiosInstanceAccountant.get(`${API_BASE}/${id}/`),

  createAnalyticAccount: (data) => axiosInstanceAccountant.post(API_BASE + "/", data),

  updateAnalyticAccount: (id, data) =>
    axiosInstanceAccountant.put(`${API_BASE}/${id}/`, data),

  deleteAnalyticAccount: (id) =>
    axiosInstanceAccountant.delete(`${API_BASE}/${id}/`),

  getActiveAnalyticAccounts: () =>
    axiosInstanceAccountant.get(`${API_BASE}/?is_active=true`),
};
