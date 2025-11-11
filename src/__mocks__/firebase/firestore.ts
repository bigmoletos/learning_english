// Mock for Firebase Firestore
export const mockDoc = {
  id: 'test-doc-id',
  exists: () => true,
  data: () => ({
    email: 'test@example.com',
    displayName: 'Test User'
  })
};

// Mock Firestore instance
const mockFirestore = {
  app: { name: '[DEFAULT]' },
  type: 'firestore'
};

export const getFirestore = jest.fn(() => mockFirestore);

export const collection = jest.fn((db, path) => ({
  id: path,
  path: path,
  type: 'collection'
}));

export const doc = jest.fn((db, path, ...segments) => ({
  id: segments.length > 0 ? segments[segments.length - 1] : path,
  path: path,
  type: 'document'
}));

export const getDoc = jest.fn(() =>
  Promise.resolve({
    exists: () => true,
    id: 'test-doc-id',
    data: () => ({
      email: 'test@example.com',
      displayName: 'Test User'
    }),
    ref: { id: 'test-doc-id', path: 'users/test-doc-id' }
  })
);

export const setDoc = jest.fn(() => Promise.resolve());

export const updateDoc = jest.fn(() => Promise.resolve());

export const deleteDoc = jest.fn(() => Promise.resolve());

export const query = jest.fn((collection, ...constraints) => ({
  type: 'query',
  firestore: mockFirestore,
  converter: null
}));

export const where = jest.fn((field, op, value) => ({
  type: 'where',
  field,
  op,
  value
}));

export const orderBy = jest.fn((field, direction = 'asc') => ({
  type: 'orderBy',
  field,
  direction
}));

export const limit = jest.fn((count) => ({
  type: 'limit',
  count
}));

export const getDocs = jest.fn(() =>
  Promise.resolve({
    docs: [{
      id: 'test-doc-1',
      exists: () => true,
      data: () => ({ test: 'data' }),
      ref: { id: 'test-doc-1', path: 'collection/test-doc-1' }
    }],
    empty: false,
    size: 1,
    forEach: (callback: any) => {
      callback({
        id: 'test-doc-1',
        exists: () => true,
        data: () => ({ test: 'data' }),
        ref: { id: 'test-doc-1', path: 'collection/test-doc-1' }
      });
    }
  })
);

export const addDoc = jest.fn(() =>
  Promise.resolve({
    id: 'new-doc-id',
    path: 'collection/new-doc-id'
  })
);

export const onSnapshot = jest.fn((docRef, callback) => {
  // Call callback immediately with mock data
  setTimeout(() => {
    callback({
      exists: () => true,
      id: 'test-doc-id',
      data: () => ({ test: 'data' }),
      ref: { id: 'test-doc-id', path: 'collection/test-doc-id' }
    });
  }, 0);

  // Return unsubscribe function
  return jest.fn();
});

export const Timestamp = {
  now: () => ({
    seconds: Math.floor(Date.now() / 1000),
    nanoseconds: 0,
    toDate: () => new Date()
  }),
  fromDate: (date: Date) => ({
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
    toDate: () => date
  })
};

export const serverTimestamp = jest.fn(() => Timestamp.now());

export const FieldValue = {
  serverTimestamp: serverTimestamp,
  delete: () => ({ type: 'delete' }),
  increment: (n: number) => ({ type: 'increment', operand: n }),
  arrayUnion: (...elements: any[]) => ({ type: 'arrayUnion', elements }),
  arrayRemove: (...elements: any[]) => ({ type: 'arrayRemove', elements })
};
