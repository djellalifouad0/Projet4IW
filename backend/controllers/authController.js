const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = 'votre_clé_secrète'; // Remplace avec un .env sécurisé

// ➕ Inscription normale (user/admin)
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Utilisateur déjà existant' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    res.status(201).json({ message: 'Compte créé', user });
  } catch (error) {
    res.status(500).json({ error: 'Erreur création compte', details: error.message });
  }
};

// ➕ Connexion email / mot de passe
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !user.isActive)
      return res.status(403).json({ error: 'Utilisateur désactivé ou inexistant' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Mot de passe incorrect' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '2h' });

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

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '2h' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Erreur authentification Google', details: error.message });
  }
};
