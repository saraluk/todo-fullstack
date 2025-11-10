"use client";

import { useAuth } from "@/contexts/AuthContext";
import { AuthForm } from "./AuthForm";
import { TodoList } from "./TodoList";

export function TodosPage() {
  const { isAuthenticated, token, logout, user: authenticatedUser } = useAuth();

  if (!isAuthenticated || !token) {
    return <AuthForm />;
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <div className="w-full max-w-md bg-white shadow-xl rounded-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {authenticatedUser?.username}'s Todos
          </h1>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-3 py-1 text-sm rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        <TodoList />
      </div>
    </main>
  );
}
