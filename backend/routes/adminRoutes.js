const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware');

// Toutes les routes admin nécessitent une authentification et des droits admin
router.use(authenticate);
router.use(authorizeAdmin);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Interface d'administration pour gérer l'application
 */

// Dashboard et statistiques
router.get('/dashboard', adminController.getDashboardStats);

// Gestion des utilisateurs
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id', adminController.updateUser);
router.patch('/users/:id/ban', adminController.toggleUserBan);
router.delete('/users/:id', adminController.deleteUser);

// Gestion des conversations
router.get('/conversations', adminController.getAllConversations);
router.delete('/conversations/:id', adminController.deleteConversation);

// Gestion des compétences
router.get('/skills', adminController.getAllSkills);
router.delete('/skills/:id', adminController.deleteSkill);

// Gestion des rendez-vous
router.get('/appointments', adminController.getAllAppointments);
router.get('/appointments/:id', adminController.getAppointmentDetails);
router.patch('/appointments/:id/status', adminController.updateAppointmentStatus);
router.delete('/appointments/:id', adminController.deleteAppointment);

// Gestion des messages
router.get('/messages/flagged', adminController.getFlaggedMessages);

module.exports = router;
