/**
 * Tests for Authentication Routes
 * @version 1.0.0
 */

const request = require('supertest');
const express = require('express');

// Mock Sequelize FIRST before anything else
jest.mock('sequelize', () => {
  const mockOp = {
    gt: Symbol('gt'),
    eq: Symbol('eq'),
  };
  const mockDataTypes = {
    UUID: 'UUID',
    UUIDV4: 'UUIDV4',
    STRING: 'STRING',
    BOOLEAN: 'BOOLEAN',
    DATE: 'DATE',
    INTEGER: 'INTEGER',
    TEXT: 'TEXT',
    ENUM: jest.fn((...values) => `ENUM(${values.join(',')})`),
  };
  return {
    Op: mockOp,
    DataTypes: mockDataTypes,
    Sequelize: jest.fn().mockImplementation(() => ({
      authenticate: jest.fn().mockResolvedValue(true),
      define: jest.fn(),
    })),
  };
});

// Mock database connection before importing User model
jest.mock('../../database/connection', () => {
  const { Op } = require('sequelize');
  const mockModel = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  };
  return {
    where: jest.fn((condition) => condition),
    fn: jest.fn((fnName) => ({
      fn: fnName,
      col: jest.fn((colName) => colName),
    })),
    col: jest.fn((colName) => colName),
    define: jest.fn(() => mockModel),
    Op,
  };
});

// Mock User model BEFORE importing it - define mocks inline to avoid hoisting issues
jest.mock('../../models/User', () => {
  const mockFindOne = jest.fn();
  const mockFindAll = jest.fn();
  const mockCreate = jest.fn();
  const mockUpdate = jest.fn();
  const mockDestroy = jest.fn();
  
  return {
    findOne: mockFindOne,
    findAll: mockFindAll,
    create: mockCreate,
    update: mockUpdate,
    destroy: mockDestroy,
    beforeSave: jest.fn((callback) => {}),
    beforeCreate: jest.fn((callback) => {}),
    beforeUpdate: jest.fn((callback) => {}),
    addHook: jest.fn((hookName, callback) => {}),
  };
});

// Create mock functions that reference the mocked User methods
const User = require('../../models/User');
const mockFindOne = User.findOne;
const mockFindAll = User.findAll;
const mockCreate = User.create;
const mockUpdate = User.update;
const mockDestroy = User.destroy;

// Mock email service BEFORE it's imported to prevent setImmediate error
jest.mock('../../utils/emailService', () => ({
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  sendWelcomeEmail: jest.fn(),
}));

const { sendVerificationEmail, sendPasswordResetEmail } = require('../../utils/emailService');

// Import routes after mocks
const authRoutes = require('../../routes/auth');

