/**
 * Service d'envoi d'emails
 * @version 1.0.0
 */

const nodemailer = require('nodemailer');

// Configuration du transporteur SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Vérifier la configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Erreur configuration email:', error);
  } else {
    console.log('✅ Service email prêt');
  }
});

/**
 * Envoyer un email de vérification
 */
const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Vérifiez votre adresse email - AI English Trainer',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1976d2; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #1976d2; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 AI English Trainer</h1>
          </div>
          <div class="content">
            <h2>Bienvenue !</h2>
            <p>Merci de vous être inscrit à AI English Trainer.</p>
            <p>Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Vérifier mon email</a>
            </p>
            <p>Ou copiez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; color: #1976d2;">${verificationUrl}</p>
            <p><strong>Ce lien expirera dans 24 heures.</strong></p>
          </div>
          <div class="footer">
            <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
            <p>© 2025 AI English Trainer - Tous droits réservés</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  return await transporter.sendMail(mailOptions);
};

/**
 * Envoyer un email de réinitialisation de mot de passe
 */
const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Réinitialisation de votre mot de passe - AI English Trainer',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1976d2; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #d32f2f; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px;
            margin: 20px 0;
          }
          .warning { 
            background: #fff3cd; 
            border-left: 4px solid #ffc107; 
            padding: 12px; 
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 AI English Trainer</h1>
          </div>
          <div class="content">
            <h2>Réinitialisation de mot de passe</h2>
            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
            <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
            </p>
            <p>Ou copiez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; color: #1976d2;">${resetUrl}</p>
            <div class="warning">
              <strong>⚠️ Important :</strong>
              <ul>
                <li>Ce lien expirera dans 1 heure</li>
                <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                <li>Votre mot de passe actuel reste valide tant que vous n'en définissez pas un nouveau</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>Pour toute question, contactez notre support.</p>
            <p>© 2025 AI English Trainer - Tous droits réservés</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  return await transporter.sendMail(mailOptions);
};

/**
 * Envoyer un email de bienvenue
 */
const sendWelcomeEmail = async (email, firstName) => {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Bienvenue sur AI English Trainer ! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1976d2; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .feature { 
            background: white; 
            padding: 15px; 
            margin: 10px 0; 
            border-left: 4px solid #1976d2;
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bienvenue ${firstName} !</h1>
          </div>
          <div class="content">
            <h2>Votre voyage vers l'anglais C1 commence maintenant</h2>
            <p>Nous sommes ravis de vous accueillir sur AI English Trainer, votre assistant personnel pour maîtriser l'anglais technique.</p>
            
            <h3>🚀 Prochaines étapes :</h3>
            <div class="feature">
              <strong>1. Évaluation initiale</strong>
              <p>Complétez l'évaluation de 18 questions pour déterminer votre niveau actuel.</p>
            </div>
            <div class="feature">
              <strong>2. Programme personnalisé</strong>
              <p>Recevez un programme d'apprentissage adapté à votre profil.</p>
            </div>
            <div class="feature">
              <strong>3. Commencez à pratiquer</strong>
              <p>Accédez à 400+ exercices ciblés sur votre domaine IT.</p>
            </div>
            
            <p style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL}" style="
                display: inline-block; 
                padding: 12px 24px; 
                background: #1976d2; 
                color: white; 
                text-decoration: none; 
                border-radius: 5px;
              ">Commencer maintenant</a>
            </p>
          </div>
          <div class="footer">
            <p>Besoin d'aide ? Répondez à cet email ou consultez notre FAQ.</p>
            <p>© 2025 AI English Trainer - Tous droits réservés</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
};

