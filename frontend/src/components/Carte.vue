<template>
  <div class="carte-page">
    <!-- Background animé -->
    <BackgroundManager />
    
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
        
        
        <button 
          class="mobile-toggle-btn-header" 
          @click="toggleMobileList"
          :class="{ active: showMobileList }"
          title="Afficher/masquer les posts"
        >
          <span class="toggle-icon">{{ showMobileList ? '✕' : '☰' }}</span>
        </button>
      </div>
    </div>    <div class="carte-content">
      <div class="carte-list" :class="{ 'mobile-hidden': !showMobileList }">
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
      </div>      <div class="carte-map">
        <iframe
          width="100%"
          height="100%"
          frameborder="0"
          style="border:0;"
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
import BackgroundManager from './BackgroundManager.vue'
import api from '../services/api'
import toast from '../services/toast'
import NotificationService from '../services/notificationService'
import socketService from '../services/socket'

export default {
  name: 'Carte',
  components: { PostCard, SearchBar, BackgroundManager },data() {
    return {
      posts: [],
      mapUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=2.3775%2C48.8495%2C2.3865%2C48.8535&layer=mapnik',
      showMobileList: false
    }
  },  async mounted() {

    await this.initializeSocketConnection();

    const address = this.$route?.query?.address;
    if (address) {
      this.centerMapOnAddress(address);
    }
    try {
      const res = await api.get('/skills')

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

        NotificationService.triggerNotificationCheck();


      } catch (e) {
        toast.error('Erreur lors du like');

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

        NotificationService.triggerNotificationCheck();


      } catch (e) {
        toast.error('Erreur lors du dislike');

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

      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            const { lat, lon } = data[0];

            const latNum = parseFloat(lat);
            const lonNum = parseFloat(lon);

            const bbox = `${lonNum-0.01}%2C${latNum-0.01}%2C${lonNum+0.01}%2C${latNum+0.01}`;
            this.mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latNum},${lonNum}`;
          }
        })
        .catch(() => {          // En cas d'erreur, ne change rien
        });
    },

    handlePostUpdated(updatedPost) {

      const postIndex = this.posts.findIndex(p => p.postId === updatedPost.postId);
      if (postIndex !== -1) {
        this.posts[postIndex].description = updatedPost.description;

        this.$forceUpdate();
      }
    },
      handlePostDeleted(postId) {

      this.posts = this.posts.filter(p => p.postId !== postId);
    },

    toggleMobileList() {
      this.showMobileList = !this.showMobileList;
    },

    async initializeSocketConnection() {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        if (!socketService.isConnected()) {
          await socketService.connect(token);
        }

        setTimeout(() => {
          socketService.getOnlineUsers();
        }, 1000);
        
      } catch (error) {
        console.error('Erreur lors de l\'initialisation WebSocket dans Carte:', error);
      }
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
  z-index: 100;
  background: #fefcf6;
  box-shadow: 0 2px 16px #0001;
  padding-top: 12px;
  padding-bottom: 12px;
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
  max-width: 700px;
}
.carte-page {
  width: 100vw;
  /* min-height: 100vh; */
  background: #fefcf6;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 130px;
  position: relative;
}
.carte-content {
  display: flex;
  flex-direction: row;
  width: 100vw;
  height: calc(100vh - 130px);
  position: fixed;
  top: 130px;
  left: 0;
}
.carte-list {
  width: 600px;
  background: transparent;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  overflow-y: auto;
  height: 100%;
  border-right: none;
}
.carte-map {
  flex: 1;
  height: 100%;
  background: #f5f5f5;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  padding: 0;
}


.mobile-toggle-btn-header {
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #C6553B;
  border: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 15px;
  flex-shrink: 0;
}

.mobile-toggle-btn-header:hover {
  background: #A64530;
  transform: scale(1.05);
}

.mobile-toggle-btn-header.active {
  background: #28303F;
}

.mobile-toggle-btn-header .toggle-icon {
  color: white;
  font-size: 16px;
  font-weight: bold;
}


.mobile-toggle-btn {
  display: none !important;
}
.btn-retour {
  background: #fff;
  color: #C6553B;
  border: 1.5px solid #ECBC76;
  border-radius: 10px;
  padding: 10px 22px;
  font-size: 1.08rem;
  font-weight: 500;
  margin-top: 15px;
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






@media (max-width: 1199px) {
  .carte-header-inner {
    width: 100%;
    padding: 0 20px;
    gap: 20px;
  }
  
  .carte-list {
    width: 500px;
  }
}


@media (max-width: 1023px) {
  * {
    box-sizing: border-box;
  }
  
  html, body {
    overflow-x: hidden !important;
    max-width: 100vw !important;
  }
  
  .carte-page {
    overflow-x: hidden !important;
    width: 100vw !important;
    max-width: 100vw !important;
  }
  
  .carte-header-fixed {
    width: 100vw !important;
    max-width: 100vw !important;
    overflow-x: hidden !important;
  }
  
  .mobile-toggle-btn-header {
    display: flex;
  }
  
  .carte-content {
    flex-direction: column;
    height: auto;
    position: relative;
    top: 0;
  }
  
  .carte-page {
    padding-top: 0;
  }
    .carte-list {
    position: fixed;
    top: 140px;
    left: 0;
    width: 100vw;
    height: calc(100vh - 140px);
    z-index: 15;
    background: #fff4e3;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    border-right: none;
    border-bottom: none;
    overflow-y: auto;
  }
  
  .carte-list:not(.mobile-hidden) {
    transform: translateX(0);
  }
  
  .carte-map {
    width: 100vw;
    height: calc(100vh - 140px);
    position: fixed;
    top: 140px;
    left: 0;
  }
}


@media (max-width: 767px) {
  * {
    box-sizing: border-box;
  }
  
  html, body {
    overflow-x: hidden !important;
    max-width: 100vw !important;
  }
  
  .carte-page {
    overflow-x: hidden !important;
    width: 100vw !important;
    max-width: 100vw !important;
  }
  
  .carte-header-fixed {
    width: 100vw !important;
    max-width: 100vw !important;
    overflow-x: hidden !important;
  }
  
  .mobile-toggle-btn-header {
    width: 32px;
    height: 32px;
    margin-left: 10px;
    flex-shrink: 0;
  }
  
  .mobile-toggle-btn-header .toggle-icon {
    font-size: 12px;
  }
  
  .carte-header-fixed {
    padding-top: 15px;
    padding-bottom: 15px;
  }
  
  .carte-header-inner {
    gap: 10px;
    padding: 0 15px;
    max-width: 100vw !important;
    overflow-x: hidden !important;
    box-sizing: border-box !important;
  }
  
  .carte-logo {
    width: 40px;
    height: 40px;
  }
  
  .carte-brand {
    font-size: 1.1rem;
    flex-shrink: 0;
  }
  
  .carte-search {
    max-width: none !important;
    flex: 1 !important;
    min-width: 0 !important;
    width: auto !important;
  }
  
  .carte-search >>> .search-bar {
    height: 50px !important;
    padding: 12px 15px !important;
    border-radius: 12px !important;
    background: rgba(255, 255, 255, 0.95) !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
  }
  
  .carte-search >>> .search-icon {
    display: none !important;
  }
  
  .carte-search >>> .search-submit-btn {
    display: none !important;
  }
  
  .carte-search >>> .search-input-wrapper {
    padding: 0 !important;
    width: 100% !important;
    display: flex !important;
    align-items: center !important;
  }
  
  .carte-search >>> .search-input-wrapper input {
    height: 42px !important;
    padding: 12px 18px !important;
    font-size: 1rem !important;
    width: 100% !important;
    box-sizing: border-box !important;
    border-radius: 10px !important;
    border: 2px solid #ECBC76 !important;
  }
    .carte-list {
    top: 110px;
    height: calc(100vh - 110px);
    padding: 15px;
  }
  
  .carte-map {
    top: 110px;
    height: calc(100vh - 110px);
  }
  
  .btn-retour {
    font-size: 1rem;
    padding: 8px 18px;
    margin-top: 10px;
    margin-bottom: 15px;
  }
}


@media (max-width: 575px) {
  * {
    box-sizing: border-box;
  }
  
  html, body {
    overflow-x: hidden !important;
    max-width: 100vw !important;
  }
  
  .carte-page {
    overflow-x: hidden !important;
    width: 100vw !important;
    max-width: 100vw !important;
  }
  
  .carte-header-fixed {
    width: 100vw !important;
    max-width: 100vw !important;
    overflow-x: hidden !important;
  }
  
  .carte-header-inner {
    flex-direction: row;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    max-width: 100vw !important;
    overflow-x: hidden !important;
    box-sizing: border-box !important;
    padding: 0 12px !important;
  }
  
  .carte-logo-bar {
    justify-content: flex-start;
    position: static;
    flex-shrink: 0;
  }
  
  .mobile-toggle-btn-header {
    position: static;
    width: 32px;
    height: 32px;
    margin: 0;
    border-radius: 6px;
    transform: none;
    flex-shrink: 0;
  }
  
  .mobile-toggle-btn-header .toggle-icon {
    font-size: 12px;
  }
  
  .carte-search {
    width: 100% !important;
    margin-top: 12px;
    order: 3;
    flex-basis: 100% !important;
    min-width: 0 !important;
  }
  
  .carte-search >>> .search-bar {
    height: 48px !important;
    padding: 14px 18px !important;
    border-radius: 14px !important;
    background: rgba(255, 255, 255, 0.98) !important;
    box-shadow: 0 3px 12px rgba(0,0,0,0.15) !important;
  }
  
  .carte-search >>> .search-icon {
    display: none !important;
  }
  
  .carte-search >>> .search-submit-btn {
    display: none !important;
  }
  
  .carte-search >>> .search-input-wrapper {
    padding: 0 !important;
    width: 100% !important;
    display: flex !important;
    align-items: center !important;
  }
  
  .carte-search >>> .search-input-wrapper input {
    height: 40px !important;
    padding: 14px 20px !important;
    font-size: 0.95rem !important;
    width: 100% !important;
    box-sizing: border-box !important;
    border-radius: 12px !important;
    border: 2px solid #ECBC76 !important;
  }
  
  .carte-header-inner {
    flex-wrap: wrap;
  }
    .carte-list {
    top: 160px;
    height: calc(100vh - 160px);
    padding: 12px;
  }
  
  .carte-map {
    top: 160px;
    height: calc(100vh - 160px);
  }
  
  .btn-retour {
    font-size: 0.95rem;
    padding: 8px 15px;
    margin-top: 8px;
    margin-bottom: 12px;
  }
}


@media (max-width: 400px) {
  * {
    box-sizing: border-box;
  }
  
  html, body {
    overflow-x: hidden !important;
    max-width: 100vw !important;
  }
  
  .carte-page {
    overflow-x: hidden !important;
    width: 100vw !important;
    max-width: 100vw !important;
  }
  
  .carte-header-fixed {
    width: 100vw !important;
    max-width: 100vw !important;
    overflow-x: hidden !important;
  }
  
  .mobile-toggle-btn-header {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    flex-shrink: 0;
  }
  
  .mobile-toggle-btn-header .toggle-icon {
    font-size: 10px;
  }
  
  .carte-header-fixed {
    padding-top: 10px;
    padding-bottom: 10px;
  }
  
  .carte-header-inner {
    padding: 0 8px !important;
    max-width: 100vw !important;
    overflow-x: hidden !important;
    box-sizing: border-box !important;
  }
  
  .carte-logo {
    width: 36px;
    height: 36px;
  }
  
  .carte-brand {
    font-size: 1rem;
    flex-shrink: 0;
  }
  
  .carte-search >>> .search-bar {
    height: 44px !important;
    margin-top: 10px;
    padding: 12px 16px !important;
    border-radius: 12px !important;
    background: rgba(255, 255, 255, 0.98) !important;
    box-shadow: 0 2px 10px rgba(0,0,0,0.12) !important;
  }
  
  .carte-search >>> .search-icon {
    display: none !important;
  }
  
  .carte-search >>> .search-submit-btn {
    display: none !important;
  }
  
  .carte-search >>> .search-input-wrapper {
    padding: 0 !important;
    width: 100% !important;
    display: flex !important;
    align-items: center !important;
  }
  
  .carte-search >>> .search-input-wrapper input {
    height: 36px !important;
    padding: 12px 16px !important;
    font-size: 0.9rem !important;
    width: 100% !important;
    box-sizing: border-box !important;
    border-radius: 10px !important;
    border: 2px solid #ECBC76 !important;
  }
    .carte-list {
    top: 140px;
    height: calc(100vh - 140px);
    padding: 10px;
  }
  
  .carte-map {
    top: 140px;
    height: calc(100vh - 140px);
  }
  
  .btn-retour {
    font-size: 0.9rem;
    padding: 6px 12px;
    margin-top: 5px;
    margin-bottom: 10px;
  }
}
</style>

