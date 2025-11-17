// Mock for Firebase Storage
const mockStorage = {
  app: { name: "[DEFAULT]" },
  maxOperationRetryTime: 120000,
  maxUploadRetryTime: 600000,
};

export const getStorage = jest.fn(() => mockStorage);

export const ref = jest.fn((storage, path) => ({
  bucket: "mock-bucket",
  fullPath: path || "",
  name: path ? path.split("/").pop() : "",
  parent: null,
  root: { fullPath: "", name: "" },
  storage: mockStorage,
  toString: () => `gs://mock-bucket/${path || ""}`,
}));

export const uploadBytes = jest.fn(() =>
  Promise.resolve({
    metadata: {
      bucket: "mock-bucket",
      fullPath: "mock-path",
      generation: "1",
      metageneration: "1",
      name: "mock-file",
      size: 1024,
      timeCreated: new Date().toISOString(),
      updated: new Date().toISOString(),
    },
    ref: {
      bucket: "mock-bucket",
      fullPath: "mock-path",
      name: "mock-file",
    },
  })
);

export const uploadBytesResumable = jest.fn(() => {
  const task: any = {
    snapshot: {
      bytesTransferred: 0,
      totalBytes: 0,
      state: "running",
      metadata: {},
      ref: {},
    },
    on: jest.fn(),
    cancel: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    then: jest.fn((resolve) => {
      resolve({
        bytesTransferred: 1024,
        totalBytes: 1024,
        state: "success",
      });
      return task;
    }),
    catch: jest.fn(),
  };
  return task;
});

export const getDownloadURL = jest.fn(() =>
  Promise.resolve("https://mock-storage.example.com/mock-file.jpg")
);

export const deleteObject = jest.fn(() => Promise.resolve());

export const listAll = jest.fn(() =>
  Promise.resolve({
    items: [],
    prefixes: [],
  })
);

export const getMetadata = jest.fn(() =>
  Promise.resolve({
    bucket: "mock-bucket",
    fullPath: "mock-path",
    name: "mock-file",
    size: 1024,
    timeCreated: new Date().toISOString(),
    updated: new Date().toISOString(),
  })
);

export const updateMetadata = jest.fn(() =>
  Promise.resolve({
    bucket: "mock-bucket",
    fullPath: "mock-path",
    name: "mock-file",
    size: 1024,
  })
);
