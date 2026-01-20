import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

const API_BASE = "fixed-assets";

export const fixedAssetService = {
  getAllAssets: (params = {}) =>
    axiosInstanceAccountant.get(API_BASE + "/", { params }),

  getAsset: (id) => axiosInstanceAccountant.get(`${API_BASE}/${id}/`),

  createAsset: (data) => axiosInstanceAccountant.post(API_BASE + "/", data),
  updateAsset: (id, data) =>
    axiosInstanceAccountant.put(`${API_BASE}/${id}/`, data),

  deleteAsset: (id) => axiosInstanceAccountant.delete(`${API_BASE}/${id}/`),

  getAssetDepreciation: (id) =>
    axiosInstanceAccountant.get(`${API_BASE}/${id}/depreciation/`),

  getAssetNetValue: (id) =>
    axiosInstanceAccountant.get(`${API_BASE}/${id}/net_value/`),

  getActiveAssets: () =>
    axiosInstanceAccountant.get(`${API_BASE}/?is_active=true`),
};
