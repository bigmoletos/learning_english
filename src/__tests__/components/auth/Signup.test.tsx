/**
 * Tests for Signup Component
 * @version 1.0.0
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { Signup } from "../../../components/auth/Signup";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock VerifyEmail component
jest.mock("../../../components/auth/VerifyEmail", () => ({
  VerifyEmail: ({ email, onSwitchToLogin }: any) => (
    <div data-testid="verify-email">
      <div>Verify Email: {email}</div>
      <button onClick={onSwitchToLogin}>Back to Login</button>
    </div>
  ),
}));

describe("Signup Component", () => {
  const mockOnSuccess = jest.fn();
  const mockOnSwitchToLogin = jest.fn();

  const defaultProps = {
    onSuccess: mockOnSuccess,
    onSwitchToLogin: mockOnSwitchToLogin,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Clear console mocks
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("should render signup form with all elements", () => {
      render(<Signup {...defaultProps} />);

      expect(screen.getByText(/Créer un compte/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Prénom/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Nom$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Confirmer le mot de passe/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /S'inscrire/i })).toBeInTheDocument();
      expect(screen.getByText(/Déjà un compte/i)).toBeInTheDocument();
    });

    it("should render password helper text", () => {
      render(<Signup {...defaultProps} />);

      expect(
        screen.getByText(/Min. 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial/i)
      ).toBeInTheDocument();
    });

    it("should have required fields marked as required", () => {
      render(<Signup {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/^Mot de passe$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirmer le mot de passe/i);

      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
      expect(confirmPasswordInput).toBeRequired();
    });
  });

  describe("User Interactions", () => {
    it("should update all form fields when user types", async () => {
      const user = userEvent.setup();
      render(<Signup {...defaultProps} />);

      const firstNameInput = screen.getByLabelText(/Prénom/i) as HTMLInputElement;
      const lastNameInput = screen.getByLabelText(/^Nom$/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/^Mot de passe$/i) as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText(
        /Confirmer le mot de passe/i
      ) as HTMLInputElement;

      await user.type(firstNameInput, "John");
      await user.type(lastNameInput, "Doe");
      await user.type(emailInput, "john.doe@example.com");
      await user.type(passwordInput, "Password123!");
      await user.type(confirmPasswordInput, "Password123!");

      expect(firstNameInput.value).toBe("John");
      expect(lastNameInput.value).toBe("Doe");
      expect(emailInput.value).toBe("john.doe@example.com");
      expect(passwordInput.value).toBe("Password123!");
      expect(confirmPasswordInput.value).toBe("Password123!");
    });

    it("should toggle password visibility", async () => {
      const user = userEvent.setup();
      render(<Signup {...defaultProps} />);

      const passwordInput = screen.getByLabelText(/^Mot de passe$/i);
      const toggleButtons = screen.getAllByRole("button", { name: /toggle password visibility/i });

      expect(passwordInput).toHaveAttribute("type", "password");

      await user.click(toggleButtons[0]);
      expect(passwordInput).toHaveAttribute("type", "text");

      await user.click(toggleButtons[0]);
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("should toggle confirm password visibility", async () => {
      const user = userEvent.setup();
      render(<Signup {...defaultProps} />);

      const confirmPasswordInput = screen.getByLabelText(/Confirmer le mot de passe/i);
      const toggleButtons = screen.getAllByRole("button", { name: /toggle password visibility/i });

      expect(confirmPasswordInput).toHaveAttribute("type", "password");

      await user.click(toggleButtons[1]);
      expect(confirmPasswordInput).toHaveAttribute("type", "text");
    });

    it("should call onSwitchToLogin when login link is clicked", async () => {
      const user = userEvent.setup();
      render(<Signup {...defaultProps} />);

      const loginLink = screen.getByText(/Se connecter/i);
      await user.click(loginLink);

      expect(mockOnSwitchToLogin).toHaveBeenCalledTimes(1);
    });
  });

  describe("Password Validation", () => {
    it("should show error for password less than 8 characters", async () => {
      const user = userEvent.setup();
      render(<Signup {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/^Mot de passe$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirmer le mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /S'inscrire/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Pass1!");
      await user.type(confirmPasswordInput, "Pass1!");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/au moins 8 caractères/i)).toBeInTheDocument();
      });

      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it("should show error for password without lowercase", async () => {
      const user = userEvent.setup();
      render(<Signup {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/^Mot de passe$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirmer le mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /S'inscrire/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "PASSWORD123!");
      await user.type(confirmPasswordInput, "PASSWORD123!");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/au moins une minuscule/i)).toBeInTheDocument();
      });
    });

    it("should show error for password without uppercase", async () => {
      const user = userEvent.setup();
      render(<Signup {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/^Mot de passe$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirmer le mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /S'inscrire/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123!");
      await user.type(confirmPasswordInput, "password123!");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/au moins une majuscule/i)).toBeInTheDocument();
      });
    });

    it("should show error for password without digit", async () => {
      const user = userEvent.setup();
      render(<Signup {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/^Mot de passe$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirmer le mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /S'inscrire/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password!");
      await user.type(confirmPasswordInput, "Password!");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/au moins un chiffre/i)).toBeInTheDocument();
      });
    });

    it("should show error for password without special character", async () => {
      const user = userEvent.setup();
      render(<Signup {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/^Mot de passe$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirmer le mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /S'inscrire/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123");
      await user.type(confirmPasswordInput, "Password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/au moins un caractère spécial/i)).toBeInTheDocument();
      });
    });

    it("should show error when passwords do not match", async () => {
      const user = userEvent.setup();
      render(<Signup {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/^Mot de passe$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirmer le mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /S'inscrire/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123!");
      await user.type(confirmPasswordInput, "DifferentPassword123!");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Les mots de passe ne correspondent pas/i)).toBeInTheDocument();
      });
    });
  });

  describe("Form Submission - Success", () => {
    it("should submit form successfully and show email verification", async () => {
      const user = userEvent.setup();
      const mockResponse = {
        data: {
          success: true,
          email: "test@example.com",
          requiresVerification: true,
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      render(<Signup {...defaultProps} />);

      const firstNameInput = screen.getByLabelText(/Prénom/i);
      const lastNameInput = screen.getByLabelText(/^Nom$/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/^Mot de passe$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirmer le mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /S'inscrire/i });

      await user.type(firstNameInput, "John");
      await user.type(lastNameInput, "Doe");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123!");
      await user.type(confirmPasswordInput, "Password123!");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining("/api/auth/register"),
          {
            email: "test@example.com",
            password: "Password123!",
            firstName: "John",
            lastName: "Doe",
          }
        );
      });

      // Should show email verification component
      await waitFor(() => {
        expect(screen.getByTestId("verify-email")).toBeInTheDocument();
      });
      expect(screen.getByText(/Verify Email: test@example.com/i)).toBeInTheDocument();

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it("should handle legacy response without email verification", async () => {
      const user = userEvent.setup();
      const mockResponse = {
        data: {
          success: true,
          token: "test-token",
          user: {
            id: "user-123",
            email: "test@example.com",
            firstName: "John",
            lastName: "Doe",
          },
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      render(<Signup {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/^Mot de passe$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirmer le mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /S'inscrire/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123!");
      await user.type(confirmPasswordInput, "Password123!");
      await user.click(submitButton);

      await waitFor(() => {
        expect(localStorage.getItem("token")).toBe("test-token");
      });
      expect(mockOnSuccess).toHaveBeenCalledWith("test-token", mockResponse.data.user);
    });

    it("should show loading state during submission", async () => {
      const user = userEvent.setup();
      let resolveSignup: any;
      const signupPromise = new Promise((resolve) => {
        resolveSignup = resolve;
      });

      mockedAxios.post.mockReturnValue(signupPromise as any);

      render(<Signup {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/^Mot de passe$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirmer le mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /S'inscrire/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123!");
      await user.type(confirmPasswordInput, "Password123!");
      await user.click(submitButton);

      // Check loading state
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      // Resolve the promise
      resolveSignup({
        data: {
          success: true,
          email: "test@example.com",
          requiresVerification: true,
        },
      });

      await waitFor(() => {
        expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
      });
    });

    it("should prevent multiple submissions while loading", async () => {
      const user = userEvent.setup();
      let resolveSignup: any;
      const signupPromise = new Promise((resolve) => {
        resolveSignup = resolve;
      });

      mockedAxios.post.mockReturnValue(signupPromise as any);

      render(<Signup {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/^Mot de passe$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirmer le mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /S'inscrire/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123!");
      await user.type(confirmPasswordInput, "Password123!");

      // Click submit button multiple times
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      // Should only call API once
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);

      resolveSignup({
        data: {
          success: true,
          email: "test@example.com",
          requiresVerification: true,
        },
      });
    });
  });

  describe("Form Submission - Errors", () => {
    it("should display error for existing email", async () => {
      const user = userEvent.setup();
      mockedAxios.post.mockRejectedValue({
        response: {
          data: {
            message: "Un utilisateur avec cet email existe déjà",
          },
        },
      });

      render(<Signup {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/^Mot de passe$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirmer le mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /S'inscrire/i });

      await user.type(emailInput, "existing@example.com");
      await user.type(passwordInput, "Password123!");
      await user.type(confirmPasswordInput, "Password123!");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Un compte existe déjà avec cet email/i)).toBeInTheDocument();
      });
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

      render(<Signup {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/^Mot de passe$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirmer le mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /S'inscrire/i });

      await user.type(emailInput, "invalid-email");
      await user.type(passwordInput, "Password123!");
      await user.type(confirmPasswordInput, "Password123!");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Email invalide/i)).toBeInTheDocument();
      });
    });

    it("should handle validation errors array", async () => {
      const user = userEvent.setup();
      mockedAxios.post.mockRejectedValue({
        response: {
          data: {
            errors: [{ msg: "Email is required", param: "email", location: "body" }],
          },
        },
      });

      render(<Signup {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/^Mot de passe$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirmer le mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /S'inscrire/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123!");
      await user.type(confirmPasswordInput, "Password123!");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email: Email is required/i)).toBeInTheDocument();
      });
    });

    it("should allow closing error alert", async () => {
      const user = userEvent.setup();
      mockedAxios.post.mockRejectedValue({
        response: {
          data: {
            message: "Test error",
          },
        },
      });

      render(<Signup {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/^Mot de passe$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirmer le mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /S'inscrire/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123!");
      await user.type(confirmPasswordInput, "Password123!");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Test error/i)).toBeInTheDocument();
      });

      // Close the alert
      const closeButton = screen.getByRole("button", { name: /close/i });
      await user.click(closeButton);

      expect(screen.queryByText(/Test error/i)).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels for all form fields", () => {
      render(<Signup {...defaultProps} />);

      expect(screen.getByLabelText(/Prénom/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Nom$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Confirmer le mot de passe/i)).toBeInTheDocument();
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      mockedAxios.post.mockResolvedValue({
        data: {
          success: true,
          email: "test@example.com",
          requiresVerification: true,
        },
      });

      render(<Signup {...defaultProps} />);

      // Navigate through form with Tab
      await user.tab(); // First name
      await user.keyboard("John");
      await user.tab(); // Last name
      await user.keyboard("Doe");
      await user.tab(); // Email
      await user.keyboard("test@example.com");
      await user.tab(); // Password
      await user.keyboard("Password123!");
      await user.tab(); // Confirm password
      await user.keyboard("Password123!");

      // Submit with Enter
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled();
      });
    });
  });
});
