<template>
  <div class="carte-page">
    <div class="carte-header-fixed">
      <div class="carte-header-inner">
        <div class="carte-logo-bar" @click="$router.push('/')" style="cursor:pointer">
          <img
            src="@/assets/images/SkillSwap Logo.png"
            alt="SkillSwap"
            class="carte-logo"
          />
          <span class="carte-brand">SkillSwap</span>
        </div>
        <SearchBar class="carte-search" />
      </div>
    </div>
    <div class="carte-content">
      <div class="carte-list">
        <button class="btn-retour" @click="$router.push('/')">
          ← Retour à l'accueil
        </button>        <PostCard
          v-for="(post, i) in posts"
          :key="i"
          :name="post.name"
          :address="post.address"
          :avatar="post.avatar"
          :rate="post.rate"
          :likes="post.likes"
          :views="post.views"
          :online="post.online"
          :paid="post.paid"
          :description="post.description"
          :createdAt="post.createdAt"
          :postId="post.postId"
          :likedByMe="post.likedByMe"
          :commentsCount="post.commentsCount || 0"
          :profileToken="post.profileToken || ''"
          :userId="post.userId"
          @like="likePost"
          @dislike="dislikePost"
          @addressClicked="centerMapOnAddress"
          @comment-posted="refreshPosts"
          @post-updated="handlePostUpdated"
          @post-deleted="handlePostDeleted"
        />
      </div>
      <div class="carte-map">
        <iframe
          width="100%"
          height="100%"
          frameborder="0"
          style="border:0;border-radius:18px;"
          :src="mapUrl"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script>
import PostCard from './PostCard.vue'
import SearchBar from './SearchBar.vue'
import api from '../services/api'
import toast from '../services/toast'
import NotificationService from '../services/notificationService'

