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
        :avatar="post.avatar || 'https://randomuser.me/api/portraits/men/32.jpg'"
        :rate="post.pricePerHour ? post.pricePerHour + '€/h' : ''"
        :likes="post.likes || 0"
        :views="post.views || 0"
        :online="true"
        :paid="!!post.pricePerHour"
        :description="post.description"
      />
    </div>

    <!-- Formulaire de création de post -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal-card" @click.stop>
        <h2>Publier un service</h2>
        <form @submit.prevent="handlePublish">
          <textarea v-model="form.description" placeholder="Description" required></textarea>
          <input v-model="form.location" type="text" placeholder="Adresse (optionnel)" />
          <input v-model.number="form.pricePerHour" type="number" min="0" step="1" placeholder="Tarif horaire (€) (optionnel)" />
          <button type="submit">Publier</button>
          <button type="button" @click="showForm = false">Annuler</button>
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
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}
.modal-card h2 {
  margin-top: 0;
  font-size: 1.5rem;
  text-align: center;
}
.modal-card form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.modal-card input,
.modal-card textarea {
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
}
.modal-card button {
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.18s;
}
.modal-card button[type="submit"] {
  background: #E48700;
  color: #fff;
  font-weight: bold;
}
.modal-card button[type="button"] {
  background: #ccc;
  color: #111;
}
.modal-card button:hover {
  opacity: 0.9;
}
.error-message {
  color: red;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 1rem;
}

/* Empêche tout débordement horizontal sur la page, même si un enfant déborde */
:global(body) {
  overflow-x: hidden;
}
</style>
