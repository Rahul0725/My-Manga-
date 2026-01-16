import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loginUser: (user: User) => void;
  logoutUser: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loginUser: () => {},
  logoutUser: () => {},
  isLoading: true
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('mymanga_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user session");
        localStorage.removeItem('mymanga_user');
      }
    }
    setIsLoading(false);
  }, []);

  const loginUser = (user: User) => {
    setUser(user);
    localStorage.setItem('mymanga_user', JSON.stringify(user));
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('mymanga_user');
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};