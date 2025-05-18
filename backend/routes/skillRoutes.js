const express = require('express');
const router = express.Router();
const skillController = require('../controllers//skillController')
const { authenticate } = require('../middlewares/authMiddleware'); // <-- ton fichier

router.get('/', skillController.getAllSkills);
router.get('/:id', skillController.getSkillById);


router.post('/', authenticate, skillController.createSkill);
router.patch('/:id', authenticate, skillController.updateSkill);
router.delete('/:id', authenticate, skillController.deleteSkill);

module.exports = router;