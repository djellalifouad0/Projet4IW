const Skill = require('../models/skill');
const User = require('../models/user'); // Import du modèle User
const Like = require('../models/like'); // Import du modèle Like
const Comment = require('../models/comment'); // Import du modèle Comment


exports.getAllSkills = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { profileToken } = req.query; // Get profileToken from query parameters

    const whereClause = {};
    if (profileToken) {
      const user = await User.findOne({ where: { profileToken } });
      if (user) {
        whereClause.userId = user.id; // Filter posts by userId corresponding to the profileToken
      }
    }    const skills = await Skill.findAll({
      where: whereClause,      include: [
        {
          model: User,
          attributes: ['username', 'avatar', 'profileToken'], // Inclure l'avatar et profileToken
        },
        {
          model: Like,
          attributes: ['userId'],
          required: false
        },
        {
          model: Comment,
          attributes: ['id'],
          required: false
        }
      ],
    });

    const result = skills.map(skill => {
      const likes = skill.Likes ? skill.Likes.length : 0;
      const likedByMe = userId ? skill.Likes.some(l => l.userId === userId) : false;
      const commentsCount = skill.Comments ? skill.Comments.length : 0;
      return {
        ...skill.toJSON(),
        likes,
        likedByMe,
        commentsCount
      };
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des compétences' });
  }
};


exports.getSkillById = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;    const skill = await Skill.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['username', 'avatar', 'profileToken'], // Inclure l'avatar et profileToken
        },
        {
          model: Like,
          attributes: ['userId'],
          required: false
        },
        {
          model: Comment,
          attributes: ['id'],
          required: false
        }
      ]
    });
    
    if (!skill) return res.status(404).json({ error: 'Compétence non trouvée' });

    const likes = skill.Likes ? skill.Likes.length : 0;
    const likedByMe = userId ? skill.Likes.some(l => l.userId === userId) : false;
    const commentsCount = skill.Comments ? skill.Comments.length : 0;
    
    const result = {
      ...skill.toJSON(),
      likes,
      likedByMe,
      commentsCount
    };
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};


exports.createSkill = async (req, res) => {
  try {
    const { description, pricePerHour, location } = req.body;
    const skill = await Skill.create({
      description,
      pricePerHour,
      location,
      userId: req.user.id
    });
    res.status(201).json(skill);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de la compétence', details: error.message });
  }
};


exports.updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findByPk(req.params.id);
    if (!skill || skill.userId !== req.user.id) return res.status(403).json({ error: 'Non autorisé' });
    const { description, pricePerHour, location } = req.body;
    await skill.update({ description, pricePerHour, location });
    res.json(skill);
  } catch (error) {
    res.status(500).json({ error: 'Erreur mise à jour' });
  }
};


exports.deleteSkill = async (req, res) => {
  const sequelize = require('../config/db');
  const Comment = require('../models/comment');
  const Like = require('../models/like');
  const transaction = await sequelize.transaction();
  
  try {
    console.log('Tentative de suppression du skill ID:', req.params.id);
    console.log('Utilisateur connecté:', req.user.id);
    
    const skill = await Skill.findByPk(req.params.id);
    console.log('Skill trouvé:', skill ? skill.id : 'non trouvé');
    
    if (!skill) {
      console.log('Skill non trouvé');
      await transaction.rollback();
      return res.status(404).json({ error: 'Compétence non trouvée' });
    }
    
    if (skill.userId !== req.user.id) {
      console.log('Utilisateur non autorisé. Propriétaire:', skill.userId, 'Utilisateur connecté:', req.user.id);
      await transaction.rollback();
      return res.status(403).json({ error: 'Non autorisé' });
    }
    
    console.log('Suppression manuelle des enregistrements liés...');


    await Comment.destroy({
      where: { 
        skillId: req.params.id,
        parentId: { [require('sequelize').Op.ne]: null }
      },
      transaction
    });
    console.log('Commentaires enfants supprimés');

    await Comment.destroy({
      where: { 
        skillId: req.params.id,
        parentId: null
      },
      transaction
    });
    console.log('Commentaires parents supprimés');

    await Like.destroy({
      where: { skillId: req.params.id },
      transaction
    });
    console.log('Likes supprimés');

    await skill.destroy({ transaction });
    console.log('Skill supprimé');
    
    console.log('Committing transaction...');
    await transaction.commit();
    console.log('Suppression réussie');
    
    res.json({ message: 'Compétence supprimée' });
  } catch (error) {
    console.error('Erreur lors de la suppression du skill:', error);
    console.error('Stack trace:', error.stack);
    await transaction.rollback();
    res.status(500).json({ error: 'Erreur suppression', details: error.message });
  }
};
