import axiosInstanceFinancial from "../../Utils/axiosInstancefinancial";

const API_BASE = "/api/v1/accounting/budgets";

export const budgetService = {
  getAllBudgets: (params = {}) =>
    axiosInstanceFinancial.get(API_BASE, { params }),

  getBudget: (id) => axiosInstanceFinancial.get(`${API_BASE}/${id}/`),

  createBudget: (data) => axiosInstanceFinancial.post(API_BASE, data),
  updateBudget: (id, data) =>
    axiosInstanceFinancial.put(`${API_BASE}/${id}/`, data),

  deleteBudget: (id) => axiosInstanceFinancial.delete(`${API_BASE}/${id}/`),

  approveBudget: (id) =>
    axiosInstanceFinancial.post(`${API_BASE}/${id}/approve/`, {}),

  getBudgetLines: (id) =>
    axiosInstanceFinancial.get(`${API_BASE}/${id}/lines/`),

  createBudgetLine: (budgetId, data) =>
    axiosInstanceFinancial.post(`${API_BASE}/${budgetId}/lines/`, data),
};
