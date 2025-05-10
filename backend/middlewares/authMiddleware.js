const jwt = require('jsonwebtoken');
const JWT_SECRET = 'votre_clé_secrète'; // à stocker dans un fichier .env sécurisé

/**
 * Middleware d'authentification :
 * - Vérifie le token dans le header Authorization
 * - Décode le token et attache l'objet `user` à la requête
 */
exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ error: 'Token manquant ou mal formé' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token invalide ou expiré' });
  }
};

/**
 * Middleware d'autorisation :
 * - Vérifie que le rôle de l'utilisateur est "admin"
 */
exports.authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
  next();
};
