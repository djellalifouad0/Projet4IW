const Like = require('../models/like');
const Skill = require('../models/skill');
const User = require('../models/user');
const NotificationService = require('../services/notificationService');

/**
 * @swagger
 * /skills/{id}/like:
 *   post:
 *     summary: Aime une compétence
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Compétence aimée
 */
exports.likeSkill = async (req, res) => {
  try {
    console.log('LIKE: userId:', req.user && req.user.id, 'skillId:', req.params.id);
    const [like, created] = await Like.findOrCreate({
      where: { userId: req.user.id, skillId: req.params.id }
    });
    console.log('LIKE RESULT:', like, 'CREATED:', created);

    // Récupérer les informations de la compétence pour la notification
    const skill = await Skill.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'username'] }]
    });

    // Créer une notification pour le propriétaire de la compétence (si ce n'est pas lui qui like)
    // Même si le like existait déjà, on crée une nouvelle notification pour actualiser l'heure
    if (skill && skill.User && skill.User.id !== req.user.id) {
      try {
        const likerName = req.user.username;
        const io = req.app.get('socketio');
        await NotificationService.createNewLikeNotification(
          skill.User.id,
          likerName,
          skill.description,
          req.user.id,
          io
        );
      } catch (notifError) {
        console.error('Erreur création notification like:', notifError);
      }
    }

    res.json({ 
      liked: true, // Toujours retourner true car l'action de like a été effectuée
      message: created ? 'Compétence ajoutée à vos favoris !' : 'Compétence toujours dans vos favoris !'
    });
  } catch (error) {
    console.error('LIKE ERROR:', error);
    res.status(500).json({ error: 'Erreur lors du like', details: error.message });
  }
};

/**
 * @swagger
 * /skills/{id}/unlike:
 *   delete:
 *     summary: Retire un like d'une compétence
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Like retiré
 */
exports.unlikeSkill = async (req, res) => {
  try {
    const result = await Like.destroy({ where: { userId: req.user.id, skillId: req.params.id } });
    res.json({ 
      unliked: result > 0, 
      message: result > 0 ? 'Compétence retirée de vos favoris' : 'Cette compétence n\'était pas dans vos favoris'
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du unlike' });
  }
};
