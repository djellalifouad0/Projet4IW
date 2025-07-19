const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticate } = require('../middlewares/authMiddleware');

// Routes publiques (webhooks)
router.post('/payment-webhook', express.raw({type: 'application/json'}), appointmentController.handlePaymentWebhook);

// Routes protégées
router.use(authenticate);

// Middleware de debug pour la route PATCH
router.patch('/:id/status', (req, res, next) => {
  console.log('=== Route PATCH /:id/status called ===');
  console.log('Params:', req.params);
  console.log('Body:', req.body);
  console.log('User:', req.user?.id);
  next();
}, appointmentController.updateAppointmentStatus);

router.post('/', appointmentController.createAppointment);
router.get('/', appointmentController.getUserAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.get('/conversation/:conversationId', appointmentController.getAppointmentsByConversation);
router.delete('/:id', appointmentController.deleteAppointment);

// Routes de paiement
router.post('/:id/create-payment-session', appointmentController.createPaymentSession);
router.get('/payment-success', appointmentController.verifyPaymentSuccess);

module.exports = router;

