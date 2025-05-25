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
          <div v-if="isUserOnline(conv.userId)" class="online-indicator"></div>
        </div>
        <div class="info">
          <div class="name">{{ conv.name }}</div>
          <div class="last-message">{{ conv.lastMessage }}</div>
        </div>
      </div>
    </div>
    <div class="chat-window">      <template v-if="selectedConversation">
        <div class="chat-header">
          <div class="avatar-container">
            <img :src="selectedConversation.avatar" class="avatar" />
            <div v-if="isUserOnline(selectedConversation.userId)" class="online-indicator"></div>
          </div>
          <div class="user-info">
            <span class="name">{{ selectedConversation.name }}</span>
            <span v-if="isUserOnline(selectedConversation.userId)" class="status online">En ligne</span>
            <span v-else class="status offline">Hors ligne</span>
          </div>
        </div>        <div class="chat-messages">
          <div v-for="msg in messages" :key="msg.id" :class="['chat-message', msg.fromMe ? 'me' : 'other', msg.isAppointment ? 'appointment-message' : '']">
            <span>{{ msg.text }}</span>
            <div v-if="msg.fromMe" class="message-status">
              <span v-if="msg.status === 'sent'" class="status-icon">📤</span>
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
          />
          <button 
            @click="showAppointmentModal = true" 
            class="appointment-btn"
            :disabled="!selectedConversation"
            title="Proposer un rendez-vous"
          >
            📅
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
  </div>
</template>

<script>
import api from '../services/api'
import socketService from '../services/socket'

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
      reconnecting: false,
      showAppointmentModal: false,
      appointmentForm: {
        title: '',
        date: '',
        time: '',
        location: '',
        description: ''
      }
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
    }
  },
  async created() {
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
  },
  methods: {
    async loadConversations() {
      try {
        this.loading = true;
        this.error = '';
        const response = await api.get('/conversations');        this.conversations = response.data.map(conv => ({
          id: conv.id,
          name: conv.otherUser.username,
          avatar: conv.otherUser.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg',
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
    },
    async selectConversation(conv) {
      try {
        this.selectedConversation = conv;
        this.error = '';
        const response = await api.get(`/conversations/${conv.id}/messages`);        this.messages = response.data.map(msg => ({
          id: msg.id,
          text: msg.content,
          fromMe: msg.fromMe,
          createdAt: msg.createdAt,
          sender: msg.sender,
          status: msg.fromMe ? 'delivered' : null
        }));
        
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
    },    async sendMessage() {
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
      }    },    async initializeWebSocket() {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ Aucun token trouvé pour l\'authentification WebSocket');
        this.error = 'Vous devez être connecté pour utiliser le chat';
        return;
      }

      console.log('🔌 Initialisation de la connexion WebSocket...');
      
      try {
        await socketService.connect(token);
        console.log('✅ WebSocket initialisé avec succès');
        this.setupSocketListeners();
        this.error = ''; // Effacer les erreurs précédentes
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation WebSocket:', error);
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
    },
    async createAppointment() {
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
        this.closeAppointmentModal();
        
        // Ajouter un message système dans la conversation pour informer du rendez-vous
        const systemMessage = `📅 Rendez-vous proposé: "${this.appointmentForm.title}" le ${new Date(appointmentDateTime).toLocaleDateString('fr-FR')} à ${this.appointmentForm.time}`;
        
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
        });

        console.log('Rendez-vous créé:', response.data);
      } catch (error) {
        this.error = 'Erreur lors de la création du rendez-vous';
        console.error('Error creating appointment:', error);
      }
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
  height: 93vh;
  min-height: 0;
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
  background: #4CAF50 !important;
  color: #fff !important;
  min-width: 40px !important;
  padding: 10px !important;
  font-size: 1.2rem !important;
  border-radius: 50% !important;
}

.appointment-btn:hover:not(:disabled) {
  background: #45a049 !important;
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
  background: #4CAF50;
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
  background: #45a049;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Message de rendez-vous */
.chat-message.appointment-message {
  background: linear-gradient(135deg, #4CAF50, #45a049) !important;
  color: white !important;
  border-left: 4px solid #2e7d32;
  font-weight: 500;
}

.chat-message.appointment-message.me {
  background: linear-gradient(135deg, #4CAF50, #45a049) !important;
}

@media (max-width: 900px) {
  .discussions-page {
    flex-direction: column;
    gap: 18px;
    padding: 18px 0;
  }
  .discussions-list, .chat-window {
    width: 100%;
    height: 340px;
    min-width: 0;
    max-width: 100vw;
  }
}
</style>
