<template>
  <nav class="navbar-vertical">
    <div class="navbar-logo">
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
    <div class="navbar-profile">
      <img class="avatar" src="https://randomuser.me/api/portraits/men/32.jpg" alt="avatar" />
      <div class="profile-info">
        <span class="username">Fouad Andrieu</span>
        <span class="email">fandrieu@myges.fr</span>
      </div>
      <img src="../assets/icons/3dots.svg" alt="Options" class="dots-icon" />
    </div>
  </nav>
</template>

<script>
export default { name: 'Navbar' }
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
  font-weight: 600;
  background: none;
}

.navbar-profile {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: auto;
  padding-top: 16px;
  width: 100%;
  padding-right: 12px;
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
  transition: opacity 0.2s;
}

.username {
  font-size: 1rem;
  color: #28303F;
  font-weight: 500;
}

.email {
  font-size: 0.92rem;
  color: #888;
}

.dots-icon {
  width: 18px;
  height: 18px;
  margin-left: auto;
  margin-right: 8px;
  cursor: pointer;
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
}
</style>
