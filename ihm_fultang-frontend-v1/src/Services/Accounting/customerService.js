import axiosInstanceFinancial from "../../Utils/axiosInstancefinancial";

const API_BASE = "/api/v1/accounting/customers";

export const customerService = {
  getAllCustomers: (params = {}) =>
    axiosInstanceFinancial.get(API_BASE, { params }),

  getCustomer: (id) => axiosInstanceFinancial.get(`${API_BASE}/${id}/`),

  createCustomer: (data) => axiosInstanceFinancial.post(API_BASE, data),
  updateCustomer: (id, data) =>
    axiosInstanceFinancial.put(`${API_BASE}/${id}/`, data),

  deleteCustomer: (id) => axiosInstanceFinancial.delete(`${API_BASE}/${id}/`),

  getActiveCustomers: () =>
    axiosInstanceFinancial.get(`${API_BASE}/active_customers/`),

  getCustomerBalance: (id) =>
    axiosInstanceFinancial.get(`${API_BASE}/${id}/balance/`),
};
