<template>
  <div class="discussions-page">
    <div class="discussions-list">
      <button class="new-discussion-btn" @click="showNewDiscussion = true">+ Nouvelle discussion</button>
      <div v-if="showNewDiscussion" class="new-discussion-form">
        <input v-model="newDiscussionName" placeholder="Nom du contact" />
        <input v-model="newDiscussionMessage" placeholder="Premier message" @keyup.enter="createDiscussion" />
        <button @click="createDiscussion">Créer</button>
        <button @click="showNewDiscussion = false">Annuler</button>
      </div>
      <div v-if="loading" class="loading">Chargement...</div>
      <div v-if="error" class="error">{{ error }}</div>      <div v-for="conv in conversations" :key="conv.id" class="discussion-item" :class="{ active: selectedConversation && selectedConversation.id === conv.id }" @click="selectConversation(conv)">
        <div class="avatar-container">
          <img :src="conv.avatar" class="avatar" />
          <div v-if="isUserOnline(conv.userId)" class="online-indicator"></div>        </div>
        <div class="info">
          <div class="name">{{ conv.name }}</div>
          <div class="last-message">{{ conv.lastMessage }}</div>
        </div>
      </div>
    </div>
    <div class="chat-window">      <template v-if="selectedConversation">        <div class="chat-header">
          <div class="avatar-container">
            <img :src="selectedConversation.avatar" class="avatar" />
            <div v-if="isUserOnline(selectedConversation.userId)" class="online-indicator"></div>          </div>
          <div class="user-info">
            <span class="name clickable-name" @click="goToProfile(selectedConversation.profileToken)">{{ selectedConversation.name }}</span>
            <span v-if="isUserOnline(selectedConversation.userId)" class="status online">En ligne</span>
            <span v-else class="status offline">Hors ligne</span>
          </div>
        </div>        <!-- Section Rendez-vous actifs -->
        <div v-if="pendingAppointments.length > 0" class="pending-appointments">
          <div class="pending-appointments-title" @click="togglePendingAppointments">
            <div class="title-content">
              <img src="../assets/icons/agenda.svg" class="pending-icon" alt="Calendar">
              <span>Rendez-vous actifs ({{ pendingAppointments.length }})</span>
            </div>
            <div class="toggle-arrow" :class="{ 'collapsed': !showPendingAppointments }">
              ▼
            </div>
          </div>
          <div v-if="showPendingAppointments" class="pending-appointments-content">
            <div v-for="appointment in pendingAppointments" :key="appointment.id" class="pending-appointment-card">            <div class="appointment-info">
              <div class="appointment-header">
                <div class="appointment-title">{{ appointment.title }}</div>
                <div class="appointment-status-badge" :class="`status-${appointment.status}`">
                  {{ getStatusText(appointment.status) }}
                </div>
              </div>
              <div class="appointment-date">{{ formatAppointmentDate(appointment.appointmentDate) }}</div>
              <div v-if="appointment.location" class="appointment-location">
                <img src="../assets/icons/carte.svg" class="location-icon" alt="Location"> {{ appointment.location }}
              </div>
              <div v-if="appointment.description" class="appointment-description">{{ appointment.description }}</div>              <div class="appointment-requester">
                Proposé par <span class="clickable-name" @click="goToProfile(appointment.requester.profileToken)">{{ appointment.requester.username }}</span>              </div>
            </div><!-- Actions pour les rendez-vous reçus -->
            <div v-if="isAppointmentReceiver(appointment) && appointment.status === 'pending'" class="appointment-actions">              <button 
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
            </div>
            
            <!-- Actions pour les rendez-vous envoyés en attente -->
            <div v-else-if="!isAppointmentReceiver(appointment) && appointment.status === 'pending'" class="appointment-actions">
              <button 
                @click="updateAppointmentStatus(appointment.id, 'cancelled')"
                class="cancel-btn"
                title="Annuler ce rendez-vous"
              >
                <img src="../assets/icons/trash.svg" class="btn-action-icon" alt="Cancel">
                Annuler
              </button>
              <div class="appointment-status-waiting">
                En attente de réponse...
              </div>
            </div>
            
            <!-- Actions pour les rendez-vous acceptés -->
            <div v-else-if="appointment.status === 'accepted'" class="appointment-actions">
              <button 
                @click="updateAppointmentStatus(appointment.id, 'cancelled')"
                class="cancel-btn"
                title="Annuler ce rendez-vous"
              >
                <img src="../assets/icons/trash.svg" class="btn-action-icon" alt="Cancel">
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
        </div><div class="chat-messages">
          <div v-for="msg in messages" :key="msg.id" :class="['chat-message', msg.fromMe ? 'me' : 'other', msg.isAppointment ? 'appointment-message' : '']">
            <span>{{ msg.text }}</span>            <div v-if="msg.fromMe" class="message-status">
              <span v-if="msg.status === 'sent'" class="status-icon">•</span>
              <span v-else-if="msg.status === 'delivered'" class="status-icon">
                <img src="@/assets/icons/check.svg" alt="Livré" class="status-check-icon" />
              </span>
              <span v-else-if="msg.status === 'read'" class="status-icon">
                <img src="@/assets/icons/check.svg" alt="Lu" class="status-check-icon" />
                <img src="@/assets/icons/check.svg" alt="Lu" class="status-check-icon status-check-double" />
              </span>
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
          <button @click="sendMessage" :disabled="!newMessage.trim()">Envoyer</button>
        </div>
      </template>
      <template v-else>
        <div class="chat-placeholder">
          <p>Sélectionnez une discussion pour commencer à échanger !</p>
        </div>      </template>
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

    <!-- Dialogue de confirmation pour la fermeture du modal -->
    <div v-if="showConfirmCloseModal" class="modal-overlay confirmation-overlay" @click="cancelCloseConfirmation">
      <div class="confirmation-dialog" @click.stop>
        <div class="confirmation-header">
          <h3>Confirmer la fermeture</h3>
        </div>
        <div class="confirmation-body">
          <p>Vous avez commencé à remplir le formulaire de rendez-vous. Êtes-vous sûr de vouloir fermer cette fenêtre ? Vos modifications seront perdues.</p>
        </div>
        <div class="confirmation-actions">
          <button @click="cancelCloseConfirmation" class="btn btn-cancel">Continuer l'édition</button>
          <button @click="forceCloseAppointmentModal" class="btn btn-confirm">Fermer sans sauvegarder</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api'
