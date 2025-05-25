const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticate } = require('../middlewares/authMiddleware');

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes pour les rendez-vous
router.post('/', appointmentController.createAppointment);
router.get('/', appointmentController.getUserAppointments);
router.patch('/:id/status', appointmentController.updateAppointmentStatus);
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;
