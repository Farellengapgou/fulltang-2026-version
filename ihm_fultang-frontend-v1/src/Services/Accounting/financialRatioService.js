import axiosInstanceFinancial from "../../Utils/axiosInstancefinancial";

const API_BASE = "/api/v1/accounting/financial-ratios";

export const financialRatioService = {
  getAllRatios: (params = {}) =>
    axiosInstanceFinancial.get(API_BASE, { params }),

  getRatio: (id) => axiosInstanceFinancial.get(`${API_BASE}/${id}/`),

  createRatio: (data) => axiosInstanceFinancial.post(API_BASE, data),
  getRatiosByPeriod: (year, month) =>
    axiosInstanceFinancial.get(
      `${API_BASE}/?period_year=${year}&period_month=${month}`
    ),

  getRatiosByType: (ratioType) =>
    axiosInstanceFinancial.get(`${API_BASE}/?ratio_type=${ratioType}`),

  calculateRatios: (data) =>
    axiosInstanceFinancial.post(`${API_BASE}/calculate/`, data),
};
