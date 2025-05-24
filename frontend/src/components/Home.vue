<template>
  <div class="home-content">
    <div class="filters-bar">
      <button class="filter-btn">Filtrer par <span>▼</span></button>
      <button class="publish-btn" @click="showForm = true">+ Publier</button>
    </div>

    <div class="cards">
      <PostCard
        v-for="post in posts"
        :key="post.id"
        :name="post.User?.username || ''"
        :address="post.location || ''"
        :avatar="post.User?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg'"
        :rate="post.pricePerHour ? post.pricePerHour + '€/h' : ''"
        :likes="post.likes || 0"
        :views="post.views || 0"
        :online="true"
        :paid="!!post.pricePerHour"
        :description="post.description"
        :createdAt="post.createdAt || ''"
      />
    </div>

    <!-- Formulaire de création de post -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal-card" @click.stop>
        <div class="modal-header">
          <span class="modal-icon">📝</span>
          <h2>Publier un service</h2>
        </div>
        <div class="modal-separator"></div>
        <form @submit.prevent="handlePublish">
          <textarea v-model="form.description" placeholder="Description" required></textarea>
          <input v-model="form.location" type="text" placeholder="Adresse (optionnel)" />
          <input v-model.number="form.pricePerHour" type="number" min="0" step="1" placeholder="Tarif horaire (€) (optionnel)" />
          <div class="modal-actions">
            <button type="submit">Publier</button>
            <button type="button" @click="showForm = false">Annuler</button>
          </div>
        </form>
        <div v-if="error" class="error-message">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import PostCard from './PostCard.vue'
import api from '../services/api'

export default {
  name: 'Home',
  components: { PostCard },
  data() {
    return {
      posts: [],
      showForm: false,
      form: {
        description: '',
        location: '',
        pricePerHour: null
      },
      error: ''
    }
  },
  async mounted() {
    await this.fetchPosts();
  },
  methods: {
    async fetchPosts() {
      try {
        const res = await api.get('/skills');
        console.log('API response:', res.data);
        console.log('API response structure:', res.data);
        this.posts = res.data;
      } catch (e) {
        this.error = "Erreur lors du chargement des posts.";
      }
    },
    async handlePublish() {
      this.error = '';
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
        this.error = e.response?.data?.error || 'Erreur lors de la publication.';
      }
    }
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
  background: #FFFEF9;
  overflow-x: hidden; /* Empêche le scroll horizontal */
  max-width: 100vw; /* Limite la largeur à 100% de la vue */
}
/* Filters bar + boutons */
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
/* Cards grid */
.cards {
  display: flex;
  flex-direction: column;
  gap: 22px;
  align-items: center;
  width: 100%;
  max-width: 700px;
  box-sizing: border-box;
  overflow-x: hidden; /* Ajouté pour éviter tout débordement */
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
/* Empêche tout débordement horizontal sur la page, même si un enfant déborde */
:global(body) {
  overflow-x: hidden;
}
</style>
