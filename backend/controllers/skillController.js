const Skill = require('../models/skill');
const User = require('../models/user'); // Import du modèle User
const Like = require('../models/like'); // Import du modèle Like
const Comment = require('../models/comment'); // Import du modèle Comment

/**
 * @swagger
 * tags:
 *   name: Skills
 *   description: API de gestion des compétences
 */

/**
 * @swagger
 * /skills:
 *   get:
 *     summary: Liste toutes les compétences
 *     tags: [Skills]
 *     responses:
 *       200:
 *         description: Liste des compétences
 */
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
    // Ajout des infos de like et commentaires pour le front
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

/**
 * @swagger
 * /skills/{id}:
 *   get:
 *     summary: Récupère une compétence par ID
 *     tags: [Skills]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Compétence trouvée
 *       404:
 *         description: Compétence non trouvée
 */
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
    
    // Ajout des infos de like et commentaires pour le front
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

/**
 * @swagger
 * /skills:
 *   post:
 *     summary: Crée une nouvelle compétence
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               pricePerHour:
 *                 type: number
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Compétence créée avec succès
 */
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

/**
 * @swagger
 * /skills/{id}:
 *   patch:
 *     summary: Met à jour une compétence existante
 *     tags: [Skills]
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
 *               description:
 *                 type: string
 *               pricePerHour:
 *                 type: number
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Compétence mise à jour avec succès
 *       403:
 *         description: Non autorisé
 */
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

/**
 * @swagger
 * /skills/{id}:
 *   delete:
 *     summary: Supprime une compétence
 *     tags: [Skills]
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
 *         description: Compétence supprimée avec succès
 *       403:
 *         description: Non autorisé
 */
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
    
    // Supprimer manuellement tous les enregistrements liés dans l'ordre approprié
    
    // 1. Supprimer les commentaires enfants (réponses) d'abord
    await Comment.destroy({
      where: { 
        skillId: req.params.id,
        parentId: { [require('sequelize').Op.ne]: null }
      },
      transaction
    });
    console.log('Commentaires enfants supprimés');
    
    // 2. Supprimer les commentaires parents
    await Comment.destroy({
      where: { 
        skillId: req.params.id,
        parentId: null
      },
      transaction
    });
    console.log('Commentaires parents supprimés');
    
    // 3. Supprimer tous les likes
    await Like.destroy({
      where: { skillId: req.params.id },
      transaction
    });
    console.log('Likes supprimés');
    
    // 4. Enfin, supprimer le skill
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