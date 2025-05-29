const User = require('./user');
const Conversation = require('./conversation');
const Message = require('./message');
const Appointment = require('./appointment');
const Rating = require('./rating');
const Skill = require('./skill');
const Notification = require('./notification');

// Définir les associations
Conversation.belongsTo(User, { as: 'user1', foreignKey: 'user1Id' });
Conversation.belongsTo(User, { as: 'user2', foreignKey: 'user2Id' });

Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId' });

Conversation.hasMany(Message, { foreignKey: 'conversationId' });
User.hasMany(Message, { as: 'sentMessages', foreignKey: 'senderId' });

// Associations pour les rendez-vous
Appointment.belongsTo(User, { as: 'requester', foreignKey: 'requesterId' });
Appointment.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });
Appointment.belongsTo(Conversation, { foreignKey: 'conversationId' });

User.hasMany(Appointment, { as: 'requestedAppointments', foreignKey: 'requesterId' });
User.hasMany(Appointment, { as: 'receivedAppointments', foreignKey: 'receiverId' });
Conversation.hasMany(Appointment, { foreignKey: 'conversationId' });

// Associations pour les avis/notes
Rating.belongsTo(User, { as: 'rater', foreignKey: 'raterId' });
Rating.belongsTo(User, { as: 'ratedUser', foreignKey: 'ratedUserId' });

User.hasMany(Rating, { as: 'givenRatings', foreignKey: 'raterId' });
User.hasMany(Rating, { as: 'receivedRatings', foreignKey: 'ratedUserId' });

// Associations pour les compétences
User.hasMany(Skill, { as: 'skills', foreignKey: 'userId' });
Skill.belongsTo(User, { as: 'author', foreignKey: 'userId' });

// Associations pour les notifications
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  Conversation,
  Message,
  Appointment,
  Rating,
  Skill,
  Notification
};
