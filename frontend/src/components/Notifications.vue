<template>
  <div class="notifications-content">
    <div class="notifications-header">
      <h1 class="notifications-title">Notifications</h1>
      <button 
        v-if="hasNotifications && unreadCount > 0" 
        @click="markAllAsRead"
        class="mark-all-read-btn"
        :disabled="loading"
      >
        Tout marquer comme lu
      </button>
    </div>
    
    <div v-if="loading && currentPage === 1" class="loading">Chargement...</div>
    <div v-else-if="!hasNotifications" class="empty">Aucune notification pour le moment.</div>
    
    
    <div v-else class="notifications-wrapper">
      <div v-for="(notifs, dateGroup) in groupedNotifications" :key="dateGroup" class="date-group">
        <h3 class="date-header">{{ dateGroup }}</h3>
        <ul class="notification-list">          <li 
            v-for="notif in notifs" 
            :key="notif.id" 
            class="notification-item"
            :class="{ 'unread': !notif.read }"
            @click="markAsRead(notif)"
          >
            
            <div class="notification-avatar" v-if="notif.triggerUser">
              <img 
                :src="notif.triggerUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(notif.triggerUser.username || 'User')}&background=ECBC76&color=fff&size=40&bold=true`" 
                :alt="notif.triggerUser.username"
                class="trigger-user-avatar"
                @click.stop="navigateToProfile(notif.triggerUser.profileToken)"
              />
            </div>
            
            <span v-else class="icon" :style="{ color: getNotificationColor(notif.type) }">
              {{ getNotificationIcon(notif.type) }}
            </span>
            
            <div class="notif-content">
              <p class="notif-message" v-html="formatNotificationMessage(notif)"></p>
              <span class="notif-date">{{ formatDate(notif.createdAt) }}</span>
            </div>
            <div v-if="!notif.read" class="unread-indicator"></div>
          </li>
        </ul>
      </div>

      
      <div v-if="pagination && pagination.totalPages > 1" class="pagination">
        <button 
          @click="loadPage(currentPage - 1)"
          :disabled="!pagination.hasPrev || loading"
          class="pagination-btn"
        >
          ← Précédent
        </button>
        
        <div class="page-info">
          Page {{ currentPage }} sur {{ pagination.totalPages }}
        </div>
        
        <button 
          @click="loadPage(currentPage + 1)"
          :disabled="!pagination.hasNext || loading"
          class="pagination-btn"
        >
          Suivant →
        </button>
      </div>

      
      <div v-if="pagination && pagination.hasNext && !showPagination" class="load-more-container">
        <button 
          @click="loadMore"
          :disabled="loading"
          class="load-more-btn"
        >
          {{ loading ? 'Chargement...' : 'Charger plus' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import NotificationService from '@/services/notificationService'
import toastService from '@/services/toast'
import eventBus, { NotificationEvents } from '@/services/eventBus'

export default {
  name: 'Notifications',
  data() {
    return {
      groupedNotifications: {},
      allNotifications: [], // Stockage de toutes les notifications pour "Charger plus"
      loading: true,
      unreadCount: 0,
      currentPage: 1,
      pagination: null,
      showPagination: true, // true pour pagination classique, false pour "Charger plus"
      refreshInterval: null
    }
  },
  computed: {
    hasNotifications() {
      return Object.keys(this.groupedNotifications).length > 0
    }
  },  async mounted() {
    await this.loadNotifications()

    this.startAutoRefresh()

    this.addUsernameClickHandlers()
  },
  beforeUnmount() {
    this.stopAutoRefresh()
  },
  methods: {
    async loadNotifications(page = 1) {
      try {
        this.loading = true
        const response = await NotificationService.getNotifications(page, 10)
        
        if (this.showPagination) {

          this.groupedNotifications = response.notifications
          this.currentPage = page
        } else {

          if (page === 1) {
            this.allNotifications = []
          }

          Object.keys(response.notifications).forEach(dateGroup => {
            this.allNotifications.push(...response.notifications[dateGroup])
          })

          this.groupedNotifications = this.groupNotificationsByDate(this.allNotifications)
        }
          this.pagination = response.pagination
        this.unreadCount = await NotificationService.getUnreadCount()
      } catch (error) {
        console.error('Erreur chargement notifications:', error)
        toastService.error('Erreur lors du chargement des notifications')
      } finally {
        this.loading = false

        this.addUsernameClickHandlers()
      }
    },

    async loadPage(page) {
      if (page < 1 || (this.pagination && page > this.pagination.totalPages)) return
      await this.loadNotifications(page)
    },

    async loadMore() {
      if (!this.pagination.hasNext) return
      await this.loadNotifications(this.currentPage + 1)
      this.currentPage++
    },

    groupNotificationsByDate(notifications) {
      const groups = {}
      
      notifications.forEach(notification => {
        const date = new Date(notification.createdAt)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        
        let dateKey

        if (date.toDateString() === today.toDateString()) {
          dateKey = "Aujourd'hui"
        }

        else if (date.toDateString() === yesterday.toDateString()) {
          dateKey = "Hier"
        }

        else if (date >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
          const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
          dateKey = days[date.getDay()]
        }

        else {
          dateKey = date.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })
        }
        
        if (!groups[dateKey]) {
          groups[dateKey] = []
        }
        
        groups[dateKey].push(notification)
      })
      
      return groups
    },    async markAsRead(notification) {
      if (notification.read) return
      
      try {
        await NotificationService.markAsRead(notification.id)
        notification.read = true

        eventBus.emit(NotificationEvents.NOTIFICATION_READ)
      } catch (error) {
        console.error('Erreur marquage notification:', error)
        toastService.error('Erreur lors du marquage de la notification')
      }
    },async markAllAsRead() {
      try {
        await NotificationService.markAllAsRead()

        Object.keys(this.groupedNotifications).forEach(dateGroup => {
          this.groupedNotifications[dateGroup].forEach(notif => {
            notif.read = true
          })
        })
        
        this.unreadCount = 0
        toastService.success('Toutes les notifications ont été marquées comme lues')

        eventBus.emit(NotificationEvents.ALL_NOTIFICATIONS_READ)
      } catch (error) {
        console.error('Erreur marquage toutes notifications:', error)
        toastService.error('Erreur lors du marquage des notifications')
      }
    },    async refreshNotifications() {

      try {
        const response = await NotificationService.getNotifications(this.currentPage, 10)
        this.groupedNotifications = response.notifications
        this.pagination = response.pagination
        const newUnreadCount = await NotificationService.getUnreadCount()
        if (newUnreadCount !== this.unreadCount) {
          this.unreadCount = newUnreadCount          // Émettre l'événement pour actualiser les autres composants
          eventBus.emit(NotificationEvents.UNREAD_COUNT_CHANGED, newUnreadCount)
        }

        this.addUsernameClickHandlers()
      } catch (error) {
        console.error('Erreur actualisation notifications:', error)
      }
    },

    startAutoRefresh() {

      this.refreshInterval = setInterval(this.refreshNotifications, 30000)
    },

    stopAutoRefresh() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval)
      }
    },
    
    formatDate(dateString) {
      return NotificationService.formatNotificationDate(dateString)
    },
    
    getNotificationIcon(type) {
      return NotificationService.getNotificationIcon(type)
    },    
    getNotificationColor(type) {
      return NotificationService.getNotificationColor(type)
    },

    formatNotificationMessage(notification) {
      let message = notification.message;

      if (notification.triggerUser) {
        const username = notification.triggerUser.username;
        const profileToken = notification.triggerUser.profileToken;

        message = message.replace(
          username,
          `<span class="clickable-username" data-profile-token="${profileToken}">${username}</span>`
        );
      }
      
      return message;
    },    // Navigation vers le profil d'un utilisateur
    navigateToProfile(profileToken) {
      if (profileToken) {
        this.$router.push(`/profile/${profileToken}`);
      }
    },

    addUsernameClickHandlers() {
      this.$nextTick(() => {
        const clickableUsernames = document.querySelectorAll('.clickable-username');
        clickableUsernames.forEach(element => {
          element.addEventListener('click', (e) => {
            e.stopPropagation();
            const profileToken = element.getAttribute('data-profile-token');
            this.navigateToProfile(profileToken);
          });
        });
      });
    }
  }
}
</script>

