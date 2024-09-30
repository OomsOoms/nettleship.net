import { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

// eslint-disable-next-line react/prop-types
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await fetch('https://api.nettleship.net/api/auth/status', {
                    credentials: 'include', // Include cookies if needed
                });
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                }
                if (!response.ok) {
                    setUser(null);
                }
            } catch (error) {
                console.error('Failed to check auth status:', error);
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