import socketService from '../services/socket'
import unreadMessagesService from '../services/unreadMessages'
import NotificationService from '../services/notificationService'
import AuthService from '../services/authService'

export default {
  name: 'Discussions',  data() {    return {
      conversations: [],
      selectedConversation: null,
      messages: [],
      newMessage: '',
      showNewDiscussion: false,
      newDiscussionName: '',
      newDiscussionMessage: '',
      loading: false,
      error: '',
      typingUsers: new Set(),
      typingTimeout: null,
      onlineUsers: new Set(),
      reconnecting: false,      showAppointmentModal: false,
      appointmentForm: {
        title: '',
        date: '',
        time: '',
        location: '',
        description: ''      },
      conversationAppointments: [], // Nouveau: rendez-vous de la conversation actuelle
      showConfirmCloseModal: false, // Pour le dialogue de confirmation
      showPendingAppointments: true, // Pour cacher/afficher les rendez-vous en attente
      currentUser: null // Utilisateur connecté
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
    },    // Nouveau: rendez-vous actifs pour la conversation actuelle (pending et acceptés)
    pendingAppointments() {
      return this.conversationAppointments.filter(appointment => 
        appointment.status === 'pending' || appointment.status === 'accepted'
      );
    },
    // Tous les rendez-vous incluant les annulés récents (pour l'historique)
    allAppointments() {
      return this.conversationAppointments.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
    }  },
  async created() {
    await this.loadCurrentUser();
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
  },  methods: {
    // Méthode utilitaire pour générer un avatar par défaut personnalisé
    getDefaultAvatar(username) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=ECBC76&color=fff&size=128&bold=true`;
    },
    // Charger les informations de l'utilisateur connecté
    async loadCurrentUser() {      try {
        this.currentUser = await AuthService.getUserInfo();
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur connecté:', error);
        this.currentUser = null;
      }
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
          this.error = 'Erreur lors de l\'envoi du message';
          console.error('Error sending message:', error);
        }
      }
    },
    async createDiscussion() {
      if (this.newDiscussionName.trim() && this.newDiscussionMessage.trim()) {
        try {
          this.error = '';
          // Ici on devrait chercher l'utilisateur par nom d'abord
          // Pour simplifier, on va juste fermer le modal pour l'instant
          this.showNewDiscussion = false;
          this.newDiscussionName = '';
          this.newDiscussionMessage = '';
          // Recharger les conversations
          await this.loadConversations();
        } catch (error) {
          this.error = 'Erreur lors de la création de la discussion';
          console.error('Error creating discussion:', error);
        }
      }    },    async initializeWebSocket() {      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Aucun token trouvé pour l\'authentification WebSocket');
        this.error = 'Vous devez être connecté pour utiliser le chat';
        return;
      }
      
      try {
        await socketService.connect(token);
          // Initialiser l'intégration WebSocket pour les messages non lus
        const userId = this.currentUser?.id;
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
    },    handleNewMessage(message) {
      // Ajouter le message à la conversation sélectionnée
      if (this.selectedConversation && this.selectedConversation.id == message.conversationId) {        this.messages.push({
          id: message.id,
          text: message.content,
          fromMe: message.senderId == this.currentUser?.id || false,
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
      }    },
    // Méthodes pour les rendez-vous
    async loadConversationAppointments(conversationId) {      try {
        const response = await api.get(`/appointments/conversation/${conversationId}`);
        this.conversationAppointments = response.data;
      } catch (error) {
        console.error('Error loading conversation appointments:', error);
        this.conversationAppointments = [];
      }
    },async updateAppointmentStatus(appointmentId, status) {
      try {
        const response = await api.patch(`/appointments/${appointmentId}/status`, { status });
        
        // Recharger les rendez-vous de la conversation
        if (this.selectedConversation) {
          await this.loadConversationAppointments(this.selectedConversation.id);
        }
        
        // Déclencher la vérification des notifications après mise à jour du statut
        NotificationService.triggerNotificationCheck();
        
        // Si l'appointment a été supprimé (deleted: true), ne pas chercher les détails
        if (response.data.deleted) {
          const statusMessages = {
            cancelled: 'annulé',
            declined: 'refusé'
          };
          
          const systemMessage = `Rendez-vous ${statusMessages[status]} et supprimé`;
          
          this.messages.push({
            id: Date.now(),
            text: systemMessage,
            fromMe: true,
            createdAt: new Date().toISOString(),
            sender: { username: 'Système' },
            status: 'delivered',
            isAppointment: true
          });
        } else {
          // Ajouter un message de confirmation dans le chat pour les statuts conservés
          const statusMessages = {
            accepted: 'accepté',
            declined: 'refusé',
            cancelled: 'annulé'
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
          }
        }

        // Scroll to bottom
        this.$nextTick(() => {
          const messagesContainer = this.$el.querySelector('.chat-messages');
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        });
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
      });    },    isAppointmentReceiver(appointment) {
      const currentUserId = this.currentUser?.id;
      return appointment.receiverId === currentUserId;
    },
    isAppointmentFormDirty() {
      // Vérifie si des champs du formulaire ont été remplis
      return this.appointmentForm.title.trim() !== '' ||
             this.appointmentForm.date !== '' ||
             this.appointmentForm.time !== '' ||
             this.appointmentForm.location.trim() !== '' ||
             this.appointmentForm.description.trim() !== '';
    },
    closeAppointmentModal() {
      // Si le formulaire a été rempli, demander confirmation
      if (this.isAppointmentFormDirty()) {
        this.showConfirmCloseModal = true;
      } else {
        this.forceCloseAppointmentModal();
      }
    },
    forceCloseAppointmentModal() {
      this.showAppointmentModal = false;
      this.showConfirmCloseModal = false;
      this.resetAppointmentForm();
    },
    cancelCloseConfirmation() {
      this.showConfirmCloseModal = false;
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
      if (!this.isAppointmentFormValid) {
        this.error = 'Veuillez remplir tous les champs obligatoires';
        return;
      }

      if (!this.selectedConversation) {
        this.error = 'Aucune conversation sélectionnée';
        return;
      }

      if (!this.selectedConversation.id || !this.selectedConversation.userId) {
        this.error = 'Conversation invalide, veuillez recharger la page';
        return;
      }

      try {
        this.error = '';
        
        // Combiner date et heure
        const appointmentDateTime = new Date(`${this.appointmentForm.date}T${this.appointmentForm.time}`);
        
        // Vérifier que la date est dans le futur
        if (appointmentDateTime <= new Date()) {
          this.error = 'La date du rendez-vous doit être dans le futur';
          return;
        }
          const appointmentData = {
          receiverId: this.selectedConversation.userId,
          conversationId: this.selectedConversation.id,
          title: this.appointmentForm.title,
          description: this.appointmentForm.description,
          appointmentDate: appointmentDateTime.toISOString(),
          location: this.appointmentForm.location
        };        const response = await api.post('/appointments', appointmentData);
        
        // Fermer le modal et réinitialiser le formulaire directement (pas de confirmation après validation)
        this.forceCloseAppointmentModal();// Recharger les rendez-vous de la conversation
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
          }        });      } catch (error) {
        // Gestion spécifique des erreurs
        if (error.response?.status === 400) {
          this.error = error.response.data.error || 'Données invalides pour le rendez-vous';
        } else if (error.response?.status === 403) {
          this.error = 'Vous n\'êtes pas autorisé à créer ce rendez-vous';
        } else if (error.response?.status === 404) {
          this.error = 'Conversation introuvable, veuillez recharger la page';
        } else if (error.response?.status === 500) {
          // Le 500 peut être causé par une contrainte de clé étrangère
          this.error = 'Erreur serveur. La conversation pourrait être invalide, veuillez recharger la page.';        } else {
          this.error = 'Erreur lors de la création du rendez-vous';
        }
      }
    },
    // Méthode pour naviguer vers le profil d'un utilisateur
    goToProfile(profileToken) {
      if (profileToken) {
        this.$router.push(`/profile/${profileToken}`);
      }
    },    togglePendingAppointments() {
      this.showPendingAppointments = !this.showPendingAppointments;
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
  }
}
</script>

<style scoped>
body, html, #app {
  height: 100vh;
  overflow: hidden;
}
.discussions-page {
  display: flex;
  flex-direction: row;
  gap: 32px;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 0;
  min-height: calc(100vh - 140px);
  height: auto;
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
  max-height: calc(100vh - 200px);
  min-height: 400px;
  overflow-y: auto;
}
.new-discussion-btn {
  margin: 0 18px 10px 18px;
  padding: 8px 0;
  background: #ecbc76;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.15s;
}
.new-discussion-btn:hover {
  background: #e4a94f;
}
.new-discussion-form {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0 18px 10px 18px;
}
.new-discussion-form input {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1.5px solid #ecbc76;
  font-size: 1rem;
}
.new-discussion-form button {
  background: #ecbc76;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 0;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.new-discussion-form button:last-child {
  background: #eee;
  color: #28303F;
  margin-top: 2px;
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
  max-height: calc(100vh - 200px);
  min-height: 400px;
}
.chat-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 24px;
  border-bottom: 1.5px solid #eee;
}
.chat-messages {
  flex: 1;
  padding: 18px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  background: #ff9800;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.cancel-btn:hover {
  background: #f57c00;
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

/* Styles pour les rendez-vous en attente */
.pending-appointments {
  background: #fff9e6;
  border-bottom: 1px solid #f0d08a;
  padding: 16px 24px;
  max-height: 300px;
  overflow-y: auto;
}

.pending-appointments-title {
  font-weight: 600;
  color: #b8860b;
  margin-bottom: 12px;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 4px 0;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.pending-appointments-title:hover {
  background-color: rgba(184, 134, 11, 0.1);
}

.title-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-arrow {
  font-size: 0.8rem;
  transition: transform 0.2s ease;
  user-select: none;
}

.toggle-arrow.collapsed {
  transform: rotate(-90deg);
}

.pending-appointments-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
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

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
  gap: 8px;
}

.appointment-status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
  border: 1px solid;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
  border-color: #ffeaa7;
}

.status-accepted {
  background: #d4edda;
  color: #155724;
  border-color: #c3e6cb;
}

.status-declined {
  background: #f8d7da;
  color: #721c24;
  border-color: #f5c6cb;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
  border-color: #f5c6cb;
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

.appointment-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
  flex-shrink: 0;
  min-width: 120px;
}

.appointment-actions button {
  white-space: nowrap;
  min-width: 80px;
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
  vertical-align: middle;  filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);
}

/* Styles pour le dialogue de confirmation */
.confirmation-overlay {
  z-index: 1001;
}

.confirmation-dialog {
  background: white;
  border-radius: 12px;
  padding: 0;
  max-width: 450px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: confirmationPopIn 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes confirmationPopIn {
  0% { 
    transform: scale(0.7) translateY(20px); 
    opacity: 0; 
  }
  100% { 
    transform: scale(1) translateY(0); 
    opacity: 1; 
  }
}

.btn-cancel {
  background: #f5f5f5;
  color: #333;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-confirm {
  background: #dc3545;
  color: white;
}

.btn-confirm:hover {
  background: #c82333;
}

/* Status check icon styles */
.status-check-icon {
  width: 12px;
  height: 12px;
  margin-left: 2px;
  filter: brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%);
}

.status-check-double {
  margin-left: -6px;
  position: relative;
  z-index: 1;
}

.message-status {
  display: flex;
  align-items: center;
  margin-top: 4px;
  font-size: 0.75rem;
  color: #666;
}

.status-icon {
  display: flex;
  align-items: center;
}

@media (max-width: 900px) {
  .discussions-page {
    flex-direction: column;
    gap: 18px;
    padding: 18px 0;
    min-height: auto;
  }
  .discussions-list, .chat-window {
    width: 100%;
    height: 340px;
    min-width: 0;
    max-width: 100vw;
    max-height: none;
    min-height: 340px;
  }
}
</style>
