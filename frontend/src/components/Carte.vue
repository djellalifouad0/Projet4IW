<template>
  <div class="carte-page">    <div class="carte-header-fixed">
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
        
        <!-- Bouton toggle mobile dans le header -->
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
        </button><PostCard
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
import api from '../services/api'
import toast from '../services/toast'
import NotificationService from '../services/notificationService'

export default {
  name: 'Carte',
  components: { PostCard, SearchBar },  data() {
    return {
      posts: [],
      mapUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=2.3775%2C48.8495%2C2.3865%2C48.8535&layer=mapnik',
      showMobileList: false
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
    
    // === GESTION DU TOGGLE MOBILE ===
    toggleMobileList() {
      this.showMobileList = !this.showMobileList;
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
  background: var(--bg-primary);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
  padding-top: 20px;
  padding-bottom: 20px;
  transition: background 0.3s ease, box-shadow 0.3s ease;
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
  transition: filter 0.3s ease;
}
.carte-brand {
  font-family: 'Feather', 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 1.3rem;
  color: var(--accent-primary);
  letter-spacing: 1px;
  transition: color 0.3s ease;
}
.carte-search {
  flex: 1;
  max-width: 500px;
}
.carte-page {
  width: 100vw;
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 120px;
  transition: background 0.3s ease;
}
.carte-content {
  display: flex;
  flex-direction: row;
  width: 100vw;
  height: calc(100vh - 120px);
  position: fixed;
  top: 120px;
  left: 0;
}
.carte-list {
  width: 600px;
  background: var(--card-bg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  overflow-y: auto;
  height: 100%;
  border-right: none;
  transition: background 0.3s ease;
}
.carte-map {
  flex: 1;
  height: 100%;
  background: var(--bg-secondary);
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  padding: 0;
  transition: background 0.3s ease;
}

/* === BOUTON TOGGLE MOBILE DANS LE HEADER === */
.mobile-toggle-btn-header {
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--accent-primary);
  border: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 15px;
  flex-shrink: 0;
}

.mobile-toggle-btn-header:hover {
  background: var(--accent-secondary);
  transform: scale(1.05);
}

.mobile-toggle-btn-header.active {
  background: var(--text-primary);
}

.mobile-toggle-btn-header .toggle-icon {
  color: var(--bg-primary);
  font-size: 16px;
  font-weight: bold;
}

/* Ancien bouton mobile - maintenant caché */
.mobile-toggle-btn {
  display: none !important;
}
.btn-retour {
  background: var(--bg-secondary);
  color: var(--accent-secondary);
  border: 1.5px solid var(--accent-primary);
  border-radius: 10px;
  padding: 10px 22px;
  font-size: 1.08rem;
  font-weight: 500;
  margin-top: 15px;
  margin-bottom: 18px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: background 0.18s, color 0.18s, border 0.3s ease;
  width: 100%;
}
.btn-retour:hover {
  background: var(--accent-primary);
  color: var(--text-primary);
}

/* === RESPONSIVE DESIGN === */

/* Large screens et desktop (1200px+) - Default styles above */

/* Tablets et écrans moyens (768px - 1199px) */
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

/* Tablettes en portrait et petits écrans (768px - 1023px) */
@media (max-width: 1023px) {
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
    background: var(--card-bg);
    transform: translateX(-100%);
    transition: transform 0.3s ease, background 0.3s ease;
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

/* Smartphones en paysage et petites tablettes (576px - 767px) */
@media (max-width: 767px) {
  .mobile-toggle-btn-header {
    width: 36px;
    height: 36px;
    margin-left: 10px;
  }
  
  .mobile-toggle-btn-header .toggle-icon {
    font-size: 14px;
  }
  
  .carte-header-fixed {
    padding-top: 15px;
    padding-bottom: 15px;
  }
  
  .carte-header-inner {
    gap: 15px;
    padding: 0 15px;
  }
  
  .carte-logo {
    width: 40px;
    height: 40px;
  }
  
  .carte-brand {
    font-size: 1.1rem;
  }
  
  .carte-search {
    max-width: none;
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

/* Smartphones en portrait (jusqu'à 575px) */
@media (max-width: 575px) {
  .carte-header-inner {
    flex-direction: row;
    gap: 15px;
    align-items: center;
    justify-content: space-between;
  }
  
  .carte-logo-bar {
    justify-content: flex-start;
    position: static;
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
    width: 100%;
    margin-top: 10px;
    order: 3;
    flex-basis: 100%;
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

/* Très petits écrans (jusqu'à 400px) */
@media (max-width: 400px) {
  .mobile-toggle-btn-header {
    width: 28px;
    height: 28px;
    border-radius: 4px;
  }
  
  .mobile-toggle-btn-header .toggle-icon {
    font-size: 10px;
  }
  
  .carte-header-fixed {
    padding-top: 10px;
    padding-bottom: 10px;
  }
  
  .carte-header-inner {
    padding: 0 10px;
  }
  
  .carte-logo {
    width: 36px;
    height: 36px;
  }
  
  .carte-brand {
    font-size: 1rem;
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
    margin-bottom: 10px;  }
}

/* Dark mode icon filter for logo */
@media (prefers-color-scheme: dark) {
  .carte-logo {
    filter: var(--icon-filter, brightness(0) invert(1));
  }
}
</style>
