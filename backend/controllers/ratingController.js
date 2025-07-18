const { Rating, User } = require('../models/associations');
const { Sequelize } = require('sequelize');
const NotificationService = require('../services/notificationService');


const ratingController = {
  
  createRating: async (req, res) => {
    try {
      const { ratedUserId, rating, comment } = req.body;
      const raterId = req.user.id;

      if (raterId === parseInt(ratedUserId)) {
        return res.status(400).json({ 
          error: 'Vous ne pouvez pas vous noter vous-même' 
        });
      }

      const ratedUser = await User.findByPk(ratedUserId);
      if (!ratedUser) {
        return res.status(404).json({ 
          error: 'Utilisateur à noter introuvable' 
        });
      }

      const newRating = await Rating.create({
        raterId,
        ratedUserId: parseInt(ratedUserId),
        rating: parseFloat(rating),
        comment
      });      // Récupérer l'avis créé avec les informations du notateur
      const createdRating = await Rating.findByPk(newRating.id, {
        include: [
          {
            model: User,          as: 'rater',
            attributes: ['id', 'username', 'avatar']
          }
        ]
      });      // Créer une notification pour l'utilisateur noté
      try {
        const raterName = createdRating.rater.username;
        const io = req.app.get('socketio'); // Récupérer l'instance WebSocket
        await NotificationService.createNewRatingNotification(
          ratedUserId,
          raterName,
          'votre profil', // Titre générique car ce n'est pas lié à une compétence spécifique
          rating,
          io
        );
      } catch (notifError) {
        console.error('Erreur création notification évaluation:', notifError);
      }

      res.status(201).json(createdRating);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ 
          error: 'Vous avez déjà noté cet utilisateur' 
        });
      }
      console.error('Erreur lors de la création de l\'avis:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  
  updateRating: async (req, res) => {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user.id;

      const existingRating = await Rating.findByPk(id);
      if (!existingRating) {
        return res.status(404).json({ error: 'Avis introuvable' });
      }

      if (existingRating.raterId !== userId) {
        return res.status(403).json({ 
          error: 'Vous ne pouvez modifier que vos propres avis' 
        });
      }

      await existingRating.update({ rating, comment });

      const updatedRating = await Rating.findByPk(id, {
        include: [
          {
            model: User,
            as: 'rater',
            attributes: ['id', 'username', 'avatar']
          }
        ]
      });

      res.json(updatedRating);
    } catch (error) {
      console.error('Erreur lors de la modification de l\'avis:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  
  deleteRating: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const rating = await Rating.findByPk(id);
      if (!rating) {
        return res.status(404).json({ error: 'Avis introuvable' });
      }

      if (rating.raterId !== userId) {
        return res.status(403).json({ 
          error: 'Vous ne pouvez supprimer que vos propres avis' 
        });
      }

      await rating.destroy();
      res.json({ message: 'Avis supprimé avec succès' });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'avis:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  
  getUserRatings: async (req, res) => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur introuvable' });
      }

      const { count, rows: ratings } = await Rating.findAndCountAll({
        where: { ratedUserId: userId },
        include: [
          {
            model: User,
            as: 'rater',
            attributes: ['id', 'username', 'avatar']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      const avgRating = await Rating.findOne({
        where: { ratedUserId: userId },
        attributes: [
          [Sequelize.fn('AVG', Sequelize.col('rating')), 'average'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'total']
        ]
      });

      const average = parseFloat(avgRating.dataValues.average) || 0;
      const total = parseInt(avgRating.dataValues.total) || 0;

      res.json({
        ratings,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit
        },
        statistics: {
          averageRating: Math.round(average * 10) / 10, // Arrondir à 1 décimale
          totalRatings: total
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des avis:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  
  getUserRatingSummary: async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur introuvable' });
      }

      const summary = await Rating.findOne({
        where: { ratedUserId: userId },
        attributes: [
          [Sequelize.fn('AVG', Sequelize.col('rating')), 'average'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'total']
        ]
      });

      const distribution = await Rating.findAll({
        where: { ratedUserId: userId },
        attributes: [
          'rating',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        group: ['rating'],
        order: [['rating', 'DESC']]
      });

      const average = parseFloat(summary.dataValues.average) || 0;
      const total = parseInt(summary.dataValues.total) || 0;

      const ratingDistribution = {
        5: 0, 4: 0, 3: 0, 2: 0, 1: 0
      };

      distribution.forEach(item => {
        const rating = Math.floor(parseFloat(item.rating));
        ratingDistribution[rating] = parseInt(item.dataValues.count);
      });

      res.json({
        averageRating: Math.round(average * 10) / 10,
        totalRatings: total,
        distribution: ratingDistribution
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du résumé:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
};

module.exports = ratingController;

