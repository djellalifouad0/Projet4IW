const crypto = require('crypto');
const User = require('../models/user');
const Rating = require('../models/rating');
const { Sequelize } = require('sequelize');
const NotificationService = require('../services/notificationService');

function generateProfileToken() {
  return crypto.randomBytes(16).toString('hex');
}

User.beforeCreate((user) => {
  user.profileToken = generateProfileToken();
});

User.beforeUpdate((user) => {
  if (!user.profileToken) {
    user.profileToken = generateProfileToken();
  }
});

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erreur récupération utilisateurs' });
  }
};

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

exports.updateUserProfile = async (req, res) => {
  try {
    const { username, bio, address, avatar, cover } = req.body;
    const userId = req.user.id;

    console.log('=== DÉBUT MISE À JOUR PROFIL ===');
    console.log('User ID:', userId);
    console.log('Username:', username);
    console.log('Bio:', bio);
    console.log('Address:', address);
    console.log('Avatar présent:', !!avatar);
    console.log('Cover présent:', !!cover);
    if (avatar) console.log('Taille avatar:', avatar.length);
    if (cover) console.log('Taille cover:', cover.length);

    const user = await User.findByPk(userId);
    if (!user) {
      console.log('Utilisateur non trouvé:', userId);
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    console.log('Utilisateur trouvé:', user.username);

    // Mise à jour progressive pour identifier le problème
    if (username !== undefined) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (address !== undefined) user.address = address;
    
    console.log('Avant mise à jour des images');
    
    if (avatar !== undefined) {
      console.log('Mise à jour avatar...');
      user.avatar = avatar;
    }
    if (cover !== undefined) {
      console.log('Mise à jour cover...');
      user.cover = cover;
    }
    
    console.log('Avant sauvegarde...');
    await user.save();
    console.log('Sauvegarde réussie');

    // Skip notification pour l'instant
    console.log('=== FIN MISE À JOUR PROFIL ===');

    res.json({ 
      message: 'Profil mis à jour avec succès', 
      user: {
        id: user.id,
        username: user.username,
        bio: user.bio,
        address: user.address,
        avatar: user.avatar ? 'présent' : null,
        cover: user.cover ? 'présent' : null
      }
    });
  } catch (error) {
    console.error('=== ERREUR MISE À JOUR PROFIL ===');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('=== FIN ERREUR ===');
    res.status(500).json({ 
      error: 'Erreur mise à jour du profil', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

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

    const ratingStats = await Rating.findOne({
      where: { ratedUserId: user.id },
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('rating')), 'average'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'total']
      ]
    });

    const averageRating = parseFloat(ratingStats?.dataValues?.average) || 0;
    const totalRatings = parseInt(ratingStats?.dataValues?.total) || 0;

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

exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user.id;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Le terme de recherche doit contenir au moins 2 caractères' });
    }

    const users = await User.findAll({
      where: {
        [Sequelize.Op.and]: [
          {
            [Sequelize.Op.or]: [
              Sequelize.where(
                Sequelize.fn('LOWER', Sequelize.col('email')), 
                'LIKE', 
                `%${q.trim().toLowerCase()}%`
              ),
              Sequelize.where(
                Sequelize.fn('LOWER', Sequelize.col('username')), 
                'LIKE', 
                `%${q.trim().toLowerCase()}%`
              )
            ]
          },
          {
            id: {
              [Sequelize.Op.ne]: currentUserId // Exclure l'utilisateur connecté
            },
            isActive: true // Seulement les utilisateurs actifs
          }
        ]
      },
      attributes: ['id', 'username', 'email', 'avatar', 'profileToken'],
      limit: 10
    });

    res.json(users);
  } catch (error) {
    console.error('Erreur recherche utilisateurs:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche d\'utilisateurs' });
  }
};

