const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleAuthCallback);
router.post('/enable-2fa', authenticate, authController.enable2FA);
router.get('/validate/:token', authController.validateAccount);

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
router.put('/change-password', authenticate, authController.changePassword);
router.put('/change-email', authenticate, authController.changeEmail);

router.post('/logout-all', authenticate, authController.logoutAll);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.get('/reset-password/:token', authController.showResetPasswordForm);
module.exports = router;

