import axios from "axios";

const createAxiosInstance = () => {
  // Use different base URLs based on environment
  const baseURL = import.meta.env.VITE_BACKEND_DOMAIN;

  const axiosInstance = axios.create({
    baseURL,
    timeout: parseInt("30000", 10),
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  axiosInstance.interceptors.request.use(
    (config) => {
      console.log("[Request]", config);
      return config;
    },
    (error) => Promise.reject(error),
  );
  axiosInstance.interceptors.response.use(
    (response) => {
      console.log("[Response]", response);
      return response;
    },
    (error) => {
      console.error("[Response Error]", error);
      return Promise.reject(error);
    },
  );

  return axiosInstance;
};

export const api = createAxiosInstance();
