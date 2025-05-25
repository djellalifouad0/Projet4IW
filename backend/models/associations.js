const User = require('./user');
const Conversation = require('./conversation');
const Message = require('./message');

// Définir les associations
Conversation.belongsTo(User, { as: 'user1', foreignKey: 'user1Id' });
Conversation.belongsTo(User, { as: 'user2', foreignKey: 'user2Id' });

Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId' });

Conversation.hasMany(Message, { foreignKey: 'conversationId' });
User.hasMany(Message, { as: 'sentMessages', foreignKey: 'senderId' });

module.exports = {
  User,
  Conversation,
  Message
};
