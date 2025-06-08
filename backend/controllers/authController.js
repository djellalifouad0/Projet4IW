const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');
const NotificationService = require('../services/notificationService');

const JWT_SECRET = 'votre_clé_secrète'; // Remplace avec un .env sécurisé

// ➕ Inscription normale (user/admin)
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Utilisateur déjà existant' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const profileToken = crypto.randomBytes(16).toString('hex');
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'user',
      profileToken
    });    // Créer une notification de bienvenue
    try {
      const io = req.app.get('socketio'); // Récupérer l'instance WebSocket
      await NotificationService.createWelcomeNotification(user.id, io);
    } catch (notifError) {
      console.error('Erreur création notification bienvenue:', notifError);
    }

    res.status(201).json({ message: 'Compte créé', user });
  } catch (error) {
    res.status(500).json({ error: 'Erreur création compte', details: error.message });
  }
};

// ➕ Connexion email / mot de passe
exports.login = async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !user.isActive)
      return res.status(403).json({ error: 'Utilisateur désactivé ou inexistant' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Mot de passe incorrect' });

    // ➕ Vérification 2FA si activée
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

// ➕ Connexion via Google (OAuth simulée ici)
exports.googleAuthCallback = async (req, res) => {
  try {
    const { email, googleId, username } = req.body;

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
      userId: user.id, // Ajouter pour compatibilité WebSocket
      username: user.username, // Ajouter le username pour les notifications
      role: user.role,
      profileToken: user.profileToken
    }, JWT_SECRET, { expiresIn: '2h' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Erreur authentification Google', details: error.message });
  }
};



// ===== AJOUTS POUR L'AUTHENTIFICATION 2 FACTEURS (TOTP) =====

// 🔐 Générer une clé secrète TOTP (hex string)
function generateSecret() {
  return crypto.randomBytes(20).toString('hex');
}

// 🔁 Générer un code TOTP
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

// ✅ Vérifier un code TOTP reçu
function verifyTOTP(token, secret) {
  for (let errorWindow = -1; errorWindow <= 1; errorWindow++) {
    if (generateTOTP(secret, errorWindow) === token) {
      return true;
    }
  }
  return false;
}

// 🔧 Activer la 2FA pour un utilisateur connecté
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
