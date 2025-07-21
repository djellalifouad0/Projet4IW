import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }  // Connexion au serveur WebSocket
  connect(token) {
    if (!token) {
      console.error(' Token requis pour la connexion WebSocket');
      return Promise.reject(new Error('Token manquant'));
    }

    if (this.socket && this.connected) {
      console.log(' Déjà connecté, fermeture de la connexion existante');
      this.disconnect();
    }

    console.log(' Tentative de connexion WebSocket avec token...');
    
    this.socket = io('https://srv908931.hstgr.cloud/', {
      auth: {
        token: token
      },
      autoConnect: true,
      transports: ['websocket', 'polling']
    });

    return new Promise((resolve, reject) => {
      this.socket.on('connect', () => {
        console.log(' Connecté au serveur WebSocket avec succès');
        this.connected = true;
        resolve(this.socket);
      });

      this.socket.on('disconnect', () => {
        console.log(' Déconnecté du serveur WebSocket');
        this.connected = false;
      });

      this.socket.on('reconnect', () => {
        console.log(' Reconnecté au serveur WebSocket');
        this.connected = true;
      });

      this.socket.on('connect_error', (error) => {
        console.error(' Erreur de connexion WebSocket:', error.message);
        this.connected = false;
        reject(error);
      });

      setTimeout(() => {
        if (!this.connected) {
          reject(new Error('Timeout de connexion WebSocket'));
        }
      }, 5000);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  joinConversation(conversationId) {
    if (this.socket && this.connected) {
      this.socket.emit('join-conversation', conversationId);
      console.log(` Rejoint la conversation ${conversationId}`);
    }
  }

  leaveConversation(conversationId) {
    if (this.socket && this.connected) {
      this.socket.emit('leave-conversation', conversationId);
      console.log(` Quitté la conversation ${conversationId}`);
    }
  }

  sendMessage(conversationId, message) {
    if (this.socket && this.connected) {
      this.socket.emit('send-message', {
        conversationId,
        message
      });
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  offNewMessage() {
    if (this.socket) {
      this.socket.off('new-message');
    }
  }

  sendTyping(conversationId, isTyping) {
    if (this.socket && this.connected) {
      this.socket.emit('typing', {
        conversationId,
        isTyping
      });
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  offUserTyping() {
    if (this.socket) {
      this.socket.off('user-typing');
    }
  }

  getOnlineUsers() {
    if (this.socket && this.connected) {
      this.socket.emit('get-online-users');
    }
  }

  onOnlineUsers(callback) {
    if (this.socket) {
      this.socket.on('online-users', callback);
    }
  }

  onUserConnected(callback) {
    if (this.socket) {
      this.socket.on('user-connected', callback);
    }
  }

  onUserDisconnected(callback) {
    if (this.socket) {
      this.socket.on('user-disconnected', callback);
    }
  }

  sendMessageDelivered(conversationId, messageId) {
    if (this.socket && this.connected) {
      this.socket.emit('message-delivered', {
        conversationId,
        messageId
      });
    }
  }

  sendMessageRead(conversationId, messageId) {
    if (this.socket && this.connected) {
      this.socket.emit('message-read', {
        conversationId,
        messageId
      });
    }
  }
  onMessageStatus(callback) {
    if (this.socket) {
      this.socket.on('message-status', callback);
    }
  }


  onNewNotification(callback) {
    if (this.socket) {
      this.socket.on('new-notification', callback);
    }
  }

  offNewNotification() {
    if (this.socket) {
      this.socket.off('new-notification');
    }
  }

  requestNotificationCheck() {
    if (this.socket && this.connected) {
      this.socket.emit('check-notifications');
    }
  }

  onNotificationCountUpdate(callback) {
    if (this.socket) {
      this.socket.on('notification-count-update', callback);
    }
  }

  offNotificationCountUpdate() {
    if (this.socket) {
      this.socket.off('notification-count-update');
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }
}

const socketService = new SocketService();
export default socketService;

