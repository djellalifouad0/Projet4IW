<template>
  <div class="notification-badge-container">
    <img src="@/assets/icons/notification.svg" alt="Notifications" class="notification-icon" />
    <span v-if="unreadCount > 0" class="badge">{{ displayCount }}</span>
  </div>
</template>

<script>
import NotificationService from '@/services/notificationService'
import eventBus, { NotificationEvents } from '@/services/eventBus'

export default {
  name: 'NotificationBadge',
  data() {
    return {
      unreadCount: 0,
      refreshInterval: null
    }
  },
  computed: {
    displayCount() {
      return this.unreadCount > 99 ? '99+' : this.unreadCount.toString()
    }
  },
  async mounted() {
    await this.loadUnreadCount()
    this.setupEventListeners()
    // Actualiser le compteur toutes les 30 secondes
    this.refreshInterval = setInterval(this.loadUnreadCount, 30000)
  },
  beforeUnmount() {
    this.removeEventListeners()
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
  },
  methods: {
    async loadUnreadCount() {
      try {
        this.unreadCount = await NotificationService.getUnreadCount()
      } catch (error) {
        console.error('Erreur chargement compteur notifications:', error)
      }
    },    setupEventListeners() {
      // Écouter les événements de notification
      eventBus.on(NotificationEvents.NOTIFICATION_READ, () => {
        this.unreadCount = Math.max(0, this.unreadCount - 1)
      })

      eventBus.on(NotificationEvents.ALL_NOTIFICATIONS_READ, () => {
        this.unreadCount = 0
      })

      eventBus.on(NotificationEvents.UNREAD_COUNT_CHANGED, (newCount) => {
        this.unreadCount = newCount
      })

      eventBus.on(NotificationEvents.NEW_NOTIFICATION, () => {
        this.unreadCount += 1
      })
    },

    removeEventListeners() {
      // Nettoyer les écouteurs d'événements
      eventBus.off(NotificationEvents.NOTIFICATION_READ)
      eventBus.off(NotificationEvents.ALL_NOTIFICATIONS_READ)
      eventBus.off(NotificationEvents.UNREAD_COUNT_CHANGED)
      eventBus.off(NotificationEvents.NEW_NOTIFICATION)
    },
    
    // Méthode publique pour actualiser le compteur depuis l'extérieur
    async refresh() {
      await this.loadUnreadCount()
    }
  }
}
</script>

<style scoped>
.notification-badge-container {
  position: relative;
  display: inline-block;
}

.notification-icon {
  width: 24px;
  height: 24px;
  transition: opacity 0.2s;
}

.notification-icon:hover {
  opacity: 0.8;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 0.75rem;
  font-weight: bold;
  min-width: 18px;
  text-align: center;
  line-height: 1.2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border: 2px solid white;
}

.badge:empty {
  display: none;
}
</style>
