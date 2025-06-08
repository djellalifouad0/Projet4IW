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
 *               otp:
 *                 type: string
 *                 description: Code TOTP si 2FA est activée
 *     responses:
 *       200:
 *         description: Connexion réussie avec token JWT
 *       401:
 *         description: Identifiants invalides ou OTP incorrect
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
 * /api/auth/enable-2fa:
 *   post:
 *     summary: Activer l'authentification à deux facteurs (2FA) pour un utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Clé secrète 2FA générée avec otpauthUrl (à scanner dans Google Authenticator)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 secret:
 *                   type: string
 *                 otpauthUrl:
 *                   type: string
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post('/enable-2fa', authenticate, authController.enable2FA);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Récupérer l'utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
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
  User.findByPk(req.user.id, {
    attributes: ['id', 'username', 'email', 'avatar', 'cover', 'profileToken']
  })
    .then(user => {
      if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
      res.json(user);
    })
    .catch(() => res.status(500).json({ error: 'Erreur serveur' }));
});

module.exports = router;
