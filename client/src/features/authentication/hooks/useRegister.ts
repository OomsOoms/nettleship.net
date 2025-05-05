import { useState } from "react";
import useValidation from "../../../hooks/useValidation";
import { register } from "../services/authService";

const useRegister = () => {
  // Regsiter form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    hCaptchaToken: "",
  });

  // Loading state
  const [loading, setLoading] = useState(false);

  const { validateField } = useValidation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToken = (token: string | null) => {
    setFormData({ ...formData, hCaptchaToken: token ?? "" });
  };

  const buttonDisabled = () => {
    return (
      validateField("username", formData.username) ||
      validateField("email", formData.email) ||
      validateField("password", formData.password) ||
      validateField(
        "confirmPassword",
        formData.confirmPassword,
        formData.password,
      ) ||
      !formData.hCaptchaToken
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (buttonDisabled()) return;

    setLoading(true);
    try {
      const response = await register(formData);
      if (response && response.status === 201) {
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
    handleToken,
    handleSubmit,
    buttonDisabled,
    loading,
    handleGoogleLogin,
  };
};

export default useRegister;
