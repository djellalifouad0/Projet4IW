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
    const [like, created] = await Like.findOrCreate({
      where: { userId: req.user.id, skillId: req.params.id }
    });
    res.json({ liked: created });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du like' });
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
    res.json({ unliked: result > 0 });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du unlike' });
  }
};
