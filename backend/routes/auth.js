/**
 * Routes d'authentification
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');

// ==================================
// INSCRIPTION
// ==================================

router.post('/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Le mot de passe doit contenir au moins 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractere special'),
    body('firstName').optional().trim().isLength({ min: 2 }),
    body('lastName').optional().trim().isLength({ min: 2 })
  ],
  async (req, res) => {
    try {
      // Validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { email, password, firstName, lastName } = req.body;

      // Verifier si l'utilisateur existe deja
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Un compte existe deja avec cet email'
        });
      }

      // Generer le token de verification
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

      // Creer l'utilisateur
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires
      });

      // Envoyer l'email de verification
      try {
        await sendVerificationEmail(user.email, verificationToken);
      } catch (emailError) {
        console.error('Erreur envoi email:', emailError);
        // Ne pas bloquer l'inscription si l'email echoue
      }

      // Generer le JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Inscription reussie. Veuillez verifier votre email.',
        token,
        user: user.toJSON()
      });

    } catch (error) {
      console.error('Erreur inscription:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'inscription'
      });
    }
  }
);

// ==================================
// CONNEXION
// ==================================

router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { email, password } = req.body;

      // Trouver l'utilisateur
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect'
        });
      }

      // Verifier si le compte est actif
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Ce compte a ete desactive'
        });
      }

      // Verifier le mot de passe
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect'
        });
      }

      // Mettre a jour la derniere connexion
      user.lastLogin = new Date();
      await user.save();

      // Generer le JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(200).json({
        success: true,
        message: 'Connexion reussie',
        token,
        user: user.toJSON()
      });

    } catch (error) {
      console.error('Erreur connexion:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la connexion'
      });
    }
  }
);

// ==================================
// VERIFICATION EMAIL
// ==================================

router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: { [require('sequelize').Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token de verification invalide ou expire'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verifie avec succes'
    });

  } catch (error) {
    console.error('Erreur verification email:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la verification'
    });
  }
});

// ==================================
// DEMANDE DE REINITIALISATION MOT DE PASSE
// ==================================

router.post('/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        // Ne pas reveler si l'email existe
        return res.status(200).json({
          success: true,
          message: 'Si cet email existe, un lien de reinitialisation a ete envoye'
        });
      }

      // Generer le token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h

      user.passwordResetToken = resetToken;
      user.passwordResetExpires = resetExpires;
      await user.save();

      // Envoyer l'email
      await sendPasswordResetEmail(user.email, resetToken);

      res.status(200).json({
        success: true,
        message: 'Un email de reinitialisation a ete envoye'
      });

    } catch (error) {
      console.error('Erreur reset password:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la demande de reinitialisation'
      });
    }
  }
);

// ==================================
// REINITIALISATION MOT DE PASSE
// ==================================

router.post('/reset-password/:token',
  [
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  ],
  async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const user = await User.findOne({
        where: {
          passwordResetToken: token,
          passwordResetExpires: { [require('sequelize').Op.gt]: new Date() }
        }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Token invalide ou expire'
        });
      }

      user.password = password;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Mot de passe reinitialise avec succes'
      });

    } catch (error) {
      console.error('Erreur reset password:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la reinitialisation'
      });
    }
  }
);

module.exports = router;
