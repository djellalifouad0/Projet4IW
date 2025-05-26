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
        </div>        <!-- Show 'Edit Profile' button only if the profile belongs to the logged-in user -->
        <div v-if="user?.profileToken === loggedInUser?.profileToken" class="profile-actions">
          <button class="profile-btn-v2" @click="showEditModal = true">Modifier le profil</button>
        </div>        <!-- Show 'Send Message' button if viewing someone else's profile -->        <div v-else class="profile-actions">
          <button class="profile-btn-v2 profile-btn-message" @click="startConversation">Envoyer un message</button>
          <button class="profile-btn-v2 profile-btn-rate" @click="showRatingModal = true">Noter cet utilisateur</button>
        </div>
      </div>
      
      <!-- Section des notes/avis -->
      <div class="ratings-section">
        <div class="ratings-summary" v-if="user?.ratingStats">
          <div class="rating-average">
            <div class="stars-display">
              <span v-for="star in 5" :key="star" 
                    :class="['star', { filled: star <= Math.round(user.ratingStats.averageRating) }]">
                ⭐
              </span>
            </div>
            <span class="rating-number">{{ user.ratingStats.averageRating || 0 }}/5</span>
            <span class="rating-count">({{ user.ratingStats.totalRatings }} avis)</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Section avec onglets pour Posts et Rendez-vous -->
    <div class="profile-section" v-if="userPosts.length || (user?.profileToken === loggedInUser?.profileToken)">
      <div class="profile-tabs">
        <button 
          :class="['tab-button', { active: activeTab === 'posts' }]"
          @click="activeTab = 'posts'"
          v-if="userPosts.length"
        >
          Mes posts ({{ userPosts.length }})
        </button>
        <button 
          :class="['tab-button', { active: activeTab === 'appointments' }]"
          @click="activeTab = 'appointments'"
          v-if="user?.profileToken === loggedInUser?.profileToken && appointments.length"
        >
          Mes rendez-vous ({{ appointments.length }})
        </button>        <button 
          :class="['tab-button', { active: activeTab === 'calendar' }]"
          @click="activeTab = 'calendar'"
          v-if="user?.profileToken === loggedInUser?.profileToken"
        >
          📅 Calendrier ({{ appointments.length }})
        </button>
        <button 
          :class="['tab-button', { active: activeTab === 'ratings' }]"
          @click="activeTab = 'ratings'; loadUserRatings()"
        >
          ⭐ Avis ({{ user?.ratingStats?.totalRatings || 0 }})
        </button>
      </div>

      <!-- Contenu de l'onglet Posts -->
      <div v-if="activeTab === 'posts'" class="tab-content">
        <ul class="profile-posts-list">
          <li v-for="post in userPosts" :key="post.id" class="profile-post-item">
            <div class="profile-post-title">{{ post.description }}</div>
            <div class="profile-post-date">Publié le {{ new Date(post.createdAt).toLocaleDateString() }}</div>
          </li>
        </ul>
      </div>

      <!-- Contenu de l'onglet Rendez-vous -->
      <div v-if="activeTab === 'appointments'" class="tab-content">
        <div class="appointments-list">
          <div v-for="appointment in appointments" :key="appointment.id" class="appointment-card">
            <div class="appointment-header">
              <h4>{{ appointment.title }}</h4>
              <span :class="['appointment-status', appointment.status]">
                {{ getStatusText(appointment.status) }}
              </span>
            </div>
            <div class="appointment-details">
              <div class="appointment-date">
                📅 {{ formatAppointmentDate(appointment.appointmentDate) }}
              </div>
              <div class="appointment-with">
                👤 Avec {{ getOtherUserName(appointment) }}
              </div>
              <div v-if="appointment.location" class="appointment-location">
                📍 {{ appointment.location }}
              </div>
              <div v-if="appointment.description" class="appointment-description">
                {{ appointment.description }}
              </div>
            </div>
            <div v-if="appointment.status === 'pending'" class="appointment-actions">
              <button 
                v-if="appointment.receiverId === loggedInUser.id" 
                @click="updateAppointmentStatus(appointment.id, 'accepted')"
                class="appointment-btn accept"
              >
                Accepter
              </button>
              <button 
                v-if="appointment.receiverId === loggedInUser.id" 
                @click="updateAppointmentStatus(appointment.id, 'declined')"
                class="appointment-btn decline"
              >
                Refuser
              </button>              <button 
                v-if="appointment.requesterId === loggedInUser.id" 
                @click="updateAppointmentStatus(appointment.id, 'cancelled')"
                class="appointment-btn cancel"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenu de l'onglet Calendrier -->
      <div v-if="activeTab === 'calendar'" class="tab-content">
        <div class="calendar-container">
          <div class="calendar-header">
            <button @click="previousMonth" class="calendar-nav-btn">‹</button>
            <h3 class="calendar-title">{{ formatCalendarTitle(currentDate) }}</h3>
            <button @click="nextMonth" class="calendar-nav-btn">›</button>
          </div>
          
          <div class="calendar-grid">
            <div class="calendar-day-header" v-for="day in dayHeaders" :key="day">
              {{ day }}
            </div>
            
            <div 
              v-for="day in calendarDays" 
              :key="day.date"
              :class="['calendar-day', { 
                'other-month': !day.isCurrentMonth, 
                'today': day.isToday,
                'has-appointment': day.hasAppointment
              }]"
            >
              <span class="calendar-day-number">{{ day.day }}</span>
              <div v-if="day.appointments.length" class="calendar-appointments">
                <div 
                  v-for="appointment in day.appointments" 
                  :key="appointment.id"
                  :class="['calendar-appointment', appointment.status]"
                  :title="`${appointment.title} - ${formatAppointmentTime(appointment.appointmentDate)}`"
                >
                  <span class="appointment-time">{{ formatAppointmentTime(appointment.appointmentDate) }}</span>
                  <span class="appointment-title">{{ appointment.title }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Liste des rendez-vous du mois -->
          <div class="calendar-appointments-list">
            <h4>Rendez-vous de {{ formatCalendarTitle(currentDate) }}</h4>
            <div v-if="monthAppointments.length === 0" class="no-appointments">
              Aucun rendez-vous ce mois-ci
            </div>
            <div v-else class="month-appointments">
              <div 
                v-for="appointment in monthAppointments" 
                :key="appointment.id" 
                class="month-appointment-card"
              >
                <div class="appointment-date-time">
                  📅 {{ formatAppointmentDateShort(appointment.appointmentDate) }}
                </div>
                <div class="appointment-info">
                  <h5>{{ appointment.title }}</h5>
                  <p>👤 Avec {{ getOtherUserName(appointment) }}</p>
                  <span :class="['appointment-status', appointment.status]">
                    {{ getStatusText(appointment.status) }}
                  </span>
                </div>
              </div>
            </div>          </div>        </div>
      </div>

      <!-- Contenu de l'onglet Avis -->
      <div v-if="activeTab === 'ratings'" class="tab-content">
        <div class="ratings-container">
          <div v-if="!userRatings.length" class="no-ratings">
            Aucun avis pour le moment
          </div>
          <div v-else class="ratings-list">
            <div v-for="rating in userRatings" :key="rating.id" class="rating-card">
              <div class="rating-header">
                <div class="rating-user">
                  <img 
                    :src="rating.rater?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg'" 
                    :alt="rating.rater?.username"
                    class="rating-avatar"
                  />
                  <span class="rating-username">{{ rating.rater?.username }}</span>
                </div>
                <div class="rating-score">
                  <div class="stars-display">
                    <span v-for="star in 5" :key="star" 
                          :class="['star', { filled: star <= rating.rating }]">
                      ⭐
                    </span>
                  </div>
                  <span class="rating-value">{{ rating.rating }}/5</span>
                </div>
              </div>
              <div v-if="rating.comment" class="rating-comment">
                {{ rating.comment }}
              </div>
              <div class="rating-date">
                {{ formatRatingDate(rating.createdAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>
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
        </div>      </div>    </div>
    <!-- FIN MODALE EDITION -->

    <!-- MODALE NOTATION UTILISATEUR -->
    <div v-if="showRatingModal" class="modal-overlay" @click.self="showRatingModal = false">
      <div class="modal-rating">
        <button class="modal-close" @click="showRatingModal = false">×</button>
        <div class="modal-header">
          <h2>Noter {{ user?.username }}</h2>
        </div>
        <div class="modal-body">
          <div class="rating-form">
            <div class="rating-stars">
              <label>Note :</label>
              <div class="stars-input">
                <span v-for="star in 5" :key="star" 
                      :class="['star-input', { active: star <= newRating.rating }]"
                      @click="newRating.rating = star">
                  ⭐
                </span>
              </div>
            </div>
            <div class="rating-comment">
              <label>Commentaire (optionnel) :</label>
              <textarea 
                v-model="newRating.comment" 
                placeholder="Partagez votre expérience avec cet utilisateur..."
                rows="4"
              ></textarea>
            </div>
          </div>
          <div class="modal-actions">
            <button @click="showRatingModal = false" class="btn btn-cancel">Annuler</button>
            <button @click="submitRating" class="btn btn-primary" :disabled="!newRating.rating">
              Publier l'avis
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- FIN MODALE NOTATION -->
  </div>
</template>

<script>
import api from '../services/api'

export default {
  name: 'Profile',  data() {
    return {
      user: null,
      userPosts: [],
      appointments: [],
      loggedInUser: null, // Store the logged-in user's data
      showEditModal: false,
      showRatingModal: false,
      userRatings: [],
      newRating: {
        rating: 0,
        comment: ''
      },
      activeTab: 'posts', // Onglet actif par défaut
      currentDate: new Date(), // Date actuelle pour le calendrier
      dayHeaders: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
      edit: {
        username: '',
        bio: '',
        address: '',
        avatar: '',
        cover: ''
      }
    }  },
  computed: {
    upcomingAppointments() {
      const now = new Date();
      return this.appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.appointmentDate);
        return appointmentDate >= now && appointment.status === 'accepted';
      });
    },    calendarDays() {
      console.log('Calculating calendar days for:', this.currentDate);
      console.log('Appointments available:', this.appointments);
      
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      
      // Premier jour du mois
      const firstDay = new Date(year, month, 1);
      // Dernier jour du mois
      const lastDay = new Date(year, month + 1, 0);
      
      // Premier jour de la semaine à afficher (peut être du mois précédent)
      const firstCalendarDay = new Date(firstDay);
      firstCalendarDay.setDate(firstDay.getDate() - firstDay.getDay());
      
      // Dernier jour de la semaine à afficher (peut être du mois suivant)
      const lastCalendarDay = new Date(lastDay);
      lastCalendarDay.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
      
      const days = [];
      const today = new Date();
      
      for (let d = new Date(firstCalendarDay); d <= lastCalendarDay; d.setDate(d.getDate() + 1)) {
        const dayAppointments = this.appointments.filter(appointment => {
          const appointmentDate = new Date(appointment.appointmentDate);
          return appointmentDate.toDateString() === d.toDateString();
        });
        
        days.push({
          date: d.toISOString(),
          day: d.getDate(),
          isCurrentMonth: d.getMonth() === month,
          isToday: d.toDateString() === today.toDateString(),
          hasAppointment: dayAppointments.length > 0,
          appointments: dayAppointments
        });
      }
      
      return days;
    },
    monthAppointments() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      
      return this.appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.appointmentDate);
        return appointmentDate.getFullYear() === year && appointmentDate.getMonth() === month;
      }).sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
    }
  },
  async mounted() {
    await this.loadProfileData();
  },  watch: {
    // Surveiller les changements de route pour recharger le profil
    '$route'(to, from) {
      if (to.params.profileToken !== from.params.profileToken) {
        this.loadProfileData();
      }
    }
  },
  methods: {    async loadProfileData() {
      try {
        const profileToken = this.$route.params.profileToken; // Get profileToken from the URL

        // Fetch the logged-in user's data
        const loggedInRes = await api.get('/auth/me');
        this.loggedInUser = loggedInRes.data;

        // Fetch the visited user's profile data
        const res = await api.get(`/users/profile/${profileToken}`);
        this.user = res.data;
        this.edit.username = this.user.username;
        this.edit.bio = this.user.bio || '';
        this.edit.address = this.user.address || '';
        this.edit.avatar = this.user.avatar || '';
        this.edit.cover = this.user.cover || '';

        // Fetch posts of the visited user
        const postsRes = await api.get(`/skills?profileToken=${profileToken}`);
        this.userPosts = postsRes.data;        // Fetch appointments only if viewing own profile
        if (this.user?.profileToken === this.loggedInUser?.profileToken) {
          await this.loadAppointments();
        }

        // Déterminer l'onglet par défaut
        this.setDefaultTab();
      } catch (e) {
        this.user = null;
        this.$router.push('/login');
      }    },    setDefaultTab() {
      console.log('Posts:', this.userPosts.length);
      console.log('Appointments:', this.appointments.length);
      console.log('Is own profile:', this.user?.profileToken === this.loggedInUser?.profileToken);
      
      // Si on a des posts, afficher l'onglet posts par défaut
      if (this.userPosts.length > 0) {
        this.activeTab = 'posts';
      }
      // Sinon si on a des rendez-vous et c'est notre profil, afficher l'onglet rendez-vous
      else if (this.user?.profileToken === this.loggedInUser?.profileToken && this.appointments.length > 0) {
        this.activeTab = 'appointments';
      }
      // Par défaut, rester sur posts
      else {
        this.activeTab = 'posts';
      }
      
      console.log('Active tab:', this.activeTab);
    },
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
        })        .catch((error) => {
          console.error('Error updating profile:', error);
        });
    },    async startConversation() {
      try {
        // Créer une conversation avec l'utilisateur visité
        const response = await api.post('/conversations', {
          profileToken: this.user.profileToken,
          initialMessage: `Bonjour ${this.user.username} !`
        });
        
        // Rediriger vers la page des discussions avec un délai pour s'assurer que la conversation est bien créée
        this.$router.push('/discussions');
        
        // Optionnel : afficher un message de succès
        console.log('Conversation créée avec succès !');
      } catch (error) {
        console.error('Error creating conversation:', error);
        if (error.response && error.response.status === 404) {
          alert('Utilisateur introuvable');
        } else if (error.response && error.response.status === 400) {
          alert(error.response.data.error || 'Vous ne pouvez pas créer une conversation avec vous-même');
        } else {
          alert('Erreur lors de la création de la conversation');
        }
      }
    },
    // Méthodes pour les rendez-vous
    async loadAppointments() {
      try {
        const response = await api.get('/appointments');
        this.appointments = response.data.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
      } catch (error) {
        console.error('Error loading appointments:', error);
      }
    },
    async updateAppointmentStatus(appointmentId, status) {
      try {
        await api.patch(`/appointments/${appointmentId}/status`, { status });
        // Recharger les rendez-vous après mise à jour
        await this.loadAppointments();
      } catch (error) {
        console.error('Error updating appointment status:', error);
      }
    },
    getStatusText(status) {
      const statusTexts = {
        pending: 'En attente',
        accepted: 'Accepté',
        declined: 'Refusé',
        cancelled: 'Annulé'
      };
      return statusTexts[status] || status;
    },
    formatAppointmentDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    getOtherUserName(appointment) {
      if (appointment.requesterId === this.loggedInUser?.id) {
        return appointment.receiver?.username || 'Utilisateur inconnu';      } else {
        return appointment.requester?.username || 'Utilisateur inconnu';
      }
    },
    // Méthodes pour le calendrier
    previousMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    },
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    },
    formatCalendarTitle(date) {
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long'
      });
    },
    formatAppointmentTime(dateString) {
      const date = new Date(dateString);
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    },    formatAppointmentDateShort(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    },    // Méthodes pour les avis
    async loadUser() {
      try {
        const profileToken = this.$route.params.profileToken;
        const res = await api.get(`/users/profile/${profileToken}`);
        this.user = res.data;
      } catch (error) {
        console.error('Error reloading user data:', error);
      }
    },

    async loadUserRatings() {
      try {
        const response = await api.get(`/ratings/user/${this.user.id}`);
        this.userRatings = response.data.ratings;
      } catch (error) {
        console.error('Error loading user ratings:', error);
      }
    },

    async submitRating() {
      try {
        await api.post('/ratings', {
          ratedUserId: this.user.id,
          rating: this.newRating.rating,
          comment: this.newRating.comment
        });

        // Réinitialiser le formulaire
        this.newRating = { rating: 0, comment: '' };
        this.showRatingModal = false;

        // Recharger les avis et les stats
        await this.loadUserRatings();
        await this.loadUser(); // Pour mettre à jour les stats

        alert('Votre avis a été publié avec succès !');
      } catch (error) {
        console.error('Error submitting rating:', error);
        if (error.response?.status === 409) {
          alert('Vous avez déjà noté cet utilisateur');
        } else if (error.response?.status === 400) {
          alert('Vous ne pouvez pas vous noter vous-même');
        } else {
          alert('Erreur lors de la publication de l\'avis');
        }
      }
    },

    formatRatingDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
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
  flex-direction: column; /* Stack avatar and name vertically */
  align-items: flex-start; /* Align items to the left */
  gap: 0.3rem; /* Add spacing between avatar and name */
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
  margin: 0; /* Remove unnecessary margins */
  text-align: left; /* Align the username to the left */
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
.profile-btn-message {
  background: #4CAF50;
}
.profile-btn-message:hover {
  background: #45a049;
}
.profile-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
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

