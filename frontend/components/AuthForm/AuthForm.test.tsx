/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthForm } from "../AuthForm/AuthForm";
import { API_URLS } from "@/constants/apiUrls";

import "@testing-library/jest-dom";

// 1. Mock the useAuth hook to control authentication state
const mockLogin = jest.fn();
jest.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false,
    user: null,
    token: null,
    logout: jest.fn(),
  }),
}));

// 2. Mock the global fetch function to intercept API calls
global.fetch = jest.fn();

// Helper to reset the fetch mock and define a mock response
const mockFetchResponse = (ok: boolean, data: unknown, status?: number) => {
  const finalStatus = status === undefined ? 200 : status;
  (fetch as jest.Mock).mockResolvedValueOnce({
    ok: ok,
    status: finalStatus,
    json: async () => data,
  } as Response);
};

describe("AuthForm", () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it("renders in Register mode by default and allows switching to Login mode", async () => {
    const user = userEvent.setup();
    render(<AuthForm />);

    // Check initial state (Register mode)
    expect(
      screen.getByRole("heading", { name: /create new account/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /register/i })
    ).toBeInTheDocument();

    // Click the switch button
    await user.click(screen.getByRole("button", { name: /login here/i }));

    // Check switched state (Login mode)
    expect(
      screen.getByRole("heading", { name: /sign in/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("handles successful registration and calls the login function", async () => {
    const user = userEvent.setup();
    render(<AuthForm />);
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const registerButton = screen.getByRole("button", { name: /register/i });

    // 1. Simulate user input
    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "password123");

    // Mock a successful registration response
    const mockUserResponse = {
      id: 101,
      username: "testuser",
      token: "mock-jwt-token",
    };
    mockFetchResponse(true, mockUserResponse, 201);

    // 2. Click the register button
    await user.click(registerButton);

    // 3. Wait for the API call to complete
    await waitFor(() => {
      // Assert fetch was called with correct payload and endpoint
      expect(fetch).toHaveBeenCalledWith(
        `${API_URLS.AUTH}/register`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            username: "testuser",
            password: "password123",
          }),
        })
      );

      // Assert the mockLogin function was called with the returned token and user data
      expect(mockLogin).toHaveBeenCalledWith(mockUserResponse.token, {
        id: mockUserResponse.id,
        username: mockUserResponse.username,
      });

      // Assert the loading state is finished
      expect(registerButton).not.toBeDisabled();
    });
  });

  it("handles login errors and displays an error message", async () => {
    // Start in Login mode
    const user = userEvent.setup();
    render(<AuthForm />);
    await user.click(screen.getByRole("button", { name: /login here/i }));

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole("button", { name: /login/i });

    // 1. Simulate user input
    await user.type(usernameInput, "wronguser");
    await user.type(passwordInput, "wrongpass");

    // Mock a failed login response (e.g., 401 Unauthorized)
    const mockErrorData = { message: "Invalid username or password." };
    mockFetchResponse(false, mockErrorData, 401);

    // 2. Click the login button
    await user.click(loginButton);

    // 3. Wait for the error message to appear
    await waitFor(() => {
      const errorMessage = screen.getByRole("alert");
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent("Invalid username or password.");

      // Assert mockLogin was NOT called
      expect(mockLogin).not.toHaveBeenCalled();

      // Assert the button is not disabled anymore
      expect(loginButton).not.toBeDisabled();
    });
  });
});
