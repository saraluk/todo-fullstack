"use client";

import React, { useCallback, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { API_URLS } from "@/constants/apiUrls";

export function AuthForm() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const endpoint = isRegister ? "register" : "login";

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setErrorMessage("");
      setLoading(true);

      try {
        const response = await fetch(`${API_URLS.AUTH}/${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            password,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || data || `Failed to ${endpoint}`);
        }

        login(data.token, { id: data.id, username: data.username });
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "An unknown error occured."
        );
      } finally {
        setLoading(false);
      }
    },
    [endpoint, login, password, username]
  );

  const title = isRegister ? "Create New Account" : "Sign In";

  return (
    <div className="w-full max-w-sm bg-white shadow-2xl rounded-xl p-8 mx-auto">
      <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
        {title}
      </h2>
      {errorMessage && (
        <div
          className="bg-red-100 border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          {errorMessage}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition duration-150 disabled:bg-gray-400"
        >
          {loading ? "Processing..." : isRegister ? "Register" : "Login"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm">
        {isRegister ? "Already have an account" : "Don't have an account?"}
        <button
          type="button"
          onClick={() => setIsRegister((prev) => !prev)}
          className="text-blue-600 hover:text-blue-800 font-medium ml-1"
        >
          {isRegister ? "Login here" : "Register here"}
        </button>
      </p>
    </div>
  );
}
