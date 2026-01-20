import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

const API_BASE = "reports";

export const financialReportService = {
  // Get balance sheet
  getBalanceSheet: (params = {}) =>
    axiosInstanceAccountant.get(`${API_BASE}/balance_sheet/`, { params }),

  // Get income statement
  getIncomeStatement: (params = {}) =>
    axiosInstanceAccountant.get(`${API_BASE}/income_statement/`, { params }),
  // Get trial balance
  getTrialBalance: (params = {}) =>
    axiosInstanceAccountant.get(`${API_BASE}/trial_balance/`, { params }),
};