export default {
  name: 'Carte',
  components: { PostCard, SearchBar },
  data() {
    return {
      posts: [],
      mapUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=2.3775%2C48.8495%2C2.3865%2C48.8535&layer=mapnik'
    }
  },
  async mounted() {
    // Si une adresse est passée en query, centrer la carte dessus
    const address = this.$route?.query?.address;
    if (address) {
      this.centerMapOnAddress(address);
    }
    try {
      const res = await api.get('/skills')
      // Adapter les données pour PostCard
      const postsWithComments = await Promise.all(res.data.map(async skill => {        try {
          const commentsRes = await api.get(`/skills/${skill.id}/comments`);            const commentsCount = Array.isArray(commentsRes.data) ? commentsRes.data.length : 0;
          return {
            name: skill.User?.username || 'Utilisateur inconnu',
            address: skill.location || '',
            avatar: skill.User?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(skill.User?.username || 'User')}&background=ECBC76&color=fff&size=64&bold=true`,
            rate: skill.pricePerHour ? skill.pricePerHour + ' €/h' : '',
            likes: skill.likes || 0,
            views: skill.views || 0,
            online: skill.User?.online || false,
            paid: !!skill.pricePerHour,
            description: skill.description,
            createdAt: skill.createdAt || '',
            postId: skill.id,
            likedByMe: skill.likedByMe || false,
            commentsCount,
            profileToken: skill.User?.profileToken || '',
            userId: skill.userId
          };        } catch {
          return {
            name: skill.User?.username || 'Utilisateur inconnu',
            address: skill.location || '',
            avatar: skill.User?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(skill.User?.username || 'User')}&background=ECBC76&color=fff&size=64&bold=true`,
            rate: skill.pricePerHour ? skill.pricePerHour + ' €/h' : '',
            likes: skill.likes || 0,
            views: skill.views || 0,
            online: skill.User?.online || false,
            paid: !!skill.pricePerHour,
            description: skill.description,
            createdAt: skill.createdAt || '',
            postId: skill.id,
            likedByMe: skill.likedByMe || false,
            commentsCount: 0,
            profileToken: skill.User?.profileToken || '',
            userId: skill.userId
          };
        }
      }))
      this.posts = postsWithComments
    } catch (e) {
      // Optionnel : gestion d'erreur
      this.posts = []
    }
  },
  methods: {    async likePost(postId) {
      try {
        const idx = this.posts.findIndex(p => p.postId === postId)
        if (idx !== -1 && !this.posts[idx].likedByMe) {
          this.posts[idx].likes++
          this.posts[idx].likedByMe = true
        }
        const response = await api.post(`/likes/${postId}/like`)
        if (response.data.message) {
          toast.success(response.data.message);
        }
        
        // Déclencher une vérification des notifications
        NotificationService.triggerNotificationCheck();
        
        // Optionnel : rafraîchir les posts pour synchro
        // await this.fetchPosts()
      } catch (e) {
        toast.error('Erreur lors du like');
        // Optionnel : gestion d'erreur
      }
    },    async dislikePost(postId) {
      try {
        const idx = this.posts.findIndex(p => p.postId === postId)
        if (idx !== -1 && this.posts[idx].likedByMe) {
          this.posts[idx].likes = Math.max(0, this.posts[idx].likes - 1)
          this.posts[idx].likedByMe = false
        }
        const response = await api.delete(`/likes/${postId}/unlike`)
        if (response.data.message) {
          toast.success(response.data.message);
        }
        
        // Déclencher une vérification des notifications
        NotificationService.triggerNotificationCheck();
        
        // Optionnel : rafraîchir les posts pour synchro
        // await this.fetchPosts()
      } catch (e) {
        toast.error('Erreur lors du dislike');
        // Optionnel : gestion d'erreur
      }
    },
    async refreshPosts() {
      try {
        const res = await api.get('/skills')
        const postsWithComments = await Promise.all(res.data.map(async skill => {
          try {
            const commentsRes = await api.get(`/skills/${skill.id}/comments`);
            const commentsCount = Array.isArray(commentsRes.data) ? commentsRes.data.length : 0;            return {
              name: skill.User?.username || 'Utilisateur inconnu',
              address: skill.location || '',
              avatar: skill.User?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(skill.User?.username || 'User')}&background=ECBC76&color=fff&size=64&bold=true`,
              rate: skill.pricePerHour ? skill.pricePerHour + ' €/h' : '',
              likes: skill.likes || 0,
              views: skill.views || 0,
              online: skill.User?.online || false,
              paid: !!skill.pricePerHour,
              description: skill.description,
              createdAt: skill.createdAt || '',
              postId: skill.id,
              likedByMe: skill.likedByMe || false,
              commentsCount,
              profileToken: skill.User?.profileToken || '',
              userId: skill.userId
            };          } catch {            return {
              name: skill.User?.username || 'Utilisateur inconnu',
              address: skill.location || '',
              avatar: skill.User?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(skill.User?.username || 'User')}&background=ECBC76&color=fff&size=64&bold=true`,
              rate: skill.pricePerHour ? skill.pricePerHour + ' €/h' : '',
              likes: skill.likes || 0,
              views: skill.views || 0,
              online: skill.User?.online || false,
              paid: !!skill.pricePerHour,
              description: skill.description,
              createdAt: skill.createdAt || '',
              postId: skill.id,
              likedByMe: skill.likedByMe || false,
              commentsCount: 0,
              profileToken: skill.User?.profileToken || '',
              userId: skill.userId
            };
          }
        }))
        this.posts = postsWithComments
      } catch (e) {
        this.posts = []
      }
    },
    centerMapOnAddress(address) {
      // Utilise l'API de géocodage pour trouver la position de la ville/adresse
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            const { lat, lon } = data[0];
            // Correction : s'assurer que lon et lat sont bien des nombres
            const latNum = parseFloat(lat);
            const lonNum = parseFloat(lon);
            // Correction du calcul du bbox (évite NaN)
            const bbox = `${lonNum-0.01}%2C${latNum-0.01}%2C${lonNum+0.01}%2C${latNum+0.01}`;
            this.mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latNum},${lonNum}`;
          }
        })
        .catch(() => {          // En cas d'erreur, ne change rien
        });
    },
    
    // === GESTION DES MISES À JOUR DE POSTS ===
    handlePostUpdated(updatedPost) {
      // Mise à jour instantanée du post dans la liste
      const postIndex = this.posts.findIndex(p => p.postId === updatedPost.postId);
      if (postIndex !== -1) {
        this.posts[postIndex].description = updatedPost.description;
        // Forcer la réactivité
        this.$forceUpdate();
      }
    },
    
    handlePostDeleted(postId) {
      // Suppression instantanée du post de la liste
      this.posts = this.posts.filter(p => p.postId !== postId);
    },
  },
}
</script>

<style scoped>
.carte-header-fixed {
  width: 100vw;
  display: flex;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  background: #fefcf6;
  box-shadow: 0 2px 16px #0001;
  padding-top: 24px;
  padding-bottom: 18px;
}
.carte-header-inner {
  width: 1200px;
  max-width: 98vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}
.carte-logo-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}
.carte-logo {
  width: 48px;
  height: 48px;
}
.carte-brand {
  font-family: 'Feather', 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 1.3rem;
  color: #C6553B;
  letter-spacing: 1px;
}
.carte-search {
  flex: 1;
  max-width: 500px;
}
.carte-page {
  width: 100vw;
  min-height: 100vh;
  background: #fefcf6;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 110px;
}
.carte-content {
  display: flex;
  flex-direction: row;
  width: 100vw;
  height: calc(100vh - 110px);
  position: fixed;
  top: 110px;
  left: 0;
}
.carte-list {
  width: 600px;
  background: #fff4e3;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  overflow-y: auto;
  height: 100%;
  border-right: 2px solid #eee;
}
.carte-map {
  flex: 1;
  height: 100%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-retour {
  background: #fff;
  color: #C6553B;
  border: 1.5px solid #ECBC76;
  border-radius: 10px;
  padding: 10px 22px;
  font-size: 1.08rem;
  font-weight: 500;
  margin-bottom: 18px;
  cursor: pointer;
  box-shadow: 0 2px 8px #0001;
  transition: background 0.18s, color 0.18s;
  width: 100%;
}
.btn-retour:hover {
  background: #ECBC76;
  color: #fff;
}
@media (max-width: 1100px) {
  .carte-content {
    flex-direction: column;
    height: auto;
    position: relative;
    top: 0;
  }
  .carte-list {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 2px solid #eee;
  }
  .carte-map {
    height: 400px;
  }
}
@media (max-width: 700px) {
  .carte-list {
    padding: 15px;
  }
  .carte-map {
    height: 300px;
  }
}
</style>
