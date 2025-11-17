/**
 * Tests for Authentication Routes
 * @version 1.0.0
 */

const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/auth');
const User = require('../../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../../utils/emailService');

// Mock models and services
jest.mock('../../models/User');
jest.mock('../../utils/emailService');

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
      User.findOne.mockResolvedValue(null); // No existing user
      User.create.mockResolvedValue({
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
      expect(User.create).toHaveBeenCalledWith(
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
      User.findOne.mockResolvedValue({
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
      User.findOne.mockResolvedValue(null);
      User.create.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    it('should create user even if email sending fails', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
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
        emailVerified: true,
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User'
        }),
        save: jest.fn()
      };

      User.findOne.mockResolvedValue(mockUser);

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
        emailVerified: true,
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('incorrect');
    });

    it('should reject login for non-existent user', async () => {
      User.findOne.mockResolvedValue(null);

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
        emailVerified: false,
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(mockUser);

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
        emailVerified: true,
        isActive: false,
        comparePassword: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(mockUser);

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
        emailVerified: true,
        isActive: true,
        lastLogin: null,
        comparePassword: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({ id: 1, email: 'test@example.com' }),
        save: jest.fn()
      };

      User.findOne.mockResolvedValue(mockUser);

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
        emailVerified: false,
        emailVerificationToken: 'valid-token',
        emailVerificationExpires: new Date(Date.now() + 3600000), // Future date
        save: jest.fn()
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/auth/verify-email/valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockUser.emailVerified).toBe(true);
      expect(mockUser.emailVerificationToken).toBeNull();
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should reject verification with invalid token', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/auth/verify-email/invalid-token');

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

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/auth/verify-email/expired-token');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('expir');
    });

    it('should handle already verified email', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        emailVerified: true,
        emailVerificationToken: 'token',
        emailVerificationExpires: new Date(Date.now() + 3600000)
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/auth/verify-email/token');

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
        save: jest.fn()
      };

      User.findOne.mockResolvedValue(mockUser);
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
      User.findOne.mockResolvedValue(null);

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
        save: jest.fn()
      };

      User.findOne.mockResolvedValue(mockUser);
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
        save: jest.fn()
      };

      User.findOne.mockResolvedValue(mockUser);

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
      User.findOne.mockResolvedValue(null);

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

      User.findOne.mockResolvedValue(mockUser);

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

      User.findOne.mockResolvedValue(mockUser);

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
        emailVerified: true,
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          email: 'test@example.com',
          firstName: 'Test'
        }),
        save: jest.fn()
      };

      User.findOne.mockResolvedValue(mockUser);

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
        emailVerified: true,
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          id: 123,
          email: 'test@example.com'
        }),
        save: jest.fn()
      };

      User.findOne.mockResolvedValue(mockUser);

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
