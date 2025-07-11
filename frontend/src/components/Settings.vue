<template>
  <div class="settings-page">
    <div class="settings-container">
      <div class="settings-header">
        <h1 class="settings-title">
          <img src="@/assets/icons/settings.svg" alt="Paramètres" class="title-icon" />
          Paramètres
        </h1>
        <p class="settings-subtitle">Gérez vos préférences et paramètres de compte</p>
      </div>

      <!-- Section Compte -->
      <div class="settings-section">
        <h2 class="section-title">
          <img src="@/assets/icons/user.svg" alt="Compte" class="section-icon" />
          Compte
        </h2>
        <p class="section-description">Gérez les informations de votre compte</p>
        
        <!-- Changement de mot de passe -->
        <div class="settings-card">
          <div class="card-header">
            <h3>Modifier le mot de passe</h3>
            <p>Changez votre mot de passe pour sécuriser votre compte</p>
          </div>
          <form @submit.prevent="changePassword" class="form-content">
            <div class="form-group">
              <label for="currentPassword">Mot de passe actuel</label>
              <input 
                id="currentPassword" 
                v-model="passwordForm.current" 
                type="password" 
                placeholder="Entrez votre mot de passe actuel"
                required
              />
            </div>
            <div class="form-group">
              <label for="newPassword">Nouveau mot de passe</label>
              <input 
                id="newPassword" 
                v-model="passwordForm.new" 
                type="password" 
                placeholder="Entrez votre nouveau mot de passe"
                required
              />
            </div>
            <div class="form-group">
              <label for="confirmPassword">Confirmer le mot de passe</label>
              <input 
                id="confirmPassword" 
                v-model="passwordForm.confirm" 
                type="password" 
                placeholder="Confirmez votre nouveau mot de passe"
                required
              />
            </div>
            <button type="submit" class="btn-primary" :disabled="isUpdatingPassword">
              <span v-if="isUpdatingPassword">Mise à jour...</span>
              <span v-else>Changer le mot de passe</span>
            </button>
          </form>
        </div>

        <!-- Changement d'email -->
        <div class="settings-card">
          <div class="card-header">
            <h3>Modifier l'adresse email</h3>
            <p>Changez l'adresse email associée à votre compte</p>
          </div>
          <form @submit.prevent="changeEmail" class="form-content">
            <div class="form-group">
              <label for="currentEmail">Email actuel</label>
              <input 
                id="currentEmail" 
                v-model="currentEmail" 
                type="email" 
                disabled
                class="input-disabled"
              />
            </div>
            <div class="form-group">
              <label for="newEmail">Nouvel email</label>
              <input 
                id="newEmail" 
                v-model="emailForm.new" 
                type="email" 
                placeholder="Entrez votre nouvel email"
                :class="emailValidationClass"
                required
              />
              <div v-if="emailForm.new && !isEmailValid" class="field-error">
                <span v-if="emailForm.new.trim() === currentEmail">Le nouvel email doit être différent de l'actuel</span>
                <span v-else>Format d'email invalide</span>
              </div>
              <div v-if="emailForm.new && isEmailValid" class="field-success">
                Email valide ✓
              </div>
            </div>
            <div class="form-group">
              <label for="passwordConfirm">Mot de passe de confirmation</label>
              <input 
                id="passwordConfirm" 
                v-model="emailForm.password" 
                type="password" 
                placeholder="Confirmez avec votre mot de passe"
                required
              />
            </div>
            <button type="submit" class="btn-primary" :disabled="isUpdatingEmail">
              <span v-if="isUpdatingEmail">Mise à jour...</span>
              <span v-else>Changer l'email</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Section Apparence -->
      <div class="settings-section">
        <h2 class="section-title">
          <img src="@/assets/icons/banner_change.svg" alt="Apparence" class="section-icon" />
          Apparence
        </h2>
        <p class="section-description">Personnalisez l'apparence de l'interface</p>
        
        <div class="settings-card">
          <div class="setting-item">
            <div class="setting-info">
              <h3>Mode sombre</h3>
              <p>Activez le mode sombre pour une expérience plus confortable la nuit</p>
            </div>
            <div class="setting-control">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <!-- Section Notifications -->
      <div class="settings-section">
        <h2 class="section-title">
          <img src="@/assets/icons/notification.svg" alt="Notifications" class="section-icon" />
          Notifications
        </h2>
        <p class="section-description">Configurez vos préférences de notifications</p>
        
        <div class="settings-card">
          <div class="card-header">
            <h3>Préférences de notifications</h3>
            <p>Choisissez quelles notifications vous souhaitez recevoir</p>
          </div>
          
          <div class="notifications-list">
            <div class="notification-item">
              <div class="notification-info">
                <div class="notification-icon">
                  <img src="@/assets/icons/message.svg" alt="Messages" />
                </div>
                <div>
                  <h4>Messages privés</h4>
                  <p>Recevez des notifications quand vous recevez un nouveau message</p>
                </div>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="notificationSettings.messages"
                  @change="updateNotificationSettings"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="notification-item">
              <div class="notification-info">
                <div class="notification-icon">
                  <img src="@/assets/icons/coeur.svg" alt="Likes" />
                </div>
                <div>
                  <h4>Likes sur vos posts</h4>
                  <p>Soyez notifié quand quelqu'un aime vos publications</p>
                </div>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="notificationSettings.likes"
                  @change="updateNotificationSettings"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="notification-item">
              <div class="notification-info">
                <div class="notification-icon">
                  <img src="@/assets/icons/comment.svg" alt="Commentaires" />
                </div>
                <div>
                  <h4>Commentaires</h4>
                  <p>Recevez des notifications pour les nouveaux commentaires</p>
                </div>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="notificationSettings.comments"
                  @change="updateNotificationSettings"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="notification-item">
              <div class="notification-info">
                <div class="notification-icon">
                  <img src="@/assets/icons/agenda.svg" alt="Rendez-vous" />
                </div>
                <div>
                  <h4>Rendez-vous</h4>
                  <p>Notifications pour les nouveaux rendez-vous et rappels</p>
                </div>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="notificationSettings.appointments"
                  @change="updateNotificationSettings"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="notification-item">
              <div class="notification-info">
                <div class="notification-icon">
                  <img src="@/assets/icons/star.svg" alt="Évaluations" />
                </div>
                <div>
                  <h4>Évaluations</h4>
                  <p>Soyez notifié quand vous recevez une nouvelle évaluation</p>
                </div>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="notificationSettings.ratings"
                  @change="updateNotificationSettings"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="notification-item">
              <div class="notification-info">
                <div class="notification-icon">
                  <img src="@/assets/icons/check.svg" alt="Nouvelles fonctionnalités" />
                </div>
                <div>
                  <h4>Nouvelles fonctionnalités</h4>
                  <p>Découvrez les nouvelles fonctionnalités de SkillSwap</p>
                </div>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="notificationSettings.updates"
                  @change="updateNotificationSettings"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="notification-item">
              <div class="notification-info">
                <div class="notification-icon">
                  <img src="@/assets/icons/user.svg" alt="Mises à jour de profil" />
                </div>
                <div>
                  <h4>Mises à jour de profil</h4>
                  <p>Notifications de confirmation lors de modifications de votre profil</p>
                </div>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="notificationSettings.profileUpdates"
                  @change="updateNotificationSettings"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Sécurité -->
      <div class="settings-section">
        <h2 class="section-title">
          <img src="@/assets/icons/check.svg" alt="Sécurité" class="section-icon" />
          Sécurité
        </h2>
        <p class="section-description">Gérez la sécurité de votre compte</p>
        
        <div class="settings-card">
          <div class="security-info">
            <h3>Sessions actives</h3>
            <p>Gérez vos sessions de connexion actives</p>
            <button class="btn-secondary" @click="logoutAllDevices">
              Déconnecter tous les appareils
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ThemeToggle from './ThemeToggle.vue'
import api from '../services/api'
import toast from '../services/toast'

