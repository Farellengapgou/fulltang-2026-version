import axiosInstanceFinancial from "../../Utils/axiosInstancefinancial";

const API_BASE = "/api/v1/accounting/inventory";

export const inventoryService = {
  getAllInventory: (params = {}) =>
    axiosInstanceFinancial.get(API_BASE, { params }),

  getInventoryItem: (id) => axiosInstanceFinancial.get(`${API_BASE}/${id}/`),

  createInventoryItem: (data) => axiosInstanceFinancial.post(API_BASE, data),

  updateInventoryItem: (id, data) =>
    axiosInstanceFinancial.put(`${API_BASE}/${id}/`, data),

  deleteInventoryItem: (id) =>
    axiosInstanceFinancial.delete(`${API_BASE}/${id}/`),

  getLowStockItems: () =>
    axiosInstanceFinancial.get(`${API_BASE}/?low_stock=true`),
};
