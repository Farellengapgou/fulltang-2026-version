import axiosInstanceFinancial from "../../Utils/axiosInstancefinancial";

const API_BASE = "/api/v1/accounting/vat";

export const vatService = {
  getAllVAT: (params = {}) => axiosInstanceFinancial.get(API_BASE, { params }),

  getVAT: (id) => axiosInstanceFinancial.get(`${API_BASE}/${id}/`),

  createVAT: (data) => axiosInstanceFinancial.post(API_BASE, data),
  updateVAT: (id, data) =>
    axiosInstanceFinancial.put(`${API_BASE}/${id}/`, data),

  deleteVAT: (id) => axiosInstanceFinancial.delete(`${API_BASE}/${id}/`),

  getVATByPeriod: (month, year) =>
    axiosInstanceFinancial.get(
      `${API_BASE}/?period_month=${month}&period_year=${year}`
    ),

  declareVAT: (id) =>
    axiosInstanceFinancial.post(`${API_BASE}/${id}/declare/`, {}),
};
