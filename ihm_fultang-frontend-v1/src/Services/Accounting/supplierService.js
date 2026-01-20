import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

const API_BASE = "suppliers";

export const supplierService = {
  getAllSuppliers: (params = {}) =>
    axiosInstanceAccountant.get(API_BASE + "/", { params }),

  getSupplier: (id) => axiosInstanceAccountant.get(`${API_BASE}/${id}/`),

  createSupplier: (data) => axiosInstanceAccountant.post(API_BASE + "/", data),
  updateSupplier: (id, data) =>
    axiosInstanceAccountant.put(`${API_BASE}/${id}/`, data),

  deleteSupplier: (id) => axiosInstanceAccountant.delete(`${API_BASE}/${id}/`),

  getSupplierBalance: (id) =>
    axiosInstanceAccountant.get(`${API_BASE}/${id}/balance/`),
};
