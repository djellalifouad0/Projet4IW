const { Rating, User } = require('../models/associations');
const { Sequelize } = require('sequelize');
const NotificationService = require('../services/notificationService');

/**
 * @swagger
 * tags:
 *   name: Ratings
 *   description: Gestion des avis et notes utilisateurs
 */

const ratingController = {
  /**
   * @swagger
   * /api/ratings:
   *   post:
   *     summary: Donner un avis/note à un utilisateur
   *     tags: [Ratings]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - ratedUserId
   *               - rating
   *             properties:
   *               ratedUserId:
   *                 type: integer
   *                 description: ID de l'utilisateur à noter
   *               rating:
   *                 type: number
   *                 minimum: 1
   *                 maximum: 5
   *                 description: Note de 1 à 5
   *               comment:
   *                 type: string
   *                 description: Commentaire optionnel
   *     responses:
   *       201:
   *         description: Avis créé avec succès
   *       400:
   *         description: Données invalides
   *       409:
   *         description: Avis déjà donné ou tentative d'auto-notation
   */
  createRating: async (req, res) => {
    try {
      const { ratedUserId, rating, comment } = req.body;
      const raterId = req.user.id;

      // Vérifier que l'utilisateur ne se note pas lui-même
      if (raterId === parseInt(ratedUserId)) {
        return res.status(400).json({ 
          error: 'Vous ne pouvez pas vous noter vous-même' 
        });
      }

      // Vérifier que l'utilisateur à noter existe
      const ratedUser = await User.findByPk(ratedUserId);
      if (!ratedUser) {
        return res.status(404).json({ 
          error: 'Utilisateur à noter introuvable' 
        });
      }

      // Créer l'avis
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

  /**
   * @swagger
   * /api/ratings/{id}:
   *   put:
   *     summary: Modifier un avis existant
   *     tags: [Ratings]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de l'avis
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               rating:
   *                 type: number
   *                 minimum: 1
   *                 maximum: 5
   *               comment:
   *                 type: string
   *     responses:
   *       200:
   *         description: Avis modifié avec succès
   *       403:
   *         description: Non autorisé à modifier cet avis
   *       404:
   *         description: Avis introuvable
   */
  updateRating: async (req, res) => {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user.id;

      const existingRating = await Rating.findByPk(id);
      if (!existingRating) {
        return res.status(404).json({ error: 'Avis introuvable' });
      }

      // Vérifier que l'utilisateur est bien celui qui a donné l'avis
      if (existingRating.raterId !== userId) {
        return res.status(403).json({ 
          error: 'Vous ne pouvez modifier que vos propres avis' 
        });
      }

      await existingRating.update({ rating, comment });

      // Récupérer l'avis modifié avec les informations du notateur
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

  /**
   * @swagger
   * /api/ratings/{id}:
   *   delete:
   *     summary: Supprimer un avis
   *     tags: [Ratings]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de l'avis
   *     responses:
   *       200:
   *         description: Avis supprimé avec succès
   *       403:
   *         description: Non autorisé à supprimer cet avis
   *       404:
   *         description: Avis introuvable
   */
  deleteRating: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const rating = await Rating.findByPk(id);
      if (!rating) {
        return res.status(404).json({ error: 'Avis introuvable' });
      }

      // Vérifier que l'utilisateur est bien celui qui a donné l'avis
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

  /**
   * @swagger
   * /api/ratings/user/{userId}:
   *   get:
   *     summary: Récupérer les avis d'un utilisateur
   *     tags: [Ratings]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de l'utilisateur
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Numéro de page
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Nombre d'avis par page
   *     responses:
   *       200:
   *         description: Liste des avis avec moyenne et total
   */
  getUserRatings: async (req, res) => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Vérifier que l'utilisateur existe
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur introuvable' });
      }

      // Récupérer les avis avec pagination
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

      // Calculer la moyenne des notes
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

  /**
   * @swagger
   * /api/ratings/user/{userId}/summary:
   *   get:
   *     summary: Récupérer un résumé des notes d'un utilisateur
   *     tags: [Ratings]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de l'utilisateur
   *     responses:
   *       200:
   *         description: Résumé des notes (moyenne, total, répartition)
   */
  getUserRatingSummary: async (req, res) => {
    try {
      const { userId } = req.params;

      // Vérifier que l'utilisateur existe
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur introuvable' });
      }

      // Calculer la moyenne et le total
      const summary = await Rating.findOne({
        where: { ratedUserId: userId },
        attributes: [
          [Sequelize.fn('AVG', Sequelize.col('rating')), 'average'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'total']
        ]
      });

      // Répartition des notes par étoile
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

      // Formatier la répartition
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
