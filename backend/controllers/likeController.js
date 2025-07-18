const Like = require('../models/like');
const Skill = require('../models/skill');
const User = require('../models/user');
const NotificationService = require('../services/notificationService');


exports.likeSkill = async (req, res) => {
  try {
    console.log('LIKE: userId:', req.user && req.user.id, 'skillId:', req.params.id);
    const [like, created] = await Like.findOrCreate({
      where: { userId: req.user.id, skillId: req.params.id }
    });
    console.log('LIKE RESULT:', like, 'CREATED:', created);

    const skill = await Skill.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'username'] }]
    });


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

