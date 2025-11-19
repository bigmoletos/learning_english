// src/components/auth/Login.test.tsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Login } from "../../../components/auth/Login";
import { loginUser } from "../../../firebase/authService";

// Mock Firebase Auth Service
jest.mock("../../../firebase/authService");
const mockedLoginUser = loginUser as jest.MockedFunction<typeof loginUser>;

describe("Login Component", () => {
  const mockOnSuccess = jest.fn();
  const mockOnSwitchToSignup = jest.fn();
  const mockOnSwitchToForgotPassword = jest.fn();

  const defaultProps = {
    onSuccess: mockOnSuccess,
    onSwitchToSignup: mockOnSwitchToSignup,
    onSwitchToForgotPassword: mockOnSwitchToForgotPassword,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("should render all form fields", () => {
    render(<Login {...defaultProps} />);
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Se connecter/i })).toBeInTheDocument();
  });

  it("should toggle password visibility when clicking the eye icon", async () => {
    render(<Login {...defaultProps} />);
    const passwordInput = screen.getByLabelText(/Mot de passe/i);
    const toggleButton = screen.getByRole("button", { name: /toggle password visibility/i });

    expect(passwordInput).toHaveAttribute("type", "password");
    await userEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");
    await userEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });
  it("should show loading state during submission", async () => {
    // Mock a delayed response to see loading state
    mockedLoginUser.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ success: false, message: "Error" }), 100);
        })
    );

    render(<Login {...defaultProps} />);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Mot de passe/i);
    const submitButton = screen.getByRole("button", { name: /Se connecter/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password");
    await userEvent.click(submitButton);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("should display error for wrong password", async () => {
    // Mock loginUser to throw an error with auth/invalid-credential code
    mockedLoginUser.mockRejectedValueOnce({
      code: "auth/invalid-credential",
      message: "Email ou mot de passe incorrect",
    });

    render(<Login {...defaultProps} />);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Mot de passe/i);
    const submitButton = screen.getByRole("button", { name: /Se connecter/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "wrongpassword");
    await userEvent.click(submitButton);

    await waitFor(
      () => {
        expect(
          screen.getByText(/Email ou mot de passe incorrect. Vérifiez vos identifiants ou créez un compte./i)
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  // Ajoutez d'autres tests similaires pour les autres fonctionnalités
});
