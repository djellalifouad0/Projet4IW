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

module.exports = router;
