import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

const API_BASE = "payroll";

export const payrollService = {
  getAllPayrolls: (params = {}) =>
    axiosInstanceAccountant.get(API_BASE + "/", { params }),

  getPayroll: (id) => axiosInstanceAccountant.get(`${API_BASE}/${id}/`),

  createPayroll: (data) => axiosInstanceAccountant.post(API_BASE + "/", data),
  updatePayroll: (id, data) =>
    axiosInstanceAccountant.put(`${API_BASE}/${id}/`, data),

  deletePayroll: (id) => axiosInstanceAccountant.delete(`${API_BASE}/${id}/`),

  approvePayroll: (id) =>
    axiosInstanceAccountant.post(`${API_BASE}/${id}/approve/`, {}),

  payPayroll: (id) => axiosInstanceAccountant.post(`${API_BASE}/${id}/pay/`, {}),

  generatePayslips: (id) =>
    axiosInstanceAccountant.post(`${API_BASE}/${id}/generate_payslips/`, {}),
};
