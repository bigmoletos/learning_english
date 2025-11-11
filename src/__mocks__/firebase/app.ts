// Mock for Firebase App
export const initializeApp = jest.fn(() => ({
  name: "[DEFAULT]",
  options: {},
  automaticDataCollectionEnabled: false
}));

export const getApp = jest.fn(() => ({
  name: "[DEFAULT]",
  options: {},
  automaticDataCollectionEnabled: false
}));

export const getApps = jest.fn(() => []);
