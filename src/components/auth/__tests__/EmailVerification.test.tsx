import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { EmailVerification } from "../EmailVerification";
import { useUser } from "../../../contexts/UserContext";
import { auth } from "../../../services/firebase/config";
import { applyActionCode, checkActionCode, sendEmailVerification } from "firebase/auth";
import { storageService, StorageKeys } from "../../../utils/storageService";

// Mock des modules externes
jest.mock("../../../contexts/UserContext");
jest.mock("../../../services/firebase/config", () => ({
  auth: {
    currentUser: null,
  },
}));
jest.mock("firebase/auth", () => ({
  checkActionCode: jest.fn(),
  applyActionCode: jest.fn(),
  sendEmailVerification: jest.fn(),
}));
jest.mock("../../../utils/storageService");

// Mock de l'utilisateur
const mockUser = {
  uid: "123",
  email: "test@example.com",
  emailVerified: false,
  displayName: "Test User",
  getIdToken: jest.fn().mockResolvedValue("mock-token"),
  reload: jest.fn().mockResolvedValue(undefined),
};

// Mock de la navigation
describe("EmailVerification Component", () => {
  const mockLogin = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnSwitchToLogin = jest.fn();

  // Store original location for restoration
  const originalLocation = window.location;

  // Shared location search value that tests can modify
  let locationSearch = "?mode=verifyEmail&oobCode=test-code";

  // Configuration avant chaque test
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset location search to default
    locationSearch = "?mode=verifyEmail&oobCode=test-code";

    // Mock console.error to suppress JSDOM navigation errors
    jest.spyOn(console, "error").mockImplementation(() => {});

    (useUser as jest.Mock).mockReturnValue({ login: mockLogin });

    // Mock Firebase auth functions
    (checkActionCode as jest.Mock).mockResolvedValue(undefined);
    (applyActionCode as jest.Mock).mockResolvedValue(undefined);
    (sendEmailVerification as jest.Mock).mockResolvedValue(undefined);

    // Mock auth.currentUser with proper Firebase User structure
    Object.defineProperty(auth, "currentUser", {
      value: mockUser,
      writable: true,
      configurable: true,
    });

    (storageService.get as jest.Mock).mockImplementation((key) => {
      if (key === StorageKeys.PENDING_USER) return Promise.resolve(null);
      if (key === StorageKeys.FIREBASE_USER) return Promise.resolve(null);
      return Promise.resolve(null);
    });
    (storageService.setMultiple as jest.Mock).mockResolvedValue(undefined);
    (storageService.remove as jest.Mock).mockResolvedValue(undefined);

    // Use JSDOM's jsdom.reconfigure to set the URL properly
    const { window: domWindow } = global as any;
    if (domWindow && domWindow.document && domWindow.document.defaultView) {
      const jsdomWindow = domWindow.document.defaultView;
      if ((jsdomWindow as any)._virtualConsole) {
        // Use history API to change URL without reload
        window.history.pushState({}, "", `http://localhost${locationSearch}`);
      }
    }
  });

  // Restore original location after each test
  afterEach(() => {
    const descriptor = Object.getOwnPropertyDescriptor(window, "location");
    if (descriptor && descriptor.configurable) {
      delete (window as any).location;
      (window as any).location = originalLocation;
    }
    jest.restoreAllMocks();
  });

  // Test de rendu de base
  it("renders loading state initially", () => {
    // Mock checkActionCode to return a promise that never resolves (keeps loading state)
    (checkActionCode as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<EmailVerification onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);
    expect(screen.getByText("Vérification de votre email...")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  // Test de succès de vérification
  it("shows success message when email is verified", async () => {
    (checkActionCode as jest.Mock).mockResolvedValue(undefined);
    (applyActionCode as jest.Mock).mockResolvedValue(undefined);

    // Mock storage to return a pending user so login gets called
    (storageService.get as jest.Mock).mockImplementation((key) => {
      if (key === StorageKeys.PENDING_USER) {
        return Promise.resolve({
          id: "123",
          email: "test@example.com",
          name: "Test User",
          currentLevel: "B1",
          targetLevel: "C1",
        });
      }
      return Promise.resolve(null);
    });

    render(<EmailVerification onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);

    await waitFor(() => {
      expect(screen.getByText("✅ Email vérifié !")).toBeInTheDocument();
    });
    expect(
      screen.getByText("Email vérifié avec succès ! Vous êtes maintenant connecté.")
    ).toBeInTheDocument();

    expect(mockLogin).toHaveBeenCalledWith("mock-token", expect.any(Object));
    expect(mockOnSuccess).toHaveBeenCalledWith("mock-token", expect.any(Object));
  });

  // Test d'erreur de vérification
  it("shows error message when verification fails", async () => {
    const mockError: Error & { code?: string } = new Error("Invalid action code");
    mockError.code = "auth/invalid-action-code";
    (checkActionCode as jest.Mock).mockRejectedValue(mockError);

    render(<EmailVerification onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);

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
      emailVerified: false,
    };
    Object.defineProperty(auth, "currentUser", {
      value: mockUnverifiedUser,
      writable: true,
      configurable: true,
    });
    (sendEmailVerification as jest.Mock).mockResolvedValue(undefined);

    // Override location.search to have NO oobCode (no verification link)
    // Mock URLSearchParams to return empty values since the component uses it to read location.search
    // This is necessary because history.pushState doesn't reliably update location.search in JSDOM
    const originalURLSearchParams = window.URLSearchParams;
    (window as any).URLSearchParams = jest.fn().mockImplementation(() => {
      const params = new originalURLSearchParams("");
      return params;
    });

    render(<EmailVerification onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);

    await waitFor(() => {
      expect(screen.getByText("❌ Erreur de vérification")).toBeInTheDocument();
    });
    expect(
      screen.getByText(
        "Un nouvel email de vérification a été envoyé. Vérifiez votre boîte de réception."
      )
    ).toBeInTheDocument();
    expect(sendEmailVerification).toHaveBeenCalledWith(mockUnverifiedUser);

    // Restore URLSearchParams to avoid affecting other tests
    (window as any).URLSearchParams = originalURLSearchParams;
  });

  // Test de connexion après vérification
  it("logs in user after successful verification", async () => {
    (checkActionCode as jest.Mock).mockResolvedValue(undefined);
    (applyActionCode as jest.Mock).mockResolvedValue(undefined);

    // Mock storage to return a pending user so login gets called
    (storageService.get as jest.Mock).mockImplementation((key) => {
      if (key === StorageKeys.PENDING_USER) {
        return Promise.resolve({
          id: "123",
          email: "test@example.com",
          name: "Test User",
          currentLevel: "B1",
          targetLevel: "C1",
        });
      }
      return Promise.resolve(null);
    });

    render(<EmailVerification onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("mock-token", expect.any(Object));
    });
    expect(mockOnSuccess).toHaveBeenCalledWith("mock-token", expect.any(Object));
  });

  // Test de navigation vers la connexion
  it("navigates to login when clicking continue button", async () => {
    // Override auth.currentUser to have verified email
    Object.defineProperty(auth, "currentUser", {
      value: { ...mockUser, emailVerified: true },
      writable: true,
      configurable: true,
    });

    // Override location.search to have NO oobCode (user is already verified)
    window.history.pushState({}, "", "http://localhost");

    render(<EmailVerification onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);

    await waitFor(() => {
      expect(screen.getByText("Continuer")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Continuer"));
    expect(mockOnSwitchToLogin).toHaveBeenCalled();
  });
});
