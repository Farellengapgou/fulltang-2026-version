import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

const API_BASE = "periods";

export const accountingPeriodService = {
  getAllPeriods: (params = {}) =>
    axiosInstanceAccountant.get(API_BASE + "/", { params }),

  getPeriod: (id) => axiosInstanceAccountant.get(`${API_BASE}/${id}/`),

  createPeriod: (data) => axiosInstanceAccountant.post(API_BASE + "/", data),
  updatePeriod: (id, data) =>
    axiosInstanceAccountant.put(`${API_BASE}/${id}/`, data),

  deletePeriod: (id) => axiosInstanceAccountant.delete(`${API_BASE}/${id}/`),

  getCurrentPeriod: () =>
    axiosInstanceAccountant.get(`${API_BASE}/current_period/`),
  closePeriod: (id) =>
    axiosInstanceAccountant.post(`${API_BASE}/${id}/close_period/`, {}),

  getPeriodsByYear: (year) =>
    axiosInstanceAccountant.get(`${API_BASE}/?year=${year}`),
};
