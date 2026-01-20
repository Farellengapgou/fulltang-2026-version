import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

const API_BASE = "inventory";

export const inventoryService = {
  getAllInventory: (params = {}) =>
    axiosInstanceAccountant.get(API_BASE + "/", { params }),

  getInventoryItem: (id) => axiosInstanceAccountant.get(`${API_BASE}/${id}/`),

  createInventoryItem: (data) => axiosInstanceAccountant.post(API_BASE + "/", data),

  updateInventoryItem: (id, data) =>
    axiosInstanceAccountant.put(`${API_BASE}/${id}/`, data),

  deleteInventoryItem: (id) =>
    axiosInstanceAccountant.delete(`${API_BASE}/${id}/`),

  getLowStockItems: () =>
    axiosInstanceAccountant.get(`${API_BASE}/?low_stock=true`),
};
