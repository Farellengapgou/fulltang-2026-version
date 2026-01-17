import axiosInstanceFinancial from "../../Utils/axiosInstancefinancial";

const API_BASE = "/api/v1/accounting/periods";

export const accountingPeriodService = {
  getAllPeriods: (params = {}) =>
    axiosInstanceFinancial.get(API_BASE, { params }),

  getPeriod: (id) => axiosInstanceFinancial.get(`${API_BASE}/${id}/`),

  createPeriod: (data) => axiosInstanceFinancial.post(API_BASE, data),
  updatePeriod: (id, data) =>
    axiosInstanceFinancial.put(`${API_BASE}/${id}/`, data),

  deletePeriod: (id) => axiosInstanceFinancial.delete(`${API_BASE}/${id}/`),

  getCurrentPeriod: () =>
    axiosInstanceFinancial.get(`${API_BASE}/current_period/`),
  closePeriod: (id) =>
    axiosInstanceFinancial.post(`${API_BASE}/${id}/close_period/`, {}),

  getPeriodsByYear: (year) =>
    axiosInstanceFinancial.get(`${API_BASE}/?year=${year}`),
};
