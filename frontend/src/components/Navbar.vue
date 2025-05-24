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
      </li>
      <li>
        <router-link to="/discussions" exact-active-class="active">
          <img src="../assets/icons/discussions.svg" alt="Discussions" class="nav-icon" />
          <span class="nav-label">Discussions</span>
        </router-link>
      </li>
      <li>
        <router-link to="/carte" exact-active-class="active">
          <img src="../assets/icons/carte.svg" alt="Carte" class="nav-icon" />
          <span class="nav-label">Carte</span>
        </router-link>
      </li>
    </ul>
    <!-- Ajout Notification et Paramètres -->
    <ul class="navbar-actions">
      <li>
        <router-link to="/notifications" exact-active-class="active">
          <img src="../assets/icons/notification.svg" alt="Notification" class="nav-icon" />
          <span class="nav-label">Notification</span>
          <span class="notif-badge">12</span>
        </router-link>
      </li>
      <li>
        <router-link to="/parametres" exact-active-class="active">
          <img src="../assets/icons/settings.svg" alt="Paramètres" class="nav-icon" />
          <span class="nav-label">Paramètres</span>
        </router-link>
      </li>
    </ul>
    <div class="navbar-profile" @click="$router.push('/profile')" style="cursor:pointer; position: relative;">
      <img class="avatar" :src="user?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg'" alt="avatar" />
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

export default {
  name: 'Navbar',
  data() {
    return {
      user: null,
      showMenu: false
    }
  },
  async mounted() {
    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/login')
      return
    }
    try {
      const res = await api.get('/auth/me')
      this.user = res.data
    } catch (e) {
      this.user = null
      this.$router.push('/login')
    }
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    handleLogout() {
      localStorage.removeItem('token')
      this.user = null
      this.$router.push('/login')
    },
    handleClickOutside(e) {
      // Ferme le menu si on clique en dehors du menu ou de l'icône
      if (!this.$el.querySelector('.dropdown-menu')) return;
      const menu = this.$el.querySelector('.dropdown-menu');
      const dots = this.$el.querySelector('.dots-icon');
      if (this.showMenu && !menu.contains(e.target) && !dots.contains(e.target)) {
        this.showMenu = false;
      }
    }
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

.navbar-links a {
  color: #28303F;
  text-decoration: none;
  padding: 10px 12px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: color 0.2s;
}

.nav-icon {
  width: 25px;
  height: 25px;
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
  .navbar-profile {
    flex-direction: column;
    align-items: center;
    padding-right: 0;
    gap: 6px;
  }
  .dots-icon {
    margin: 0;
  }
  .navbar-actions {
    display: none !important;
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
    width: 25%;
    text-align: center;
  }
  .navbar-links a {
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
  }
  .nav-label {
    display: none;
  }
  .navbar-actions {
    display: none !important;
  }
}

</style>
