// src/components/auth/Login.test.tsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { Login } from "../../../components/auth/Login";
// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

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
    render(<Login {...defaultProps} />);
    const submitButton = screen.getByRole("button", { name: /Se connecter/i });

    await userEvent.click(submitButton);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("should display error for wrong password", async () => {
    (mockedAxios.post as jest.Mock).mockRejectedValueOnce({ response: { data: { message: "Email ou mot de passe incorrect" } } });

    render(<Login {...defaultProps} />);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Mot de passe/i);
    const submitButton = screen.getByRole("button", { name: /Se connecter/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "wrongpassword");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Email ou mot de passe incorrect/i)).toBeInTheDocument();
    });
  });

  // Ajoutez d'autres tests similaires pour les autres fonctionnalités
});
