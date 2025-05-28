const Like = require('../models/like');

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
    res.json({ 
      liked: created, 
      message: created ? 'Compétence ajoutée à vos favoris !' : 'Vous avez déjà aimé cette compétence'
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