export default {
  name: 'Settings',
  components: {
    ThemeToggle
  },
  data() {
    return {
      // Formulaires
      passwordForm: {
        current: '',
        new: '',
        confirm: ''
      },
      emailForm: {
        new: '',
        password: ''
      },
      
      // États de chargement
      isUpdatingPassword: false,
      isUpdatingEmail: false,
      
      // Données utilisateur
      currentEmail: '',
      
      // Paramètres de notifications
      notificationSettings: {
        messages: true,
        likes: true,
        comments: true,
        appointments: true,
        ratings: true,
        updates: false,
        profileUpdates: true
      }
    }
  },
  
  computed: {
    isEmailValid() {
      if (!this.emailForm.new) return null // null = pas encore saisi
      
      const cleanEmail = this.emailForm.new.trim()
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
      
      return emailRegex.test(cleanEmail) && cleanEmail !== this.currentEmail
    },
    
    emailValidationClass() {
      if (this.isEmailValid === null) return ''
      return this.isEmailValid ? 'input-valid' : 'input-invalid'
    }
  },
  
  async mounted() {
    await this.loadUserData()
    await this.loadNotificationSettings()
  },
  
  methods: {
    async loadUserData() {
      try {
        const response = await api.get('/auth/me')
        if (response.data) {
          this.currentEmail = response.data.email || ''
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error)
      }
    },
    
    async loadNotificationSettings() {
      try {
        const response = await api.get('/notifications/settings')
        if (response.data) {
          this.notificationSettings = { ...this.notificationSettings, ...response.data }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres de notifications:', error)
        // Si l'endpoint n'existe pas encore, on garde les valeurs par défaut
      }
    },
    
    async changePassword() {
      // Validation
      if (this.passwordForm.new !== this.passwordForm.confirm) {
        toast.error('Les mots de passe ne correspondent pas')
        return
      }
      
      if (this.passwordForm.new.length < 6) {
        toast.error('Le mot de passe doit contenir au moins 6 caractères')
        return
      }
      
      this.isUpdatingPassword = true
      
      try {
        await api.put('/auth/change-password', {
          currentPassword: this.passwordForm.current,
          newPassword: this.passwordForm.new
        })
        
        toast.success('Mot de passe modifié avec succès !')
        
        // Réinitialiser le formulaire
        this.passwordForm = {
          current: '',
          new: '',
          confirm: ''
        }
      } catch (error) {
        console.error('Erreur lors du changement de mot de passe:', error)
        if (error.response?.status === 400) {
          toast.error('Mot de passe actuel incorrect')
        } else {
          toast.error('Erreur lors du changement de mot de passe')
        }
      } finally {
        this.isUpdatingPassword = false
      }
    },
    
    async changeEmail() {
      // Validation des champs requis
      if (!this.emailForm.new || !this.emailForm.password) {
        toast.error('Veuillez remplir tous les champs')
        return
      }
      
      // Nettoyer l'email (supprimer les espaces)
      const cleanEmail = this.emailForm.new.trim()
      
      // Validation email plus robuste
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
      if (!emailRegex.test(cleanEmail)) {
        toast.error('Adresse email invalide')
        return
      }
      
      if (cleanEmail === this.currentEmail) {
        toast.error('Le nouvel email doit être différent de l\'actuel')
        return
      }
      
      this.isUpdatingEmail = true
      
      try {
        await api.put('/auth/change-email', {
          newEmail: cleanEmail,
          password: this.emailForm.password
        })
        
        toast.success('Email modifié avec succès !')
        
        // Mettre à jour l'email actuel
        this.currentEmail = cleanEmail
        
        // Réinitialiser le formulaire
        this.emailForm = {
          new: '',
          password: ''
        }
      } catch (error) {
        console.error('Erreur lors du changement d\'email:', error)
        if (error.response?.status === 400) {
          toast.error('Mot de passe incorrect ou email déjà utilisé')
        } else {
          toast.error('Erreur lors du changement d\'email')
        }
      } finally {
        this.isUpdatingEmail = false
      }
    },
    
    async updateNotificationSettings() {
      try {
        await api.put('/notifications/settings', this.notificationSettings)
        toast.success('Paramètres de notifications mis à jour !')
      } catch (error) {
        console.error('Erreur lors de la mise à jour des paramètres:', error)
        toast.error('Erreur lors de la sauvegarde des paramètres')
      }
    },
    
    async logoutAllDevices() {
      if (!confirm('Êtes-vous sûr de vouloir déconnecter tous les appareils ? Vous devrez vous reconnecter.')) {
        return
      }
      
      try {
        await api.post('/auth/logout-all')
        toast.success('Déconnecté de tous les appareils')
        
        // Rediriger vers la page de connexion
        localStorage.removeItem('token')
        this.$router.push('/login')
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
        toast.error('Erreur lors de la déconnexion')
      }
    }
  }
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: #fefcf6;
  padding: 20px 0;
}

.settings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.settings-header {
  text-align: center;
  margin-bottom: 40px;
}

.settings-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #C6553B;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.title-icon {
  width: 32px;
  height: 32px;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #28303F;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 2px solid #ECBC76;
  padding-bottom: 8px;
  width: 100%;
}

