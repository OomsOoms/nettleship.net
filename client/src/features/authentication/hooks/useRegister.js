import { useState } from 'react';
import { register } from '../services/registerService';

export const useRegister = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleRegister = async (username, email, password, hCaptchaToken) => {
        setLoading(true);
        setError(null);
        try {
            const response = await register(username, email, password, hCaptchaToken);
            if (!response.ok) {
                return response;
            }
            if (response.ok) {
                window.location.href = '/';
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { handleRegister, loading, error };
};