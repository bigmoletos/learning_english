import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { EmailVerification } from "../EmailVerification";
import { useUser } from "../../../contexts/UserContext";
import { auth } from "../../../firebase/config";
import { applyActionCode, checkActionCode, sendEmailVerification } from "firebase/auth";
import { storageService, StorageKeys } from "../../../utils/storageService";

// Mock des modules externes
jest.mock("../../../contexts/UserContext");
jest.mock("../../../firebase/config");
jest.mock("firebase/auth");
jest.mock("../../../utils/storageService");

// Mock de l'utilisateur
const mockUser = {
  uid: "123",
  email: "test@example.com",
  emailVerified: true,
  displayName: "Test User",
  getIdToken: jest.fn().mockResolvedValue("mock-token"),
  reload: jest.fn().mockResolvedValue(undefined)
};

// Mock de la navigation
describe("EmailVerification Component", () => {
  const mockLogin = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnSwitchToLogin = jest.fn();

  // Configuration avant chaque test
  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({ login: mockLogin });
    (auth.currentUser as jest.Mock).mockReturnValue(mockUser);
    (storageService.get as jest.Mock).mockImplementation((key) => {
      if (key === StorageKeys.PENDING_USER) return Promise.resolve(null);
      if (key === StorageKeys.FIREBASE_USER) return Promise.resolve(mockUser);
      return Promise.resolve(null);
    });
    (storageService.setMultiple as jest.Mock).mockResolvedValue(undefined);
    (storageService.remove as jest.Mock).mockResolvedValue(undefined);
  });

  // Test de rendu de base
  it("renders loading state initially", () => {
    render(
      <EmailVerification
        onSuccess={mockOnSuccess}
        onSwitchToLogin={mockOnSwitchToLogin}
      />
    );
    expect(screen.getByText("Vérification de votre email...")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  // Test de succès de vérification
  it("shows success message when email is verified", async () => {
    (checkActionCode as jest.Mock).mockResolvedValue(undefined);
    (applyActionCode as jest.Mock).mockResolvedValue(undefined);

    render(
      <EmailVerification
        onSuccess={mockOnSuccess}
        onSwitchToLogin={mockOnSwitchToLogin}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("✅ Email vérifié !")).toBeInTheDocument();
    });
    expect(
      screen.getByText("Votre email a été vérifié avec succès. Vous pouvez maintenant utiliser toutes les fonctionnalités de l'application.")
    ).toBeInTheDocument();

    expect(mockLogin).toHaveBeenCalledWith("mock-token", expect.any(Object));
    expect(mockOnSuccess).toHaveBeenCalledWith("mock-token", expect.any(Object));
  });

  // Test d'erreur de vérification
  it("shows error message when verification fails", async () => {
    const mockError = new Error("Invalid action code");
    mockError.code = "auth/invalid-action-code";
    (checkActionCode as jest.Mock).mockRejectedValue(mockError);

    render(
      <EmailVerification
        onSuccess={mockOnSuccess}
        onSwitchToLogin={mockOnSwitchToLogin}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("❌ Erreur de vérification")).toBeInTheDocument();
    });
    expect(
      screen.getByText("Le lien de vérification est invalide ou a déjà été utilisé.")
    ).toBeInTheDocument();
  });

  // Test de renvoi d'email de vérification
  it("resends verification email when user is not verified", async () => {
    const mockUnverifiedUser = {
      ...mockUser,
      emailVerified: false
    };
    (auth.currentUser as jest.Mock).mockReturnValue(mockUnverifiedUser);
    (sendEmailVerification as jest.Mock).mockResolvedValue(undefined);

    render(
      <EmailVerification
        onSuccess={mockOnSuccess}
        onSwitchToLogin={mockOnSwitchToLogin}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("❌ Erreur de vérification")).toBeInTheDocument();
    });
    expect(
      screen.getByText("Un nouvel email de vérification a été envoyé. Vérifiez votre boîte de réception.")
    ).toBeInTheDocument();
  });

  // Test de connexion après vérification
  it("logs in user after successful verification", async () => {
    (checkActionCode as jest.Mock).mockResolvedValue(undefined);
    (applyActionCode as jest.Mock).mockResolvedValue(undefined);

    render(
      <EmailVerification
        onSuccess={mockOnSuccess}
        onSwitchToLogin={mockOnSwitchToLogin}
      />
    );

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("mock-token", expect.any(Object));
    });
    expect(mockOnSuccess).toHaveBeenCalledWith("mock-token", expect.any(Object));
  });

  // Test de navigation vers la connexion
  it("navigates to login when clicking continue button", async () => {
    render(
      <EmailVerification
        onSuccess={mockOnSuccess}
        onSwitchToLogin={mockOnSwitchToLogin}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Continuer")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Continuer"));
    expect(mockOnSwitchToLogin).toHaveBeenCalled();
  });
});
