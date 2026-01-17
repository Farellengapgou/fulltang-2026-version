import axiosInstanceFinancial from "../../Utils/axiosInstancefinancial";

const API_BASE = "/api/v1/accounting/accounting-operations";

export const accountingOperationService = {
  getAllOperations: (params = {}) =>
    axiosInstanceFinancial.get(API_BASE, { params }),

  getOperation: (id) => axiosInstanceFinancial.get(`${API_BASE}/${id}/`),

  createOperation: (data) => axiosInstanceFinancial.post(API_BASE, data),
  updateOperation: (id, data) =>
    axiosInstanceFinancial.put(`${API_BASE}/${id}/`, data),

  deleteOperation: (id) => axiosInstanceFinancial.delete(`${API_BASE}/${id}/`),

  getOperationsByBill: (billId) =>
    axiosInstanceFinancial.get(`${API_BASE}/?bill=${billId}`),

  getOperationsByType: (operationType) =>
    axiosInstanceFinancial.get(`${API_BASE}/?operation_type=${operationType}`),
};
