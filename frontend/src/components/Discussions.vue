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
      <div v-if="error" class="error">{{ error }}</div>
      <div v-for="conv in conversations" :key="conv.id" class="discussion-item" :class="{ active: selectedConversation && selectedConversation.id === conv.id }" @click="selectConversation(conv)">
        <img :src="conv.avatar" class="avatar" />
        <div class="info">
          <div class="name">{{ conv.name }}</div>
          <div class="last-message">{{ conv.lastMessage }}</div>
        </div>
      </div>
    </div>
    <div class="chat-window">
      <template v-if="selectedConversation">
        <div class="chat-header">
          <img :src="selectedConversation.avatar" class="avatar" />
          <span class="name">{{ selectedConversation.name }}</span>
        </div>
        <div class="chat-messages">
          <div v-for="msg in messages" :key="msg.id" :class="['chat-message', msg.fromMe ? 'me' : 'other']">
            <span>{{ msg.text }}</span>
          </div>
        </div>
        <div class="chat-input">
          <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Écrire un message..." />
          <button @click="sendMessage">Envoyer</button>
        </div>
      </template>
      <template v-else>
        <div class="chat-placeholder">
          <p>Sélectionnez une discussion pour commencer à échanger !</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import api from '../services/api'

export default {
  name: 'Discussions',
  data() {
    return {
      conversations: [],
      selectedConversation: null,
      messages: [],
      newMessage: '',
      showNewDiscussion: false,
      newDiscussionName: '',
      newDiscussionMessage: '',
      loading: false,
      error: ''
    }
  },  async created() {
    await this.loadConversations();
  },
  async activated() {
    // Recharger les conversations quand le composant devient actif (utile avec keep-alive)
    await this.loadConversations();
  },
  watch: {
    // Surveiller les changements de route pour recharger les conversations
    '$route'() {
      this.loadConversations();
    }
  },
  methods: {
    async loadConversations() {
      try {
        this.loading = true;
        this.error = '';
        const response = await api.get('/conversations');
        this.conversations = response.data.map(conv => ({
          id: conv.id,
          name: conv.otherUser.username,
          avatar: conv.otherUser.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg',
          profileToken: conv.otherUser.profileToken,
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
        const response = await api.get(`/conversations/${conv.id}/messages`);
        this.messages = response.data.map(msg => ({
          id: msg.id,
          text: msg.content,
          fromMe: msg.fromMe,
          createdAt: msg.createdAt,
          sender: msg.sender
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
    },
    async sendMessage() {
      if (this.newMessage.trim() && this.selectedConversation) {
        try {
          this.error = '';
          const response = await api.post(`/conversations/${this.selectedConversation.id}/messages`, {
            content: this.newMessage
          });
          
          // Ajouter le nouveau message à la liste
          this.messages.push({
            id: response.data.id,
            text: response.data.content,
            fromMe: true,
            createdAt: response.data.createdAt,
            sender: response.data.sender
          });
          
          // Mettre à jour le dernier message dans la liste des conversations
          const convIndex = this.conversations.findIndex(c => c.id === this.selectedConversation.id);
          if (convIndex !== -1) {
            this.conversations[convIndex].lastMessage = this.newMessage;
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
      }
    }
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
.chat-input button:hover {
  background: #e4a94f;
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