.section-description {
  color: #666;
  margin: 0 0 20px 0;
  font-size: 0.95rem;
}

.section-icon {
  width: 24px;
  height: 24px;
}

.settings-subtitle {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

.settings-section {
  margin-bottom: 40px;
}

.settings-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  margin-bottom: 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.settings-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.card-header {
  margin-bottom: 25px;
}

.card-header h3 {
  font-size: 1.4rem;
  font-weight: 600;
  color: #28303F;
  margin-bottom: 8px;
}

.card-header p {
  color: #666;
  margin: 0;
  font-size: 0.95rem;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #28303F;
  font-size: 0.95rem;
}

.form-group input {
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background: white;
}

.form-group input:focus {
  outline: none;
  border-color: #ECBC76;
  box-shadow: 0 0 0 3px rgba(236, 188, 118, 0.1);
}

.form-group input.input-disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.form-group input.input-valid {
  border-color: #28a745;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
}

.form-group input.input-invalid {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.btn-primary {
  background: #C6553B;
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;
}

.btn-primary:hover {
  background: #A64530;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(198, 85, 59, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #f8f9fa;
  color: #28303F;
  border: 2px solid #e1e5e9;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #e9ecef;
  border-color: #C6553B;
  color: #C6553B;
}

/* Section Apparence */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.setting-info h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #28303F;
  margin-bottom: 5px;
}

.setting-info p {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

/* Section Notifications */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.notification-item:hover {
  background: #e9ecef;
  border-color: #ECBC76;
}

.notification-info {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.notification-icon {
  min-width: 40px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-icon img {
  width: 24px;
  height: 24px;
}

.notification-info h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #28303F;
  margin-bottom: 4px;
}

.notification-info p {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #ECBC76;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(26px);
  background-color: #C6553B;
}

/* Section Sécurité */
.security-info {
  text-align: center;
}

.security-info h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #28303F;
  margin-bottom: 10px;
}

.security-info p {
  color: #666;
  margin-bottom: 20px;
  font-size: 0.95rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .settings-container {
    padding: 0 15px;
  }
  
  .settings-title {
    font-size: 2rem;
  }
  
  .settings-card {
    padding: 20px;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .notification-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .notification-info {
    gap: 12px;
  }
  
  .btn-primary {
    width: 100%;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .settings-title {
    font-size: 1.8rem;
    flex-direction: column;
    gap: 10px;
  }
  
  .title-icon {
    font-size: 1.5rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .settings-card {
    padding: 15px;
  }
  
  .form-group input {
    padding: 10px 12px;
  }
}
</style>
