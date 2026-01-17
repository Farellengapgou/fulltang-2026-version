import axiosInstanceFinancial from "../../Utils/axiosInstancefinancial";

const API_BASE = "/api/v1/accounting/reports";

export const financialReportService = {
  // Get balance sheet
  getBalanceSheet: (params = {}) =>
    axiosInstanceFinancial.get(`${API_BASE}/balance_sheet/`, { params }),

  // Get income statement
  getIncomeStatement: (params = {}) =>
    axiosInstanceFinancial.get(`${API_BASE}/income_statement/`, { params }),
  // Get trial balance
  getTrialBalance: (params = {}) =>
    axiosInstanceFinancial.get(`${API_BASE}/trial_balance/`, { params }),
};
