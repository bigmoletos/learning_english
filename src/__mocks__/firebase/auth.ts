// Mock for Firebase Auth
export const mockUser = {
  uid: "test-uid-123",
  email: "test@example.com",
  displayName: "Test User",
  emailVerified: true,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString()
  }
};

// Mock auth instance
const mockAuth = {
  currentUser: null,
  app: { name: "[DEFAULT]" },
  name: "auth"
};

export const getAuth = jest.fn(() => mockAuth);

export const createUserWithEmailAndPassword = jest.fn((auth, email, password) =>
  Promise.resolve({
    user: { ...mockUser, email },
    providerId: "password"
  })
);

export const signInWithEmailAndPassword = jest.fn((auth, email, password) =>
  Promise.resolve({
    user: { ...mockUser, email },
    providerId: "password"
  })
);

export const signOut = jest.fn(() => Promise.resolve());

export const sendPasswordResetEmail = jest.fn(() => Promise.resolve());

export const sendEmailVerification = jest.fn(() => Promise.resolve());

export const updateProfile = jest.fn(() => Promise.resolve());

export class GoogleAuthProvider {
  providerId = "google.com";
  static PROVIDER_ID = "google.com";
  static credential = jest.fn();
  addScope = jest.fn();
  setCustomParameters = jest.fn();
}

export const signInWithPopup = jest.fn((auth, provider) =>
  Promise.resolve({
    user: mockUser,
    providerId: "google.com",
    operationType: "signIn"
  })
);

export const onAuthStateChanged = jest.fn((auth, callback) => {
  // Call callback immediately with null (no user)
  setTimeout(() => callback(null), 0);
  // Return unsubscribe function
  return jest.fn();
});

export const setPersistence = jest.fn(() => Promise.resolve());

export const browserLocalPersistence = "LOCAL";
export const browserSessionPersistence = "SESSION";

export const getIdToken = jest.fn(() => Promise.resolve("mock-id-token"));

export const reload = jest.fn(() => Promise.resolve());

export const deleteUser = jest.fn(() => Promise.resolve());
