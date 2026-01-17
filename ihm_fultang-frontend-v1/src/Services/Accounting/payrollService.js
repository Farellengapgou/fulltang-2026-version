import axiosInstanceFinancial from "../../Utils/axiosInstancefinancial";

const API_BASE = "/api/v1/accounting/payroll";

export const payrollService = {
  getAllPayrolls: (params = {}) =>
    axiosInstanceFinancial.get(API_BASE, { params }),

  getPayroll: (id) => axiosInstanceFinancial.get(`${API_BASE}/${id}/`),

  createPayroll: (data) => axiosInstanceFinancial.post(API_BASE, data),
  updatePayroll: (id, data) =>
    axiosInstanceFinancial.put(`${API_BASE}/${id}/`, data),

  deletePayroll: (id) => axiosInstanceFinancial.delete(`${API_BASE}/${id}/`),

  approvePayroll: (id) =>
    axiosInstanceFinancial.post(`${API_BASE}/${id}/approve/`, {}),

  payPayroll: (id) => axiosInstanceFinancial.post(`${API_BASE}/${id}/pay/`, {}),

  generatePayslips: (id) =>
    axiosInstanceFinancial.post(`${API_BASE}/${id}/generate_payslips/`, {}),
};
