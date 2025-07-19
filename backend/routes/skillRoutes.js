const express = require('express');
const router = express.Router();
const skillController = require('../controllers//skillController')
const { addComment, getComments, updateComment, deleteComment } = require('../controllers/commentController');
const { likeSkill, unlikeSkill } = require('../controllers/likeController');
const { authenticate, optionalAuthenticate } = require('../middlewares/authMiddleware'); // <-- ton fichier

router.get('/', authenticate, skillController.getAllSkills);
router.get('/:id', optionalAuthenticate, skillController.getSkillById);


router.post('/', authenticate, skillController.createSkill);
router.patch('/:id', authenticate, skillController.updateSkill);
router.delete('/:id', authenticate, skillController.deleteSkill);

router.post('/:id/comments', authenticate, addComment);
router.get('/:id/comments', getComments);

router.patch('/comments/:id', authenticate, updateComment);
router.delete('/comments/:id', authenticate, deleteComment);

router.post('/:id/like', authenticate, likeSkill);
router.delete('/:id/unlike', authenticate, unlikeSkill);

module.exports = router;
