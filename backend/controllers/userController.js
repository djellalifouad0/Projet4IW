const crypto = require('crypto');
const User = require('../models/user');
const Rating = require('../models/rating');
const { Sequelize } = require('sequelize');
const NotificationService = require('../services/notificationService');

// Generate a unique profile token for a user
function generateProfileToken() {
  return crypto.randomBytes(16).toString('hex');
}

// Update or create user logic
User.beforeCreate((user) => {
  user.profileToken = generateProfileToken();
});

User.beforeUpdate((user) => {
  if (!user.profileToken) {
    user.profileToken = generateProfileToken();
  }
});

// ✅ Récupérer tous les utilisateurs (admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erreur récupération utilisateurs' });
  }
};

// ✅ Activer/Désactiver un utilisateur
exports.toggleUserActive = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `Utilisateur ${user.isActive ? 'activé' : 'désactivé'}` });
  } catch (error) {
    res.status(500).json({ error: 'Erreur changement statut' });
  }
};

// ✅ Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    await user.destroy();
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur suppression utilisateur' });
  }
};

// ✅ Mettre à jour le profil utilisateur
exports.updateUserProfile = async (req, res) => {
  try {
    const { username, bio, address, avatar, cover } = req.body;
    const userId = req.user.id; // Supposons que l'ID utilisateur est disponible dans req.user

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.address = address || user.address;
    user.avatar = avatar || user.avatar;
    user.cover = cover || user.cover;    await user.save();    // Créer une notification de mise à jour de profil
    try {
      const io = req.app.get('socketio'); // Récupérer l'instance WebSocket
      await NotificationService.createProfileUpdateNotification(userId, io);
    } catch (notifError) {
      console.error('Erreur création notification profil:', notifError);
    }

    res.json({ message: 'Profil mis à jour avec succès', user });
  } catch (error) {
    res.status(500).json({ error: 'Erreur mise à jour du profil' });
  }
};

// ✅ Récupérer un utilisateur par son token de profil
exports.getUserByProfileToken = async (req, res) => {
  try {
    const { profileToken } = req.params;
    const user = await User.findOne({ 
      where: { profileToken },
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Récupérer les statistiques de notation
    const ratingStats = await Rating.findOne({
      where: { ratedUserId: user.id },
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('rating')), 'average'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'total']
      ]
    });

    const averageRating = parseFloat(ratingStats?.dataValues?.average) || 0;
    const totalRatings = parseInt(ratingStats?.dataValues?.total) || 0;

    // Ajouter les statistiques au profil utilisateur
    const userWithRatings = {
      ...user.toJSON(),
      ratingStats: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings
      }
    };

    res.json(userWithRatings);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
