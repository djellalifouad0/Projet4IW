<template>
  <div class="profile-content">
    <div class="profile-card-v2">
      <div class="profile-cover">
        <img class="profile-cover-img" :src="user?.cover || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'" alt="cover" />
      </div>
      <div class="profile-card-bottom-v2">        <div class="profile-avatar-block">
          <img class="profile-avatar-v2" :src="user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=ECBC76&color=fff&size=128&bold=true`" alt="Avatar utilisateur" />
          <div class="profile-name-v2">{{ user?.username || '' }}</div>
          <!-- Moyenne des avis intégrée dans le profil -->          <div v-if="user?.ratingStats && user.ratingStats.totalRatings > 0" class="profile-rating-inline">            <div class="stars-display-inline">
              <span v-for="star in 5" :key="star" class="star-inline">
                <img 
                  :src="star <= user.ratingStats.averageRating ? '/src/assets/icons/star-filled.svg' : '/src/assets/icons/star-empty.svg'" 
                  alt="étoile" 
                  class="star-icon-inline" 
                />
              </span>
            </div>
            <span class="rating-text-inline">{{ user.ratingStats.averageRating.toFixed(1) }} • {{ user.ratingStats.totalRatings }} avis</span>
          </div>
        </div>        <div class="profile-infos-v2">
          <div class="profile-address-v2">{{ user?.address || '' }}</div>
        </div><!-- Show 'Edit Profile' button only if the profile belongs to the logged-in user -->
        <div v-if="user?.profileToken === loggedInUser?.profileToken" class="profile-actions">
          <button class="profile-btn-icon" @click="showEditModal = true" title="Modifier le profil">
            <img src="@/assets/icons/edit.svg" alt="Modifier" class="btn-icon-only" />
          </button>
        </div>        <!-- Show 'Send Message' button if viewing someone else's profile -->        <div v-else class="profile-actions">
          <button class="profile-btn-icon profile-btn-message" @click="startConversation" title="Envoyer un message">
            <img src="@/assets/icons/message.svg" alt="Message" class="btn-icon-only" />
          </button>
          <button class="profile-btn-icon profile-btn-rate" @click="showRatingModal = true" title="Noter cet utilisateur">
            <img src="@/assets/icons/star.svg" alt="Noter" class="btn-icon-only" />
          </button>        </div>
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
        Calendrier
          <img src="@/assets/icons/agenda.svg" alt="Calendrier" class="tab-icon" />
        </button>
        <button 
          :class="['tab-button', { active: activeTab === 'ratings' }]"
          @click="activeTab = 'ratings'; loadUserRatings()"
        >
          <!-- <img src="@/assets/icons/star.svg" alt="Avis" class="tab-icon" /> -->
          Avis ({{ user?.ratingStats?.totalRatings || 0 }})
        </button>
      </div>      <!-- Contenu de l'onglet Posts -->
      <div v-if="activeTab === 'posts'" class="tab-content">
        <ul class="profile-posts-list">          <li 
            v-for="post in userPosts" 
            :key="post.id" 
            class="profile-post-item clickable-post"
            @click="navigateToPost(post.id)"
            :title="'Cliquer pour voir le post complet'"
          >
            <div class="post-content">
              <div class="post-header">
                <div class="profile-post-title">{{ post.description }}</div>
                <span v-if="post.pricePerHour" class="post-price-badge">{{ post.pricePerHour }}€/h</span>
              </div>
              
              <div class="post-meta">
                <div class="profile-post-date">
                  <svg class="date-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  {{ formatPostDate(post.createdAt) }}
                </div>
              </div>
              
              <div class="profile-post-stats">
                <div class="post-stat-item">
                  <img src="@/assets/icons/coeur.svg" alt="Likes" class="stat-icon-small" />
                  <span class="stat-value">{{ post.likes || 0 }}</span>
                  <span class="stat-label">J'aime</span>
                </div>
                <div class="post-stat-item">
                  <img src="@/assets/icons/comment.svg" alt="Comments" class="stat-icon-small" />
                  <span class="stat-value">{{ post.commentsCount || 0 }}</span>
                  <span class="stat-label">Commentaire{{ (post.commentsCount || 0) > 1 ? 's' : '' }}</span>
                </div>
              </div>
            </div>
            
            <div class="post-hover-indicator">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
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
            </div>            <div class="appointment-details">
              <div class="appointment-date">
                <img src="@/assets/icons/agenda.svg" alt="Date" class="detail-icon" />
                {{ formatAppointmentDate(appointment.appointmentDate) }}
              </div>
              <div class="appointment-with">
                <img src="@/assets/icons/user.svg" alt="Avec" class="detail-icon" />
                Avec {{ getOtherUserName(appointment) }}
              </div>
              <div v-if="appointment.location" class="appointment-location">
                <img src="@/assets/icons/carte.svg" alt="Lieu" class="detail-icon" />
                {{ appointment.location }}
              </div>
              <div v-if="appointment.description" class="appointment-description">
                {{ appointment.description }}
              </div>            </div>
            <!-- Actions pour les rendez-vous en attente -->
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
            
            <!-- Actions pour les rendez-vous acceptés -->
            <div v-else-if="appointment.status === 'accepted'" class="appointment-actions">
              <button 
                @click="updateAppointmentStatus(appointment.id, 'cancelled')"
                class="appointment-btn cancel"
              >
                Annuler
              </button>
              <div class="appointment-status-confirmed">
                Rendez-vous confirmé
              </div>
            </div>
            
            <!-- Statut pour les rendez-vous terminés -->
            <div v-else class="appointment-actions">
              <div class="appointment-status-final">
                {{ getStatusText(appointment.status) }}
              </div>
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
              >                <div class="appointment-date-time">
                  <img src="@/assets/icons/agenda.svg" alt="Date" class="detail-icon" />
                  {{ formatAppointmentDateShort(appointment.appointmentDate) }}
                </div>                <div class="appointment-info">
                  <h5>{{ appointment.title }}</h5>
                  <p>
                    <img src="@/assets/icons/user.svg" alt="Avec" class="detail-icon" />
                    Avec {{ getOtherUserName(appointment) }}
                  </p>
                  <span :class="['appointment-status', appointment.status]">
                    {{ getStatusText(appointment.status) }}
                  </span>
                </div>
                <!-- Actions pour les rendez-vous dans le calendrier -->
                <div class="month-appointment-actions">
                  <!-- Actions pour les rendez-vous en attente -->
                  <div v-if="appointment.status === 'pending'" class="appointment-quick-actions">                    <button 
                      v-if="appointment.receiverId === loggedInUser.id" 
                      @click="updateAppointmentStatus(appointment.id, 'accepted')"
                      class="quick-btn accept-quick"
                      title="Accepter"
                    >
                      <img src="@/assets/icons/check.svg" alt="Accepter" class="quick-action-icon" />
                    </button>                    <button 
                      v-if="appointment.receiverId === loggedInUser.id" 
                      @click="updateAppointmentStatus(appointment.id, 'declined')"
                      class="quick-btn decline-quick"
                      title="Refuser"
                    >
                      <img src="@/assets/icons/close.svg" alt="Refuser" class="quick-action-icon" />
                    </button>                    <button 
                      v-if="appointment.requesterId === loggedInUser.id" 
                      @click="updateAppointmentStatus(appointment.id, 'cancelled')"
                      class="quick-btn cancel-quick"
                      title="Annuler"
                    >
                      <img src="@/assets/icons/close.svg" alt="Annuler" class="quick-action-icon" />
                    </button>
                  </div>
                    <!-- Actions pour les rendez-vous acceptés -->
                  <div v-else-if="appointment.status === 'accepted'" class="appointment-quick-actions">
                    <button 
                      @click="updateAppointmentStatus(appointment.id, 'cancelled')"
                      class="quick-btn cancel-quick"
                      title="Annuler ce rendez-vous"
                    >
                      <img src="@/assets/icons/close.svg" alt="Annuler" class="quick-action-icon" />
                    </button>
                  </div>
                </div>
              </div>
            </div>          </div>        </div>
      </div>      <!-- Contenu de l'onglet Avis -->
      <div v-if="activeTab === 'ratings'" class="tab-content">
        <div class="ratings-container">
          <div v-if="!userRatings.length" class="no-ratings">
            Aucun avis pour le moment
          </div>
          <div v-else class="ratings-list">
            <div v-for="rating in userRatings" :key="rating.id" class="rating-card">
              <div class="rating-header">
                <div class="rating-user">                  <img 
                    :src="rating.rater?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rating.rater?.username || 'User')}&background=ECBC76&color=fff&size=64&bold=true`" 
                    :alt="rating.rater?.username"
                    class="rating-avatar"
                  />
                  <span class="rating-username">{{ rating.rater?.username }}</span>
                </div>                  <div class="rating-score-actions">
                    <div class="rating-score">                      <div class="stars-display-small">
                        <span v-for="star in 5" :key="star" class="star-small">
                          <img 
                            :src="star <= rating.rating ? '/src/assets/icons/star-filled.svg' : '/src/assets/icons/star-empty.svg'" 
                            alt="étoile" 
                            class="star-icon-small" 
                          />
                        </span>
                      </div>
                      <span class="rating-value">{{ rating.rating }}/5</span>
                    </div>                    <!-- Actions pour modifier/supprimer si c'est notre avis -->
                    <div v-if="rating.raterId === loggedInUser?.id" class="rating-actions">
                      <button @click="editRating(rating)" class="btn-edit" title="Modifier">
                        <img src="@/assets/icons/edit.svg" alt="Modifier" class="action-icon" />
                      </button>
                      <button @click="deleteRating(rating.id)" class="btn-delete" title="Supprimer">
                        <img src="@/assets/icons/trash.svg" alt="Supprimer" class="action-icon" />
                      </button>
                    </div>
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
        </div>        <div class="modal-cover-block">
          <div class="modal-cover-container" :class="{ 'no-cover': !edit.cover && !user?.cover }">
            <img v-if="edit.cover || user?.cover" class="modal-cover-img" :src="edit.cover || user?.cover" alt="cover" />
          </div>          <div class="modal-cover-actions">
            <label class="modal-cover-upload">
              <input type="file" accept="image/*" @change="onCoverChange" style="display:none" />
              <img src="@/assets/icons/avatar_change.svg" alt="Changer couverture" class="modal-camera-icon" />
            </label>
            <button v-if="edit.cover || user?.cover" class="modal-cover-remove" @click="removeCover">
              <img src="@/assets/icons/trash.svg" alt="Supprimer bannière" class="modal-remove-icon" />
            </button>
          </div>
        </div>
        <div class="modal-avatar-block">
          <img class="modal-avatar-img" :src="edit.avatar || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=ECBC76&color=fff&size=128&bold=true`" alt="avatar" />          <label class="modal-avatar-upload">
            <input type="file" accept="image/*" @change="onAvatarChange" style="display:none" />
            <img src="@/assets/icons/avatar_change.svg" alt="Changer avatar" class="modal-camera-icon" />
          </label>
        </div>
        <div class="modal-form">
          <input v-model="edit.username" placeholder="Nom" />
          <textarea v-model="edit.bio" placeholder="Bio"></textarea>
          <input v-model="edit.address" placeholder="Localisation" />
        </div>      </div>    </div>
    <!-- FIN MODALE EDITION -->    <!-- MODALE NOTATION UTILISATEUR -->
    <div v-if="showRatingModal" class="modal-overlay" @click.self="resetRatingForm">      <div class="modal-rating">
        <button class="modal-close" @click="resetRatingForm">×</button>
        <div class="modal-header">
          <h2>{{ editingRating ? 'Modifier votre avis' : 'Noter' }} {{ user?.username }}</h2>
        </div>
        <div class="modal-body">
          <div class="rating-form">            <div class="rating-stars">
              <label>Note :</label>              <div class="stars-input">
                <span v-for="star in 5" :key="star" 
                      :class="['star-input']"
                      @click="newRating.rating = star"
                      @mouseenter="hoverRating = star"
                      @mouseleave="hoverRating = 0">
                  <img 
                    :src="(hoverRating > 0 ? star <= hoverRating : star <= newRating.rating) 
                          ? '/src/assets/icons/star-filled.svg' 
                          : '/src/assets/icons/star-empty.svg'" 
                    alt="étoile" 
                    class="star-icon-input" 
                  />
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
            <button @click="resetRatingForm" class="btn btn-cancel">Annuler</button>
            <button @click="submitRating" class="btn btn-primary" :disabled="!newRating.rating">
              {{ editingRating ? 'Modifier l\'avis' : 'Publier l\'avis' }}
            </button>
          </div>
        </div>
      </div>    </div>
    <!-- FIN MODALE NOTATION -->

    <!-- DIALOG DE CONFIRMATION -->
    <div v-if="confirmDialog.show" class="modal-overlay" @click="cancelConfirmation">
      <div class="confirm-dialog" @click.stop>
        <div class="confirm-header">
          <h3>Confirmation</h3>
        </div>
        <div class="confirm-body">
          <p>{{ confirmDialog.message }}</p>
        </div>
        <div class="confirm-actions">
          <button @click="cancelConfirmation" class="btn btn-cancel">Annuler</button>
          <button @click="confirmAction" class="btn btn-danger">Supprimer</button>
        </div>
      </div>
    </div>    <!-- FIN DIALOG DE CONFIRMATION -->
    
    <!-- IMAGE CROPPER -->
    <ImageCropper
      :show="showImageCropper"
      :imageData="cropperImageData"
      :cropType="cropperType"
      @crop-complete="onCropComplete"
      @cancel="closeCropper"
    />
    <!-- FIN IMAGE CROPPER -->
  </div>
