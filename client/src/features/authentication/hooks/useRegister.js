import { useState } from 'react';
import { register } from '../services/registerService';

export const useRegister = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleRegister = async (username, email, password, hCaptchaToken) => {
        setLoading(true);
        setError(null);
        try {
            return await register(username, email, password, hCaptchaToken);
        } catch (err) {
            setError(err.message); // These errors will be network errors or server errors
        } finally {
            setLoading(false);
        }
    };

    return { handleRegister, loading, error };
};
