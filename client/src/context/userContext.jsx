import { createContext, useState, useEffect } from 'react';
import axiosInstance from "../utils/axios-instance";

export const UserContext = createContext();

// eslint-disable-next-line react/prop-types
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await axiosInstance.get('/api/auth/status', {
                    withCredentials: true,
                });
                console.log(response);
                if (response.status === 200) {
                    const data = response.data;
                    setUser(data);
                } else {
                    console.log('User:');
                    setUser(null);
                }
            } catch (error) {
                if (error.response.status === 401) {
                    setUser(null);
                } else {
                    console.error('Failed to check auth status');
                }
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    return (
        <UserContext.Provider value={{ user, loading }}>
            {children}
        </UserContext.Provider>
    );
};