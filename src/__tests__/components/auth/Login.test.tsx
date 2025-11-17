/**
 * Tests for Login Component
 * @version 1.0.0
 */

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

  describe("Rendering", () => {
    it("should render login form with all elements", () => {
      render(<Login {...defaultProps} />);

      expect(screen.getByText(/AI English Trainer/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Se connecter/i })).toBeInTheDocument();
      expect(screen.getByText(/Pas encore de compte/i)).toBeInTheDocument();
      expect(screen.getByText(/Mot de passe oublié/i)).toBeInTheDocument();
    });

    it("should render email and password fields as required", () => {
      render(<Login {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Mot de passe/i);

      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });

    it("should have email field with email type", () => {
      render(<Login {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      expect(emailInput).toHaveAttribute("type", "email");
    });

    it("should have password field with password type by default", () => {
      render(<Login {...defaultProps} />);

      const passwordInput = screen.getByLabelText(/Mot de passe/i);
      expect(passwordInput).toHaveAttribute("type", "password");
    });
  });

  describe("User Interactions", () => {
    it("should update email field when user types", async () => {
      const user = userEvent.setup();
      render(<Login {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
      await user.type(emailInput, "test@example.com");

      expect(emailInput.value).toBe("test@example.com");
    });

    it("should update password field when user types", async () => {
      const user = userEvent.setup();
      render(<Login {...defaultProps} />);

      const passwordInput = screen.getByLabelText(/Mot de passe/i) as HTMLInputElement;
      await user.type(passwordInput, "password123");

      expect(passwordInput.value).toBe("password123");
    });

    it("should toggle password visibility when clicking the eye icon", async () => {
      const user = userEvent.setup();
      render(<Login {...defaultProps} />);

      const passwordInput = screen.getByLabelText(/Mot de passe/i);
      expect(passwordInput).toHaveAttribute("type", "password");

      // Find and click the visibility toggle button
      const toggleButton = screen.getByRole("button", { name: /toggle password visibility/i });
      await user.click(toggleButton);

      expect(passwordInput).toHaveAttribute("type", "text");

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("should call onSwitchToSignup when signup link is clicked", async () => {
      const user = userEvent.setup();
      render(<Login {...defaultProps} />);

      const signupLink = screen.getByText(/S'inscrire/i);
      await user.click(signupLink);

      expect(mockOnSwitchToSignup).toHaveBeenCalledTimes(1);
    });

    it("should call onSwitchToForgotPassword when forgot password link is clicked", async () => {
      const user = userEvent.setup();
      render(<Login {...defaultProps} />);

      const forgotPasswordLink = screen.getByText(/Mot de passe oublié/i);
      await user.click(forgotPasswordLink);

      expect(mockOnSwitchToForgotPassword).toHaveBeenCalledTimes(1);
    });
  });

  describe("Form Submission - Success", () => {
    it("should submit form successfully with valid credentials", async () => {
      const user = userEvent.setup();
      const mockResponse = {
        data: {
          success: true,
          token: "test-token-123",
          user: {
            id: "user-123",
            email: "test@example.com",
            firstName: "Test",
            lastName: "User",
          },
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      render(<Login {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /Se connecter/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining("/api/auth/login"), {
          email: "test@example.com",
          password: "password123",
        });
      });

      expect(localStorage.getItem("token")).toBe("test-token-123");
      expect(localStorage.getItem("user")).toBe(JSON.stringify(mockResponse.data.user));
      expect(mockOnSuccess).toHaveBeenCalledWith("test-token-123", mockResponse.data.user);
    });

    it("should show loading state during submission", async () => {
      const user = userEvent.setup();
      let resolveLogin: any;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });

      mockedAxios.post.mockReturnValue(loginPromise as any);

      render(<Login {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /Se connecter/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      // Check loading state
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      // Resolve the promise
      resolveLogin({
        data: {
          success: true,
          token: "token",
          user: { id: "1", email: "test@example.com" },
        },
      });

      await waitFor(() => {
        expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
      });
    });
  });

  describe("Form Submission - Errors", () => {
    it("should display error for wrong password", async () => {
      const user = userEvent.setup();
      mockedAxios.post.mockRejectedValue({
        response: {
          data: {
            message: "Email ou mot de passe incorrect",
          },
        },
      });

      render(<Login {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /Se connecter/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "wrongpassword");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Email ou mot de passe incorrect/i)).toBeInTheDocument();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(localStorage.getItem("token")).toBeNull();
    });

    it("should display error for invalid email", async () => {
      const user = userEvent.setup();
      mockedAxios.post.mockRejectedValue({
        response: {
          data: {
            message: "Email invalide",
          },
        },
      });

      render(<Login {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /Se connecter/i });

      await user.type(emailInput, "invalid-email");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/L'adresse email n'est pas valide/i)).toBeInTheDocument();
      });
    });

    it("should display error for disabled account", async () => {
      const user = userEvent.setup();
      mockedAxios.post.mockRejectedValue({
        response: {
          data: {
            message: "Ce compte a ete desactive",
          },
        },
      });

      render(<Login {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /Se connecter/i });

      await user.type(emailInput, "disabled@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Ce compte a été désactivé/i)).toBeInTheDocument();
      });
    });

    it("should handle validation errors array", async () => {
      const user = userEvent.setup();
      mockedAxios.post.mockRejectedValue({
        response: {
          data: {
            errors: [{ msg: "Invalid email format" }],
          },
        },
      });

      render(<Login {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /Se connecter/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
      });
    });

    it("should handle network errors", async () => {
      const user = userEvent.setup();
      mockedAxios.post.mockRejectedValue({
        message: "Network Error",
      });

      render(<Login {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /Se connecter/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Network Error/i)).toBeInTheDocument();
      });
    });

    it("should handle response with success: false", async () => {
      const user = userEvent.setup();
      mockedAxios.post.mockResolvedValue({
        data: {
          success: false,
          message: "Authentication failed",
        },
      });

      render(<Login {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /Se connecter/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Authentication failed/i)).toBeInTheDocument();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  describe("Error Clearing", () => {
    it("should clear error when submitting form again", async () => {
      const user = userEvent.setup();

      // First submission with error
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: { message: "Wrong password" },
        },
      });

      render(<Login {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /Se connecter/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "wrongpassword");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Wrong password/i)).toBeInTheDocument();
      });

      // Second submission successful
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          token: "token",
          user: { id: "1", email: "test@example.com" },
        },
      });

      await user.clear(passwordInput);
      await user.type(passwordInput, "correctpassword");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/Wrong password/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels for form fields", () => {
      render(<Login {...defaultProps} />);

      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
    });

    it("should allow keyboard navigation and submission", async () => {
      const user = userEvent.setup();
      mockedAxios.post.mockResolvedValue({
        data: {
          success: true,
          token: "token",
          user: { id: "1", email: "test@example.com" },
        },
      });

      render(<Login {...defaultProps} />);

      // Tab to email field and type
      await user.tab();
      await user.keyboard("test@example.com");

      // Tab to password field and type
      await user.tab();
      await user.keyboard("password123");

      // Submit with Enter key
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });
});
