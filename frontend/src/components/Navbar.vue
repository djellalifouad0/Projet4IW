<template>
  <nav class="navbar-vertical">
    <div class="navbar-logo" @click="$router.push('/')" style="cursor:pointer">
      <img src="../assets/images/SkillSwap Logo.png" alt="SkillSwap" class="logo" />
      <span class="brand">SkillSwap</span>
    </div>
    <ul class="navbar-links">
      <li>
        <router-link to="/" exact-active-class="active">
          <img src="../assets/icons/accueil.svg" alt="Accueil" class="nav-icon" />
          <span class="nav-label">Accueil</span>
        </router-link>
      </li>
      <li>
        <router-link to="/dashboard" exact-active-class="active">
          <img src="../assets/icons/dashboard.svg" alt="Dashboard" class="nav-icon" />
          <span class="nav-label">Dashboard</span>
        </router-link>
      </li>      <li>
        <router-link to="/discussions" exact-active-class="active">
          <img src="../assets/icons/discussions.svg" alt="Discussions" class="nav-icon" />
          <span class="nav-label">Discussions</span>
          <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
        </router-link>
      </li>      <li>
        <router-link to="/carte" exact-active-class="active">
          <img src="../assets/icons/carte.svg" alt="Carte" class="nav-icon" />
          <span class="nav-label">Carte</span>
        </router-link>
      </li>
      <!-- Ajout des boutons mobile pour Notifications et Paramètres -->
      <li class="mobile-only">
        <router-link to="/notifications" exact-active-class="active" class="notification-link">
          <div class="notification-wrapper">
            <img src="../assets/icons/notification.svg" alt="Notifications" class="nav-icon" />
            <span v-if="notificationCount > 0" class="notification-count">{{ notificationCount > 99 ? '99+' : notificationCount }}</span>
          </div>
          <span class="nav-label">Notifications</span>
        </router-link>
      </li>      <li class="mobile-only">
        <router-link to="/parametres" exact-active-class="active">
          <img src="../assets/icons/settings.svg" alt="Paramètres" class="nav-icon" />
          <span class="nav-label">Paramètres</span>
        </router-link>
      </li>
      <li class="mobile-only">
        <div @click="navigateToMyProfile" class="profile-link">
          <img class="nav-icon profile-avatar" :src="user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=ECBC76&color=fff&size=64&bold=true`" alt="Profile" />
          <span class="nav-label">Profile</span>
        </div>
      </li>
    </ul><!-- Ajout Notification et Paramètres -->
    <ul class="navbar-actions">
      <li>
        <router-link to="/notifications" exact-active-class="active" class="notification-link">
          <div class="notification-wrapper">
            <img src="../assets/icons/notification.svg" alt="Notifications" class="nav-icon" />
            <span v-if="notificationCount > 0" class="notification-count">{{ notificationCount > 99 ? '99+' : notificationCount }}</span>
          </div>
          <span class="nav-label">Notifications</span>
        </router-link>
      </li>
      <li>
        <router-link to="/parametres" exact-active-class="active">
          <img src="../assets/icons/settings.svg" alt="Paramètres" class="nav-icon" />
          <span class="nav-label">Paramètres</span>
        </router-link>
      </li>
    </ul>
    <div class="navbar-profile" @click="navigateToMyProfile" style="cursor: pointer; position: relative;">
      <img class="avatar" :src="user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=ECBC76&color=fff&size=64&bold=true`" alt="avatar" />
      <div class="profile-info">
        <span class="username" :title="user ? user.username : ''">{{ user ? user.username : 'Non connecté' }}</span>
        <span class="email" :title="user ? user.email : ''">{{ user ? user.email : '' }}</span>
      </div>
      <img src="../assets/icons/3dots.svg" alt="Options" class="dots-icon" @click.stop="showMenu = !showMenu" />
      <div v-if="showMenu" class="dropdown-menu" @click.stop>
        <button @click="handleLogout">Se déconnecter</button>
      </div>
    </div>
  </nav>
</template>

<script>
import api from '../services/api'
import authService from '../services/authService'
import unreadMessagesService from '../services/unreadMessages'
import NotificationService from '../services/notificationService'
import eventBus, { NotificationEvents, ProfileEvents } from '../services/eventBus'

