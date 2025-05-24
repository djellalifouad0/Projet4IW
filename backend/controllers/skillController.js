const Skill = require('../models/skill');
const User = require('../models/user'); // Import du modèle User

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
    const skills = await Skill.findAll({
      include: [
        {
          model: User,
          attributes: ['username', 'avatar'], // Inclure l'avatar
        },
      ],
    });
    res.json(skills);
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
    const skill = await Skill.findByPk(req.params.id, {
      include: [{
        model: require('../models/user'),
        attributes: ['username']
      }]
    });
    if (!skill) return res.status(404).json({ error: 'Compétence non trouvée' });
    res.json(skill);
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
  try {
    const skill = await Skill.findByPk(req.params.id);
    if (!skill || skill.userId !== req.user.id) return res.status(403).json({ error: 'Non autorisé' });
    await skill.destroy();
    res.json({ message: 'Compétence supprimée' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur suppression' });
  }
};