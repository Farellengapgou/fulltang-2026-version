import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

const API_BASE = "budgets";

export const budgetService = {
  getAllBudgets: (params = {}) =>
    axiosInstanceAccountant.get(API_BASE + "/", { params }),

  getBudget: (id) => axiosInstanceAccountant.get(`${API_BASE}/${id}/`),

  createBudget: (data) => axiosInstanceAccountant.post(API_BASE + "/", data),
  updateBudget: (id, data) =>
    axiosInstanceAccountant.put(`${API_BASE}/${id}/`, data),

  deleteBudget: (id) => axiosInstanceAccountant.delete(`${API_BASE}/${id}/`),

  approveBudget: (id) =>
    axiosInstanceAccountant.post(`${API_BASE}/${id}/approve/`, {}),

  getBudgetLines: (id) =>
    axiosInstanceAccountant.get(`${API_BASE}/${id}/lines/`),

  createBudgetLine: (budgetId, data) =>
    axiosInstanceAccountant.post(`${API_BASE}/${budgetId}/lines/`, data),
};
