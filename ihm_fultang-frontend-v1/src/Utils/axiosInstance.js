import axios from "axios";



/*const ErrorInterceptor = (axiosInstance) => {

    axiosInstance.interceptors.response.use(
        res => {
            return res;
        },
        error => {
            console.group("Error");
            console.log(error);
            console.groupEnd();

            return error.response
        }
    )
}
*/

const axiosInstance = axios.create(
    {
    baseURL: import.meta.env.VITE_BACKEND_FULTANG_API_BASE_MEDICALSTAFF_URL,
    headers:
        {
        'Content-Type': 'application/json'
        }
    }
);

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token_key_fultang");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        delete config.headers.Authorization;
    }
    return config;
});

//ErrorInterceptor(axiosInstance);
export default axiosInstance;
