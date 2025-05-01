import { useState, useEffect } from "react";
import { verifyEmail } from "../services/authService";

const useVerifyEmail = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); // For error handling
    const [success, setSuccess] = useState(false); // For success state

    useEffect(() => {
        const verifyEmailToken = async () => {
            setLoading(true);
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const token = urlParams.get("token");

                if (!token) {
                    setError("No token found in URL");
                    setLoading(false);
                    return;
                }

                const response = await verifyEmail(token);
                if (response && response.status === 200) {
                    // if the response is successful, set success to true
                    setSuccess(true);
                } else {
                    alert(response?.data?.message || "Verification failed");
                }
            } catch (error) {
                alert("Something went wrong, please try again.");
            } finally {
                setLoading(false);
            }
        };

        verifyEmailToken();
    }, []); // empty dependency array runs when component mounts

    return {
        loading,
        error,
        success,
    };
};

export default useVerifyEmail;
