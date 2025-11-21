const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const API_URLS = {
  TODOS: `${API_BASE_URL}/api/todos`,
  AUTH: `${API_BASE_URL}/api/auth`,
} as const;
