import axios from "axios";
import { api } from "../../../utils/axiosInstance";

const handleAxiosError = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response) {
    throw error.response;
  }
  throw error;
};

interface LoginFormData {
  username: string;
  password: string;
}

export const login = async (formData: LoginFormData) => {
  try {
    const response = await api.post("/auth/login", formData);
    return response;
  } catch (error) {
    handleAxiosError(error);
  }
};

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  hCaptchaToken: string;
}

export const register = async (formData: RegisterFormData) => {
  try {
    const response = await api.post("/users", formData);
    return response;
  } catch (error) {
    handleAxiosError(error);
  }
};

interface ResetRequestFormData {
  email: string;
  hCaptchaToken: string;
}

export const requestResetPassword = async (formData: ResetRequestFormData) => {
  try {
    return await api.post("/auth/reset-password", formData);
  } catch (error) {
    handleAxiosError(error);
  }
};

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export const resetPassword = async (
  formData: ResetPasswordFormData,
  token: string | null,
) => {
  try {
    if (!token) throw new Error("No reset token found in URL");

    return await api.put(
      "/auth/reset-password",
      { password: formData.password },
      { headers: { Authorization: `Bearer ${token}` } },
    );
  } catch (error) {
    handleAxiosError(error);
  }
};

export const verifyEmail = async (token: string | null) => {
  try {
    if (!token) throw new Error("No verification token found in URL");

    return await api.post(
      "/users/verify-email",
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
  } catch (error) {
    handleAxiosError(error);
  }
};
