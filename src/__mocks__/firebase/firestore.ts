// Mock for Firebase Firestore
export const mockDoc = {
  id: 'test-doc-id',
  exists: () => true,
  data: () => ({
    email: 'test@example.com',
    displayName: 'Test User'
  })
};

export const getFirestore = jest.fn();
export const collection = jest.fn();
export const doc = jest.fn();
export const getDoc = jest.fn();
export const setDoc = jest.fn();
export const updateDoc = jest.fn();
export const deleteDoc = jest.fn();
export const query = jest.fn();
export const where = jest.fn();
export const orderBy = jest.fn();
export const limit = jest.fn();
export const getDocs = jest.fn();
export const addDoc = jest.fn();
export const onSnapshot = jest.fn();
export const Timestamp = {
  now: () => ({ seconds: Date.now() / 1000, nanoseconds: 0 }),
  fromDate: (date: Date) => ({ seconds: date.getTime() / 1000, nanoseconds: 0 })
};
