"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { User } from "@/types/user";
import {
  clearAuthFromStorage,
  getStoredToken,
  getStoredUser,
  saveAuthToStorage,
} from "@/utils/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook for easier access to the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider(props: AuthProviderProps) {
  const { children } = props;
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const isAuthenticated = !!user && !!token;

  // Function to handle successful login (stores token and user)
  const login = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    saveAuthToStorage(newToken, newUser);
  }, []);

  // Function to handle logout (clears client state and localStorage)
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    clearAuthFromStorage();
  }, []);

  const contextValue: AuthContextType = useMemo(
    () => ({ user, token, isAuthenticated, login, logout }),
    [isAuthenticated, login, logout, token, user]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