export default {
  name: 'Navbar',  data() {
    return {
      user: null,
      showMenu: false,
      notificationCount: 0,
      refreshInterval: null,
      isUserActive: true,
      lastActivity: Date.now(),
      activityCheckInterval: null,
      updateActivityHandler: null
    }
  },
  computed: {
    unreadCount() {
      return unreadMessagesService.getCount();
    }
  },  async mounted() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.$router.push('/login');
      return;
    }    try {
      // Utiliser authService qui gère automatiquement l'initialisation WebSocket
      this.user = await authService.getUserInfo();
      console.log('User data:', this.user); // Debugging line to verify user data
        // Charger le compteur de messages non lus
      await unreadMessagesService.fetchUnreadCount();
        // Charger le compteur de notifications
      await this.loadNotificationCount();
        // Configurer les écouteurs d'événements
      this.setupEventListeners();
      
      // Configurer la détection automatique WebSocket des notifications
      NotificationService.setupAutoNotificationDetection();
      
      // Démarrer l'actualisation automatique intelligente
      this.startSmartAutoRefresh();
      
      // Configurer la détection d'activité utilisateur
      this.setupActivityDetection();
    } catch (e) {
      this.user = null;
      this.$router.push('/login');
    }
    document.addEventListener('click', this.handleClickOutside)
  },  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
    this.stopAutoRefresh()
    this.removeEventListeners()
    this.cleanupActivityDetection()
    // Nettoyer les écouteurs WebSocket
    NotificationService.cleanupAutoNotificationDetection()
  },
  methods: {
    async loadNotificationCount() {
      try {
        this.notificationCount = await NotificationService.getUnreadCount();
      } catch (error) {
        console.error('Erreur chargement compteur notifications:', error);
      }    },
    
    setupEventListeners() {
      // Écouter les événements de notification
      eventBus.on(NotificationEvents.NOTIFICATION_READ, () => {
        this.notificationCount = Math.max(0, this.notificationCount - 1);
      });

      eventBus.on(NotificationEvents.ALL_NOTIFICATIONS_READ, () => {
        this.notificationCount = 0;
      });

      eventBus.on(NotificationEvents.UNREAD_COUNT_CHANGED, (newCount) => {
        this.notificationCount = newCount;
      });      eventBus.on(NotificationEvents.NEW_NOTIFICATION, () => {
        this.notificationCount += 1;
        // Rafraîchir immédiatement pour avoir les données les plus récentes
        this.loadNotificationCount();
      });

      // Écouter les événements de mise à jour du profil
      eventBus.on(ProfileEvents.PROFILE_UPDATED, (profileData) => {
        console.log('Mise à jour du profil reçue:', profileData);
        if (this.user) {
          this.user.username = profileData.username;
          this.user.avatar = profileData.avatar;
          // Forcer la réactivité de Vue
          this.$forceUpdate();
        }
      });

      eventBus.on(ProfileEvents.USERNAME_CHANGED, (newUsername) => {
        console.log('Nom d\'utilisateur changé:', newUsername);
        if (this.user) {
          this.user.username = newUsername;
          this.$forceUpdate();
        }
      });

      eventBus.on(ProfileEvents.AVATAR_CHANGED, (newAvatar) => {
        console.log('Avatar changé:', newAvatar);
        if (this.user) {
          this.user.avatar = newAvatar;
          this.$forceUpdate();
        }
      });

      // Écouter les événements qui peuvent déclencher des notifications
      eventBus.on('action-completed', () => {
        // Vérifier les nouvelles notifications après une action
        setTimeout(() => this.loadNotificationCount(), 1000);
      });
    },    removeEventListeners() {
      // Nettoyer les écouteurs d'événements
      eventBus.off(NotificationEvents.NOTIFICATION_READ);
      eventBus.off(NotificationEvents.ALL_NOTIFICATIONS_READ);
      eventBus.off(NotificationEvents.UNREAD_COUNT_CHANGED);
      eventBus.off(NotificationEvents.NEW_NOTIFICATION);
      eventBus.off(ProfileEvents.PROFILE_UPDATED);
      eventBus.off(ProfileEvents.USERNAME_CHANGED);
      eventBus.off(ProfileEvents.AVATAR_CHANGED);
      eventBus.off('action-completed');
    },

    startAutoRefresh() {
      // Actualiser le compteur toutes les 30 secondes
      this.refreshInterval = setInterval(async () => {
        await this.loadNotificationCount();
      }, 30000);
    },
    
    stopAutoRefresh() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
      }
      if (this.activityCheckInterval) {
        clearInterval(this.activityCheckInterval);
      }
    },    // Système d'actualisation intelligent basé sur l'activité utilisateur
    startSmartAutoRefresh() {
      // Polling plus fréquent quand l'utilisateur est actif
      this.refreshInterval = setInterval(async () => {
        const interval = this.isUserActive ? 10000 : 60000; // 10s si actif, 1min si inactif
        await this.loadNotificationCount();
      }, this.isUserActive ? 10000 : 60000);
    },
    
    // Détecter l'activité utilisateur
    setupActivityDetection() {
      this.updateActivityHandler = () => {
        this.lastActivity = Date.now();
        this.isUserActive = true;
      };

      // Événements qui indiquent une activité utilisateur
      ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
        document.addEventListener(event, this.updateActivityHandler, true);
      });

      // Vérifier périodiquement si l'utilisateur est inactif
      this.activityCheckInterval = setInterval(() => {
        const timeSinceLastActivity = Date.now() - this.lastActivity;
        this.isUserActive = timeSinceLastActivity < 30000; // Inactif après 30s
        
        // Redémarrer le polling avec le bon intervalle si nécessaire
        if (this.refreshInterval) {
          clearInterval(this.refreshInterval);
          this.startSmartAutoRefresh();
        }      }, 5000);
    },
    
    // Nettoyer la détection d'activité
    cleanupActivityDetection() {
      if (this.updateActivityHandler) {
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
          document.removeEventListener(event, this.updateActivityHandler, true);
        });
      }
      
      if (this.activityCheckInterval) {
        clearInterval(this.activityCheckInterval);
      }
    },

    // Méthode publique pour actualiser le compteur depuis l'extérieur
    async refreshNotificationCount() {
      await this.loadNotificationCount();
    },

    // Méthode pour réduire le compteur quand une notification est lue
    decrementNotificationCount() {
      this.notificationCount = Math.max(0, this.notificationCount - 1);
    },

    // Méthode pour remettre le compteur à zéro
    resetNotificationCount() {
      this.notificationCount = 0;
    },    handleLogout() {
      this.stopAutoRefresh();
      localStorage.removeItem('token');
      this.user = null;
      this.$router.push('/login');
    },
    
    handleClickOutside(e) {
      // Ferme le menu si on clique en dehors du menu ou de l'icône
      if (!this.$el.querySelector('.dropdown-menu')) return;
      const menu = this.$el.querySelector('.dropdown-menu');
      const dots = this.$el.querySelector('.dots-icon');
      if (this.showMenu && !menu.contains(e.target) && !dots.contains(e.target)) {
        this.showMenu = false;
      }
    },
    
    getProfileLink() {
      if (this.user && this.user.profileToken) {
        return `/profile/${this.user.profileToken}`;
      }
      return '/profile';
    },
    
    navigateToMyProfile() {
      const profileLink = this.getProfileLink();
      console.log('Navigating to profile:', profileLink);
      
      // Forcer la navigation même si on est déjà sur une page de profil
      if (this.$route.path.startsWith('/profile/')) {
        // Si on est déjà sur une page de profil, utiliser replace pour forcer le rechargement
        this.$router.replace(profileLink);
      } else {
        // Sinon, navigation normale
        this.$router.push(profileLink);
      }
    },
  }
}
</script>

