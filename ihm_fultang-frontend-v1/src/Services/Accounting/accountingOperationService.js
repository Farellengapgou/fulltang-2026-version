import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

const API_BASE = "accounting-operations";

export const accountingOperationService = {
  getAllOperations: (params = {}) =>
    axiosInstanceAccountant.get(API_BASE + "/", { params }),

  getOperation: (id) => axiosInstanceAccountant.get(`${API_BASE}/${id}/`),

  createOperation: (data) => axiosInstanceAccountant.post(API_BASE + "/", data),
  updateOperation: (id, data) =>
    axiosInstanceAccountant.put(`${API_BASE}/${id}/`, data),

  deleteOperation: (id) => axiosInstanceAccountant.delete(`${API_BASE}/${id}/`),

  getOperationsByBill: (billId) =>
    axiosInstanceAccountant.get(`${API_BASE}/?bill=${billId}`),

  getOperationsByType: (operationType) =>
    axiosInstanceAccountant.get(`${API_BASE}/?operation_type=${operationType}`),
};
