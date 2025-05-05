import { useState } from "react";
import { login } from "../services/authService";

const useLogin = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const buttonDisabled = () => {
    return !formData.username || !formData.password;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (buttonDisabled()) return;

    setLoading(true);
    try {
      const response = await login(formData);
      if (response && response.status === 200) {
        window.location.href = "/";
      } else {
        alert(response?.data?.message);
      }
    } catch (error) {
      alert("Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_DOMAIN}/auth/google`;
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    buttonDisabled,
    handleGoogleLogin,
    loading,
  };
};

export default useLogin;
