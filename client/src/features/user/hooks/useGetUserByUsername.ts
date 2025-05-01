import { useState, useEffect } from "react";
import { getUserByUsername } from "../services/userServices";
import { User } from "../pages/ProfilePage"; // Ensure this path is correct

const useGetUserByUsername = (username: string) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const response = await getUserByUsername(username);
                if (response) {
                    setUser(response);
                } else {
                    setError("User not found");
                }
            } catch (error) {
                setError("Something went wrong, please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [username]);

    return { user, loading, error };
};

export default useGetUserByUsername;
