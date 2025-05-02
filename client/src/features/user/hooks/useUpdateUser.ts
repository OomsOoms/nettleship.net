import { updateUser } from "../services/userServices";

const useUpdateUser = () => {
  const updateUserData = async (username: string, data: FormData) => {
    try {
      await updateUser(username, data);
    } catch (error) {
      console.error("Error updating user data:", error);
      throw error; // Re-throw the error to handle it in the component
    }
  };

  return { updateUserData };
};

export default useUpdateUser;
