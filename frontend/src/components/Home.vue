<template>
  <div class="home-content">    <div class="filters-bar">
      <div class="filter-dropdown-wrapper">
        <button class="filter-btn" @click="toggleFilterMenu">Filtrer par <span>▼</span></button>
        <div v-if="showFilterMenu" class="filter-dropdown-overlay" @click="showFilterMenu = false"></div>
        <div v-if="showFilterMenu" class="filter-dropdown">
          <button @click="setSort('recent')">Plus récent</button>
          <button @click="setSort('ancien')">Plus ancien</button>
          <button @click="setSort('proche')">Plus proche</button>
          <button @click="setSort('loin')">Plus loin</button>
          <button @click="setSort('plusCher')">Plus cher</button>
          <button @click="setSort('moinsCher')">Moins cher</button>
        </div>
      </div>
      <button class="publish-btn" @click="handlePublishClick">+ Publier</button>
    </div>

    <div v-if="likeError" class="error-message" style="margin-bottom: 10px;">{{ likeError }}</div>

    
    <div v-if="searchQuery" class="search-indicator">
      <div class="search-info">
        <span class="search-text">Résultats pour : "<strong>{{ searchQuery }}</strong>"</span>
        <span class="search-count">({{ posts.length }} résultat{{ posts.length !== 1 ? 's' : '' }})</span>
      </div>
      <button @click="clearSearch" class="clear-search-btn" title="Effacer la recherche">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div class="cards">      <PostCard
        v-for="post in posts"
        :key="post.id"
        :name="post.User?.username || ''"
        :address="post.location || ''"
        :avatar="post.User?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.User?.username || 'User')}&background=ECBC76&color=fff&size=64&bold=true`"
        :rate="post.pricePerHour ? post.pricePerHour + '€/h' : ''"
        :likes="post.likes || 0"
        :views="post.views || 0"
        :paid="!!post.pricePerHour"
        :description="post.description"
        :createdAt="post.createdAt || ''"
        :postId="post.id"
        :likedByMe="post.likedByMe"
        :commentsCount="post.commentsCount || 0"
        :profileToken="post.User?.profileToken || ''"
        :userId="post.userId"
        @like="likePost"
        @dislike="dislikePost"
        @addressClicked="handleAddressClick"
        @comment-posted="fetchPosts"
        @post-updated="handlePostUpdated"
        @post-deleted="handlePostDeleted"
      />
    </div>

    
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal-card" @click.stop>        <div class="modal-header">
          <img src="../assets/icons/edit.svg" class="modal-icon-svg" alt="Edit">
          <h2>Publier un service</h2>
        </div>
        <div class="modal-separator"></div>
        <form @submit.prevent="handlePublish">
          <textarea v-model="form.description" placeholder="Description" required></textarea>
          <div style="position: relative;">
            <input
              v-model="form.location"
              type="text"
              placeholder="Ville (auto-complétion)"
              @input="searchCities"
              @focus="showCitySuggestions = true"
              @blur="hideCitySuggestions"
              autocomplete="off"
            />
            <ul v-if="showCitySuggestions && citySuggestions.length" class="city-suggestions">
              <li v-for="city in citySuggestions" :key="city.code" @mousedown.prevent="selectCity(city)">
                {{ city.nom }} <span v-if="city.codesPostaux && city.codesPostaux.length">({{ city.codesPostaux[0] }})</span>
              </li>
            </ul>
          </div>
          <input v-model.number="form.pricePerHour" type="number" min="0" step="1" placeholder="Tarif horaire (€) (optionnel)" />
          <div class="modal-actions">
            <button type="submit">Publier</button>
            <button type="button" @click="showForm = false">Annuler</button>
          </div>
        </form>
        <div v-if="publishError" class="error-message">{{ publishError }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import PostCard from './PostCard.vue'
import api from '../services/api'
import toast from '../services/toast'
import NotificationService from '../services/notificationService'
import socketService from '../services/socket'

export default {
  name: 'Home',
  components: { PostCard },
  inject: ['matomo'], // Injecter le service Matomo
  
  data() {
    return {
      posts: [],
      allPosts: [], // Tous les posts pour la recherche
      showForm: false,
      form: {
        description: '',
        location: '',
        pricePerHour: null
      },
      publishError: '', // Erreur pour la publication
      likeError: '',     // Erreur pour les likes
      citySuggestions: [],
      showCitySuggestions: false,
      citySearchTimeout: null,
      showFilterMenu: false,
      sortBy: 'recent',
      userPosition: null,
      searchQuery: '', // Terme de recherche actuel
      pageStartTime: null // Pour tracker le temps passé sur la page
    }
  },
  
  async mounted() {

    this.pageStartTime = Date.now();
    if (window._paq) {
      window._paq.push(['trackPageView', 'Homepage']);
    }
   // this.matomo.startPageTimer();

    await this.initializeSocketConnection();

    this.searchQuery = this.$route.query.search || '';
    
    navigator.geolocation.getCurrentPosition((pos) => {
      this.userPosition = {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude
      };
      this.fetchPosts();
    }, () => {
      this.fetchPosts();
    });

    document.addEventListener('click', this.handleClickOutside);
  },

  watch: {
    '$route.query.search': {
      handler(newSearchQuery) {
        this.searchQuery = newSearchQuery || '';
        this.applySearch();
        this.sortPosts();
      },
      immediate: false
    }
  },
  
  beforeDestroy() {

    if (this.pageStartTime) {
      const timeSpent = Date.now() - this.pageStartTime;
      this.matomo.trackEvent('Homepage', 'Time Spent', 'Session Duration', Math.round(timeSpent / 1000));
    }
    this.matomo.endPageTimer('Homepage');
    document.removeEventListener('click', this.handleClickOutside);
  },
  
  methods: {
    toggleFilterMenu() {
      this.showFilterMenu = !this.showFilterMenu;
    },
    setSort(type) {
      this.sortBy = type;
      this.showFilterMenu = false;

      this.matomo.trackFilterClick('Sort', type);
      this.sortPosts();
    },    async fetchPosts() {
      try {
        const res = await api.get('/skills');

        const postsWithComments = await Promise.all(res.data.map(async post => {

          try {
            const commentsRes = await api.get(`/skills/${post.id}/comments`);

            const commentsCount = Array.isArray(commentsRes.data) ? commentsRes.data.length : 0;
            return { ...post, commentsCount };
          } catch {
            return { ...post, commentsCount: 0 };
          }
        }));

        this.allPosts = postsWithComments;

        this.applySearch();
        
        await this.sortPosts();
      } catch (e) {
        this.publishError = "Erreur lors du chargement des posts.";
      }
    },
    applySearch() {
      if (!this.searchQuery.trim()) {

        this.posts = [...this.allPosts];
        return;
      }

      const query = this.searchQuery.toLowerCase().trim();

      this.posts = this.allPosts.filter(post => {
        const description = (post.description || '').toLowerCase();
        const location = (post.location || '').toLowerCase();
        const username = (post.User?.username || '').toLowerCase();
        
        return description.includes(query) || 
               location.includes(query) || 
               username.includes(query);
      });
    },
    async sortPosts() {
      if (this.sortBy === 'recent') {
        this.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (this.sortBy === 'ancien') {
        this.posts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      } else if ((this.sortBy === 'proche' || this.sortBy === 'loin') && this.userPosition) {
        for (const post of this.posts) {
          post.distance = null;
          if (post.location) {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(post.location)}`);
            const geoData = await geoRes.json();
            if (geoData && geoData.length > 0) {
              const lat = parseFloat(geoData[0].lat);
              const lon = parseFloat(geoData[0].lon);
              const R = 6371;
              const dLat = (lat - this.userPosition.lat) * Math.PI / 180;
              const dLon = (lon - this.userPosition.lon) * Math.PI / 180;
              const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                        Math.cos(this.userPosition.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
                        Math.sin(dLon/2) * Math.sin(dLon/2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              post.distance = R * c;
            }
          }
        }
        this.posts.sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return this.sortBy === 'proche' ? a.distance - b.distance : b.distance - a.distance;
        });
      } else if (this.sortBy === 'plusCher') {
        this.posts.sort((a, b) => (b.pricePerHour || 0) - (a.pricePerHour || 0));
      } else if (this.sortBy === 'moinsCher') {
        this.posts.sort((a, b) => (a.pricePerHour || 0) - (b.pricePerHour || 0));
      }
    },
    async handlePublish() {
      this.publishError = '';
      try {
        await api.post('/skills', {
          description: this.form.description,
          location: this.form.location,
          pricePerHour: this.form.pricePerHour || null
        });
        this.showForm = false;
        this.form = { description: '', location: '', pricePerHour: null };
        await this.fetchPosts();
      } catch (e) {
        this.publishError = e.response?.data?.error || 'Erreur lors de la publication.';
      }
    },    async likePost(postId) {
      this.likeError = '';
      try {
        const idx = this.posts.findIndex(p => p.id === postId);
        if (idx !== -1 && !this.posts[idx].likedByMe) {
          this.posts[idx].likes++;
          this.posts[idx].likedByMe = true;
        }
        const response = await api.post(`/likes/${postId}/like`);
        if (response.data.message) {
          toast.success(response.data.message);
        }

        NotificationService.triggerNotificationCheck();
        
        await this.fetchPosts();
      } catch (e) {
        this.likeError = 'Erreur lors du like.';
        toast.error('Erreur lors du like');
      }
    },    async dislikePost(postId) {
      this.likeError = '';
      try {
        const idx = this.posts.findIndex(p => p.id === postId);
        if (idx !== -1 && this.posts[idx].likedByMe) {
          this.posts[idx].likes = Math.max(0, this.posts[idx].likes - 1);
          this.posts[idx].likedByMe = false;
        }
        const response = await api.delete(`/likes/${postId}/unlike`);
        if (response.data.message) {
          toast.success(response.data.message);
        }

        NotificationService.triggerNotificationCheck();
        
        await this.fetchPosts();
      } catch (e) {
        this.likeError = 'Erreur lors du dislike.';
        toast.error('Erreur lors du dislike');
      }
    },
    async searchCities() {
      clearTimeout(this.citySearchTimeout);
      const query = this.form.location.trim();
      if (!query) {
        this.citySuggestions = [];
        return;
      }
      this.citySearchTimeout = setTimeout(async () => {
        try {
          const res = await fetch(`https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}&fields=nom,codesPostaux,code&boost=population&limit=5`);
          const data = await res.json();
          this.citySuggestions = data;
        } catch {
          this.citySuggestions = [];
        }
      }, 250);
    },
    selectCity(city) {
      this.form.location = city.nom + (city.codesPostaux && city.codesPostaux.length ? ` (${city.codesPostaux[0]})` : '');
      this.citySuggestions = [];
      this.showCitySuggestions = false;
    },    hideCitySuggestions() {
      setTimeout(() => { this.showCitySuggestions = false; }, 120);
    },
    
    handleAddressClick(address) {

      this.$router.push(`/carte?address=${encodeURIComponent(address)}`);
    },

    handlePostUpdated(updatedPost) {

      const postIndex = this.posts.findIndex(p => p.id === updatedPost.postId);
      if (postIndex !== -1) {
        this.posts[postIndex].description = updatedPost.description;

        this.$forceUpdate();
      }
    },
      handlePostDeleted(postId) {

      this.posts = this.posts.filter(p => p.id !== postId);
    },

    handleClickOutside(event) {
      const filterWrapper = this.$el?.querySelector('.filter-dropdown-wrapper');
      if (filterWrapper && !filterWrapper.contains(event.target)) {
        this.showFilterMenu = false;
      }
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
        }, 1000); // Délai pour s'assurer que tout est connecté
        
      } catch (error) {
        console.error('Erreur lors de l\'initialisation WebSocket dans Home:', error);
      }
    },
    clearSearch() {

      this.matomo.trackClearSearchClick();

      this.$router.push({ path: '/', query: {} });
    },

    handlePublishClick() {
      this.matomo.trackPostPublishClick();
      this.showForm = true;
    },
  }
}
</script>

<style scoped>
.home-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.2rem 1rem 2.2rem 1rem;
  background: transparent; /* Rendre transparent pour voir le background animé */
  overflow-x: hidden; 
  max-width: 100vw; 
  min-height: 100vh; 
}

.filters-bar {
  display: flex;
  justify-content: space-between;
  width: 700px;
  max-width: 100%;
  margin: 0 auto 40px auto;
  gap: 32px;
  margin-top: 10px;
}
.filters-bar .filter-btn {
  background: #ECBC76;
  color: #111;
  border: none;
  border-radius: 10px;
  padding: 14px 32px;
  font-size: 1.08rem;
  cursor: pointer;
  box-shadow: 0 2px 8px #0001;
  font-weight: 500;
  transition: background 0.18s;
}
.filters-bar .filter-btn span {
  margin-left: 8px;
}
.filters-bar .publish-btn {
  background: #E48700;
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 14px 38px;
  font-size: 1.18rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px #0001;
  transition: background 0.18s;
}

.cards {
  display: flex;
  flex-direction: column;
  gap: 22px;
  align-items: center;
  width: 100%;
  max-width: 700px;
  box-sizing: border-box;
  overflow-x: hidden; 
}
@media (max-width: 900px) {
  .filters-bar,
  .cards {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    padding-left: 2vw;
    padding-right: 2vw;
  }
  .cards {
    gap: 16px;
  }
  .home-content, .cards {
    padding-bottom: 50px; 
  }
}
@media (max-width: 700px) {
  .filters-bar,
  .cards {
    padding-left: 3vw;
    padding-right: 3vw;
  }
  .filters-bar {
    gap: 12px;
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 18px;
  }
  .filters-bar .filter-btn,
  .filters-bar .publish-btn {
    width: 100%;
    padding: 14px 0;
    border-radius: 12px;
    font-size: 1rem;
  }
  .cards {
    gap: 12px;
  }
    
  .filter-dropdown-overlay {
    display: block;
    animation: overlayFadeIn 0.2s ease-out;
  }
  
  .filter-dropdown {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    max-width: 300px;
    z-index: 1001;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    margin-top: 0;
    animation: filterDropdownMobileOpen 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  @keyframes overlayFadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  
  @keyframes filterDropdownMobileOpen {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.9);
    }
    100% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }
}
@media (max-width: 480px) {
  .filters-bar,
  .cards {
    padding-left: 4vw;
    padding-right: 4vw;
  }
  .filters-bar .filter-btn,
  .filters-bar .publish-btn {
    padding: 11px 0;
    font-size: 0.98rem;
    border-radius: 8px;
  }
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-card {
  background: #fffbe6;
  border-radius: 18px;
  padding: 0 2rem 2rem 2rem;
  width: 95%;
  max-width: 440px;
  box-shadow: 0 8px 32px rgba(228, 135, 0, 0.13), 0 2px 8px #0001;
  position: relative;
  animation: modalPop 0.25s cubic-bezier(.4,1.6,.6,1) 1;
}
@keyframes modalPop {
  0% { transform: scale(0.95) translateY(30px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
.modal-header {
  background: #E48700;
  border-radius: 18px 18px 0 0;
  padding: 1.2rem 0 1rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 -2rem;
}
.modal-icon-svg {
  width: 32px;
  height: 32px;
  margin-bottom: 0.2rem;
  filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);
}
.modal-icon {
  font-size: 2.1rem;
  margin-bottom: 0.2rem;
}
.modal-card h2 {
  margin: 0;
  font-size: 1.45rem;
  color: #fff;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-align: center;
}
.modal-separator {
  width: 100%;
  height: 3px;
  background: #ffe1a1;
  border-radius: 2px;
  margin: 0.5rem 0 1.2rem 0;
  box-shadow: 0 1px 4px #e4870022;
}
.modal-card form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.modal-card input,
.modal-card textarea {
  padding: 14px 14px 14px 18px;
  border: 1.5px solid #e6cfa1;
  border-radius: 10px;
  font-size: 1.04rem;
  background: #fffef9;
  transition: border 0.18s, box-shadow 0.18s;
  outline: none;
  box-shadow: 0 1px 4px #e4870022;
}
.modal-card input:focus,
.modal-card textarea:focus {
  border-color: #E48700;
  box-shadow: 0 2px 8px #e4870033;
}
.modal-card textarea {
  min-height: 80px;
  resize: vertical;
}
.modal-actions {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  margin-top: 0.2rem;
  justify-content: flex-end;
}
.modal-card button {
  width: 100%;
  max-width: 50%;
  padding: 13px 0;
  border: none;
  border-radius: 10px;
  font-size: 1.08rem;
  cursor: pointer;
  transition: background 0.18s, box-shadow 0.18s;
  font-weight: 600;
  box-shadow: 0 1px 4px #e4870022;
  margin: 0;
}
.modal-card button[type="submit"] {
  background: #E48700;
  color: #fff;
  font-weight: bold;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px #e4870033;
}
.modal-card button[type="submit"]:hover {
  background: #ECBC76;
  color: #111;
}
.modal-card button[type="button"] {
  background: #fffbe6;
  color: #E48700;
  font-weight: 500;
  border: 1.2px solid #e6cfa1;
}
.modal-card button[type="button"]:hover {
  background: #ECBC76;
  color: #b97a00;
}
.error-message {
  color: #d32f2f;
  font-size: 1rem;
  text-align: center;
  margin-top: 1.1rem;
  background: #fff3f3;
  border-radius: 8px;
  padding: 7px 0;
  border: 1px solid #ffd6d6;
}
.city-suggestions {
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  background: #fff;
  border: 1px solid #e6cfa1;
  border-radius: 0 0 10px 10px;
  box-shadow: 0 2px 8px #e4870033;
  z-index: 10;
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 180px;
  overflow-y: auto;
}
.city-suggestions li {
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.15s;
}
.city-suggestions li:hover {
  background: #ffe1a1;
}

@media (max-width: 600px) {
  .modal-card {
    padding: 0 0.5rem 1.2rem 0.5rem;
    max-width: 98vw;
  }
  .modal-header {
    padding: 0.8rem 0 0.7rem 0;
    margin: 0 -0.5rem;
  }
  .modal-card h2 {
    font-size: 1.1rem;
  }
  .modal-actions {
    flex-direction: row;
    gap: 0.5rem;
  }
  .modal-card button {
    max-width: 100%;
    font-size: 1rem;
  }
}

:global(body) {
  overflow-x: hidden;
}


.search-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #fff8e1 0%, #f5f5f5 100%);
  border: 2px solid #ECBC76;
  border-radius: 12px;
  padding: 16px 20px;
  margin: 20px 0;
  font-size: 1rem;
  box-shadow: 0 3px 12px rgba(236, 188, 118, 0.2);
  position: relative;
  overflow: hidden;
}

.search-indicator::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #ECBC76, #d48a2f, #ECBC76);
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.search-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-text {
  color: #28303F;
  font-weight: 500;
}

.search-text strong {
  color: #d48a2f;
  font-weight: 700;
}

.search-count {
  color: #6B7280;
  background: rgba(107, 114, 128, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.clear-search-btn {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ECBC76;
  color: #d48a2f;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.clear-search-btn:hover {
  background: #ECBC76;
  color: #28303F;
  transform: translateY(-1px);  box-shadow: 0 4px 8px rgba(236, 188, 118, 0.3);
}
.filter-dropdown-wrapper {
  position: relative;
  display: inline-block;
}

.filter-dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: none;
}

.filter-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background: #fff;
  border: 1.5px solid #e6cfa1;
  border-radius: 10px;
  box-shadow: 0 2px 12px #e4870033;
  z-index: 1000;
  min-width: 160px;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: 5px;
  animation: filterDropdownOpen 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top left;
}

@keyframes filterDropdownOpen {
  0% {
    opacity: 0;
    transform: scaleY(0.8) translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: scaleY(1) translateY(0);
  }
}
.filter-dropdown button {
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  padding: 12px 18px;
  font-size: 1.05rem;
  color: #28303F;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  border-radius: 0;
}
.filter-dropdown button:hover {
  background: #ECBC76;
  color: #fff;
}


.modal-icon-svg {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  vertical-align: middle;
  filter: brightness(0) saturate(100%) invert(56%) sepia(88%) saturate(2574%) hue-rotate(24deg) brightness(100%) contrast(91%);
}
</style>

<style>

.dark-theme .search-indicator {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%) !important;
  border-color: #ECBC76 !important;
  box-shadow: 0 3px 12px rgba(236, 188, 118, 0.3) !important;
}

.dark-theme .search-indicator::before {
  background: linear-gradient(90deg, #ECBC76, #d48a2f, #ECBC76) !important;
}

.dark-theme .search-text {
  color: #e2e8f0 !important;
}

.dark-theme .search-text strong {
  color: #ECBC76 !important;
  background: rgba(236, 188, 118, 0.2) !important;
}

.dark-theme .search-count {
  color: #cbd5e0 !important;
  background: rgba(203, 213, 224, 0.1) !important;
}

.dark-theme .clear-search-btn {
  background: rgba(45, 55, 72, 0.9) !important;
  border-color: #ECBC76 !important;
  color: #ECBC76 !important;
}

.dark-theme .clear-search-btn:hover {
  background: #ECBC76 !important;
  color: #1a202c !important;
}
</style>
