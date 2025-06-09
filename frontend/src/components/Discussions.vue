<template>  <div class="discussions-page">
    <div class="discussions-list" :class="{ 'mobile-hidden': selectedConversation && isMobile }">
      <div class="discussions-header">
        <h2>Discussions</h2>
      </div>
      <div v-if="loading" class="loading">Chargement...</div>
      <div v-if="error" class="error">{{ error }}</div><div v-for="conv in conversations" :key="conv.id" class="discussion-item" :class="{ active: selectedConversation && selectedConversation.id === conv.id }" @click="selectConversation(conv)">
        <div class="avatar-container">
          <img :src="conv.avatar" class="avatar" />
          <div v-if="isUserOnline(conv.userId)" class="online-indicator"></div>        </div>
        <div class="info">
          <div class="name">{{ conv.name }}</div>
          <div class="last-message">{{ conv.lastMessage }}</div>
        </div>
      </div>    </div>
    <div class="chat-window" :class="chatWindowClasses">
      <template v-if="selectedConversation">
        <div class="chat-header">
          <button v-if="isMobile" @click="goBackToDiscussions" class="back-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="avatar-container">
            <img :src="selectedConversation.avatar" class="avatar" />
            <div v-if="isUserOnline(selectedConversation.userId)" class="online-indicator"></div>          </div>
          <div class="user-info">
            <span class="name clickable-name" @click="goToProfile(selectedConversation.profileToken)">{{ selectedConversation.name }}</span>
            <span v-if="isUserOnline(selectedConversation.userId)" class="status online">En ligne</span>
            <span v-else class="status offline">Hors ligne</span>
          </div>
        </div><!-- Section Rendez-vous en attente -->
        <div v-if="pendingAppointments.length > 0" class="pending-appointments" :class="{ collapsed: !showPendingAppointments }">
          <div class="pending-appointments-header" @click="showPendingAppointments = !showPendingAppointments">
            <div class="pending-appointments-title">
              <img src="../assets/icons/agenda.svg" class="pending-icon" alt="Calendar">
              <span>Rendez-vous en attente ({{ pendingAppointments.length }})</span>
            </div>            <button class="toggle-appointments-btn" type="button">
              <span class="toggle-arrow" :class="{ 'collapsed': !showPendingAppointments }">
                ▼
              </span>
            </button>
          </div>
          <div v-if="showPendingAppointments" class="pending-appointments-content">
            <div v-for="appointment in pendingAppointments" :key="appointment.id" class="pending-appointment-card">
            <div class="appointment-info">
              <div class="appointment-title">{{ appointment.title }}</div>
              <div class="appointment-date">{{ formatAppointmentDate(appointment.appointmentDate) }}</div>
              <div v-if="appointment.location" class="appointment-location">
                <img src="../assets/icons/carte.svg" class="location-icon" alt="Location"> {{ appointment.location }}
              </div>
              <div v-if="appointment.description" class="appointment-description">{{ appointment.description }}</div>              <div class="appointment-requester">
                Proposé par <span class="clickable-name" @click="goToProfile(appointment.requester.profileToken)">{{ appointment.requester.username }}</span>
              </div>
            </div>
            <div v-if="isAppointmentReceiver(appointment)" class="appointment-actions">              <button 
                @click="updateAppointmentStatus(appointment.id, 'accepted')"
                class="accept-btn"
                title="Accepter ce rendez-vous"
              >
                <img src="../assets/icons/star.svg" class="btn-action-icon" alt="Accept">
                Accepter
              </button>
              <button 
                @click="updateAppointmentStatus(appointment.id, 'declined')"
                class="decline-btn"
                title="Refuser ce rendez-vous"
              >
                <img src="../assets/icons/trash.svg" class="btn-action-icon" alt="Decline">
                Refuser
              </button>
            </div>            <div v-else class="appointment-status-waiting">
              En attente de réponse...
            </div>
          </div>
          </div>
        </div><div class="chat-messages">
          <div v-for="msg in messages" :key="msg.id" :class="['chat-message', msg.fromMe ? 'me' : 'other', msg.isAppointment ? 'appointment-message' : '']">
            <span>{{ msg.text }}</span>
            <div v-if="msg.fromMe" class="message-status">
              <span v-if="msg.status === 'sent'" class="status-icon">•</span>
              <span v-else-if="msg.status === 'delivered'" class="status-icon">✓</span>
              <span v-else-if="msg.status === 'read'" class="status-icon">✓✓</span>
            </div>
          </div>
          <!-- Indicateur de frappe -->
          <div v-if="typingUsers.size > 0" class="typing-indicator">
            <span>{{ getTypingText() }}</span>
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>        <div class="chat-input">
          <input 
            v-model="newMessage" 
            @keyup.enter="sendMessage" 
            @input="handleTyping"
            :placeholder="getInputPlaceholder()" 
            :disabled="false"
          />          <button 
            @click="showAppointmentModal = true" 
            class="appointment-btn"
            :disabled="!selectedConversation"
            title="Proposer un rendez-vous"
          >
            <img src="../assets/icons/agenda.svg" class="appointment-icon" alt="Calendar">
          </button>
          <button @click="sendMessage" :disabled="!newMessage.trim()" class="send-btn">
            <span v-if="!isMobile" class="send-text">Envoyer</span>
            <svg v-else class="send-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m22 2-7 20-4-9-9-4z"/>
              <path d="m22 2-11 11"/>
            </svg>
          </button>
        </div>
      </template>      <template v-else>
        <div class="chat-placeholder" :class="{ 'mobile-hidden': isMobile }">
          <p>Sélectionnez une discussion pour commencer à échanger !</p>
        </div></template>
    </div>

    <!-- Modal pour créer un rendez-vous -->
    <div v-if="showAppointmentModal" class="modal-overlay" @click="closeAppointmentModal">
      <div class="appointment-modal" @click.stop>
        <h3>Proposer un rendez-vous</h3>
        <form @submit.prevent="createAppointment">
          <div class="form-group">
            <label for="appointment-title">Titre du rendez-vous *</label>
            <input 
              id="appointment-title"
              v-model="appointmentForm.title" 
              type="text" 
              placeholder="Ex: Échange sur le développement web"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="appointment-date">Date *</label>
            <input 
              id="appointment-date"
              v-model="appointmentForm.date" 
              type="date" 
              :min="minDate"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="appointment-time">Heure *</label>
            <input 
              id="appointment-time"
              v-model="appointmentForm.time" 
              type="time" 
              required
            />
          </div>
          
          <div class="form-group">
            <label for="appointment-location">Lieu (optionnel)</label>
            <input 
              id="appointment-location"
              v-model="appointmentForm.location" 
              type="text" 
              placeholder="Ex: En ligne, Café du centre, etc."
            />
          </div>
          
          <div class="form-group">
            <label for="appointment-description">Description (optionnel)</label>
            <textarea 
              id="appointment-description"
              v-model="appointmentForm.description" 
              placeholder="Décrivez l'objet du rendez-vous..."
              rows="3"
            ></textarea>
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="closeAppointmentModal" class="cancel-btn">Annuler</button>
            <button type="submit" class="submit-btn" :disabled="!isAppointmentFormValid">Proposer</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api'
