import { useState } from 'react';
import { login } from '../services/loginService';

export const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (username, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await login(username, password);
            if (!response.ok) {
                console.log(response);
                return setError('Invalid credentials');
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

    return { handleLogin, loading, error };
};