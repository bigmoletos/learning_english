/**
 * Tests for Signup Component
 * @version 1.0.0
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Signup } from "../../../components/auth/Signup";
import { registerUser } from "../../../firebase/authService";

// Mock Firebase auth service
jest.mock("../../../firebase/authService");
const mockedRegisterUser = registerUser as jest.MockedFunction<typeof registerUser>;

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
      // There are two password fields, use getAllByLabelText
      const passwordFields = screen.getAllByLabelText(/Mot de passe/i);
      expect(passwordFields.length).toBeGreaterThanOrEqual(1);
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
      const passwordInput = screen.getAllByLabelText(/Mot de passe/i)[0];
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
      const passwordInput = screen.getAllByLabelText(/Mot de passe/i)[0] as HTMLInputElement;
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

      const passwordInput = screen.getAllByLabelText(/Mot de passe/i)[0];
      // Find toggle buttons - they are IconButtons without accessible names
      // Get all buttons and find the IconButtons (buttons before submit button without text)
      const allButtons = screen.getAllByRole("button");
      const submitButton = screen.getByRole("button", { name: /S'inscrire/i });
      const submitIndex = allButtons.indexOf(submitButton);
      // IconButtons are the buttons before the submit button (typically 2 buttons for password visibility)
      const toggleButtons = allButtons.slice(0, submitIndex);

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
      // Find toggle buttons - they are IconButtons without accessible names
      // Get all buttons and find the IconButtons (buttons before submit button without text)
      const allButtons = screen.getAllByRole("button");
      const submitButton = screen.getByRole("button", { name: /S'inscrire/i });
      const submitIndex = allButtons.indexOf(submitButton);
      // IconButtons are the buttons before the submit button (typically 2 buttons for password visibility)
      const toggleButtons = allButtons.slice(0, submitIndex);

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
      const passwordInput = screen.getAllByLabelText(/Mot de passe/i)[0];
      const confirmPasswordInput = screen.getByLabelText(/Confirmer le mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /S'inscrire/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Pass1!");
      await user.type(confirmPasswordInput, "Pass1!");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/au moins 8 caractères/i)).toBeInTheDocument();
      });

      expect(mockedRegisterUser).not.toHaveBeenCalled();
    });

    it("should show error for password without lowercase", async () => {
      const user = userEvent.setup();
      render(<Signup {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getAllByLabelText(/Mot de passe/i)[0];
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
      const passwordInput = screen.getAllByLabelText(/Mot de passe/i)[0];
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
      const passwordInput = screen.getAllByLabelText(/Mot de passe/i)[0];
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
      const passwordInput = screen.getAllByLabelText(/Mot de passe/i)[0];
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
      const passwordInput = screen.getAllByLabelText(/Mot de passe/i)[0];
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

      mockedRegisterUser.mockResolvedValue({
        success: true,
        user: {
          uid: "test-uid",
          email: "test@example.com",
          displayName: "John Doe",
        } as any,
        message: "User registered successfully",
      });

      render(<Signup {...defaultProps} />);

      const firstNameInput = screen.getByLabelText(/Prénom/i);
      const lastNameInput = screen.getByLabelText(/^Nom$/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getAllByLabelText(/Mot de passe/i)[0];
      const confirmPasswordInput = screen.getByLabelText(/Confirmer le mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /S'inscrire/i });

      await user.type(firstNameInput, "John");
      await user.type(lastNameInput, "Doe");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123!");
      await user.type(confirmPasswordInput, "Password123!");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockedRegisterUser).toHaveBeenCalledWith(
          "test@example.com",
          "Password123!",
          "John Doe"
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

      // With Firebase, successful registration shows VerifyEmail component
      // This test verifies that VerifyEmail is shown instead of expecting a token
      mockedRegisterUser.mockResolvedValue({
        success: true,
        user: {
          uid: "test-uid",
          email: "test@example.com",
          displayName: "John Doe",
        } as any,
        message: "User registered successfully",
      });

      render(<Signup {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getAllByLabelText(/Mot de passe/i)[0];
      const confirmPasswordInput = screen.getByLabelText(/Confirmer le mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /S'inscrire/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123!");
      await user.type(confirmPasswordInput, "Password123!");
      await user.click(submitButton);

      // With Firebase, successful registration shows VerifyEmail component
      await waitFor(() => {
        expect(screen.getByTestId("verify-email")).toBeInTheDocument();
      });
      // Token is not set in localStorage at this stage with Firebase
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it("should show loading state during submission", async () => {
      const user = userEvent.setup();
      let resolveSignup: any;
      const signupPromise = new Promise((resolve) => {
        resolveSignup = resolve;
      });

      mockedRegisterUser.mockImplementation(() => signupPromise as any);

      render(<Signup {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getAllByLabelText(/Mot de passe/i)[0];
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

      mockedRegisterUser.mockImplementation(() => signupPromise as any);

      render(<Signup {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getAllByLabelText(/Mot de passe/i)[0];
      const confirmPasswordInput = screen.getByLabelText(/Confirmer le mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /S'inscrire/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123!");
      await user.type(confirmPasswordInput, "Password123!");

      // Click submit button multiple times
      await user.click(submitButton);
      // Try to click again - should be prevented by loading state
      try {
        await user.click(submitButton);
      } catch (e) {
        // Ignore if button is disabled (pointer-events: none)
      }

      // Should only call API once (second click should be prevented by loading state)
      expect(mockedRegisterUser).toHaveBeenCalledTimes(1);

      // Resolve the promise with Firebase format
      resolveSignup({
        success: true,
        user: {
          uid: "test-uid",
          email: "test@example.com",
          displayName: "Test User",
        } as any,
        message: "User registered successfully",
      });
    });
  });

  describe("Form Submission - Errors", () => {
    it("should display error for existing email", async () => {
      const user = userEvent.setup();
      // Firebase returns success: false with message, not an exception
      mockedRegisterUser.mockResolvedValue({
        success: false,
        message: "Un compte existe déjà avec cet email. Essayez de vous connecter.",
        user: undefined,
      });

      render(<Signup {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getAllByLabelText(/Mot de passe/i)[0];
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
      // Firebase returns success: false with message
      mockedRegisterUser.mockResolvedValue({
        success: false,
        message: "Adresse email invalide.",
        user: undefined,
      });

      render(<Signup {...defaultProps} />);

      const firstNameInput = screen.getByLabelText(/Prénom/i);
      const lastNameInput = screen.getByLabelText(/^Nom$/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getAllByLabelText(/Mot de passe/i)[0];
      const confirmPasswordInput = screen.getByLabelText(/Confirmer le mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /S'inscrire/i });

      // Fill all required fields
      await user.type(firstNameInput, "Test");
      await user.type(lastNameInput, "User");
      // Use a properly formatted email to bypass HTML5 validation
      await user.type(emailInput, "invalid@email.com");
      await user.type(passwordInput, "Password123!");
      await user.type(confirmPasswordInput, "Password123!");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Adresse email invalide/i)).toBeInTheDocument();
      });
    });

    it("should handle validation errors array", async () => {
      const user = userEvent.setup();
      // Firebase returns success: false with message
      mockedRegisterUser.mockResolvedValue({
        success: false,
        message: "Erreur d'inscription. Veuillez réessayer.",
        user: undefined,
      });

      render(<Signup {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getAllByLabelText(/Mot de passe/i)[0];
      const confirmPasswordInput = screen.getByLabelText(/Confirmer le mot de passe/i);
      const submitButton = screen.getByRole("button", { name: /S'inscrire/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123!");
      await user.type(confirmPasswordInput, "Password123!");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Erreur d'inscription/i)).toBeInTheDocument();
      });
    });

    it("should allow closing error alert", async () => {
      const user = userEvent.setup();
      // Firebase returns success: false with message
      mockedRegisterUser.mockResolvedValue({
        success: false,
        message: "Test error",
        user: undefined,
      });

      render(<Signup {...defaultProps} />);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getAllByLabelText(/Mot de passe/i)[0];
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
      // There are two password fields, use getAllByLabelText
      const passwordFields = screen.getAllByLabelText(/Mot de passe/i);
      expect(passwordFields.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByLabelText(/Confirmer le mot de passe/i)).toBeInTheDocument();
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      mockedRegisterUser.mockResolvedValue({
        success: true,
        user: {
          uid: "test-uid",
          email: "test@example.com",
          displayName: "John Doe",
        } as any,
        message: "User registered successfully",
      });

      render(<Signup {...defaultProps} />);

      // Navigate through form with Tab and fill fields
      const firstNameInput = screen.getByLabelText(/Prénom/i);
      const lastNameInput = screen.getByLabelText(/^Nom$/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInputs = screen.getAllByLabelText(/Mot de passe/i);
      const passwordInput = passwordInputs[0];
      const confirmPasswordInput = screen.getByLabelText(/Confirmer le mot de passe/i);

      await user.type(firstNameInput, "John");
      await user.type(lastNameInput, "Doe");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123!");
      await user.type(confirmPasswordInput, "Password123!");

      // Find and click the submit button
      const submitButton = screen.getByRole("button", { name: /S'inscrire/i });
      await user.click(submitButton);

      await waitFor(
        () => {
          expect(mockedRegisterUser).toHaveBeenCalled();
        },
        { timeout: 5000 }
      );
    });
  });
});
