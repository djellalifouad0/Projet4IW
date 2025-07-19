const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware');


router.get('/users', authenticate, authorizeAdmin, userController.getAllUsers);


router.patch('/users/:id/toggle', authenticate, authorizeAdmin, userController.toggleUserActive);


router.delete('/users/:id', authenticate, authorizeAdmin, userController.deleteUser)

router.get('/users/me', authenticate, (req, res) => {

  const User = require('../models/user');
  User.findByPk(req.user.id, { attributes: ['id', 'username', 'email'] })
    .then(user => {
      if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
      res.json(user);
    })
    .catch(() => res.status(500).json({ error: 'Erreur serveur' }));
});


router.put('/profile', authenticate, userController.updateUserProfile);


router.get('/users/profile/:profileToken', userController.getUserByProfileToken);


router.get('/users/search', authenticate, userController.searchUsers);

module.exports = router;

