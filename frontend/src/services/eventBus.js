
class EventBus {
  constructor() {
    this.events = {}
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  off(event, callback) {
    if (!this.events[event]) return
    
    this.events[event] = this.events[event].filter(cb => cb !== callback)
  }

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

  clear() {
    this.events = {}
  }
}

const eventBus = new EventBus()

export const NotificationEvents = {
  UNREAD_COUNT_CHANGED: 'notification:unread-count-changed',
  NOTIFICATION_READ: 'notification:read',
  ALL_NOTIFICATIONS_READ: 'notification:all-read',
  NEW_NOTIFICATION: 'notification:new'
}

export const ProfileEvents = {
  PROFILE_UPDATED: 'profile:updated',
  AVATAR_CHANGED: 'profile:avatar-changed',
  USERNAME_CHANGED: 'profile:username-changed'
}

export default eventBus

