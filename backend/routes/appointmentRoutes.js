const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

router.post('/', appointmentController.createAppointment);
router.get('/', appointmentController.getUserAppointments);
router.get('/conversation/:conversationId', appointmentController.getAppointmentsByConversation);
router.patch('/:id/status', appointmentController.updateAppointmentStatus);
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;