<style scoped>
.notifications-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.notifications-title {
  font-size: 2rem;
  font-weight: 600;
  color: #E48700;
  margin: 0;
}

.mark-all-read-btn {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.mark-all-read-btn:hover:not(:disabled) {
  background: #4338ca;
}

.mark-all-read-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  font-size: 1.1rem;
}

.empty {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
  font-size: 1.1rem;
  background: #f9fafb;
  border-radius: 12px;
  border: 2px dashed #d1d5db;
}

.notifications-wrapper {
  width: 100%;
}

.date-group {
  margin-bottom: 32px;
}

.date-header {
  font-size: 1.2rem;
  font-weight: 600;
  color: #E48700;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #f3f4f6;
}

.notification-list {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
}

.notification-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 12px;
  background: #FFF4E3;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.notification-item:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.notification-item.unread {
  background: #eff6ff;
  border-color: #3b82f6;
  border-left: 4px solid #3b82f6;
}

.notification-item.unread:hover {
  background: #dbeafe;
}

.icon {
  font-size: 1.5rem;
  margin-right: 16px;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}


.notification-avatar {
  margin-right: 16px;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trigger-user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.trigger-user-avatar:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.notif-content {
  flex: 1;
}

.notif-message {
  margin: 0 0 4px 0;
  font-size: 1rem;
  color: #1f2937;
  line-height: 1.5;
}


.notif-message :deep(.clickable-username) {
  color: #E48700;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s ease;
  border-radius: 3px;
  padding: 1px 3px;
}

.notif-message :deep(.clickable-username:hover) {
  color: #c76d00;
  background-color: rgba(228, 135, 0, 0.1);
  text-decoration: underline;
}

.notif-date {
  font-size: 0.875rem;
  color: #E48700;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
  margin-left: 12px;
}


.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
  padding: 20px 0;
}

.pagination-btn {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  min-width: 120px;
}

.pagination-btn:hover:not(:disabled) {
  background: #4338ca;
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.page-info {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}


.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding: 20px 0;
}

.load-more-btn {
  background: linear-gradient(135deg, #E48700, #f59e0b);
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(228, 135, 0, 0.3);
}

.load-more-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #d97706, #E48700);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(228, 135, 0, 0.4);
}

.load-more-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@media (max-width: 768px) {
  .notifications-content {
    padding: 16px;
  }
  
  .notifications-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .notifications-title {
    font-size: 1.5rem;
  }

  .date-group {
    margin-bottom: 24px;
  }

  .date-header {
    font-size: 1.1rem;
    margin-bottom: 12px;
  }
  
  .notification-item {
    padding: 12px 16px;
  }
  
  .icon {
    font-size: 1.25rem;
    margin-right: 12px;
    min-width: 32px;
  }
  
  .notif-message {
    font-size: 0.9rem;
  }
  
  .notif-date {
    font-size: 0.8rem;
  }

  .pagination {
    flex-direction: column;
    gap: 12px;
  }

  .pagination-btn {
    min-width: 100px;
    padding: 8px 16px;
  }

  .load-more-btn {
    padding: 10px 24px;
    font-size: 0.9rem;
  }
}
</style>

