<template>
  <div class="notification-center">
    <!-- Notifications toast -->
    <div 
      v-for="notification in activeNotifications" 
      :key="notification.id"
      class="notification-toast"
      :class="notification.type"
      @click="handleNotificationClick(notification)"
    >
      <div class="notification-content">
        <span class="notification-icon">{{ getNotificationIcon(notification.type) }}</span>
        <div class="notification-text">
          <p class="notification-message">{{ notification.message }}</p>
          <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
        </div>
        <button 
          class="close-btn" 
          @click.stop="removeNotification(notification)"
          aria-label="Fermer"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import NotificationService from '@/services/notificationService'

export default {
  name: 'NotificationCenter',
  data() {
    return {
      activeNotifications: [],
      maxNotifications: 5,
      notificationTimeout: 5000
    }
  },
  mounted() {
    // Écouter les événements de nouvelles notifications
    window.addEventListener('new-notification', this.handleNewNotification)
  },
  beforeUnmount() {
    window.removeEventListener('new-notification', this.handleNewNotification)
    // Nettoyer les timeouts
    this.activeNotifications.forEach(notif => {
      if (notif.timeoutId) {
        clearTimeout(notif.timeoutId)
      }
    })
  },
  methods: {
    handleNewNotification(event) {
      const notification = event.detail
      this.addNotification(notification)
    },
    
    addNotification(notification) {
      // Limiter le nombre de notifications affichées
      if (this.activeNotifications.length >= this.maxNotifications) {
        this.removeNotification(this.activeNotifications[0])
      }
      
      // Ajouter un ID unique si pas présent
      if (!notification.id) {
        notification.id = Date.now() + Math.random()
      }
      
      // Ajouter la notification
      this.activeNotifications.push(notification)
      
      // Programmer la suppression automatique
      const timeoutId = setTimeout(() => {
        this.removeNotification(notification)
      }, this.notificationTimeout)
      
      notification.timeoutId = timeoutId
    },
    
    removeNotification(notification) {
      const index = this.activeNotifications.findIndex(n => n.id === notification.id)
      if (index > -1) {
        if (notification.timeoutId) {
          clearTimeout(notification.timeoutId)
        }
        this.activeNotifications.splice(index, 1)
      }
    },
    
    handleNotificationClick(notification) {
      // Marquer comme lue si c'est une vraie notification de la DB
      if (notification.id && typeof notification.id === 'number') {
        this.markAsRead(notification)
      }
      
      // Navigation selon le type de notification
      this.navigateBasedOnType(notification)
      
      // Supprimer la notification toast
      this.removeNotification(notification)
    },
    
    async markAsRead(notification) {
      try {
        await NotificationService.markAsRead(notification.id)
      } catch (error) {
        console.error('Erreur marquage notification:', error)
      }
    },
    
    navigateBasedOnType(notification) {
      // Navigation selon le type de notification
      switch (notification.type) {
        case 'new_message':
          this.$router.push('/discussions')
          break
        case 'appointment_created':
        case 'appointment_accepted':
        case 'appointment_rejected':
          this.$router.push('/agenda')
          break
        case 'new_comment':
        case 'new_like':
          // Si on a des données sur la compétence, naviguer vers elle
          if (notification.data && notification.data.skillId) {
            this.$router.push(`/skill/${notification.data.skillId}`)
          } else {
            this.$router.push('/dashboard')
          }
          break
        case 'new_rating':
          this.$router.push('/profile')
          break
        default:
          this.$router.push('/notifications')
      }
    },
    
    formatTime(dateString) {
      return NotificationService.formatNotificationDate(dateString)
    },
    
    getNotificationIcon(type) {
      return NotificationService.getNotificationIcon(type)
    }
  }
}
</script>

<style scoped>
.notification-center {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  pointer-events: none;
}

.notification-toast {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  margin-bottom: 12px;
  max-width: 400px;
  min-width: 300px;
  border-left: 4px solid #3b82f6;
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: slideIn 0.3s ease-out;
}

.notification-toast:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.notification-toast.success {
  border-left-color: #10b981;
}

.notification-toast.error {
  border-left-color: #ef4444;
}

.notification-toast.warning {
  border-left-color: #f59e0b;
}

.notification-toast.info {
  border-left-color: #3b82f6;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  gap: 12px;
}

.notification-icon {
  font-size: 1.25rem;
  margin-top: 2px;
}

.notification-text {
  flex: 1;
}

.notification-message {
  margin: 0 0 4px 0;
  font-size: 0.9rem;
  color: #1f2937;
  line-height: 1.4;
}

.notification-time {
  font-size: 0.75rem;
  color: #6b7280;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .notification-center {
    top: 10px;
    right: 10px;
    left: 10px;
  }
  
  .notification-toast {
    max-width: none;
    min-width: auto;
  }
}
</style>