/* Styles pour les onglets */
.profile-tabs {
  display: flex;
  border-bottom: 2px solid #ECBC76;
  margin-bottom: 1.5rem;
}

.tab-button {
  background: none;
  border: none;
  padding: 12px 20px;
  font-size: 1rem;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  margin-right: 10px;
}

.tab-button:hover {
  color: #E48700;
}

.tab-button.active {
  color: #E48700;
  border-bottom-color: #E48700;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

/* Styles pour les rendez-vous */
.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.appointment-card {
  background: #fff;
  border: 1px solid #ecbc76;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.appointment-header h4 {
  margin: 0;
  color: #28303F;
  font-size: 1.2rem;
}

.appointment-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
}

.appointment-status.pending {
  background: #fff3cd;
  color: #856404;
}

.appointment-status.accepted {
  background: #d4edda;
  color: #155724;
}

.appointment-status.declined {
  background: #f8d7da;
  color: #721c24;
}

.appointment-status.cancelled {
  background: #f1f1f1;
  color: #6c757d;
}

.appointment-details {
  margin-bottom: 16px;
}

.appointment-details > div {
  margin-bottom: 8px;
  color: #666;
  font-size: 0.95rem;
}

.appointment-date {
  font-weight: 600;
  color: #28303F;
}

.appointment-description {
  font-style: italic;
  margin-top: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.appointment-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.appointment-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.appointment-btn.accept {
  background: #4CAF50;
  color: white;
}

.appointment-btn.accept:hover {
  background: #45a049;
}

.appointment-btn.decline {
  background: #f44336;
  color: white;
}

.appointment-btn.decline:hover {
  background: #da190b;
}

.appointment-btn.cancel {
  background: #ff9800;
  color: white;
}

.appointment-btn.cancel:hover {
  background: #e68900;
}

/* Styles pour le calendrier */
.calendar-container {
  width: 100%;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 10px;
}

.calendar-title {
  margin: 0;
  color: #E48700;
  font-size: 1.5rem;
  font-weight: 600;
  text-transform: capitalize;
}

.calendar-nav-btn {
  background: #E48700;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.calendar-nav-btn:hover {
  background: #c76d00;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #ddd;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 30px;
}

.calendar-day-header {
  background: #E48700;
  color: white;
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.calendar-day {
  background: white;
  min-height: 80px;
  padding: 8px;
  position: relative;
  display: flex;
  flex-direction: column;
  transition: background-color 0.2s;
}

.calendar-day:hover {
  background: #f9f9f9;
}

.calendar-day.other-month {
  background: #f5f5f5;
  color: #ccc;
}

.calendar-day.today {
  background: #fff3e0;
  border: 2px solid #E48700;
}

.calendar-day.has-appointment {
  background: #e8f5e8;
}

.calendar-day-number {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.calendar-appointments {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.calendar-appointment {
  background: #E48700;
  color: white;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 0.7rem;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.calendar-appointment.pending {
  background: #ff9800;
}

.calendar-appointment.accepted {
  background: #4CAF50;
}

.calendar-appointment.declined {
  background: #f44336;
}

.calendar-appointment.cancelled {
  background: #9e9e9e;
}

.appointment-time {
  display: block;
  font-weight: 600;
}

.appointment-title {
  display: block;
  opacity: 0.9;
}

.calendar-appointments-list {
  margin-top: 30px;
}

.calendar-appointments-list h4 {
  color: #E48700;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.no-appointments {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.month-appointments {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.month-appointment-card {
  background: white;
  border: 1px solid #ecbc76;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.appointment-date-time {
  font-size: 0.9rem;
  color: #666;
  font-weight: 600;
  min-width: 120px;
}

.appointment-info {
  flex: 1;
}

.appointment-info h5 {
  margin: 0 0 5px 0;
  color: #28303F;
  font-size: 1rem;
}

.appointment-info p {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 600px) {
  .calendar-grid {
    gap: 0;
  }
  
  .calendar-day {
    min-height: 60px;
    padding: 4px;
  }
  
  .calendar-day-header {
    padding: 8px 4px;
    font-size: 0.8rem;
  }
  
  .calendar-appointment {
    font-size: 0.6rem;
    padding: 1px 2px;
  }
  
  .calendar-title {
    font-size: 1.2rem;
  }
  
  .calendar-nav-btn {
    width: 35px;
    height: 35px;
    font-size: 1.2rem;
  }
  
  .month-appointment-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .appointment-date-time {
    min-width: auto;
  }
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
  
  /* Responsive pour les onglets */
  .tab-button {
    padding: 10px 15px;
    font-size: 0.9rem;
    margin-right: 5px;
  }
    .profile-section {
    padding: 1rem;
  }
}

/* Styles pour le système d'avis */
.ratings-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ratings-summary {
  text-align: center;
}

.rating-average {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stars-display {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 1.2rem;
  color: #ddd;
  transition: color 0.2s;
}

.star.filled {
  color: #ffc107;
}

.rating-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.rating-count {
  color: #666;
  font-size: 0.9rem;
}

.ratings-container {
  max-width: 800px;
  margin: 0 auto;
}

.no-ratings {
  text-align: center;
  color: #666;
  padding: 2rem;
  font-style: italic;
}

.ratings-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rating-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.rating-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.rating-user {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.rating-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.rating-username {
  font-weight: 600;
  color: #333;
}

.rating-score {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-value {
  font-weight: 600;
  color: #333;
}

.rating-comment {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  font-style: italic;
  color: #555;
}

.rating-date {
  font-size: 0.85rem;
  color: #888;
}

/* Styles pour la modale de notation */
.modal-rating {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-rating .modal-header {
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-rating .modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
}

.modal-rating .modal-body {
  padding: 1.5rem;
}

.rating-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.rating-stars label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.stars-input {
  display: flex;
  gap: 5px;
}

.star-input {
  font-size: 2rem;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s;
}

.star-input:hover,
.star-input.active {
  color: #ffc107;
}

.rating-comment label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.rating-comment textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  resize: vertical;
  font-family: inherit;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.btn-cancel {
  background: #f8f9fa;
  color: #666;
}

.btn-cancel:hover {
  background: #e9ecef;
}

.btn-primary {
  background: #E48700;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #cc7700;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.profile-btn-rate {
  background: #28a745;
  color: white;
  margin-left: 0.5rem;
}

.profile-btn-rate:hover {
  background: #218838;
}
</style>
