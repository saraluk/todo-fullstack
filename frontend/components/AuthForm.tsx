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
    <div>
      <h2>{title}</h2>
      {errorMessage && <p>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button>
          {loading ? "Processing..." : isRegister ? "Register" : "Login"}
        </button>
      </form>
      <p>
        {isRegister ? "Already have an account" : "Don't have an account?"}
        <button type="button" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "Login here" : "Register here"}
        </button>
      </p>
    </div>
  );
}
