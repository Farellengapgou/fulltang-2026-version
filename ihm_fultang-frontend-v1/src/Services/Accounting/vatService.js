import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

const API_BASE = "vat";

export const vatService = {
  getAllVAT: (params = {}) => axiosInstanceAccountant.get(API_BASE + "/", { params }),

  getVAT: (id) => axiosInstanceAccountant.get(`${API_BASE}/${id}/`),

  createVAT: (data) => axiosInstanceAccountant.post(API_BASE + "/", data),
  updateVAT: (id, data) =>
    axiosInstanceAccountant.put(`${API_BASE}/${id}/`, data),

  deleteVAT: (id) => axiosInstanceAccountant.delete(`${API_BASE}/${id}/`),

  getVATByPeriod: (month, year) =>
    axiosInstanceAccountant.get(
      `${API_BASE}/?period_month=${month}&period_year=${year}`
    ),

  declareVAT: (id) =>
    axiosInstanceAccountant.post(`${API_BASE}/${id}/declare/`, {}),
};
