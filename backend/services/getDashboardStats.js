const { User, Conversation, Message, Notification, Comment, Rating, Appointment, Skill, Like, Sequelize } = require('../models')
const { Op } = Sequelize

async function getDashboardStats() {
  const now = new Date()
  const last30Days = new Date()
  last30Days.setDate(now.getDate() - 30)

  const results = {}

  const queries = [
    {
      key: 'monthlySignups',
      fn: () => User.findAll({
        attributes: [
          [Sequelize.fn('DATE_FORMAT', Sequelize.col('createdAt'), '%Y-%m'), 'month'],
          [Sequelize.fn('COUNT', '*'), 'count']
        ],
        group: 'month',
        order: [['month', 'ASC']]
      })
    },
    {
      key: 'userRoles',
      fn: () => User.findAll({
        attributes: ['role', [Sequelize.fn('COUNT', '*'), 'count']],
        group: 'role'
      })
    },
    {
      key: 'dailyConversations',
      fn: () => Conversation.findAll({
        attributes: [
          [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
          [Sequelize.fn('COUNT', '*'), 'count']
        ],
        where: { createdAt: { [Op.gte]: last30Days } },
        group: 'date',
        order: [['date', 'ASC']]
      })
    },
    {
      key: 'dailyMessages',
      fn: () => Message.findAll({
        attributes: [
          [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
          [Sequelize.fn('COUNT', '*'), 'count']
        ],
        where: { createdAt: { [Op.gte]: last30Days } },
        group: 'date',
        order: [['date', 'ASC']]
      })
    },
    {
      key: 'notificationTypes',
      fn: () => Notification.findAll({
        attributes: ['type', [Sequelize.fn('COUNT', '*'), 'count']],
        group: 'type'
      })
    },
    {
      key: 'dailyComments',
      fn: () => Comment.findAll({
        attributes: [
          [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
          [Sequelize.fn('COUNT', '*'), 'count']
        ],
        where: { createdAt: { [Op.gte]: last30Days } },
        group: 'date',
        order: [['date', 'ASC']]
      })
    },
    {
      key: 'ratingsDistribution',
      fn: () => Rating.findAll({
        attributes: ['rating', [Sequelize.fn('COUNT', '*'), 'count']],
        group: 'rating',
        order: [['rating', 'ASC']],
        raw: true
      })
    },
    {
      key: 'appointmentsByStatus',
      fn: () => Appointment.findAll({
        attributes: ['status', [Sequelize.fn('COUNT', '*'), 'count']],
        group: 'status'
      })
    },
    {
      key: 'dailyLikes',
      fn: () => Like.findAll({
        attributes: [
          [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
          [Sequelize.fn('COUNT', '*'), 'count']
        ],
        where: { createdAt: { [Op.gte]: last30Days } },
        group: 'date',
        order: [['date', 'ASC']]
      })
    },
  
    {
      key: 'totalConversations',
      fn: () => Conversation.count()
    },
    {
      key: 'totalAppointments',
      fn: () => Appointment.count()
    },
    {
      key: 'acceptedAppointments',
      fn: () => Appointment.count({ where: { status: 'accepted' } })
    },
    {
      key: 'refusedAppointments',
      fn: () => Appointment.count({ where: { status: 'refused' } })
    }
  ]

  for (const query of queries) {
    console.log(`Running query: ${query.key}`)
    try {
      results[query.key] = await query.fn()
      console.log(`Query success: ${query.key}`)
    } catch (err) {
      console.error(`Query failed: ${query.key}`)
      console.error(err)
      throw err
    }
  }

  return results
}

module.exports = getDashboardStats