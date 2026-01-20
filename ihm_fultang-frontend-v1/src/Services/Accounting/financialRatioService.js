import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

const API_BASE = "financial-ratios";

export const financialRatioService = {
  getAllRatios: (params = {}) =>
    axiosInstanceAccountant.get(API_BASE + "/", { params }),

  getRatio: (id) => axiosInstanceAccountant.get(`${API_BASE}/${id}/`),

  createRatio: (data) => axiosInstanceAccountant.post(API_BASE + "/", data),
  getRatiosByPeriod: (year, month) =>
    axiosInstanceAccountant.get(
      `${API_BASE}/?period_year=${year}&period_month=${month}`
    ),

  getRatiosByType: (ratioType) =>
    axiosInstanceAccountant.get(`${API_BASE}/?ratio_type=${ratioType}`),

  calculateRatios: (data) =>
    axiosInstanceAccountant.post(`${API_BASE}/calculate/`, data),
};
