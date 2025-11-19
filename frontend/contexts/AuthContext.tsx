"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useReducer,
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

type AuthState = {
  user: User | null;
  token: string | null;
};

type AuthAction =
  | { type: "SET_AUTH"; payload: { token: string; user: User } }
  | { type: "CLEAR_AUTH" };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_AUTH":
      return {
        token: action.payload.token,
        user: action.payload.user,
      };
    case "CLEAR_AUTH":
      return {
        token: null,
        user: null,
      };
    default:
      return state;
  }
}

export function AuthProvider(props: AuthProviderProps) {
  const { children } = props;

  const [authState, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
  });

  const isAuthenticated = !!authState.user && !!authState.token;

  // Restore auth from localStorage after initial render (client-side only)
  // useLayoutEffect runs synchronously after render but before paint, avoiding hydration issues
  useLayoutEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();
    if (storedToken && storedUser) {
      dispatch({
        type: "SET_AUTH",
        payload: { token: storedToken, user: storedUser },
      });
    }
  }, []);

  // Function to handle successful login (stores token and user)
  const login = useCallback((newToken: string, newUser: User) => {
    dispatch({ type: "SET_AUTH", payload: { token: newToken, user: newUser } });
    saveAuthToStorage(newToken, newUser);
  }, []);

  // Function to handle logout (clears client state and localStorage)
  const logout = useCallback(() => {
    dispatch({ type: "CLEAR_AUTH" });
    clearAuthFromStorage();
  }, []);

  const contextValue: AuthContextType = useMemo(
    () => ({
      user: authState.user,
      token: authState.token,
      isAuthenticated,
      login,
      logout,
    }),
    [authState.user, authState.token, isAuthenticated, login, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
