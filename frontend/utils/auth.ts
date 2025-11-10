import { User } from "@/types/user";

const STORED_TOKEN_KEY = "token";
const STORED_USER_KEY = "user";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORED_TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;

  try {
    const storedUser = localStorage.getItem(STORED_USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Failed to parse stored user data:", error);
    localStorage.removeItem(STORED_USER_KEY);
    return null;
  }
}

export function saveAuthToStorage(token: string, user: User): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORED_TOKEN_KEY, token);
  localStorage.setItem(STORED_USER_KEY, JSON.stringify(user));
}

export function clearAuthFromStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORED_TOKEN_KEY);
  localStorage.removeItem(STORED_USER_KEY);
}
