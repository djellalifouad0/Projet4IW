const User = require('./user');
const Conversation = require('./conversation');
const Message = require('./message');
const Appointment = require('./appointment');
const Rating = require('./rating');
const Skill = require('./skill');
const Comment = require('./comment');
const Like = require('./like');

function setupAssociations() {
  Conversation.belongsTo(User, {
    as: 'user1',
    foreignKey: {
      name: 'user1Id',
      unique: false
    },
    constraints: false
  });

  Conversation.belongsTo(User, {
    as: 'user2',
    foreignKey: {
      name: 'user2Id',
      unique: false
    },
    constraints: false
  });

  Message.belongsTo(User, {
    as: 'sender',
    foreignKey: {
      name: 'senderId',
      unique: false
    },
    constraints: false
  });

Message.belongsTo(Conversation, {
    as: 'conversation',
    foreignKey: {
      name: 'conversationId',
      unique: false
    },
    constraints: false
});

Conversation.hasMany(Message, {
    as: 'messages',
    foreignKey: {
      name: 'conversationId',
      unique: false
    }
});

  User.hasMany(Message, {
    as: 'sentMessages',
    foreignKey: {
      name: 'senderId',
      unique: false
    }
  });

  // Associations pour les rendez-vous
  Appointment.belongsTo(User, {
    as: 'requester',
    foreignKey: {
      name: 'requesterId',
      unique: false
    },
    constraints: false
  });

  Appointment.belongsTo(User, {
    as: 'receiver',
    foreignKey: {
      name: 'receiverId',
      unique: false
    },
    constraints: false
  });

  Appointment.belongsTo(Conversation, {
    foreignKey: {
      name: 'conversationId',
      unique: false
    },
    constraints: false
  });

  User.hasMany(Appointment, {
    as: 'requestedAppointments',
    foreignKey: {
      name: 'requesterId',
      unique: false
    }
  });

  User.hasMany(Appointment, {
    as: 'receivedAppointments',
    foreignKey: {
      name: 'receiverId',
      unique: false
    }
  });

  Conversation.hasMany(Appointment, {
    foreignKey: {
      name: 'conversationId',
      unique: false
    }
  });

  // Associations pour les avis/notes
  Rating.belongsTo(User, {
    as: 'rater',
    foreignKey: {
      name: 'raterId',
      unique: false
    },
    constraints: false
  });

  Rating.belongsTo(User, {
    as: 'ratedUser',
    foreignKey: {
      name: 'ratedUserId',
      unique: false
    },
    constraints: false
  });

  User.hasMany(Rating, {
    as: 'givenRatings',
    foreignKey: {
      name: 'raterId',
      unique: false
    }
  });

  User.hasMany(Rating, {
    as: 'receivedRatings',
    foreignKey: {
      name: 'ratedUserId',
      unique: false
    }
  });

  // Associations pour les compétences/skills
  Skill.belongsTo(User, {
    foreignKey: {
      name: 'userId',
      unique: false
    },
    onDelete: 'CASCADE',
    constraints: false
  });

  User.hasMany(Skill, {
    foreignKey: {
      name: 'userId',
      unique: false
    }
  });

  // Associations pour les commentaires
  Skill.hasMany(Comment, {
    foreignKey: {
      name: 'skillId',
      unique: false
    },
    onDelete: 'CASCADE'
  });

  Comment.belongsTo(Skill, {
    foreignKey: {
      name: 'skillId',
      unique: false
    },
    constraints: false
  });

  User.hasMany(Comment, {
    foreignKey: {
      name: 'userId',
      unique: false
    }
  });

  Comment.belongsTo(User, {
    foreignKey: {
      name: 'userId',
      unique: false
    },
    constraints: false
  });

  // Association pour les réponses imbriquées
  Comment.hasMany(Comment, {
    as: 'replies',
    foreignKey: {
      name: 'parentId',
      unique: false
    }
  });

  Comment.belongsTo(Comment, {
    as: 'parent',
    foreignKey: {
      name: 'parentId',
      unique: false
    },
    constraints: false
  });

  // Associations pour les likes
  Skill.hasMany(Like, {
    foreignKey: {
      name: 'skillId',
      unique: false
    },
    onDelete: 'CASCADE'
  });

  Like.belongsTo(Skill, {
    foreignKey: {
      name: 'skillId',
      unique: false
    },
    constraints: false
  });

  User.hasMany(Like, {
    foreignKey: {
      name: 'userId',
      unique: false
    }
  });

  Like.belongsTo(User, {
    foreignKey: {
      name: 'userId',
      unique: false
    },
    constraints: false
  });
}

module.exports = {
  User,
  Conversation,
  Message,
  Appointment,
  Rating,
  Skill,
  Comment,
  Like,
  setupAssociations
};
