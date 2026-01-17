import axiosInstanceFinancial from "../../Utils/axiosInstancefinancial";

const API_BASE = "/api/v1/accounting";

export const taxService = {
  // Tax Rates
  getAllTaxRates: (params = {}) =>
    axiosInstanceFinancial.get(`${API_BASE}/tax-rates/`, { params }),

  getTaxRate: (id) =>
    axiosInstanceFinancial.get(`${API_BASE}/tax-rates/${id}/`),

  createTaxRate: (data) =>
    axiosInstanceFinancial.post(`${API_BASE}/tax-rates/`, data),
  updateTaxRate: (id, data) =>
    axiosInstanceFinancial.put(`${API_BASE}/tax-rates/${id}/`, data),

  deleteTaxRate: (id) =>
    axiosInstanceFinancial.delete(`${API_BASE}/tax-rates/${id}/`),

  // Tax Declarations
  getAllTaxDeclarations: (params = {}) =>
    axiosInstanceFinancial.get(`${API_BASE}/tax-declarations/`, { params }),

  getTaxDeclaration: (id) =>
    axiosInstanceFinancial.get(`${API_BASE}/tax-declarations/${id}/`),
  createTaxDeclaration: (data) =>
    axiosInstanceFinancial.post(`${API_BASE}/tax-declarations/`, data),

  updateTaxDeclaration: (id, data) =>
    axiosInstanceFinancial.put(`${API_BASE}/tax-declarations/${id}/`, data),

  submitTaxDeclaration: (id) =>
    axiosInstanceFinancial.post(
      `${API_BASE}/tax-declarations/${id}/submit/`,
      {}
    ),

  payTaxDeclaration: (id) =>
    axiosInstanceFinancial.post(`${API_BASE}/tax-declarations/${id}/pay/`, {}),
};