</template>

<script>
import api from '../services/api'
import toast from '../services/toast'
import ImageCropper from './ImageCropper.vue'
import NotificationService from '../services/notificationService'
import eventBus, { ProfileEvents } from '../services/eventBus'

export default {
  name: 'Profile',
  components: {
    ImageCropper
  },  data() {    return {
      user: null,
      userPosts: [],
      appointments: [],
      loggedInUser: null, // Store the logged-in user's data
      showEditModal: false,      showRatingModal: false,
      editingRating: null, // Pour stocker l'avis en cours de modification
      userRatings: [],      newRating: {
        rating: 0,
        comment: ''
      },      hoverRating: 0, // Pour l'effet de survol des étoiles
      confirmDialog: {
        show: false,
        message: '',
        action: null
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
      },
      // Image cropper
      showImageCropper: false,
      cropperImageData: '',
      cropperType: '', // 'avatar' or 'banner'
      pendingImageFile: null
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
    },    // Méthode pour naviguer vers la vue individuelle du post
    navigateToPost(postId) {
      this.$router.push(`/post/${postId}`);
    },

    // Méthode pour formater la date des posts de manière plus lisible
    formatPostDate(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        return 'Hier';
      } else if (diffDays <= 7) {
        return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
      } else if (diffDays <= 30) {
        const weeks = Math.floor(diffDays / 7);
        return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
      } else {
        return date.toLocaleDateString('fr-FR', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        });
      }
    },onAvatarChange(e) {
      const file = e.target.files[0]
      if (file) {
        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
          toast.error('Veuillez sélectionner une image valide.');
          return;
        }
        
        // Vérifier la taille du fichier (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error('L\'image ne doit pas dépasser 5MB.');
          return;
        }
        
        const reader = new FileReader()
        reader.onload = (ev) => {
          this.cropperImageData = ev.target.result
          this.cropperType = 'avatar'
          this.pendingImageFile = file
          this.showImageCropper = true
        }
        reader.readAsDataURL(file)
      }
      // Réinitialiser l'input pour permettre de sélectionner le même fichier
      e.target.value = ''
    },
    onCoverChange(e) {
      const file = e.target.files[0]
      if (file) {
        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
          toast.error('Veuillez sélectionner une image valide.');
          return;
        }
        
        // Vérifier la taille du fichier (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error('L\'image ne doit pas dépasser 5MB.');
          return;
        }
        
        const reader = new FileReader()
        reader.onload = (ev) => {
          this.cropperImageData = ev.target.result
          this.cropperType = 'banner'
          this.pendingImageFile = file
          this.showImageCropper = true
        }
        reader.readAsDataURL(file)
      }
      // Réinitialiser l'input pour permettre de sélectionner le même fichier
      e.target.value = ''
    },    removeCover() {
      this.edit.cover = ''
      // Force la mise à jour de l'affichage pour montrer le fond #FFF4E3
      this.$forceUpdate();
    },
    
    // Méthodes pour le cropper d'images
    onCropComplete(result) {
      if (result.cropType === 'avatar') {
        this.edit.avatar = result.dataUrl
      } else if (result.cropType === 'banner') {
        this.edit.cover = result.dataUrl
      }
      this.closeCropper()
      toast.success('Image recadrée avec succès !')
    },
    
    closeCropper() {
      this.showImageCropper = false
      this.cropperImageData = ''
      this.cropperType = ''
      this.pendingImageFile = null
    },    saveProfile() {
      const updatedProfile = {
        username: this.edit.username,
        bio: this.edit.bio,
        address: this.edit.address,
        avatar: this.edit.avatar,
        cover: this.edit.cover
      };

      const oldUsername = this.user.username;
      const oldAvatar = this.user.avatar;

      api.put('/profile', updatedProfile)
        .then(() => {
          // Mettre à jour les données locales
          this.user.username = this.edit.username;
          this.user.bio = this.edit.bio;
          this.user.address = this.edit.address;
          this.user.avatar = this.edit.avatar;
          this.user.cover = this.edit.cover;
          
          // Émettre les événements de mise à jour du profil
          eventBus.emit(ProfileEvents.PROFILE_UPDATED, {
            username: this.edit.username,
            avatar: this.edit.avatar,
            cover: this.edit.cover,
            bio: this.edit.bio,
            address: this.edit.address
          });

          // Émettre des événements spécifiques si le nom d'utilisateur ou l'avatar ont changé
          if (oldUsername !== this.edit.username) {
            eventBus.emit(ProfileEvents.USERNAME_CHANGED, this.edit.username);
          }
          
          if (oldAvatar !== this.edit.avatar) {
            eventBus.emit(ProfileEvents.AVATAR_CHANGED, this.edit.avatar);
          }

          // Déclencher la vérification des notifications (pour la notification de mise à jour du profil)
          NotificationService.triggerNotificationCheck();
          
          this.showEditModal = false;
          toast.success('Profil mis à jour avec succès !');
        })
        .catch((error) => {
          console.error('Error updating profile:', error);
          toast.error('Erreur lors de la mise à jour du profil');
        });
    },async startConversation() {
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
    },    async updateAppointmentStatus(appointmentId, status) {
      try {
        await api.patch(`/appointments/${appointmentId}/status`, { status });
        // Recharger les rendez-vous après mise à jour
        await this.loadAppointments();
        // Déclencher la vérification des notifications après mise à jour du statut
        NotificationService.triggerNotificationCheck();
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
    },    async submitRating() {
      try {        if (this.editingRating) {
          // Mode modification
          await api.put(`/ratings/${this.editingRating.id}`, {
            rating: this.newRating.rating,
            comment: this.newRating.comment
          });
          toast.success('Votre avis a été modifié avec succès !');
        } else {
          // Mode création
          await api.post('/ratings', {
            ratedUserId: this.user.id,
            rating: this.newRating.rating,
            comment: this.newRating.comment
          });
          toast.success('Votre avis a été publié avec succès !');
        }

        // Réinitialiser le formulaire
        this.newRating = { rating: 0, comment: '' };
        this.editingRating = null;
        this.showRatingModal = false;
        
        // Déclencher une vérification des notifications
        NotificationService.triggerNotificationCheck();
        
        // Recharger les avis et les stats
        await this.loadUserRatings();
        await this.loadUser(); // Pour mettre à jour les stats
      } catch (error) {
        console.error('Error submitting rating:', error);
        if (error.response?.status === 409) {
          toast.error('Vous avez déjà noté cet utilisateur');
        } else if (error.response?.status === 400) {
          toast.error('Vous ne pouvez pas vous noter vous-même');        } else {
          toast.error('Erreur lors de la publication de l\'avis');
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

    // Méthodes pour modifier/supprimer les avis
    editRating(rating) {
      this.editingRating = rating;
      this.newRating = {
        rating: rating.rating,
        comment: rating.comment || ''
      };
      this.showRatingModal = true;
    },    async deleteRating(ratingId) {
      this.showConfirmation('Êtes-vous sûr de vouloir supprimer cet avis ?', async () => {        try {
          await api.delete(`/ratings/${ratingId}`);
          
          // Recharger les avis et les stats
          await this.loadUserRatings();
          await this.loadUser();
          
          toast.success('Votre avis a été supprimé avec succès !');
        } catch (error) {
          console.error('Error deleting rating:', error);        
          toast.error('Erreur lors de la suppression de l\'avis');
        }
      });
    },

    // Méthode pour déterminer la classe d'une étoile
    getStarClass(starPosition, rating) {
      if (starPosition <= Math.floor(rating)) {
        return 'filled';
      } else if (starPosition === Math.ceil(rating) && rating % 1 >= 0.5) {
        return 'half-filled';
      } else {
        return 'empty';
      }
    },    // Réinitialiser le formulaire de notation quand on ferme la modale
    resetRatingForm() {
      this.newRating = { rating: 0, comment: '' };
      this.editingRating = null;
      this.showRatingModal = false;
      this.hoverRating = 0;
    },    // Méthodes pour le dialog de confirmation
    showConfirmation(message, action) {
      this.confirmDialog.message = message;
      this.confirmDialog.action = action;
      this.confirmDialog.show = true;
    },

    confirmAction() {
      if (this.confirmDialog.action) {
        this.confirmDialog.action();
      }
      this.cancelConfirmation();
    },

    cancelConfirmation() {
      this.confirmDialog.show = false;
      this.confirmDialog.message = '';
      this.confirmDialog.action = null;
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

/* Styles pour la moyenne des avis intégrée dans le profil */
.profile-rating-inline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.3rem;
}

.stars-display-inline {
  display: flex;
  gap: 1px;
}

.star-inline {
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.star-inline.filled {
  color: #ffc107;
  text-shadow: 0 0 1px rgba(255, 193, 7, 0.3);
}

.star-inline.half-filled {
  background: linear-gradient(90deg, #ffc107 50%, #e0e0e0 50%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.star-inline.empty {
  color: #e0e0e0;
}

.rating-text-inline {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
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
  background: #4A90E2;
}
.profile-btn-message:hover {
  background: #357ABD;
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
  display: grid;
  gap: 0.75rem;
}

.profile-post-item {
  background: #fff;
  border-radius: 12px;
  padding: 0;
  margin: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f2f5;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  min-height: 80px;
}

/* Styles pour les posts cliquables */
.clickable-post {
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.clickable-post:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
  border-color: #E48700;
}

.clickable-post:hover .post-hover-indicator {
  opacity: 1;
  transform: translateX(0);
}

.clickable-post:active {
  transform: translateY(0);
}

/* Structure du contenu des posts */
.post-content {
  flex: 1;
  padding: 1.25rem;
  min-width: 0;
}

.post-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.profile-post-title {
  color: #1a1a1a;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  margin: 0;
  flex: 1;
  /* Fallback for browsers that don't support line-clamp */
  max-height: 2.8rem; /* Approximately 2 lines at 1.4 line height */
  overflow: hidden;
  /* Modern line-clamp with fallback */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  /* Alternative fallback using text-overflow */
  text-overflow: ellipsis;
  word-wrap: break-word;
}

.post-price-badge {
  background: linear-gradient(135deg, #E48700, #ff9500);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(228, 135, 0, 0.25);
}

.post-meta {
  margin-bottom: 1rem;
}

.profile-post-date {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #65676b;
  font-size: 0.85rem;
  font-weight: 500;
}

.date-icon {
  color: #65676b;
  flex-shrink: 0;
}

/* Styles améliorés pour les statistiques des posts */
.profile-post-stats {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin: 0;
  padding: 0;
}

.post-stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8f9fa;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.post-stat-item:hover {
  background: #e9ecef;
}

.stat-icon-small {
  width: 16px;
  height: 16px;
  filter: brightness(0) saturate(100%) invert(45%) sepia(15%) saturate(500%) hue-rotate(200deg) brightness(95%) contrast(85%);
  flex-shrink: 0;
}

.stat-value {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.9rem;
}

.stat-label {
  color: #65676b;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Indicateur de hover */
.post-hover-indicator {
  padding: 1rem;
  color: #E48700;
  opacity: 0;
  transform: translateX(8px);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-post-item {
    min-height: auto;
    flex-direction: column;
    align-items: stretch;
  }
  
  .post-content {
    padding: 1rem;
  }
  
  .post-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .profile-post-stats {
    gap: 1rem;
  }
  
  .post-stat-item {
    padding: 0.4rem 0.6rem;
  }
  
  .post-hover-indicator {
    display: none;
  }
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
.modal-cover-container {
  position: relative;
  width: 100%;
  height: 160px;
  background: #eee;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  overflow: hidden;
}

.modal-cover-container.no-cover {
  background: #FFF4E3;
}

.modal-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  background: #FFF4E3;
}
.modal-cover-actions {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 12px;
  align-items: center;
}

.modal-cover-upload {
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-cover-upload:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.05);
}

.modal-cover-upload .modal-camera-icon {
  width: 20px;
  height: 20px;
  filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);
}

.modal-cover-remove {
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-cover-remove:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.05);
}
.modal-avatar-block {
  position: absolute;
  left: 2.2rem;
  top: 120px;
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
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-avatar-upload:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: translate(-50%, -50%) scale(1.05);
}

.modal-avatar-upload .modal-camera-icon {
  width: 18px;
  height: 18px;
  filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);
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
  background: #4A90E2;
  color: white;
}

.appointment-btn.accept:hover {
  background: #357ABD;
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

.appointment-status-confirmed {
  color: #28a745;
  font-size: 0.85rem;
  font-weight: 600;
  align-self: center;
  flex-shrink: 0;
}

.appointment-status-final {
  color: #6c757d;
  font-size: 0.85rem;
  font-weight: 500;
  align-self: center;
  flex-shrink: 0;
  text-transform: capitalize;
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

.month-appointment-actions {
  display: flex;
  align-items: center;
  gap: 5px;
}

.appointment-quick-actions {
  display: flex;
  gap: 5px;
  align-items: center;
}

.quick-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-btn.accept-quick {
  background: #4CAF50;
  color: white;
}

.quick-btn.accept-quick:hover {
  background: #45a049;
  transform: scale(1.1);
}

.quick-btn.decline-quick,
.quick-btn.cancel-quick {
  background: #f44336;
  color: white;
}

.quick-btn.decline-quick:hover,
.quick-btn.cancel-quick:hover {
  background: #da190b;
  transform: scale(1.1);
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
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  padding: 1rem;
  margin: 0.5rem 0;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(228, 135, 0, 0.1);
}

.ratings-summary {
  text-align: center;
}

/* Design subtil pour le badge de note */
.rating-badge-subtle {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  background: rgba(228, 135, 0, 0.05);
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  border: 1px solid rgba(228, 135, 0, 0.15);
}

.stars-display-main {
  display: flex;
  gap: 1px;
}

.star-main {
  font-size: 1.1rem;
  transition: all 0.2s ease;
}

.star-main.filled {
  color: #ffc107;
  text-shadow: 0 0 2px rgba(255, 193, 7, 0.3);
}

.star-main.half-filled {
  background: linear-gradient(90deg, #ffc107 50%, #e0e0e0 50%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.star-main.empty {
  color: #e0e0e0;
}

.rating-info-subtle {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
}

.rating-number-subtle {
  font-weight: 600;
  color: #E48700;
  font-size: 1rem;
}

.rating-total-subtle {
  color: #666;
  font-size: 0.85rem;
}

/* Étoiles pour la liste des avis */
.stars-display-small {
  display: flex;
  gap: 1px;
}

.star-small {
  font-size: 1rem;
  transition: all 0.2s ease;
}

.star-small.filled {
  color: #ffc107;
}

.star-small.half-filled {
  background: linear-gradient(90deg, #ffc107 50%, #e0e0e0 50%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.star-small.empty {
  color: #e0e0e0;
}

/* Actions de modification/suppression */
.rating-score-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.rating-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.rating-card:hover .rating-actions {
  opacity: 1;
}

.btn-edit,
.btn-delete {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-edit:hover {
  background: rgba(76, 175, 80, 0.1);
}

.btn-delete:hover {
  background: rgba(244, 67, 54, 0.1);
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

.modal-rating .modal-close {
  position: absolute;
  left: auto !important;
  right: 1rem !important;
  top: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  z-index: 10;
}

.modal-rating .modal-close:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-rating .modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-rating .modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
  line-height: 1.4;
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
  cursor: pointer;
  transition: all 0.2s ease;
}

.star-input .star-icon-input {
  transition: transform 0.2s ease;
}

.star-input:hover .star-icon-input {
  transform: scale(1.1);
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
  background: #E48700;
  color: white;
  margin-left: 0.5rem;
}

.profile-btn-rate:hover {
  background: #cc7700;
}

/* Icon styles */
.btn-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  vertical-align: middle;
}

/* Boutons avec icônes uniquement */
.profile-btn-icon {
  background: #ECBC76;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: 0.5rem;
}

.profile-btn-icon:first-child {
  margin-left: 0;
}

.profile-btn-icon:hover {
  background: #e4a94f;
  transform: scale(1.05);
}

.profile-btn-icon.profile-btn-message {
  background: #ECBC76;
}

.profile-btn-icon.profile-btn-message:hover {
  background: #e4a94f;
}

.profile-btn-icon.profile-btn-rate {
  background: #ECBC76;
}

.profile-btn-icon.profile-btn-rate:hover {
  background: #e4a94f;
}

.btn-icon-only {
  width: 20px;
  height: 20px;
  filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);
}

.tab-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  vertical-align: middle;
  filter: brightness(0) saturate(100%) invert(40%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);
  /* #666 color filter */
}

.tab-button:hover .tab-icon {
  filter: brightness(0) saturate(100%) invert(55%) sepia(85%) saturate(5068%) hue-rotate(24deg) brightness(95%) contrast(95%);
  /* #E48700 color filter */
}

.tab-button.active .tab-icon {
  filter: brightness(0) saturate(100%) invert(55%) sepia(85%) saturate(5068%) hue-rotate(24deg) brightness(95%) contrast(95%);
  /* #E48700 color filter */
}

.detail-icon {
  width: 16px;
  height: 16px;
  margin-right: 6px;
  vertical-align: middle;
  filter: brightness(0) saturate(100%) invert(18%) sepia(15%) saturate(1239%) hue-rotate(195deg) brightness(96%) contrast(91%);
}

.action-icon {
  width: 16px;
  height: 16px;
  vertical-align: middle;
  transition: filter 0.2s;
}

.btn-edit .action-icon {
  filter: brightness(0) saturate(100%) invert(18%) sepia(15%) saturate(1239%) hue-rotate(195deg) brightness(96%) contrast(91%);
}

.btn-delete .action-icon {
  filter: brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%);
}

.modal-camera-icon {
  width: 16px;
  height: 16px;
  vertical-align: middle;
}

.modal-remove-icon {
  width: 16px;
  height: 16px;  vertical-align: middle;  filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);
}

/* Styles pour le dialog de confirmation */
.confirm-dialog {
  background: white;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  animation: fadeInScale 0.2s ease-out;
}

.confirm-header {
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.confirm-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
}

.confirm-body {
  padding: 1.5rem;
}

.confirm-body p {
  margin: 0;
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem 1.5rem;
  justify-content: flex-end;
}

.btn-danger {
  background: #dc3545;
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.btn-danger:hover {
  background: #c82333;
}

@keyframes fadeInScale {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Styles pour les icônes de remplacement des emojis */
.quick-action-icon {
  width: 16px;
  height: 16px;
  vertical-align: middle;
  transition: filter 0.2s;
}

.quick-action-icon:hover {
  filter: brightness(1.1);
}

.star-icon-small {
  width: 14px;
  height: 14px;
  vertical-align: middle;
}

.star-icon-input {
  width: 24px;
  height: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.star-icon-inline {
  width: 16px;
  height: 16px;
  vertical-align: middle;
}
</style>
