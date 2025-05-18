const Comment = require('../models/comment');

/**
 * @swagger
 * /skills/{id}/comments:
 *   post:
 *     summary: Ajoute un commentaire à une compétence
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Commentaire ajouté
 */
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.create({
      userId: req.user.id,
      skillId: req.params.id,
      content
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'ajout du commentaire' });
  }
};

/**
 * @swagger
 * /skills/{id}/comments:
 *   get:
 *     summary: Liste les commentaires d'une compétence
 *     tags: [Skills]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Liste des commentaires
 */
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: { skillId: req.params.id },
      include: ['userId']
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Erreur récupération commentaires' });
  }
};
