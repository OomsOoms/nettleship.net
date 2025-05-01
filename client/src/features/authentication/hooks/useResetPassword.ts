import { useState } from "react";
import useValidation from "../../../hooks/useValidation";
import { resetPassword } from "../services/authService";

const useResetPassword = () => {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });

    const [loading, setLoading] = useState(false);

    const { validateField } = useValidation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const buttonDisabled = () => {
        return (
            validateField("password", formData.password) ||
            validateField("confirmPassword", formData.confirmPassword, formData.password)
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (buttonDisabled()) return;

        setLoading(true);
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get("token");
            const response = await resetPassword(formData, token);
            if (response && response.status === 200) {
                window.location.href = "/login";
            } else {
                alert(response?.data?.message);
            }
        } catch (error) {
            alert("Something went wrong, please try again.");
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        handleChange,
        handleSubmit,
        buttonDisabled,
        loading,
    }
}

export default useResetPassword;
