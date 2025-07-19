import api from './api'
import eventBus, { NotificationEvents } from './eventBus'
import socketService from './socket'

class NotificationService {
  static async getNotifications(page = 1, limit = 10) {
    try {
      const response = await api.get(`/notifications?page=${page}&limit=${limit}`)
      return response.data
    } catch (error) {
      console.error('Erreur récupération notifications:', error)
      throw error
    }
  }

  
  static async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count')
      return response.data.count
    } catch (error) {
      console.error('Erreur récupération compteur notifications:', error)
      throw error
    }
  }  
  static async markAsRead(notificationId) {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`)
      return response.data
    } catch (error) {
      console.error('Erreur marquage notification:', error)
      throw error
    }
  }
  
  static async markAllAsRead() {
    try {
      const response = await api.patch('/notifications/mark-all-read')
      return response.data
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error)
      throw error
    }
  }

  
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
  
  static triggerNotificationCheck() {

    if (socketService.isConnected()) {
      socketService.requestNotificationCheck()
    }

    eventBus.emit('action-completed')

    setTimeout(() => {
      this.updateUnreadCount()
    }, 500)
  }

  
  static simulateNewNotification() {
    eventBus.emit(NotificationEvents.NEW_NOTIFICATION)
  }

  
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
  
  static setupAutoNotificationDetection() {

    if (socketService.isConnected()) {
      socketService.onNewNotification((notificationData) => {

        eventBus.emit(NotificationEvents.NEW_NOTIFICATION, notificationData)

        this.updateUnreadCount()
      })

      socketService.onNotificationCountUpdate((count) => {

        eventBus.emit(NotificationEvents.UNREAD_COUNT_CHANGED, count)
      })
    }

    window.addEventListener('focus', () => {

      setTimeout(() => this.updateUnreadCount(), 1000)
    })

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {

        setTimeout(() => this.updateUnreadCount(), 1000)
      }
    })
  }

  
  static cleanupAutoNotificationDetection() {
    if (socketService.isConnected()) {
      socketService.offNewNotification()
      socketService.offNotificationCountUpdate()
    }
  }
}

export default NotificationService

