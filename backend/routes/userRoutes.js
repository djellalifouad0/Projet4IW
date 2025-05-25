const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestion des utilisateurs (réservée aux administrateurs)
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé (admin requis)
 */
router.get('/users', authenticate, authorizeAdmin, userController.getAllUsers);

/**
 * @swagger
 * /api/users/{id}/toggle:
 *   patch:
 *     summary: Activer ou désactiver un utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'utilisateur
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Statut de l'utilisateur modifié
 *       404:
 *         description: Utilisateur introuvable
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 */
router.patch('/users/:id/toggle', authenticate, authorizeAdmin, userController.toggleUserActive);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'utilisateur
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 *       404:
 *         description: Utilisateur introuvable
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 */
router.delete('/users/:id', authenticate, authorizeAdmin, userController.deleteUser);

// Ajout route pour récupérer l'utilisateur connecté
router.get('/users/me', authenticate, (req, res) => {
  // req.user contient { id, role } grâce au middleware authenticate
  const User = require('../models/user');
  User.findByPk(req.user.id, { attributes: ['id', 'username', 'email'] })
    .then(user => {
      if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
      res.json(user);
    })
    .catch(() => res.status(500).json({ error: 'Erreur serveur' }));
});

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Mettre à jour le profil de l'utilisateur connecté
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               avatar:
 *                 type: string
 *               cover:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil mis à jour
 *       400:
 *         description: Données de requête invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 */
router.put('/profile', authenticate, userController.updateUserProfile);

/**
 * @swagger
 * /api/users/profile/{profileToken}:
 *   get:
 *     summary: Récupérer un utilisateur par son profileToken
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Utilisateur récupéré avec succès
 *       404:
 *         description: Utilisateur non trouvé
 */
router.get('/users/profile/:profileToken', userController.getUserByProfileToken);

module.exports = router;
