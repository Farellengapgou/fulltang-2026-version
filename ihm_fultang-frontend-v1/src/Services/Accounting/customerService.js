import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

const API_BASE = "customers";

export const customerService = {
  getAllCustomers: (params = {}) =>
    axiosInstanceAccountant.get(API_BASE + "/", { params }),

  getCustomer: (id) => axiosInstanceAccountant.get(`${API_BASE}/${id}/`),

  createCustomer: (data) => axiosInstanceAccountant.post(API_BASE + "/", data),
  updateCustomer: (id, data) =>
    axiosInstanceAccountant.put(`${API_BASE}/${id}/`, data),

  deleteCustomer: (id) => axiosInstanceAccountant.delete(`${API_BASE}/${id}/`),

  getActiveCustomers: () =>
    axiosInstanceAccountant.get(`${API_BASE}/active_customers/`),

  getCustomerBalance: (id) =>
    axiosInstanceAccountant.get(`${API_BASE}/${id}/balance/`),
};
