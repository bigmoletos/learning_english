/**
 * Routes d'authentification
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const sequelize = require('../database/connection');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');

// Rate limiting plus permissif pour la vérification d'email
const emailVerificationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 tentatives max (pour gérer les clics multiples)
  message: 'Trop de tentatives de verification. Veuillez attendre quelques minutes.',
  skip: (req) => {
    // Skip rate limiting si c'est une requête GET (redirection depuis email)
    return req.method === 'GET';
  }
});

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
      // Log pour debug (ne pas logger le mot de passe)
      console.log('Inscription - Données reçues:', {
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        passwordLength: req.body.password?.length
      });

      // Validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Extraire le premier message d'erreur
        const firstError = errors.array()[0];
        const errorMessage = firstError.msg || firstError.message || 'Données invalides';

        console.log('Erreurs de validation:', errors.array());

        return res.status(400).json({
          success: false,
          message: errorMessage,
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

      // NE PAS générer de token - l'utilisateur doit vérifier son email d'abord
      // Le token sera généré lors de la vérification de l'email

      res.status(201).json({
        success: true,
        message: 'Inscription reussie. Un email de verification a ete envoye. Veuillez verifier votre boite de reception.',
        email: user.email,
        requiresVerification: true
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
    body('email')
      .isEmail()
      .withMessage('L\'adresse email doit être au format valide (ex: nom@domaine.com)')
      .normalizeEmail(),
    body('password')
      .exists()
      .withMessage('Le mot de passe est requis')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Extraire le premier message d'erreur
        const firstError = errors.array()[0];
        const errorMessage = firstError.msg || firstError.message || 'Données invalides';

        return res.status(400).json({
          success: false,
          message: errorMessage,
          errors: errors.array()
        });
      }

      // Normaliser l'email (lowercase + trim)
      const email = req.body.email?.toLowerCase().trim() || req.body.email;
      const password = req.body.password;

      // Trouver l'utilisateur (recherche case-insensitive avec Sequelize)
      const user = await User.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('email')),
          email.toLowerCase()
        )
      });
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

      // Verifier si l'email est verifie
      if (!user.isEmailVerified) {
        return res.status(403).json({
          success: false,
          message: 'Veuillez verifier votre email avant de vous connecter'
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

// Route GET pour la vérification via navigateur (lien email) ou API
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const isApiRequest = req.headers.accept && req.headers.accept.includes('application/json');

    const user = await User.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      if (isApiRequest) {
        return res.status(400).json({
          success: false,
          message: 'Token de verification invalide ou expire'
        });
      }
      // Rediriger vers la page d'erreur dans le frontend
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/error?token=${token}`);
    }

    // Si l'email est déjà vérifié
    if (user.isEmailVerified) {
      const jwtToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      if (isApiRequest) {
        return res.status(200).json({
          success: true,
          message: 'Votre email a deja ete verifie. Vous etes maintenant connecte.',
          token: jwtToken,
          user: user.toJSON(),
          alreadyVerified: true
        });
      }
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/success?token=${jwtToken}`);
    }

    // Marquer l'email comme vérifié
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    // Générer le JWT après vérification réussie
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    if (isApiRequest) {
      return res.status(200).json({
        success: true,
        message: 'Email verifie avec succes. Vous pouvez maintenant vous connecter.',
        token: jwtToken,
        user: user.toJSON()
      });
    }

    // Rediriger vers la page de succès avec le token
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/success?token=${jwtToken}`);
  } catch (error) {
    console.error('Erreur verification email:', error);
    const isApiRequest = req.headers.accept && req.headers.accept.includes('application/json');
    if (isApiRequest) {
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la verification'
      });
    }
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/error`);
  }
});

// Route POST pour la vérification via API (alternative)
router.post('/verify-email/:token', emailVerificationLimiter, async (req, res) => {
  try {
    const { token } = req.params;

    // Chercher l'utilisateur avec ce token (peut être déjà utilisé)
    const user = await User.findOne({
      where: {
        emailVerificationToken: token
      }
    });

    // Si l'utilisateur n'existe pas avec ce token
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token de verification invalide ou expire'
      });
    }

    // Si l'email est déjà vérifié
    if (user.isEmailVerified) {
      // Générer un nouveau token JWT pour cet utilisateur
      const jwtToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return res.status(200).json({
        success: true,
        message: 'Votre email a deja ete verifie. Vous etes maintenant connecte.',
        token: jwtToken,
        user: user.toJSON(),
        alreadyVerified: true
      });
    }

    // Vérifier si le token a expiré
    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Le lien de verification a expire. Veuillez demander un nouveau lien.'
      });
    }

    // Marquer l'email comme vérifié
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    // Générer le JWT après vérification réussie
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Email verifie avec succes. Vous pouvez maintenant vous connecter.',
      token: jwtToken,
      user: user.toJSON()
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
      // Verifier les erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Format d\'email invalide',
          errors: errors.array()
        });
      }

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

      // Envoyer l'email (ne pas bloquer si l'envoi échoue)
      try {
        await sendPasswordResetEmail(user.email, resetToken);
      } catch (emailError) {
        console.error('Erreur envoi email reset password:', emailError);
        // Continuer même si l'email échoue (le token est déjà sauvegardé)
      }

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

router.post('/reset-password/:token?',
  [
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  ],
  async (req, res) => {
    try {
      // Accepter le token soit dans les paramètres, soit dans le body
      const token = req.params.token || req.body.token;
      const { password } = req.body;

      // Vérifier les erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Le mot de passe doit contenir au moins 8 caracteres, une majuscule, une minuscule, un chiffre et un caractere special',
          errors: errors.array()
        });
      }

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token de reinitialisation requis'
        });
      }

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