<style scoped>
.navbar-vertical {
  width: 300px;
  height: 100vh;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 32px 48px 24px 48px;
  font-family: 'Poppins', sans-serif;
  transition: width 0.2s;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 200;
  background: #fff;
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 40px;
}

.logo {
  height: 46px;
}

.brand {
  font-family: 'Feather', 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 1.3rem;
  color: #C6553B;
  letter-spacing: 1px;
  transition: opacity 0.2s;
}

.navbar-links {
  display: flex;
  flex-direction: column;
  gap: 18px;
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  width: 100%;
}

.navbar-links li {
  font-size: 1.08rem;
}

/* Masquer les éléments mobile-only sur desktop */
.mobile-only {
  display: none;
}

.navbar-links a,
.profile-link {
  color: #28303F;
  text-decoration: none;
  padding: 10px 12px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: color 0.2s;
  cursor: pointer;
}

.nav-icon {
  width: 25px;
  height: 25px;
}

.profile-avatar {
  border-radius: 50%;
  border: 2px solid #C6553B;
}

.nav-label {
  transition: opacity 0.2s;
  white-space: nowrap;
}

.navbar-links a.active,
.navbar-links a.router-link-exact-active {
  color: #28303F;
  font-weight: bold;
  background: none;
}

.navbar-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 32px 0 18px 0;
  width: 100%;
  list-style: none;
  padding: 0;
}

.navbar-actions li {
  font-size: 1.08rem;
}

.navbar-actions a {
  color: #28303F;
  text-decoration: none;
  padding: 10px 12px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  transition: color 0.2s;
}

