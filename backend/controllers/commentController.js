const Comment = require('../models/comment');
const User = require('../models/user');
const Skill = require('../models/skill');
const NotificationService = require('../services/notificationService');

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
    const { content, parentId } = req.body;
    const comment = await Comment.create({
      userId: req.user.id,
      skillId: req.params.id,
      content,
      parentId: parentId || null
    });    // Récupérer les informations de la compétence et du propriétaire
    const skill = await Skill.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'username'] }]
    });    // Créer une notification pour le propriétaire de la compétence (si ce n'est pas lui qui commente)
    if (skill && skill.User && skill.User.id !== req.user.id) {
          try {
        const commenterName = req.user.username;
        const io = req.app.get('socketio'); // Récupérer l'instance WebSocket
        await NotificationService.createNewCommentNotification(
          skill.User.id,
          commenterName,
          skill.description,
          io
        );
      } catch (notifError) {
        console.error('Erreur création notification commentaire:', notifError);
      }
    }

    res.status(201).json({ 
      ...comment.toJSON(), 
      message: parentId ? 'Réponse ajoutée avec succès !' : 'Commentaire ajouté avec succès !'
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
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
      include: [{ model: User, attributes: ['username', 'avatar'] }]
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Erreur récupération commentaires' });
  }
};

/**
 * @swagger
 * /comments/{id}:
 *   patch:
 *     summary: Met à jour un commentaire
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *       200:
 *         description: Commentaire mis à jour avec succès
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Commentaire non trouvé
 */
exports.updateComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Commentaire non trouvé' });
    if (comment.userId !== req.user.id) return res.status(403).json({ error: 'Non autorisé' });
    
    const { content } = req.body;
    await comment.update({ content });
    res.json({ ...comment.toJSON(), message: 'Commentaire modifié avec succès !' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur mise à jour commentaire' });
  }
};

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Supprime un commentaire
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Commentaire supprimé avec succès
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Commentaire non trouvé
 */
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Commentaire non trouvé' });
    if (comment.userId !== req.user.id) return res.status(403).json({ error: 'Non autorisé' });
    
    await comment.destroy();
    res.json({ message: 'Commentaire supprimé avec succès !' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur suppression commentaire' });
  }
};
