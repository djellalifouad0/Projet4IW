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
        <button class="profile-btn-v2" @click="showEditModal = true">Modifier le profil</button>
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

    <!-- MODALE EDITION PROFIL -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-profile-edit">
        <button class="modal-close" @click="showEditModal = false">×</button>
        <div class="modal-header">
          <span>Éditer le profil</span>
          <button class="modal-save" @click="saveProfile">Enregistrer</button>
        </div>
        <div class="modal-cover-block">
          <img class="modal-cover-img" :src="edit.cover || user?.cover || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'" alt="cover" />
          <label class="modal-cover-upload">
            <input type="file" accept="image/*" @change="onCoverChange" style="display:none" />
            <span class="modal-cover-camera">📷</span>
          </label>
          <button v-if="edit.cover" class="modal-cover-remove" @click="removeCover">✕</button>
        </div>
        <div class="modal-avatar-block">
          <img class="modal-avatar-img" :src="edit.avatar || user?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg'" alt="avatar" />
          <label class="modal-avatar-upload">
            <input type="file" accept="image/*" @change="onAvatarChange" style="display:none" />
            <span class="modal-avatar-camera">📷</span>
          </label>
        </div>
        <div class="modal-form">
          <input v-model="edit.username" placeholder="Nom" />
          <textarea v-model="edit.bio" placeholder="Bio"></textarea>
          <input v-model="edit.address" placeholder="Localisation" />
        </div>
      </div>
    </div>
    <!-- FIN MODALE -->
  </div>
</template>

<script>
import api from '../services/api'

export default {
  name: 'Profile',
  data() {
    return {
      user: null,
      userPosts: [],
      showEditModal: false,
      edit: {
        username: '',
        bio: '',
        address: '',
        avatar: '',
        cover: ''
      }
    }
  },
  async mounted() {
    try {
      const res = await api.get('/auth/me')
      this.user = res.data
      this.edit.username = this.user.username
      this.edit.bio = this.user.bio || ''
      this.edit.address = this.user.address || ''
      this.edit.avatar = this.user.avatar || ''
      this.edit.cover = this.user.cover || ''
      // Récupérer les posts de l'utilisateur
      const postsRes = await api.get(`/skills?userId=${this.user.id}`)
      this.userPosts = postsRes.data
    } catch (e) {
      this.user = null
      this.$router.push('/login')
    }
  },
  methods: {
    onAvatarChange(e) {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          this.edit.avatar = ev.target.result
        }
        reader.readAsDataURL(file)
      }
    },
    onCoverChange(e) {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          this.edit.cover = ev.target.result
        }
        reader.readAsDataURL(file)
      }
    },
    removeCover() {
      this.edit.cover = ''
    },
    saveProfile() {
      const updatedProfile = {
        username: this.edit.username,
        bio: this.edit.bio,
        address: this.edit.address,
        avatar: this.edit.avatar,
        cover: this.edit.cover
      };

      api.put('/profile', updatedProfile)
        .then(() => {
          this.user.username = this.edit.username;
          this.user.bio = this.edit.bio;
          this.user.address = this.edit.address;
          this.user.avatar = this.edit.avatar;
          this.user.cover = this.edit.cover;
          this.showEditModal = false;
        })
        .catch((error) => {
          console.error('Error updating profile:', error);
        });
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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.32);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-profile-edit {
  background: #fff;
  border-radius: 18px;
  width: 95vw;
  max-width: 540px;
  box-shadow: 0 2px 24px #0003;
  padding: 0 0 2.2rem 0;
  position: relative;
  overflow: visible;
}
.modal-close {
  position: absolute;
  left: 1.1rem;
  top: 1.1rem;
  background: none;
  border: none;
  font-size: 2.1rem;
  color: #222;
  cursor: pointer;
  z-index: 2;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.3rem 2.2rem 0.7rem 3.2rem;
  font-size: 1.25rem;
  font-weight: bold;
}
.modal-save {
  background: #E48700;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.18s;
}
.modal-save:hover {
  background: #c76d00;
}
.modal-cover-block {
  position: relative;
  width: 100%;
  height: 160px;
  background: #eee;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  overflow: hidden;
}
.modal-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.modal-cover-upload {
  position: absolute;
  right: 1.2rem;
  bottom: 1.2rem;
  background: rgba(0, 0, 0, 0.32);
  border-radius: 50%;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.modal-cover-camera {
  font-size: 1.3rem;
  color: #fff;
}
.modal-cover-remove {
  position: absolute;
  right: 3.2rem;
  top: 1.2rem;
  background: rgba(0, 0, 0, 0.32);
  border: none;
  color: #fff;
  font-size: 1.2rem;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
}
.modal-avatar-block {
  position: absolute;
  left: 2.2rem;
  top: 110px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.modal-avatar-img {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: 4px solid #fff;
  background: #fff;
  box-shadow: 0 2px 8px #0001;
}
.modal-avatar-upload {
  position: absolute;
  right: -10px;
  bottom: 0;
  background: #E48700;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid #fff;
}
.modal-avatar-camera {
  font-size: 1.1rem;
  color: #fff;
}
.modal-form {
  margin-top: 70px;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding: 0 2.2rem;
}
.modal-form input,
.modal-form textarea {
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.8rem 1rem;
  font-size: 1.05rem;
  background: #f9f9f9;
  color: #222;
  resize: none;
}
.modal-form textarea {
  min-height: 70px;
  max-height: 180px;
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
  .modal-profile-edit {
    max-width: 99vw;
    padding: 0 0 1.2rem 0;
  }
  .modal-header {
    padding: 1.1rem 1rem 0.7rem 2.2rem;
  }
  .modal-form {
    padding: 0 1rem;
  }
  .modal-avatar-block {
    left: 1rem;
    top: 100px;
  }
}
</style>
