const { User, Conversation, Message, Notification, Comment, Rating, Appointment, Skill, Like, Sequelize } = require('../models')
const { Op } = Sequelize

exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date()
    const last30Days = new Date()
    last30Days.setDate(now.getDate() - 30)

    const [monthlySignups, userRoles, dailyConversations, dailyMessages, notificationTypes, dailyComments, ratingsDistribution, appointmentsByStatus, topSkills, dailyLikes] =
      await Promise.all([
        // 1. Inscriptions par mois
        User.findAll({
          attributes: [
            [Sequelize.fn('DATE_FORMAT', Sequelize.col('createdAt'), '%Y-%m'), 'month'],
            [Sequelize.fn('COUNT', '*'), 'count']
          ],
          group: 'month',
          order: [['month', 'ASC']]
        }),

        // 2. Répartition des rôles
        User.findAll({
          attributes: ['role', [Sequelize.fn('COUNT', '*'), 'count']],
          group: 'role'
        }),

        // 3. Conversations par jour
        Conversation.findAll({
          attributes: [
            [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
            [Sequelize.fn('COUNT', '*'), 'count']
          ],
          where: { createdAt: { [Op.gte]: last30Days } },
          group: 'date',
          order: [['date', 'ASC']]
        }),

        // 4. Messages par jour
        Message.findAll({
          attributes: [
            [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
            [Sequelize.fn('COUNT', '*'), 'count']
          ],
          where: { createdAt: { [Op.gte]: last30Days } },
          group: 'date',
          order: [['date', 'ASC']]
        }),

        // 5. Notifications par type
        Notification.findAll({
          attributes: ['type', [Sequelize.fn('COUNT', '*'), 'count']],
          group: 'type'
        }),

        // 6. Commentaires par jour
        Comment.findAll({
          attributes: [
            [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
            [Sequelize.fn('COUNT', '*'), 'count']
          ],
          where: { createdAt: { [Op.gte]: last30Days } },
          group: 'date',
          order: [['date', 'ASC']]
        }),

        // 7. Ratings distribution
        Rating.findAll({
          attributes: ['score', [Sequelize.fn('COUNT', '*'), 'count']],
          group: 'score'
        }),

        // 8. Appointments par statut
        Appointment.findAll({
          attributes: ['status', [Sequelize.fn('COUNT', '*'), 'count']],
          group: 'status'
        }),

        // 9. Top skills
        Skill.findAll({
          attributes: ['name', [Sequelize.fn('COUNT', '*'), 'count']],
          group: 'name',
          order: [[Sequelize.fn('COUNT', '*'), 'DESC']],
          limit: 10
        }),

        // 10. Likes par jour
        Like.findAll({
          attributes: [
            [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
            [Sequelize.fn('COUNT', '*'), 'count']
          ],
          where: { createdAt: { [Op.gte]: last30Days } },
          group: 'date',
          order: [['date', 'ASC']]
        }),
      ])

    res.json({
      monthlySignups,
      userRoles,
      dailyConversations,
      dailyMessages,
      notificationTypes,
      dailyComments,
      ratingsDistribution,
      appointmentsByStatus,
      topSkills,
      dailyLikes,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}
