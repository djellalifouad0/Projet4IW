const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');
const NotificationService = require('../services/notificationService');
const e = require('express');
const { Op } = require('sequelize');
const JWT_SECRET = 'votre_clé_secrète'; // Remplace avec un .env sécurisé
const MailService = require('../services/emailService');
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Utilisateur déjà existant' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profileToken = crypto.randomBytes(16).toString('hex');
    const validationToken = crypto.randomBytes(24).toString('hex');

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'user',
      profileToken,
      isActive: false,
      validationToken
    });

    const validationLink = `${req.protocol}://${req.get('host')}/api/auth/validate/${validationToken}`;
    await MailService.sendAccountValidationEmail(email, username, validationLink);

    res.status(201).json({
      message: 'Compte créé. Vérifiez votre email pour activer votre compte.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur création compte', details: error.message });
  }
};

exports.validateAccount = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ where: { validationToken: token } });
    if (!user) {
      return res
        .status(400)
        .send(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #fff3f3; border: 1px solid #f5c2c7; border-radius: 8px; color: #842029;">
          <h2>Lien invalide ou expiré</h2>
          <p>Le lien de validation est invalide ou a déjà été utilisé.</p>
        </div>
        `);
    }

    user.isActive = true;
    user.validationToken = null;
    await user.save();

    res.send(`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #e7f9f0; border: 1px solid #badbcc; border-radius: 8px; color: #0f5132;">
        <h2>Compte activé !</h2>
        <p>Bonjour <strong>${user.username}</strong>, votre compte a été activé avec succès.</p>
        <p>Vous pouvez maintenant vous connecter à votre compte.</p>
        <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Retour à l'accueil</a>
      </div>
    `);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send(`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #fff3f3; border: 1px solid #f5c2c7; border-radius: 8px; color: #842029;">
        <h2>Erreur</h2>
        <p>Une erreur est survenue lors de la validation du compte. Veuillez réessayer plus tard.</p>
      </div>
      `);
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !user.isActive)
      return res.status(403).json({ error: 'Utilisateur désactivé ou inexistant' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Mot de passe incorrect' });

    if (user.totpSecret) {
      if (!otp || !verifyTOTP(otp, user.totpSecret)) {
        return res.status(401).json({ error: 'Code de vérification invalide' });
      }
    }

    const token = jwt.sign({
      id: user.id,
      userId: user.id, // Ajouter pour compatibilité WebSocket
      username: user.username, // Ajouter le username pour les notifications
      role: user.role,
      profileToken: user.profileToken
    }, JWT_SECRET, { expiresIn: '2h' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Erreur connexion', details: error.message });
  }
};
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('211678426929-22c5s4tksctlud2p36qt3q9p10jdnpf4.apps.googleusercontent.com'); 


exports.googleAuthCallback = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'idToken manquant' });
    }

    // Vérifier et décoder le id_token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: '211678426929-22c5s4tksctlud2p36qt3q9p10jdnpf4.apps.googleusercontent.com' // 👈 remplace ici aussi
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const googleId = payload.sub; // identifiant Google unique
    const username = payload.name || email.split('@')[0];

    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        email,
        username,
        googleId,
        role: 'user',
        password: null
      });
    }

    const token = jwt.sign({
      id: user.id,
      userId: user.id,
      username: user.username,
      role: user.role,
      profileToken: user.profileToken
    }, JWT_SECRET, { expiresIn: '2h' });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur authentification Google', details: error.message });
  }
};


function generateSecret() {
  return crypto.randomBytes(20).toString('hex');
}

function generateTOTP(secret, window = 0) {
  const key = Buffer.from(secret, 'hex');
  const time = Math.floor(Date.now() / 30000) + window;
  const buffer = Buffer.alloc(8);
  buffer.writeUInt32BE(0, 0);
  buffer.writeUInt32BE(time, 4);

  const hmac = crypto.createHmac('sha1', key).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = (
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  ) % 1000000;

  return code.toString().padStart(6, '0');
}

function verifyTOTP(token, secret) {
  for (let errorWindow = -1; errorWindow <= 1; errorWindow++) {
    if (generateTOTP(secret, errorWindow) === token) {
      return true;
    }
  }
  return false;
}

exports.enable2FA = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId); // req.userId injecté par middleware JWT
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const secret = generateSecret();
    user.totpSecret = secret;
    await user.save();

    const otpauthUrl = `otpauth://totp/MyApp:${user.email}?secret=${secret}&issuer=MyApp`;

    res.json({
      message: '2FA activée',
      secret,
      otpauthUrl // Utilise un QR Code generator avec ça
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur activation 2FA', details: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ error: 'Mot de passe actuel incorrect' });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du changement de mot de passe', details: error.message });
  }
};

exports.changeEmail = async (req, res) => {
  try {
    const { newEmail, password } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Mot de passe incorrect' });

    const existingUser = await User.findOne({ where: { email: newEmail } });
    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({ error: 'Cette adresse email est déjà utilisée' });
    }

    user.email = newEmail;
    await user.save();

    res.json({ message: 'Adresse email modifiée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du changement d\'email', details: error.message });
  }
};

exports.logoutAll = async (req, res) => {
  try {




    res.json({ message: 'Déconnecté de tous les appareils' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la déconnexion', details: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`Demande de réinitialisation de mot de passe pour l'email: ${email}`);

    const user = await User.findOne({ where: { email, isActive: true } });
    if (!user) {
      return res.status(400).json({ error: 'Aucun compte actif trouvé avec cet email' });
    }

    const resetToken = crypto.randomBytes(24).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000; // valide 1h
    await user.save();

    const resetLink = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

    await MailService.sendResetPasswordEmail(email, user.username, resetLink);

    res.json({ message: 'Email de réinitialisation envoyé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur forget password', details: error.message });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpires: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Lien invalide ou expiré' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur reset password', details: error.message });
  }
};
exports.showResetPasswordForm = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpires: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res
        .status(400)
        .send(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #fff3f3; border: 1px solid #f5c2c7; border-radius: 8px; color: #842029;">
          <h2>Lien invalide ou expiré</h2>
          <p>Le lien de réinitialisation est invalide ou a expiré.</p>
        </div>
        `);
    }

    res.send(`
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; border: 1px solid #ddd;">
        <h2 style="color: #333;">Réinitialiser votre mot de passe</h2>
        <form method="POST" action="/api/auth/reset-password/${token}">
          <label for="newPassword">Nouveau mot de passe :</label><br>
          <input type="password" id="newPassword" name="newPassword" required style="width:100%;padding:8px;margin:10px 0;"><br>
          <button type="submit" style="background-color:#4CAF50;color:white;padding:10px 20px;border:none;border-radius:4px;">Valider</button>
        </form>
      </div>
    `);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send(`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #fff3f3; border: 1px solid #f5c2c7; border-radius: 8px; color: #842029;">
        <h2>Erreur</h2>
        <p>Une erreur est survenue. Veuillez réessayer plus tard.</p>
      </div>
      `);
  }
};



