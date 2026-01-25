import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

const API_BASE = "";

export const taxService = {
  // Tax Rates
  getAllTaxRates: (params = {}) =>
    axiosInstanceAccountant.get(`${API_BASE}tax-rates/`, { params }),

  getTaxRate: (id) =>
    axiosInstanceAccountant.get(`${API_BASE}tax-rates/${id}/`),

  createTaxRate: (data) =>
    axiosInstanceAccountant.post(`${API_BASE}tax-rates/`, data),
  updateTaxRate: (id, data) =>
    axiosInstanceAccountant.put(`${API_BASE}tax-rates/${id}/`, data),

  deleteTaxRate: (id) =>
    axiosInstanceAccountant.delete(`${API_BASE}tax-rates/${id}/`),

  // Tax Declarations
  getAllTaxDeclarations: (params = {}) =>
    axiosInstanceAccountant.get(`${API_BASE}tax-declarations/`, { params }),

  getTaxDeclaration: (id) =>
    axiosInstanceAccountant.get(`${API_BASE}tax-declarations/${id}/`),
  createTaxDeclaration: (data) =>
    axiosInstanceAccountant.post(`${API_BASE}tax-declarations/`, data),

  updateTaxDeclaration: (id, data) =>
    axiosInstanceAccountant.put(`${API_BASE}tax-declarations/${id}/`, data),

  submitTaxDeclaration: (id) =>
    axiosInstanceAccountant.post(
      `${API_BASE}tax-declarations/${id}/submit/`,
      {}
    ),

  payTaxDeclaration: (id) =>
    axiosInstanceAccountant.post(`${API_BASE}tax-declarations/${id}/pay/`, {}),
};
