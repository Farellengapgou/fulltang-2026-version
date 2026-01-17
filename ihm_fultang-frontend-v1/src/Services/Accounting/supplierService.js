import axiosInstanceFinancial from "../../Utils/axiosInstancefinancial";

const API_BASE = "/api/v1/accounting/suppliers";

export const supplierService = {
  getAllSuppliers: (params = {}) =>
    axiosInstanceFinancial.get(API_BASE, { params }),

  getSupplier: (id) => axiosInstanceFinancial.get(`${API_BASE}/${id}/`),

  createSupplier: (data) => axiosInstanceFinancial.post(API_BASE, data),
  updateSupplier: (id, data) =>
    axiosInstanceFinancial.put(`${API_BASE}/${id}/`, data),

  deleteSupplier: (id) => axiosInstanceFinancial.delete(`${API_BASE}/${id}/`),

  getSupplierBalance: (id) =>
    axiosInstanceFinancial.get(`${API_BASE}/${id}/balance/`),
};
