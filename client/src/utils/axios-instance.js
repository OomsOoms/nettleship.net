// Proxying only works in dev so i need to do this
import axios from 'axios';

const axiosInstance = axios.create({ baseURL: import.meta.env.VITE_API_URL });
axiosInstance.interceptors.request.use(
    config => {
        console.log(config);
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
