<template>
  <div class="profile-content">
    <div class="profile-card-v2">
      <div class="profile-cover">
        <img class="profile-cover-img" :src="user?.cover || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'" alt="cover" />
      </div>
      <div class="profile-card-bottom-v2">
        <div class="profile-avatar-block">
          <img class="profile-avatar-v2" :src="user?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg'" alt="Avatar utilisateur" />
          <div class="profile-name-v2">{{ user?.username || '' }}</div>
        </div>
        <div class="profile-infos-v2">
          <div class="profile-address-v2">{{ user?.address || '' }}</div>
        </div>
        <button class="profile-btn-v2">Modifier le profil</button>
      </div>
    </div>
    <div class="profile-section" v-if="userPosts.length">
      <h3>Mes posts</h3>
      <ul class="profile-posts-list">
        <li v-for="post in userPosts" :key="post.id" class="profile-post-item">
          <div class="profile-post-title">{{ post.description }}</div>
          <div class="profile-post-date">Publié le {{ new Date(post.createdAt).toLocaleDateString() }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import api from '../services/api'

export default {
  name: 'Profile',
  data() {
    return {
      user: null,
      userPosts: []
    }
  },
  async mounted() {
    try {
      const res = await api.get('/auth/me')
      this.user = res.data
      // Récupérer les posts de l'utilisateur
      const postsRes = await api.get(`/skills?userId=${this.user.id}`)
      this.userPosts = postsRes.data
    } catch (e) {
      this.user = null
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.profile-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.2rem 1rem 2.2rem 1rem;
  background: #FFFEF9;
  width: 1000px;
  max-width: 100%;
  margin: 0 auto;
}
.profile-title {
  font-size: 2.1rem;
  color: #E48700;
  margin-bottom: 0.7rem;
  font-weight: bold;
}
.profile-card-v2 {
  background: #fff8f2;
  border-radius: 18px;
  box-shadow: 0 2px 12px #0001;
  overflow: hidden;
  max-width: 700px;
  width: 100%;
  margin: 0 auto 2.2rem auto;
  padding: 0;
  position: relative;
}
.profile-cover {
  width: 100%;
  height: 220px;
  overflow: hidden;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
}
.profile-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.profile-card-bottom-v2 {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background: #fdf3e6;
  padding: 0 1.5rem 1.6rem 1.5rem;
  border-bottom-left-radius: 18px;
  border-bottom-right-radius: 18px;
  position: relative;
  gap: 1.1rem;
  min-height: 120px;
}
.profile-avatar-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}
.profile-avatar-v2 {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 4px solid #ECBC76;
  background: #fff;
  margin-top: -55px;
  box-shadow: 0 2px 8px #0001;
}
.profile-name-v2 {
  font-size: 1.35rem;
  font-weight: bold;
  color: #181b26;
  margin: 0.7rem 0 0.1rem 0;
  text-align: center;
}
.profile-infos-v2 {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  width: auto;
}
.profile-address-v2 {
  font-size: 0.98rem;
  color: #888;
  text-align: left;
}
.profile-btn-v2 {
  background: #E48700;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.18s;
  margin-top: 0;
  margin-left: auto;
}
.profile-btn-v2:hover {
  background: #c76d00;
  color: #fff;
}
.profile-section {
  background: #FFF4E3;
  border-radius: 10px;
  box-shadow: 0 2px 8px #0001;
  padding: 1.5rem 2rem;
  max-width: 700px;
  width: 100%;
}
.profile-section h3 {
  color: #E48700;
  margin-bottom: 0.7rem;
}
.profile-about {
  color: #28303F;
  font-size: 1.08rem;
  margin: 0;
}
.profile-posts-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.profile-post-item {
  background: #fff;
  border-radius: 8px;
  padding: 1.2rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px #0001;
}
.profile-post-title {
  font-size: 1.1rem;
  color: #28303F;
  margin: 0 0 0.4rem 0;
}
.profile-post-date {
  font-size: 0.9rem;
  color: #777;
}
@media (min-width: 601px) {
  .profile-card-bottom-v2 {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  .profile-avatar-v2 {
    margin-right: 2.2rem;
    margin-top: -55px;
  }
  .profile-infos-v2 {
    margin-left: 0;
  }
}
@media (max-width: 600px) {
  .profile-card-bottom-v2 {
    flex-direction: column;
    align-items: center;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    padding: 0 0.7rem 1.2rem 0.7rem;
    gap: 1.2rem;
  }
  .profile-avatar-v2 {
    width: 80px;
    height: 80px;
    margin-top: -40px;
    margin-right: 0;
  }
  .profile-avatar-block {
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
  }
  .profile-infos-v2 {
    align-items: center;
    width: 100%;
  }
  .profile-btn-v2 {
    margin-left: 0;
    margin-top: 0.5rem;
    width: 100%;
  }
}
</style>
