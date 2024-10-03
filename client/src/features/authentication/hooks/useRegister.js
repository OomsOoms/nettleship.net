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
            if (response.status === 409) { // Username or email confict
                setError(response.data.message);
            } else if (response.status === 201) {
                window.location.href = '/';
            } else {
                // Handle other errors like server errors or bad request errors
                setError('An error occurred');
            }
        } catch (err) {
            setError(err.message); // These errors will be network errors or server errors
        } finally {
            setLoading(false);
        }
    };

    return { handleRegister, loading, error };
};
