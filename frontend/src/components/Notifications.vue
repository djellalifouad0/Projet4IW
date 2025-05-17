<template>
  <div class="notifications-content">
    <h1 class="notifications-title">Notifications</h1>
    <div v-if="notifications.length === 0" class="empty">Aucune notification pour le moment.</div>
    <ul v-else class="notification-list">
      <li v-for="(notif, idx) in notifications" :key="idx" class="notification-item">
        <span class="icon">
          <img src="@/assets/icons/notification.svg" alt="Notification" />
        </span>
        <div class="notif-content">
          <p class="notif-message">{{ notif.message }}</p>
          <span class="notif-date">{{ notif.date }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Notifications',
  data() {
    return {
      notifications: [
        { message: "Bienvenue sur SkillSwap !", date: "18/05/2025" },
        { message: "Votre profil a été mis à jour.", date: "17/05/2025" }
      ]
    }
  }
}
</script>

<style scoped>
.notifications-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.2rem 1rem 2.2rem 1rem;
  background: #FFFEF9;
  width: 700px;
  max-width: 100%;
  margin: 0 auto;
}
.notifications-title {
  font-size: 2.1rem;
  color: #E48700;
  margin-bottom: 0.7rem;
  font-weight: bold;
}
.empty {
  text-align: center;
  color: #888;
  font-size: 1.1rem;
  margin-top: 2rem;
}
.notification-list {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  max-width: 800px;
}
.notification-item {
  display: flex;
  align-items: center;
  background: #FFF4E3;
  border-radius: 10px;
  padding: 1.1rem 1.5rem;
  margin-bottom: 1.1rem;
  box-shadow: 0 2px 8px #0001;
}
.icon {
  margin-right: 1.1rem;
  display: flex;
  align-items: center;
}
.icon img {
  width: 32px;
  height: 32px;
}
.notif-content {
  flex: 1;
}
.notif-message {
  font-size: 1.1rem;
  color: #28303F;
  margin: 0 0 0.3rem 0;
}
.notif-date {
  font-size: 0.95rem;
  color: #E48700;
}
@media (max-width: 700px) {
  .notification-list {
    max-width: 100%;
    padding-left: 3vw;
    padding-right: 3vw;
  }
  .notification-item {
    padding: 1rem 0.7rem;
    border-radius: 8px;
  }
}
</style>
