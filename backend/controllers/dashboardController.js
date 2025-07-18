const { User, Skill, Comment, Like, Rating, Appointment } = require('../models/associations');
const { Sequelize } = require('sequelize');

exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const appointmentsStats = await Appointment.findAll({
      where: {
        [Sequelize.Op.or]: [
          { requesterId: userId },
          { receiverId: userId }
        ]
      },
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    let appointmentsCount = 0;
    let appointmentsAccepted = 0;

    appointmentsStats.forEach(stat => {
      const count = parseInt(stat.dataValues.count);
      appointmentsCount += count;
      if (stat.status === 'accepted') {
        appointmentsAccepted += count;
      }
    });

    const ratingSummary = await Rating.findOne({
      where: { ratedUserId: userId },
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('rating')), 'average'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'total']
      ]
    });

    const averageRating = parseFloat(ratingSummary?.dataValues?.average) || 0;
    const totalRatings = parseInt(ratingSummary?.dataValues?.total) || 0;

    const skillsCount = await Skill.count({
      where: { userId }
    });

    const likesReceived = await Like.count({
      include: [{
        model: Skill,
        where: { userId }
      }]
    });

    const commentsReceived = await Comment.count({
      include: [{
        model: Skill,
        where: { userId }
      }]
    });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyAppointments = await Appointment.findAll({
      where: {
        [Sequelize.Op.or]: [
          { requesterId: userId },
          { receiverId: userId }
        ],
        createdAt: {
          [Sequelize.Op.gte]: sixMonthsAgo
        }
      },
      attributes: [
        [Sequelize.fn('strftime', '%m/%Y', Sequelize.col('createdAt')), 'month'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: [Sequelize.fn('strftime', '%m/%Y', Sequelize.col('createdAt'))],
      order: [[Sequelize.fn('strftime', '%Y-%m', Sequelize.col('createdAt')), 'ASC']]
    });

    const monthlyRatings = await Rating.findAll({
      where: {
        ratedUserId: userId,
        createdAt: {
          [Sequelize.Op.gte]: sixMonthsAgo
        }
      },
      attributes: [
        [Sequelize.fn('strftime', '%m/%Y', Sequelize.col('createdAt')), 'month'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: [Sequelize.fn('strftime', '%m/%Y', Sequelize.col('createdAt'))],
      order: [[Sequelize.fn('strftime', '%Y-%m', Sequelize.col('createdAt')), 'ASC']]
    });

    const monthlyData = new Map();

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString('fr-FR', { month: '2-digit', year: 'numeric' });
      monthlyData.set(monthKey, { appointments: 0, ratings: 0 });
    }

    monthlyAppointments.forEach(item => {
      const month = item.dataValues.month;
      if (monthlyData.has(month)) {
        monthlyData.get(month).appointments = parseInt(item.dataValues.count);
      }
    });

    monthlyRatings.forEach(item => {
      const month = item.dataValues.month;
      if (monthlyData.has(month)) {
        monthlyData.get(month).ratings = parseInt(item.dataValues.count);
      }
    });

    const monthlyActivity = Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      appointments: data.appointments,
      ratings: data.ratings
    }));

    res.json({
      appointmentsCount,
      appointmentsAccepted,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings,
      skillsCount,
      likesReceived,
      commentsReceived,
      monthlyActivity
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
