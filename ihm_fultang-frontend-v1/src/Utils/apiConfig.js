// src/Utils/apiConfig.js
// Configuration centralisée des endpoints API

const API_BASE_URL = '/api/v1';

export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login/`,
        LOGOUT: `${API_BASE_URL}/auth/logout/`,
        REFRESH: `${API_BASE_URL}/auth/token/refresh/`,
        ME: `${API_BASE_URL}/auth/me/`,
    },

    // Medical endpoints
    MEDICAL: {
        // Patients
        PATIENTS: `${API_BASE_URL}/medical/patient/`,
        PATIENTS_ALL: `${API_BASE_URL}/medical/patient/all/`,

        // Medical Staff
        MEDICAL_STAFF: `${API_BASE_URL}/medical/medical-staff/`,
        DOCTORS: `${API_BASE_URL}/medical/medical-staff/doctors/`,

        // Appointments
        APPOINTMENTS: `${API_BASE_URL}/medical/appointment/`,

        // Medical Folder
        MEDICAL_FOLDER: `${API_BASE_URL}/medical/medical-folder/`,

        // Consultations
        CONSULTATIONS: `${API_BASE_URL}/medical/consultation/`,
    },

    // Accounting endpoints
    ACCOUNTING: {
        BILLS: `${API_BASE_URL}/accounting/bill/`,
        ACCOUNTS: `${API_BASE_URL}/accounting/account/`,
    }
};

// Helper functions
export const getEndpoint = (category, key) => {
    return API_ENDPOINTS[category]?.[key] || '';
};

export default API_ENDPOINTS;