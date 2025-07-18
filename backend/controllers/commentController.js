const Comment = require('../models/comment');
const User = require('../models/user');
const Skill = require('../models/skill');
const NotificationService = require('../services/notificationService');


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

