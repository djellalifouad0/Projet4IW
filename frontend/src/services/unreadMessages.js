import api from './api';
import { reactive } from 'vue';

// Store réactif pour le compteur de messages non lus
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

  /**
   * Initialise l'intégration WebSocket pour les mises à jour en temps réel
   */
  initWebSocketIntegration(socketService, userId) {
    this.socketService = socketService;
    this.currentUserId = userId;
    
    // Écouter les nouveaux messages pour mettre à jour le compteur
    this.socketService.onNewMessage(this.handleNewMessage.bind(this));
    
    console.log('🔔 Service unreadMessages: intégration WebSocket initialisée');
  }

  /**
   * Définit la conversation actuellement active
   */
  setActiveConversation(conversationId) {
    this.activeConversationId = conversationId;
  }

  /**
   * Gère les nouveaux messages reçus via WebSocket
   */
  handleNewMessage(message) {
    console.log('🔔 Service unreadMessages: nouveau message reçu', message);
    
    // Ne pas incrémenter le compteur si :
    // - Le message vient de l'utilisateur actuel
    // - L'utilisateur est actuellement dans cette conversation
    if (message.senderId === this.currentUserId) {
      console.log('🔔 Message de l\'utilisateur actuel, pas d\'incrémentation');
      return;
    }
    
    if (this.activeConversationId === message.conversationId) {
      console.log('🔔 Utilisateur dans la conversation active, pas d\'incrémentation');
      return;
    }
    
    // Incrémenter le compteur pour un nouveau message non lu
    this.incrementCount();
    console.log('🔔 Compteur incrémenté:', this.store.count);
  }

  /**
   * Récupère le nombre de messages non lus depuis l'API
   */
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

  /**
   * Met à jour le compteur localement (pour les mises à jour en temps réel)
   */
  updateCount(newCount) {
    this.store.count = Math.max(0, newCount);
  }

  /**
   * Incrémente le compteur d'un message
   */
  incrementCount() {
    this.store.count += 1;
  }

  /**
   * Décrémente le compteur (utile quand on lit une conversation)
   */
  decrementCount(amount = 1) {
    this.store.count = Math.max(0, this.store.count - amount);
  }

  /**
   * Remet le compteur à zéro
   */
  resetCount() {
    this.store.count = 0;
  }
  /**
   * Marque une conversation comme lue
   */
  async markConversationAsRead(conversationId) {
    try {
      await api.patch(`/conversations/${conversationId}/mark-read`);
      
      // Mettre à jour le compteur de façon optimiste
      await this.fetchUnreadCount();
      
      console.log('🔔 Conversation marquée comme lue:', conversationId);
    } catch (error) {
      console.error('Erreur lors du marquage de la conversation comme lue:', error);
    }
  }

  /**
   * Nettoie les listeners WebSocket
   */
  cleanup() {
    if (this.socketService) {
      // Note: Les listeners sont gérés par le composant Discussions
      this.socketService = null;
      this.currentUserId = null;
      this.activeConversationId = null;
    }
  }

  /**
   * Retourne le nombre actuel de messages non lus
   */
  getCount() {
    return this.store.count;
  }
}

export default new UnreadMessagesService();
