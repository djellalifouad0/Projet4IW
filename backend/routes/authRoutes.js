const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentification des utilisateurs
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Créer un compte utilisateur ou administrateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *       400:
 *         description: Utilisateur déjà existant
 *       500:
 *         description: Erreur serveur
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion avec email et mot de passe
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie avec token JWT
 *       401:
 *         description: Identifiants invalides
 *       403:
 *         description: Utilisateur désactivé
 *       500:
 *         description: Erreur serveur
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Connexion via Google OAuth (mock)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, googleId, username]
 *             properties:
 *               email:
 *                 type: string
 *               googleId:
 *                 type: string
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion Google réussie
 *       500:
 *         description: Erreur serveur
 */
router.post('/google', authController.googleAuthCallback);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Récupérer l'utilisateur connecté
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Utilisateur connecté récupéré
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/me', authenticate, (req, res) => {
  const User = require('../models/user');
  User.findByPk(req.user.id, { attributes: ['id', 'username', 'email'] })
    .then(user => {
      if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
      res.json(user);
    })
    .catch(() => res.status(500).json({ error: 'Erreur serveur' }));
});

module.exports = router;
