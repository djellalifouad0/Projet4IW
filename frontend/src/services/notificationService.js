import api from './api'
import eventBus, { NotificationEvents } from './eventBus'
import socketService from './socket'

class NotificationService {/**
   * Récupérer les notifications de l'utilisateur avec pagination
   */
  static async getNotifications(page = 1, limit = 10) {
    try {
      const response = await api.get(`/notifications?page=${page}&limit=${limit}`)
      return response.data
    } catch (error) {
      console.error('Erreur récupération notifications:', error)
      throw error
    }
  }

  /**
   * Récupérer le nombre de notifications non lues
   */
  static async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count')
      return response.data.count
    } catch (error) {
      console.error('Erreur récupération compteur notifications:', error)
      throw error
    }
  }
  /**
   * Marquer une notification comme lue
   */
  static async markAsRead(notificationId) {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`)
      
      // Émettre un événement pour mettre à jour le compteur
      eventBus.emit(NotificationEvents.NOTIFICATION_READ)
      
      return response.data
    } catch (error) {
      console.error('Erreur marquage notification:', error)
      throw error
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  static async markAllAsRead() {
    try {
      const response = await api.patch('/notifications/mark-all-read')
      
      // Émettre un événement pour remettre le compteur à zéro
      eventBus.emit(NotificationEvents.ALL_NOTIFICATIONS_READ)
      
      return response.data
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error)
      throw error
    }
  }

  /**
   * Formater une date de notification
   */
  static formatNotificationDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))
      return diffInMinutes <= 1 ? 'À l\'instant' : `Il y a ${diffInMinutes} min`
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays === 1) return 'Hier'
      if (diffInDays < 7) return `Il y a ${diffInDays} jours`
      return date.toLocaleDateString('fr-FR')
    }
  }

  /**
   * Obtenir l'icône pour un type de notification
   */
  static getNotificationIcon(type) {
    const icons = {
      welcome: '👋',
      profile_update: '👤',
      new_comment: '💬',
      new_like: '❤️',
      appointment_created: '📅',
      appointment_accepted: '✅',
      appointment_rejected: '❌',
      new_rating: '⭐',
      new_message: '📧'
    }
    return icons[type] || '🔔'
  }

  /**
   * Obtenir la couleur pour un type de notification
   */
  static getNotificationColor(type) {
    const colors = {
      welcome: '#4CAF50',
      profile_update: '#2196F3',
      new_comment: '#FF9800',
      new_like: '#E91E63',
      appointment_created: '#9C27B0',
      appointment_accepted: '#4CAF50',
      appointment_rejected: '#F44336',
      new_rating: '#FFD700',
      new_message: '#2196F3'
    }
    return colors[type] || '#757575'
  }
  /**
   * Déclencher une vérification des nouvelles notifications
   * Appelé après des actions qui peuvent générer des notifications
   */
  static triggerNotificationCheck() {
    // Utiliser WebSocket pour une notification immédiate si connecté
    if (socketService.isConnected()) {
      socketService.requestNotificationCheck()
    }
    
    // Émettre un événement local comme fallback
    eventBus.emit('action-completed')
    
    // Mise à jour directe après un délai court
    setTimeout(() => {
      this.updateUnreadCount()
    }, 500)
  }

  /**
   * Simuler une nouvelle notification (pour les tests)
   */
  static simulateNewNotification() {
    eventBus.emit(NotificationEvents.NEW_NOTIFICATION)
  }

  /**
   * Mettre à jour le compteur de notifications non lues
   */
  static async updateUnreadCount() {
    try {
      const count = await this.getUnreadCount()
      eventBus.emit(NotificationEvents.UNREAD_COUNT_CHANGED, count)
      return count
    } catch (error) {
      console.error('Erreur mise à jour compteur:', error)
      throw error
    }
  }
  /**
   * Configurer la détection automatique de nouvelles notifications
   */
  static setupAutoNotificationDetection() {
    // Configurer les écouteurs WebSocket pour les notifications en temps réel
    if (socketService.isConnected()) {
      socketService.onNewNotification((notificationData) => {
        // Émettre un événement pour une nouvelle notification
        eventBus.emit(NotificationEvents.NEW_NOTIFICATION, notificationData)
        // Mettre à jour le compteur
        this.updateUnreadCount()
      })

      socketService.onNotificationCountUpdate((count) => {
        // Mettre à jour directement le compteur
        eventBus.emit(NotificationEvents.UNREAD_COUNT_CHANGED, count)
      })
    }

    // Écouter les événements de navigation pour vérifier les notifications
    window.addEventListener('focus', () => {
      // Vérifier les notifications quand la fenêtre reprend le focus
      setTimeout(() => this.updateUnreadCount(), 1000)
    })

    // Écouter les changements de visibilité de la page
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // Page visible, vérifier les notifications
        setTimeout(() => this.updateUnreadCount(), 1000)
      }
    })
  }

  /**
   * Nettoyer les écouteurs WebSocket
   */
  static cleanupAutoNotificationDetection() {
    if (socketService.isConnected()) {
      socketService.offNewNotification()
      socketService.offNotificationCountUpdate()
    }
  }
}

export default NotificationService
