<template>
  <nav class="navbar-vertical">
    <div class="navbar-logo">
      <img src="../assets/images/SkillSwap Logo.png" alt="SkillSwap" class="logo" />
      <span class="brand">SkillSwap</span>
    </div>
    <ul class="navbar-links">
      <li>
        <router-link to="/" exact-active-class="active">Accueil</router-link>
      </li>
      <li>
        <router-link to="/dashboard" exact-active-class="active">Dashboard</router-link>
      </li>
      <li>
        <router-link to="/discussions" exact-active-class="active">Discussions</router-link>
      </li>
      <li>
        <router-link to="/carte" exact-active-class="active">Carte</router-link>
      </li>
    </ul>
    <div class="navbar-profile">
      <img class="avatar" src="https://randomuser.me/api/portraits/men/32.jpg" alt="avatar" />
      <div class="profile-info">
        <span class="username">Fouad Andrieu</span>
        <span class="email">fandrieu@myges.fr</span>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Navbar'
}
</script>

<style scoped>
.navbar-vertical {
  width: 240px;
  height: 100vh;
  background: #fff;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 32px 0 24px 0;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
}
.navbar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 32px;
  margin-bottom: 40px;
}
.logo {
  height: 36px;
}
.brand {
  font-weight: bold;
  font-size: 1.3rem;
  color: #f59c1a;
  letter-spacing: 1px;
}
.navbar-links {
  display: flex;
  flex-direction: column;
  gap: 18px;
  list-style: none;
  margin: 0;
  padding: 0 0 0 32px;
  flex: 1;
  width: 100%;
}
.navbar-links li {
  font-size: 1.08rem;
}
.navbar-links a {
  color: #333;
  text-decoration: none;
  padding: 10px 0 10px 12px;
  border-radius: 24px;
  display: block;
  transition: background 0.2s, color 0.2s;
}
.navbar-links a.active,
.navbar-links a.router-link-exact-active {
  color: #f59c1a;
  background: #fff3e6;
  font-weight: bold;
}
.navbar-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 32px;
  margin-top: auto;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #f59c1a;
}
.profile-info {
  display: flex;
  flex-direction: column;
}
.username {
  font-size: 1rem;
  color: #333;
  font-weight: 500;
}
.email {
  font-size: 0.92rem;
  color: #888;
}
</style>