import socketService from '../services/socket'
import unreadMessagesService from '../services/unreadMessages'
import NotificationService from '../services/notificationService'
import eventBus from '../services/eventBus'

export default {
  name: 'Discussions',  data() {    return {      conversations: [],
      selectedConversation: null,
      messages: [],
      newMessage: '',
      loading: false,
      error: '',
      typingUsers: new Set(),
      typingTimeout: null,
      onlineUsers: new Set(),
      reconnecting: false,
      isMobile: false, // Détection mobile
      showAppointmentModal: false,
      appointmentForm: {
        title: '',
        date: '',
        time: '',
        location: '',
        description: ''      },      conversationAppointments: [], // Nouveau: rendez-vous de la conversation actuelle
      showPendingAppointments: true, // Nouveau: contrôle l'affichage des rendez-vous
      isNavbarHidden: false // Nouvel état pour tracker si la navbar est cachée
    }
  },
  computed: {
    minDate() {
      const today = new Date();
      return today.toISOString().split('T')[0];
    },
    isAppointmentFormValid() {
      return this.appointmentForm.title.trim() && 
             this.appointmentForm.date && 
             this.appointmentForm.time;
    },    // Nouveau: rendez-vous en attente pour la conversation actuelle
    pendingAppointments() {
      return this.conversationAppointments.filter(appointment => 
        appointment.status === 'pending'
      );
    },
    // Classes CSS pour la fenêtre de chat en mode mobile
    chatWindowClasses() {
      return {
        'mobile-visible': this.selectedConversation && this.isMobile,
        'mobile-hidden': !this.selectedConversation && this.isMobile,
        'navbar-hidden': this.isNavbarHidden && this.isMobile && this.selectedConversation
      };
    }
  },async created() {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
    await this.initializeWebSocket();
    await this.loadConversations();
  },
  async activated() {
    // Recharger les conversations quand le composant devient actif (utile avec keep-alive)
    await this.loadConversations();
  },  beforeUnmount() {
    // Nettoyer les listeners WebSocket
    this.cleanupSocketListeners();
    if (this.selectedConversation) {
      socketService.leaveConversation(this.selectedConversation.id);
    }
    // Nettoyer le timeout de frappe
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    // Nettoyer le service unreadMessages
    unreadMessagesService.cleanup();
    // Déconnecter le WebSocket
    socketService.disconnect();
    // Nettoyer l'event listener de resize
    window.removeEventListener('resize', this.checkMobile);
  },watch: {
    // Surveiller les changements de route pour recharger les conversations
    '$route'() {
      this.loadConversations();
    },
    // Surveiller les changements de conversation sélectionnée
    selectedConversation(newConv, oldConv) {
      if (oldConv) {
        socketService.leaveConversation(oldConv.id);
        this.typingUsers.clear();
      }
      if (newConv) {
        socketService.joinConversation(newConv.id);
        this.typingUsers.clear();
      }
    },    // Surveiller les changements du champ de saisie pour l'indicateur de frappe
    newMessage(newVal, oldVal) {
      // Logique déplacée vers handleTyping pour éviter les conflits
    }
  },
  methods: {
    // Méthode utilitaire pour générer un avatar par défaut personnalisé
    getDefaultAvatar(username) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=ECBC76&color=fff&size=128&bold=true`;
    },
    async loadConversations() {
      try {
        this.loading = true;
        this.error = '';
        const response = await api.get('/conversations');        this.conversations = response.data.map(conv => ({
          id: conv.id,
          name: conv.otherUser.username,
          avatar: conv.otherUser.avatar || this.getDefaultAvatar(conv.otherUser.username),
          profileToken: conv.otherUser.profileToken,
          userId: conv.otherUser.id,
          lastMessage: conv.lastMessage ? conv.lastMessage.content : 'Aucun message',
          lastMessageAt: conv.lastMessageAt
        }));
          // Sélectionner la première conversation par défaut si elle existe
        if (this.conversations.length > 0) {
          // Si on revient de la création d'une conversation, sélectionner la plus récente
          const mostRecentConv = this.conversations.sort((a, b) => 
            new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
          )[0];
          await this.selectConversation(mostRecentConv);
        }
      } catch (error) {
        this.error = 'Erreur lors du chargement des conversations';
        console.error('Error loading conversations:', error);
      } finally {
        this.loading = false;
      }
    },    async selectConversation(conv) {
      try {
        this.selectedConversation = conv;
        this.error = '';
          // Émettre l'événement pour cacher la navbar en mode mobile
        if (this.isMobile) {
          this.isNavbarHidden = true;
          eventBus.emit('discussion-mobile-chat-opened');
        }
        
        // Informer le service unreadMessages de la conversation active
        unreadMessagesService.setActiveConversation(conv.id);
        
        // Charger les messages
        const messagesResponse = await api.get(`/conversations/${conv.id}/messages`);        
        
        this.messages = messagesResponse.data.map(msg => ({
          id: msg.id,
          text: msg.content,
          fromMe: msg.fromMe,
          createdAt: msg.createdAt,
          sender: msg.sender,
          status: msg.fromMe ? 'delivered' : null
        }));

        // Marquer la conversation comme lue
        await unreadMessagesService.markConversationAsRead(conv.id);

        // Charger les rendez-vous de la conversation
        await this.loadConversationAppointments(conv.id);
        
        // Scroll to bottom after loading messages
        this.$nextTick(() => {
          const messagesContainer = this.$el.querySelector('.chat-messages');
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        });
      } catch (error) {
        this.error = 'Erreur lors du chargement des messages';
        console.error('Error loading messages:', error);
      }
    },async sendMessage() {
      if (this.newMessage.trim() && this.selectedConversation) {
        try {
          this.error = '';
          const messageContent = this.newMessage;
          
          const response = await api.post(`/conversations/${this.selectedConversation.id}/messages`, {
            content: messageContent
          });
            // Ajouter le nouveau message à la liste localement
          this.messages.push({
            id: response.data.id,
            text: response.data.content,
            fromMe: true,
            createdAt: response.data.createdAt,
            sender: response.data.sender,
            status: 'sent'
          });
          
          // Envoyer via WebSocket pour notification en temps réel
          if (socketService.isConnected()) {
            socketService.sendMessage(this.selectedConversation.id, {
              id: response.data.id,
              content: response.data.content,
              senderName: response.data.sender.username,
              createdAt: response.data.createdAt
            });
          }
          
          // Mettre à jour le dernier message dans la liste des conversations
          const convIndex = this.conversations.findIndex(c => c.id === this.selectedConversation.id);
          if (convIndex !== -1) {
            this.conversations[convIndex].lastMessage = messageContent;
            this.conversations[convIndex].lastMessageAt = response.data.createdAt;
          }
            this.newMessage = '';
          
          // Déclencher la vérification des notifications après envoi d'un message
          NotificationService.triggerNotificationCheck();
          
          // Scroll to bottom
          this.$nextTick(() => {
            const messagesContainer = this.$el.querySelector('.chat-messages');
            if (messagesContainer) {
              messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
          });
        } catch (error) {
          this.error = 'Erreur lors de l\'envoi du message';        console.error('Error sending message:', error);
        }
      }
    },
    async initializeWebSocket() {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Aucun token trouvé pour l\'authentification WebSocket');
        this.error = 'Vous devez être connecté pour utiliser le chat';
        return;
      }

      console.log('Initialisation de la connexion WebSocket...');
      
      try {
        await socketService.connect(token);
        console.log('WebSocket initialisé avec succès');
        
        // Initialiser l'intégration WebSocket pour les messages non lus
        const userId = this.$store?.state?.user?.id;
        if (userId) {
          unreadMessagesService.initWebSocketIntegration(socketService, userId);
        }
        
        this.setupSocketListeners();
        this.error = ''; // Effacer les erreurs précédentes
      } catch (error) {
        console.error('Erreur lors de l\'initialisation WebSocket:', error);
        if (error.message.includes('Token invalide')) {
          this.error = 'Session expirée, veuillez vous reconnecter';
          // Optionnel : rediriger vers la page de connexion
          // this.$router.push('/login');
        } else {
          this.error = 'Erreur de connexion au serveur de discussion';
        }
      }
    },setupSocketListeners() {
      socketService.onNewMessage(this.handleNewMessage);
      socketService.onUserTyping(this.handleUserTyping);
      socketService.onOnlineUsers(this.handleOnlineUsers);
      socketService.onUserConnected(this.handleUserConnected);
      socketService.onUserDisconnected(this.handleUserDisconnected);
      socketService.onMessageStatus(this.handleMessageStatus);
      
      // Demander la liste des utilisateurs en ligne
      socketService.getOnlineUsers();
    },cleanupSocketListeners() {
      socketService.offNewMessage();
      socketService.offUserTyping();
      socketService.removeAllListeners();
    },handleNewMessage(message) {
      console.log('Nouveau message reçu:', message);
      
      // Ajouter le message à la conversation sélectionnée
      if (this.selectedConversation && this.selectedConversation.id == message.conversationId) {
        this.messages.push({
          id: message.id,
          text: message.content,
          fromMe: message.senderId == this.$store?.state?.user?.id || false,
          createdAt: message.createdAt,
          sender: { username: message.senderName }
        });
        
        // Scroll to bottom
        this.$nextTick(() => {
          const messagesContainer = this.$el.querySelector('.chat-messages');
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        });
      }
      
      // Mettre à jour la liste des conversations si nécessaire
      const convIndex = this.conversations.findIndex(c => c.id == message.conversationId);
      if (convIndex !== -1) {
        this.conversations[convIndex].lastMessage = message.content;
        this.conversations[convIndex].lastMessageAt = message.createdAt;
        
        // Trier les conversations par dernier message
        this.conversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
      }
    },    handleUserTyping({ userId, isTyping, conversationId }) {
      if (this.selectedConversation && this.selectedConversation.id == conversationId) {
        if (isTyping) {
          this.typingUsers.add(userId);
        } else {
          this.typingUsers.delete(userId);
        }
        
        // Forcer la mise à jour du DOM pour l'indicateur de frappe
        this.$nextTick(() => {
          const messagesContainer = this.$el.querySelector('.chat-messages');
          if (messagesContainer && this.typingUsers.size > 0) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        });
      }
    },
    handleOnlineUsers(users) {
      this.onlineUsers = new Set(users);
    },

    handleUserConnected(data) {
      this.onlineUsers.add(data.userId);
    },

    handleUserDisconnected(data) {
      this.onlineUsers.delete(data.userId);
    },    isUserOnline(userId) {
      return this.onlineUsers.has(userId);
    },
    getInputPlaceholder() {
      if (!this.selectedConversation) {
        return "Écrire un message...";
      }
      
      if (this.isUserOnline(this.selectedConversation.userId)) {
        return "Écrire un message...";
      } else {
        return "Écrire un message (utilisateur hors ligne)...";
      }
    },
    getTypingText() {
      if (this.typingUsers.size === 1) {
        return "En train d'écrire...";
      } else if (this.typingUsers.size > 1) {
        return `${this.typingUsers.size} personnes écrivent...`;
      }
      return "";
    },
    handleTyping() {
      if (this.selectedConversation) {
        if (this.newMessage.length > 0) {
          socketService.sendTyping(this.selectedConversation.id, true);
          
          if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
          }
          
          this.typingTimeout = setTimeout(() => {
            if (this.selectedConversation) {
              socketService.sendTyping(this.selectedConversation.id, false);
            }
          }, 2000);
        } else {
          socketService.sendTyping(this.selectedConversation.id, false);
          if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
          }
        }
      }
    },
    handleMessageStatus(data) {
      const { messageId, status } = data;
      const messageIndex = this.messages.findIndex(msg => msg.id === messageId);
      if (messageIndex !== -1) {
        this.messages[messageIndex].status = status;
      }
    },
    // Méthodes pour les rendez-vous
    async loadConversationAppointments(conversationId) {
      try {
        const response = await api.get(`/appointments/conversation/${conversationId}`);
        this.conversationAppointments = response.data;
      } catch (error) {
        console.error('Error loading conversation appointments:', error);
        this.conversationAppointments = [];
      }
    },
    async updateAppointmentStatus(appointmentId, status) {
      try {
        await api.patch(`/appointments/${appointmentId}/status`, { status });
          // Recharger les rendez-vous de la conversation
        if (this.selectedConversation) {
          await this.loadConversationAppointments(this.selectedConversation.id);
        }
        
        // Déclencher la vérification des notifications après mise à jour du statut
        NotificationService.triggerNotificationCheck();
        
        // Ajouter un message de confirmation dans le chat
        const statusMessages = {
          accepted: 'a accepté',
          declined: 'a refusé'
        };
        
        const appointment = this.conversationAppointments.find(apt => apt.id === appointmentId);
        if (appointment) {
          const systemMessage = `Vous avez ${statusMessages[status]} le rendez-vous "${appointment.title}"`;
          
          this.messages.push({
            id: Date.now(),
            text: systemMessage,
            fromMe: true,
            createdAt: new Date().toISOString(),
            sender: { username: 'Système' },
            status: 'delivered',
            isAppointment: true
          });

          // Scroll to bottom
          this.$nextTick(() => {
            const messagesContainer = this.$el.querySelector('.chat-messages');
            if (messagesContainer) {
              messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
          });
        }
      } catch (error) {
        this.error = 'Erreur lors de la mise à jour du rendez-vous';
        console.error('Error updating appointment status:', error);
      }
    },
    formatAppointmentDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    isAppointmentReceiver(appointment) {
      const currentUserId = this.$store?.state?.user?.id;
      return appointment.receiverId === currentUserId;
    },
    closeAppointmentModal() {
      this.showAppointmentModal = false;
      this.resetAppointmentForm();
    },
    resetAppointmentForm() {
      this.appointmentForm = {
        title: '',
        date: '',
        time: '',
        location: '',
        description: ''
      };
    },    async createAppointment() {
      if (!this.isAppointmentFormValid || !this.selectedConversation) {
        return;
      }

      try {
        this.error = '';
        
        // Combiner date et heure
        const appointmentDateTime = new Date(`${this.appointmentForm.date}T${this.appointmentForm.time}`);
        
        const appointmentData = {
          receiverId: this.selectedConversation.userId,
          conversationId: this.selectedConversation.id,
          title: this.appointmentForm.title,
          description: this.appointmentForm.description,
          appointmentDate: appointmentDateTime.toISOString(),
          location: this.appointmentForm.location
        };

        const response = await api.post('/appointments', appointmentData);
        
        // Fermer le modal et réinitialiser le formulaire
        this.closeAppointmentModal();        // Recharger les rendez-vous de la conversation
        await this.loadConversationAppointments(this.selectedConversation.id);
        
        // Déclencher la vérification des notifications après création du rendez-vous
        NotificationService.triggerNotificationCheck();
        
        // Ajouter un message système dans la conversation pour informer du rendez-vous
        const systemMessage = `Rendez-vous proposé: "${this.appointmentForm.title}" le ${new Date(appointmentDateTime).toLocaleDateString('fr-FR')} à ${this.appointmentForm.time}`;
        
        this.messages.push({
          id: Date.now(), // ID temporaire
          text: systemMessage,
          fromMe: true,
          createdAt: new Date().toISOString(),
          sender: { username: 'Système' },
          status: 'sent',
          isAppointment: true
        });

        // Scroll to bottom
        this.$nextTick(() => {
          const messagesContainer = this.$el.querySelector('.chat-messages');
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        });        console.log('Rendez-vous créé:', response.data);
      } catch (error) {
        this.error = 'Erreur lors de la création du rendez-vous';
        console.error('Error creating appointment:', error);
      }
    },    // Méthode pour naviguer vers le profil d'un utilisateur
    goToProfile(profileToken) {
      if (profileToken) {
        this.$router.push(`/profile/${profileToken}`);
      }
    },
    
    // Méthodes pour la responsivité mobile
    checkMobile() {
      this.isMobile = window.innerWidth <= 902;
    },    goBackToDiscussions() {
      this.selectedConversation = null;
      
      // Émettre l'événement pour réafficher la navbar en mode mobile
      if (this.isMobile) {
        this.isNavbarHidden = false;
        eventBus.emit('discussion-mobile-chat-closed');
      }
    },
  }
}
</script>

<style scoped>
.discussions-page {
  display: flex;
  flex-direction: row;
  gap: 32px;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  height: calc(100vh - 120px); /* Account for navbar and padding */
  min-height: 0;
  box-sizing: border-box;
}
.discussions-list {
  width: 320px;
  background: #fff4e3;
  border-radius: 16px;
  box-shadow: 0 2px 8px #0001;
  padding: 18px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
}

.discussions-header {
  padding: 0 22px 16px 22px;
  border-bottom: 1px solid #f0d08a;
  margin-bottom: 8px;
}

.discussions-header h2 {
  margin: 0;
  color: #28303F;
  font-size: 1.3rem;
  font-weight: 600;
}
.loading {
  text-align: center;
  color: #888;
  padding: 20px;
}
.error {
  color: #d00;
  text-align: center;
  padding: 10px;
  margin: 0 18px;
  background: #fee;
  border-radius: 8px;
}
.discussion-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 22px;
  cursor: pointer;
  border-radius: 10px;
  transition: background 0.15s;
}
.discussion-item:hover {
  background: #ffe7c2;
}
.discussion-item.active {
  background: #ffe7c2;
  box-shadow: 0 2px 8px #ecbc76aa;
}
.avatar-container {
  position: relative;
  display: inline-block;
}
.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #4CAF50;
  border: 2px solid #fff;
  border-radius: 50%;
}
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #ecbc76;
}
.info {
  flex: 1;
}
.name {
  font-weight: 600;
  color: #28303F;
  font-size: 1.08rem;
}
.clickable-name {
  cursor: pointer;
  transition: color 0.2s ease;
}
.clickable-name:hover {
  color: #ECBC76;
  text-decoration: underline;
}
.last-message {
  color: #888;
  font-size: 0.97rem;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.status {
  font-size: 0.85rem;
  font-weight: 500;
}
.status.online {
  color: #4CAF50;
}
.status.offline {
  color: #999;
}
.chat-window {
  flex: 1;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px #0001;
  display: flex;
  flex-direction: column;
  padding: 0 0 0 0;
  min-width: 0;
  height: 100%;
  min-height: 0;
  position: relative; /* Nécessaire pour le positionnement absolu des rendez-vous */
}
.chat-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 24px;
  border-bottom: 1.5px solid #eee;
}

.back-button {
  background: none;
  border: none;
  color: #28303F;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: none; /* Hidden by default on desktop */
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  margin-right: 8px;
}

.back-button:hover {
  background: #f5f5f5;
}
.chat-messages {
  flex: 1;
  padding: 18px 24px;
  padding-top: 100px; /* Espace pour les rendez-vous en position absolue */
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 200px; /* Hauteur minimale pour éviter les problèmes */
}
.chat-message {
  max-width: 70%;
  padding: 10px 18px;
  border-radius: 16px;
  font-size: 1.05rem;
  margin-bottom: 4px;
  word-break: break-word;
  align-self: flex-start;
  background: #f5f5f5;
}
.chat-message.me {
  background: #ecbc76;
  color: #28303F;
  align-self: flex-end;
}

/* Indicateur de frappe */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  color: #666;
  font-style: italic;
  font-size: 0.9rem;
}

.typing-dots {
  display: flex;
  gap: 3px;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: #999;
  border-radius: 50%;
  animation: typing-dot 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing-dot {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
.chat-input {
  display: flex;
  gap: 8px;
  padding: 18px 24px;
  border-top: 1.5px solid #eee;
}
.chat-input input {
  flex: 1;
  padding: 10px 16px;
  border-radius: 10px;
  border: 1.5px solid #ecbc76;
  font-size: 1rem;
  cursor: text;
}
.chat-input input:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}
.chat-input input:focus {
  outline: none;
  border-color: #d4a562;
  cursor: text;
}
.chat-input button {
  background: #ecbc76;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 22px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.chat-input button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.chat-input button:disabled:hover {
  background: #ccc;
}
.chat-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px 24px;
  text-align: center;
  color: #888;
  font-size: 1.1rem;
}
.message-status {
  font-size: 0.75rem;
  margin-top: 2px;
  text-align: right;
}

.status-icon {
  opacity: 0.7;
}
/* Bouton calendrier */
.appointment-btn {
  background: #ECBC76 !important;
  color: #28303F !important;
  width: 48px !important;
  height: 48px !important;
  padding: 0 !important;
  font-size: 1.2rem !important;
  border-radius: 50% !important;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  align-self: center !important;
}

.appointment-btn:hover:not(:disabled) {
  background: #e4a94f !important;
  transform: scale(1.05);
}

.appointment-btn:disabled {
  background: #ccc !important;
  cursor: not-allowed !important;
}

/* Bouton d'envoi */
.send-btn {
  background: #ECBC76 !important;
  color: #28303F !important;
  border: none;
  border-radius: 10px;
  padding: 10px 22px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 48px;
}

.send-btn:hover:not(:disabled) {
  background: #e4a94f !important;
}

.send-btn:disabled {
  background: #ccc !important;
  cursor: not-allowed !important;
}

.send-text {
  font-weight: 600;
}

.send-icon {
  width: 20px;
  height: 20px;
  stroke: currentColor;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.appointment-modal {
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.appointment-modal h3 {
  margin: 0 0 20px 0;
  color: #28303F;
  font-size: 1.4rem;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #28303F;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #ecbc76;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #d4a562;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.cancel-btn {
  background: #f5f5f5;
  color: #28303F;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.submit-btn {
  background: #4A90E2;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.submit-btn:hover:not(:disabled) {
  background: #357ABD;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Message de rendez-vous */
.chat-message.appointment-message {
  background: linear-gradient(135deg, #4A90E2, #357ABD) !important;
  color: white !important;
  border-left: 4px solid #2E5984;
  font-weight: 500;
}

.chat-message.appointment-message.me {
  background: linear-gradient(135deg, #4A90E2, #357ABD) !important;
}

/* SOLUTION POSITION ABSOLUTE : Les rendez-vous flottent et ne prennent jamais de place */
.pending-appointments {
  position: absolute;
  top: 93px; /* Juste en dessous du header */
  left: 0;
  right: 0;
  z-index: 50;
  background: #fff9e6;
  border-bottom: 1px solid #f0d08a;
  transition: all 0.3s ease;
  max-height: 300px;
  overflow: hidden;
}

.pending-appointments.collapsed {
  max-height: 50px; /* Garde juste le header visible pour pouvoir cliquer */
}

.pending-appointments.collapsed .pending-appointments-content {
  display: none; /* Cache seulement le contenu, pas le header */
}

/* Quand il n'y a pas de rendez-vous, on cache complètement */
.pending-appointments:empty {
  display: none !important;
}

/* Ajuster le padding des messages selon l'état des rendez-vous */
.chat-window:not(:has(.pending-appointments)) .chat-messages,
.chat-window:has(.pending-appointments.collapsed) .chat-messages {
  padding-top: 18px; /* Padding normal quand pas de rendez-vous ou collapsés */
}

.pending-appointments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.pending-appointments-header:hover {
  background: #f5f0d6;
}

.pending-appointments-title {
  font-weight: 600;
  color: #b8860b;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-appointments-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.toggle-appointments-btn:hover {
  background: rgba(184, 134, 11, 0.1);
}

.toggle-arrow {
  font-size: 14px;
  color: #b8860b;
  transition: transform 0.3s ease;
  user-select: none;
}

.toggle-arrow.collapsed {
  transform: rotate(-90deg);
}

.pending-appointments-content {
  padding: 0 24px 16px 24px;
  max-height: 300px;
  overflow-y: auto;
  animation: slideDown 0.3s ease;
}

.pending-appointment-card {
  background: white;
  border: 1px solid #e6cc80;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.pending-appointment-card:last-child {
  margin-bottom: 0;
}

.appointment-info {
  flex: 1;
}

.appointment-title {
  font-weight: 600;
  color: #28303F;
  margin-bottom: 4px;
  font-size: 1rem;
}

.appointment-date {
  color: #b8860b;
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 2px;
}

.appointment-location {
  color: #666;
  font-size: 0.85rem;
  margin-bottom: 2px;
}

.appointment-description {
  color: #666;
  font-size: 0.85rem;
  font-style: italic;
  margin-bottom: 4px;
}

.appointment-requester {
  color: #888;
  font-size: 0.8rem;
}

.appointment-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.accept-btn {
  background: #4A90E2;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.accept-btn:hover {
  background: #357ABD;
}

.decline-btn {
  background: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.decline-btn:hover {
  background: #da190b;
}

.appointment-status-waiting {
  color: #888;
  font-size: 0.85rem;
  font-style: italic;
  align-self: center;
  flex-shrink: 0;
}

/* Icon styles for discussions */
.pending-icon {
  width: 16px;
  height: 16px;
  filter: brightness(0) saturate(100%) invert(69%) sepia(74%) saturate(424%) hue-rotate(35deg) brightness(87%) contrast(91%);
}

.location-icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
  filter: brightness(0) saturate(100%) invert(47%) sepia(18%) saturate(1094%) hue-rotate(195deg) brightness(95%) contrast(87%);
}

.appointment-icon {
  width: 18px;
  height: 18px;
  filter: brightness(0) saturate(100%) invert(18%) sepia(15%) saturate(1239%) hue-rotate(195deg) brightness(96%) contrast(91%);
  /* #28303F color filter */
}

.btn-action-icon {
  width: 14px;
  height: 14px;
  margin-right: 6px;
  vertical-align: middle;
  filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);
}

/* Responsive Design */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1350px) {
  .discussions-page {
    max-width: 95%;
    padding: 15px;
    gap: 20px;
    height: calc(100vh - 100px);
  }
}

@media (max-width: 1200px) {
  .discussions-page {
    max-width: 95%;
    padding: 15px;
    gap: 20px;
    height: calc(100vh - 100px);
  }
  
  .discussions-list {
    width: 280px;
  }
  
  .appointment-modal {
    width: 85%;
    max-width: 450px;
  }
}

@media (max-width: 902px) {
  .discussions-page {
    flex-direction: column;
    gap: 0;
    padding: 10px;
    height: calc(100vh - 80px); /* Account for bottom navbar */
    max-width: 100%;
  }
    .discussions-list {
    width: 100%;
    height: calc(100vh - 96px); /* Prend toute la hauteur disponible sur mobile */
    min-height: calc(100vh - 96px);
    border-radius: 12px;
    margin-bottom: 0;
    transition: transform 0.3s ease;
  }
  
  .discussions-list.mobile-hidden {
    transform: translateX(-100%);
    position: absolute;
    z-index: -1;
    opacity: 0;
  }  .chat-window {
    width: 100%;
    height: 80vh;
    min-height: 350px;
    border-radius: 0 0 12px 12px;
    border-top: 1px solid #ddd;
    transition: transform 0.3s ease;
  }.chat-window.mobile-visible {
    width: 100vw; /* Force full viewport width */
    height: calc(100vh - 80px);
    border-radius: 0; /* Remove border radius for full coverage */
    border-top: none;
    display: flex;
    flex-direction: column;
    position: fixed; /* Fix position to cover entire screen */
    top: 0;
    left: 0;
    z-index: 100;
    margin: 0;
    padding: 0;
  }
    /* When navbar is hidden in mobile chat mode */
  .chat-window.mobile-visible.navbar-hidden {
    height: 100vh;
    width: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    border-radius: 0;
  }
    .chat-window.mobile-visible .chat-messages {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 0;
    padding-bottom: 20px; /* Reduced padding for tight spacing */
    height: calc(100vh - 160px); /* viewport - navbar(80px) - input field space(80px) */
    max-height: calc(100vh - 160px);
    min-height: 200px;
  }
  /* When navbar is hidden, messages take full height minus input */  .chat-window.mobile-visible.navbar-hidden .chat-messages {    height: 80vh !important;
    max-height: 80vh !important;
    padding-bottom: 10px;
  }
    .chat-window.mobile-visible .chat-input {
    position: fixed;
    bottom: 80px; /* Position just above the mobile navbar */
    left: 0;
    right: 0;
    background: white;
    border-top: 1px solid #eee;
    z-index: 101;
    flex-shrink: 0;
    margin: 0;
    padding: 14px 18px;
  }
  
  /* When navbar is hidden, position input at very bottom */
  .chat-window.mobile-visible.navbar-hidden .chat-input {
    bottom: 0; /* At the very bottom when navbar is hidden */
    padding: 12px 16px; /* Slightly reduced padding */
  }
    .back-button {
    display: flex !important;
  }
  
  .mobile-hidden {
    display: none !important;
  }
  
  .mobile-visible {
    display: block !important;
  }
  
  .chat-header {
    padding: 14px 18px;
    border-bottom: 1px solid #eee;
  }
    .chat-messages {
    padding: 14px 18px;
    padding-top: 80px; /* Espace ajusté pour mobile avec rendez-vous */
    gap: 8px;
  }
  
  /* Ajuster le padding pour mobile selon l'état des rendez-vous */
  .chat-window:not(:has(.pending-appointments)) .chat-messages,
  .chat-window:has(.pending-appointments.collapsed) .chat-messages {
    padding-top: 14px; /* Padding normal mobile quand pas de rendez-vous ou collapsés */
  }
  
  .chat-input {
    padding: 14px 18px;
    gap: 12px;
  }
  
  .chat-input input {
    font-size: 16px; /* Prevents zoom on iOS */
    padding: 12px 14px;
  }
  
  .chat-input button {
    padding: 12px 18px;
    white-space: nowrap;
  }
  
  .appointment-btn {
    width: 44px !important;
    height: 44px !important;
    min-width: 44px;
  }
  
  .appointment-icon {
    width: 20px;
    height: 20px;
  }
    .chat-message {
    max-width: 85%;
    padding: 12px 16px;
    font-size: 15px;
    line-height: 1.4;
  }
  
  .pending-appointments {
    top: 69px; /* Position ajustée pour le header mobile plus petit */
    border-radius: 8px;
  }
  
  .pending-appointment-card {
    margin: 8px 12px;
  }
  
  .pending-appointments-header {
    padding: 14px 16px;
  }
  
  .pending-appointments-content {
    padding: 0 16px 14px 16px;
  }
  
  .pending-appointment-card {
    padding: 14px;
    margin-bottom: 12px;
  }
  
  .appointment-actions {
    flex-direction: column;
    gap: 8px;
    margin-top: 12px;
  }
  
  .accept-btn, .decline-btn {
    width: 100%;
    justify-content: center;
    padding: 10px 16px;
    font-size: 14px;
  }
}

@media (max-width: 600px) {
  .discussions-page {
    padding: 8px;
    gap: 0;
    height: calc(100vh - 74px); /* Account for mobile bottom navbar */
  }
    .discussions-list {
    height: calc(100vh - 90px); /* Prend toute la hauteur disponible */
    min-height: calc(100vh - 90px);
    padding: 12px 0;
    border-radius: 12px;
  }
  
  .chat-window {
    height: 65vh;
    min-height: 300px;
    border-radius: 0 0 8px 8px;
  }
  
  .discussion-item {
    padding: 12px 16px;
    margin: 0 8px;
    border-radius: 8px;
  }
  
  .discussion-item .avatar {
    width: 45px;
    height: 45px;
  }
  
  .discussion-item .info .name {
    font-size: 15px;
    font-weight: 600;
  }
  
  .discussion-item .info .last-message {
    font-size: 13px;
    line-height: 1.3;
  }
  
  .chat-header {
    padding: 12px 16px;
  }
  
  .chat-header .avatar {
    width: 40px;
    height: 40px;
  }
  
  .chat-header .name {
    font-size: 16px;
    font-weight: 600;
  }
  
  .chat-header .status {
    font-size: 13px;
  }
  
  .chat-messages {
    padding: 12px 16px;
    gap: 6px;
  }
  .chat-input {
    padding: 12px 16px;
    gap: 10px;
  }
  .chat-window.mobile-visible .chat-input {
    position: fixed;
    bottom: 85px; /* Positioned just above bottom navbar for 600px screens */
    left: 0;
    right: 0;
    background: white;
    border-top: 1px solid #eee;
    z-index: 101; /* Higher than chat window */
    margin: 0;
    padding: 12px 16px;
  }
  
  /* When navbar is hidden at 600px breakpoint */
  .chat-window.mobile-visible.navbar-hidden .chat-input {
    bottom: 0; /* At the very bottom when navbar is hidden */
    padding: 10px 14px;
  }
  
  .chat-window.mobile-visible.navbar-hidden {
    height: 100vh;
  }
    .chat-window.mobile-visible.navbar-hidden .chat-messages {
    height: calc(100vh - 80px); /* Full viewport minus input field (estimate 80px total) */
    max-height: calc(100vh - 80px);
    padding-bottom: 15px; /* Tight spacing */
  }
  
  .chat-input input {
    font-size: 16px; /* Prevents zoom on iOS */
    padding: 12px 14px;
    border-radius: 8px;
  }
  
  .chat-input button {
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
  }
  
  .appointment-btn {
    width: 42px !important;
    height: 42px !important;
    min-width: 42px;
  }
  
  .appointment-modal {
    width: 95%;
    max-width: none;
    margin: 10px;
    padding: 20px;
    border-radius: 12px;
    max-height: 85vh;
  }
  
  .appointment-modal h3 {
    font-size: 1.2rem;
    margin-bottom: 16px;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  .form-group label {
    font-size: 14px;
    margin-bottom: 6px;
  }
  
  .form-group input,
  .form-group textarea {
    font-size: 16px; /* Prevents zoom on iOS */
    padding: 12px;
    border-radius: 8px;
  }
  
  .modal-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .modal-actions button {
    width: 100%;
    padding: 12px;
    font-size: 16px;
  }
  
  .pending-appointments {
    /* margin: 6px 8px; */
    border-radius: 6px;
  }
  
  .pending-appointments-header {
    padding: 12px 14px;
  }
  
  .pending-appointments-title {
    font-size: 0.85rem;
  }
  
  .pending-appointments-content {
    padding: 0 14px 12px 14px;
  }
  
  .pending-appointment-card {
    padding: 12px;
    margin-bottom: 10px;
    border-radius: 6px;
  }
  
  .appointment-title {
    font-size: 14px;
    font-weight: 600;
  }
  
  .appointment-date,
  .appointment-location,
  .appointment-description,
  .appointment-requester {
    font-size: 13px;
    line-height: 1.3;
  }
  
  .typing-indicator {
    font-size: 13px;
    padding: 6px 10px;
  }
  
  .online-indicator {
    width: 12px;
    height: 12px;
    bottom: 2px;
    right: 2px;
  }
}

@media (max-width: 480px) {  .discussions-page {
    padding: 5px;
    height: 80vh;
  }
    .discussions-list {
    height: calc(100vh - 80px); /* Prend toute la hauteur disponible */
    min-height: calc(100vh - 80px);
    padding: 8px 0;
  }
  
  .chat-window {
    height: 68vh;
    min-height: 280px;
  }  .chat-window.mobile-visible {    width: 100vw;
    height: 80vh;
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    border-radius: 0;
    margin: 0;
    padding: 0;
  }
  .chat-window.mobile-visible .chat-messages {
    flex: 1;
    overflow-y: auto;
    height: calc(100vh - 160px); /* viewport - navbar(90px) - input field space(70px) */
    max-height: calc(100vh - 160px);
    min-height: 180px;
    padding-bottom: 15px; /* Tight spacing */
  }.chat-window.mobile-visible .chat-input {
    position: fixed;
    bottom: 90px; /* Positioned just above bottom navbar for 480px screens */
    left: 0;
    right: 0;
    background: white;
    border-top: 1px solid #eee;
    z-index: 101;
    flex-shrink: 0;
    margin: 0;
    padding: 10px 12px;
  }
    /* When navbar is hidden at 480px breakpoint */
  .chat-window.mobile-visible.navbar-hidden .chat-input {
    bottom: 0; /* At the very bottom when navbar is hidden */
    padding: 8px 10px;
  }
  
  .chat-window.mobile-visible.navbar-hidden {
    height: 100vh;
    width: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    border-radius: 0;
  }  .chat-window.mobile-visible.navbar-hidden .chat-messages {    height: 80vh;
    max-height: 80vh;
    padding-bottom: 10px; /* Very tight spacing */
  }
  
  .discussion-item {
    padding: 10px 12px;
    margin: 0 6px;
  }
  
  .discussion-item .avatar {
    width: 42px;
    height: 42px;
  }
  
  .chat-header {
    padding: 10px 12px;
  }
  
  .chat-messages {
    padding: 10px 12px;
  }
    .chat-input {
    padding: 10px 12px;
    gap: 8px;
  }
  
  .chat-input input {
    padding: 10px 12px;
    font-size: 16px;
  }
  
  .chat-input button {
    padding: 10px 14px;
    font-size: 13px;
  }
  
  .appointment-btn {
    width: 40px !important;
    height: 40px !important;
    min-width: 40px;
  }
  
  .appointment-icon {
    width: 18px;
    height: 18px;
  }
  
  .chat-message {
    max-width: 90%;
    padding: 10px 14px;
    font-size: 14px;
  }
  
  .appointment-modal {
    margin: 5px;
    padding: 16px;
    max-height: 90vh;
  }
  
  /* .pending-appointments {
    margin: 4px 6px;
  } */
  
  .pending-appointments-header {
    padding: 10px 12px;
  }
  
  .pending-appointments-content {
    padding: 0 12px 10px 12px;
  }
}
</style>
