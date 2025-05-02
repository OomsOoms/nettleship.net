import { api } from "../../../utils/axiosInstance";

export const getUserByUsername = async (username: string) => {
  try {
    const response = await api.get(`/users/${username}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user by username:", error);
    throw error;
  }
};

export const unlinkGoogleAccount = async () => {
  try {
    const response = await api.delete("/auth/google");
    return response.data;
  } catch (error) {
    console.error("Error unlinking Google account:", error);
    throw error;
  }
};

export const requestVerifyEmail = async (email: string) => {
  try {
    const response = await api.post("/users/request-verification", {
      email,
    });
    return response.data;
  } catch (error) {
    console.error("Error requesting email verification:", error);
    throw error;
  }
};

export const updateUser = async (username: string, data: FormData) => {
  console.log(data);
  try {
    const response = await api.patch(`/users/${username}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};
