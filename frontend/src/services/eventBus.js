// Service d'événements global simple
class EventBus {
  constructor() {
    this.events = {}
  }

  // Écouter un événement
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  // Supprimer un écouteur d'événement
  off(event, callback) {
    if (!this.events[event]) return
    
    this.events[event] = this.events[event].filter(cb => cb !== callback)
  }

  // Émettre un événement
  emit(event, data) {
    if (!this.events[event]) return
    
    this.events[event].forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`Erreur dans l'écouteur d'événement ${event}:`, error)
      }
    })
  }

  // Nettoyer tous les événements
  clear() {
    this.events = {}
  }
}

// Instance globale
const eventBus = new EventBus()

// Événements spécifiques aux notifications
export const NotificationEvents = {
  UNREAD_COUNT_CHANGED: 'notification:unread-count-changed',
  NOTIFICATION_READ: 'notification:read',
  ALL_NOTIFICATIONS_READ: 'notification:all-read',
  NEW_NOTIFICATION: 'notification:new'
}

export default eventBus