describe('Auth Routes', () => {
  let app;

  beforeAll(() => {
    // Définir JWT_SECRET pour les tests
    process.env.JWT_SECRET = 'test-secret-key-for-jwt';
    process.env.JWT_EXPIRES_IN = '7d';

    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    const validRegistrationData = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User'
    };

    it('should register a new user successfully', async () => {
      mockFindOne.mockResolvedValue(null); // No existing user
      mockCreate.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        emailVerificationToken: 'token123',
        emailVerificationExpires: new Date()
      });
      sendVerificationEmail.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('verification');
      expect(response.body.email).toBe('test@example.com');
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'Test',
          lastName: 'User'
        })
      );
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validRegistrationData,
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Email invalide');
    });

    it('should reject registration with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validRegistrationData,
          password: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/mot de passe/i);
    });

    it('should reject registration without uppercase in password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validRegistrationData,
          password: 'password123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject registration without special character in password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validRegistrationData,
          password: 'Password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject registration if email already exists', async () => {
      mockFindOne.mockResolvedValue({
        id: 1,
        email: 'test@example.com'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('existe deja');
    });

    it('should handle database errors gracefully', async () => {
      mockFindOne.mockResolvedValue(null);
      mockCreate.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    it('should create user even if email sending fails', async () => {
      mockFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        emailVerificationToken: 'token123'
      });
      sendVerificationEmail.mockRejectedValue(new Error('Email error'));

      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'Password123!'
    };

    it('should login user successfully with verified email', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        isEmailVerified: true,
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User'
        }),
        save: jest.fn().mockResolvedValue(true)
      };

      mockFindOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      expect(mockUser.comparePassword).toHaveBeenCalledWith('Password123!');
    });

    it('should reject login with incorrect password', async () => {
      const mockUser = {
        email: 'test@example.com',
        isEmailVerified: true,
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      mockFindOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('incorrect');
    });

    it('should reject login for non-existent user', async () => {
      mockFindOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('incorrect');
    });

    it('should reject login for unverified email', async () => {
      const mockUser = {
        email: 'test@example.com',
        isEmailVerified: false,
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true)
      };

      mockFindOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('verifi');
    });

    it('should reject login for inactive user', async () => {
      const mockUser = {
        email: 'test@example.com',
        isEmailVerified: true,
        isActive: false,
        comparePassword: jest.fn().mockResolvedValue(true)
      };

      mockFindOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('desactive');
    });

    it('should reject login with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'Password123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject login without required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should update lastLogin timestamp on successful login', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        isEmailVerified: true,
        isActive: true,
        lastLogin: null,
        comparePassword: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({ id: 1, email: 'test@example.com' }),
        save: jest.fn().mockResolvedValue(true)
      };

      mockFindOne.mockResolvedValue(mockUser);

      await request(app)
        .post('/api/auth/login')
        .send(validLoginData);

      expect(mockUser.lastLogin).toBeDefined();
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe('GET /api/auth/verify-email/:token', () => {
    it('should verify email successfully with valid token', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        isEmailVerified: false,
        emailVerificationToken: 'valid-token',
        emailVerificationExpires: new Date(Date.now() + 3600000), // Future date
        save: jest.fn().mockResolvedValue(true)
      };

      mockFindOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/auth/verify-email/valid-token')
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockUser.isEmailVerified).toBe(true);
      expect(mockUser.emailVerificationToken).toBeNull();
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should reject verification with invalid token', async () => {
      mockFindOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/auth/verify-email/invalid-token')
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('invalide');
    });

    it('should reject verification with expired token', async () => {
      const mockUser = {
        email: 'test@example.com',
        emailVerificationToken: 'expired-token',
        emailVerificationExpires: new Date(Date.now() - 3600000) // Past date
      };

      mockFindOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/auth/verify-email/expired-token')
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('expir');
    });

    it('should handle already verified email', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        isEmailVerified: true,
        emailVerificationToken: 'token',
        emailVerificationExpires: new Date(Date.now() + 3600000)
      };

      mockFindOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/auth/verify-email/token')
        .set('Accept', 'application/json');

      // Should still return success even if already verified
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send password reset email for existing user', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        save: jest.fn().mockResolvedValue(true)
      };

      mockFindOne.mockResolvedValue(mockUser);
      sendPasswordResetEmail.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockUser.passwordResetToken).toBeDefined();
      expect(mockUser.passwordResetExpires).toBeDefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(sendPasswordResetEmail).toHaveBeenCalled();
    });

    it('should return success even for non-existent email (security)', async () => {
      mockFindOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // Don't reveal that user doesn't exist
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle email sending failure gracefully', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        save: jest.fn().mockResolvedValue(true)
      };

      mockFindOne.mockResolvedValue(mockUser);
      sendPasswordResetEmail.mockRejectedValue(new Error('Email error'));

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' });

      // Should still save token even if email fails
      expect(mockUser.save).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    const newPassword = 'NewPassword123!';

    it('should reset password successfully with valid token', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        passwordResetToken: 'valid-reset-token',
        passwordResetExpires: new Date(Date.now() + 3600000),
        save: jest.fn().mockResolvedValue(true)
      };

      mockFindOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'valid-reset-token',
          password: newPassword
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockUser.password).toBe(newPassword);
      expect(mockUser.passwordResetToken).toBeNull();
      expect(mockUser.passwordResetExpires).toBeNull();
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should reject password reset with invalid token', async () => {
      mockFindOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          password: newPassword
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject password reset with expired token', async () => {
      const mockUser = {
        passwordResetToken: 'expired-token',
        passwordResetExpires: new Date(Date.now() - 3600000)
      };

      mockFindOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'expired-token',
          password: newPassword
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('expir');
    });

    it('should reject weak password in reset', async () => {
      const mockUser = {
        passwordResetToken: 'valid-token',
        passwordResetExpires: new Date(Date.now() + 3600000)
      };

      mockFindOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'valid-token',
          password: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Security', () => {
    it('should not include password in user response', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        isEmailVerified: true,
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          email: 'test@example.com',
          firstName: 'Test'
        }),
        save: jest.fn().mockResolvedValue(true)
      };

      mockFindOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(response.body.user.password).toBeUndefined();
    });

    it('should generate JWT token with correct payload', async () => {
      const mockUser = {
        id: 123,
        email: 'test@example.com',
        isEmailVerified: true,
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          id: 123,
          email: 'test@example.com'
        }),
        save: jest.fn().mockResolvedValue(true)
      };

      mockFindOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(response.body.token).toBeDefined();

      // Verify JWT structure (should have 3 parts separated by dots)
      const tokenParts = response.body.token.split('.');
      expect(tokenParts).toHaveLength(3);
    });
  });
});
