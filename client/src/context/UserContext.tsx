import React, { createContext, useState, useEffect, ReactNode } from "react";
import { api } from "../utils/axiosInstance";

interface User {
  username: string;
  avatarUrl: string;
  role: string;
  displayName: string;
}

interface UserContextType {
  user: User | null;
}

// create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// create a custom hook to use the user context
export const useUser = (): UserContextType => {
  // use the useContext hook to access the user context
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

// component wraps the entire application
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  // store the user data in state
  const [user, setUser] = useState<User | null>(null);

  // use effect hook with empty dependency array to run once when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // fetch the user data from the server
        const response = await api.get("/auth/status");
        // set the user data in state
        setUser(response.data.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  // return the provider with the user data in context
  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
};
