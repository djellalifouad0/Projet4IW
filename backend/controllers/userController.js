const User = require('../models/user');

// ✅ Récupérer tous les utilisateurs (admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erreur récupération utilisateurs' });
  }
};

// ✅ Activer/Désactiver un utilisateur
exports.toggleUserActive = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `Utilisateur ${user.isActive ? 'activé' : 'désactivé'}` });
  } catch (error) {
    res.status(500).json({ error: 'Erreur changement statut' });
  }
};

// ✅ Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    await user.destroy();
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur suppression utilisateur' });
  }
};

// ✅ Mettre à jour le profil utilisateur
exports.updateUserProfile = async (req, res) => {
  try {
    const { username, bio, address, avatar, cover } = req.body;
    const userId = req.user.id; // Supposons que l'ID utilisateur est disponible dans req.user

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.address = address || user.address;
    user.avatar = avatar || user.avatar;
    user.cover = cover || user.cover;

    await user.save();

    res.json({ message: 'Profil mis à jour avec succès', user });
  } catch (error) {
    res.status(500).json({ error: 'Erreur mise à jour du profil' });
  }
};
