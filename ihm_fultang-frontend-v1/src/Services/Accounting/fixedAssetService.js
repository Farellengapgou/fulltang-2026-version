import axiosInstanceFinancial from "../../Utils/axiosInstancefinancial";

const API_BASE = "/api/v1/accounting/fixed-assets";

export const fixedAssetService = {
  getAllAssets: (params = {}) =>
    axiosInstanceFinancial.get(API_BASE, { params }),

  getAsset: (id) => axiosInstanceFinancial.get(`${API_BASE}/${id}/`),

  createAsset: (data) => axiosInstanceFinancial.post(API_BASE, data),
  updateAsset: (id, data) =>
    axiosInstanceFinancial.put(`${API_BASE}/${id}/`, data),

  deleteAsset: (id) => axiosInstanceFinancial.delete(`${API_BASE}/${id}/`),

  getAssetDepreciation: (id) =>
    axiosInstanceFinancial.get(`${API_BASE}/${id}/depreciation/`),

  getAssetNetValue: (id) =>
    axiosInstanceFinancial.get(`${API_BASE}/${id}/net_value/`),

  getActiveAssets: () =>
    axiosInstanceFinancial.get(`${API_BASE}/?is_active=true`),
};