.notification-icon-placeholder,
.settings-icon-placeholder {
  width: 25px;
  height: 25px;
  display: inline-block;
  background: #ffe0b2;
  border-radius: 50%;
}

.notif-badge {
  background: #ECBC76;
  color: #fff;
  font-size: 0.92rem;
  font-weight: bold;
  border-radius: 8px;
  padding: 2px 8px;
  margin-left: 8px;
  display: inline-block;
}

.notification-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.notification-count {
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

.unread-badge {
  background: #e74c3c;
  color: #fff;
  font-size: 0.8rem;
  font-weight: bold;
  border-radius: 10px;
  padding: 2px 6px;
  margin-left: auto;
  display: inline-block;
  min-width: 18px;
  text-align: center;
  line-height: 1.2;
}

.navbar-profile {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: auto;
  padding-top: 16px;
  width: 100%;
  padding-right: 12px;
  position: relative;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #C6553B;
}

.profile-info {
  display: flex;
  flex-direction: column;
  max-width: 120px;
  overflow: hidden;
}

.username {
  font-size: 1rem;
  color: #28303F;
  font-weight: 500;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 120px;
  display: block;
}

.email {
  font-size: 0.92rem;
  color: #888;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 120px;
  display: block;
}

.dots-icon {
  width: 18px;
  height: 18px;
  margin-left: auto;
  margin-right: 8px;
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  bottom: 48px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 8px #0002;
  z-index: 10;
  min-width: 140px;
  padding: 8px 0;
}

.dropdown-menu button {
  width: 100%;
  background: none;
  border: none;
  padding: 10px 16px;
  text-align: left;
  font-size: 1rem;
  color: #c6553b;
  cursor: pointer;
  transition: background 0.15s;
}

.dropdown-menu button:hover {
  background: #f5f5f5;
}

/* --- Responsive version Twitter: icons only --- */
@media (max-width: 1350px) {
  .navbar-vertical {
    width: 70px;
    padding: 32px 0 24px 0;
    align-items: center;
  }
  .navbar-logo .brand,
  .navbar-links .nav-label,
  .navbar-actions .nav-label,
  .profile-info {
    display: none !important;
  }
  .navbar-links {
    align-items: center;
    padding: 0;
  }
  .navbar-links a {
    justify-content: center;
    padding: 10px 0;
    gap: 0;
  }
  .navbar-actions {
    align-items: center;
    margin: 32px 0 18px 0;
  }
  .navbar-actions a {
    justify-content: center;
    padding: 10px 0;
    gap: 0;
  }
  .navbar-profile {
    flex-direction: column;
    align-items: center;
    padding-right: 0;
    gap: 6px;
  }
  .dots-icon {
    margin: 0;
  }
}
@media (max-width: 902px) {
  .navbar-vertical {
    /* NAVBAR BAS */
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: unset;
    width: 100vw !important;
    height: 64px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    border-right: none;
    border-top: 1px solid #eee;
    padding: 0 0 0 0;
    z-index: 100;
    background: #fff;
    box-shadow: 0 -3px 16px #0001;
  }
  .navbar-logo,
  .navbar-profile {
    display: none !important;
  }
  
  /* Afficher les éléments mobile-only en responsive */
  .mobile-only {
    display: block !important;
  }
  
  .navbar-links {
    /* Passe les liens sur une ligne, centrés */
    flex-direction: row;
    gap: 0;
    width: 100vw;
    justify-content: space-evenly;
    align-items: center;
    height: 100%;
    margin: 0;
    padding: 0;
  }
  .navbar-links li {
    width: 16.66%; /* 6 éléments au lieu de 4 */
    text-align: center;
  }  .navbar-links a {
    padding: 0;
    border-radius: 0;
    background: none !important;
    justify-content: center;
    width: 100%;
    height: 64px;
    display: flex;
    align-items: center;
    gap: 0;
  }
  
  .profile-link {
    padding: 0;
    border-radius: 0;
    background: none !important;
    justify-content: center;
    width: 100%;
    height: 64px;
    display: flex;
    align-items: center;
    gap: 0;
  }
  .nav-icon {
    width: 28px;
    height: 28px;
    margin: 0 auto;
  }  .nav-label {
    display: none;
  }
  
  /* Ajustement des badges de notification en mode mobile */
  .notification-count {
    top: -6px;
    right: -6px;
    padding: 1px 5px;
    font-size: 0.7rem;
    min-width: 16px;
  }
  
  .navbar-actions {
    display: none !important;
  }
}

</style>
