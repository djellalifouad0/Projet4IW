import api from './api';
import { reactive } from 'vue';

export const unreadMessagesStore = reactive({
  count: 0
});

class UnreadMessagesService {
  constructor() {
    this.store = unreadMessagesStore;
    this.socketService = null;
    this.currentUserId = null;
    this.activeConversationId = null;
  }

  
  initWebSocketIntegration(socketService, userId) {
    this.socketService = socketService;
    this.currentUserId = userId;

    this.socketService.onNewMessage(this.handleNewMessage.bind(this));
    
    console.log('🔔 Service unreadMessages: intégration WebSocket initialisée');
  }

  
  setActiveConversation(conversationId) {
    this.activeConversationId = conversationId;
  }

  
  handleNewMessage(message) {
    console.log('🔔 Service unreadMessages: nouveau message reçu', message);


    if (message.senderId === this.currentUserId) {
      console.log('🔔 Message de l\'utilisateur actuel, pas d\'incrémentation');
      return;
    }
    
    if (this.activeConversationId === message.conversationId) {
      console.log('🔔 Utilisateur dans la conversation active, pas d\'incrémentation');
      return;
    }

    this.incrementCount();
    console.log('🔔 Compteur incrémenté:', this.store.count);
  }

  
  async fetchUnreadCount() {
    try {
      const response = await api.get('/conversations/unread-count');
      this.store.count = response.data.unreadCount;
      return this.store.count;
    } catch (error) {
      console.error('Erreur lors de la récupération des messages non lus:', error);
      return 0;
    }
  }

  
  updateCount(newCount) {
    this.store.count = Math.max(0, newCount);
  }

  
  incrementCount() {
    this.store.count += 1;
  }

  
  decrementCount(amount = 1) {
    this.store.count = Math.max(0, this.store.count - amount);
  }

  
  resetCount() {
    this.store.count = 0;
  }
  
  async markConversationAsRead(conversationId) {
    try {
      await api.patch(`/conversations/${conversationId}/mark-read`);

      await this.fetchUnreadCount();
      
      console.log('🔔 Conversation marquée comme lue:', conversationId);
    } catch (error) {
      console.error('Erreur lors du marquage de la conversation comme lue:', error);
    }
  }

  
  cleanup() {
    if (this.socketService) {

      this.socketService = null;
      this.currentUserId = null;
      this.activeConversationId = null;
    }
  }

  
  getCount() {
    return this.store.count;
  }
}

export default new UnreadMessagesService();

