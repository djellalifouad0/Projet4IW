<template>
  <div>
    
    <div :class="['card', paid ? 'card-paid' : 'card-orange']" @click="openModal"><div class="card-header" @click.stop>
        <img class="avatar" :src="avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=ECBC76&color=fff&size=64&bold=true`" alt="avatar" @click.stop />        <div>          <div class="user-info-row">
            <div class="name" @click.stop="handleProfileClick" style="cursor:pointer;">
              {{ name }}
              <span v-if="isUserOnline" class="status-dot"></span>
            </div>
            <span v-if="postTimeAgo" class="post-time-ago-inline">{{ postTimeAgo }}</span>
          </div>
          <div class="address" @click.stop="handleAddressClick" style="cursor:pointer;text-decoration:underline;">{{ truncatedAddress }}</div>
        </div><div class="header-actions">
          <div
            class="rate"
            :class="paid ? 'rate-paid' : ''"
            v-if="rate"
            @click.stop
          >{{ rate }}</div>          
          <div v-if="isOwnPost" class="post-actions">
            <button class="post-action-btn" @click.stop.prevent="startInlineEdit" title="Modifier">
              <img src="@/assets/icons/edit.svg" alt="Modifier" class="action-icon-small" />
            </button>
            <button class="post-action-btn delete" @click.stop.prevent="deletePost" title="Supprimer">
              <img src="@/assets/icons/trash.svg" alt="Supprimer" class="action-icon-small" />
            </button>
          </div>
        </div>
      </div>      <div class="card-body">
        
        <div v-if="isEditingInline" class="inline-edit-container" @click.stop>
          <textarea 
            v-model="editPostDescription" 
            class="inline-edit-textarea"
            @keydown.enter.ctrl="saveInlineEdit"
            @keydown.escape="cancelInlineEdit"
            @click.stop
            ref="inlineTextarea"
          ></textarea>
          <div class="inline-edit-actions" @click.stop>
            <button @click.stop="saveInlineEdit" class="inline-save-btn">Sauvegarder</button>
            <button @click.stop="cancelInlineEdit" class="inline-cancel-btn">Annuler</button>
            <span class="inline-edit-hint">Ctrl+Entrée pour sauvegarder</span>
          </div>
        </div>
        
        <p v-else>
          {{ truncatedDescription }}
          <span v-if="isTruncated" class="more">...afficher plus</span>
        </p>
      </div>
      <div class="card-footer" @click.stop>
        <span
          :class="['icon', 'pastille', paid ? 'pastille-paid' : '', likedByMe ? 'liked' : '']"
          @click.stop="toggleLike"
          style="user-select: none;"
        >
          <img src="@/assets/icons/coeur.svg" alt="likes" class="icon-svg" />
          <span class="icon-number">{{ likes }}</span>
        </span>        <span :class="['icon', 'pastille', paid ? 'pastille-paid' : '', commentsCount > 0 ? 'has-comments' : '']" @click.stop="openModal">
          <img src="@/assets/icons/comment.svg" alt="views" class="icon-svg" />
          <span class="icon-number">{{ commentsCount }}</span>
        </span>
        
      </div>
    </div>    
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div :class="['modal-card', paid ? 'card-paid' : 'card-orange']" @click.stop>        
        <button class="mobile-close-btn" @click="closeModal" aria-label="Fermer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button><div class="card-header">
          <img class="avatar" :src="avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=ECBC76&color=fff&size=64&bold=true`" alt="avatar" />          <div>            <div class="name" @click.stop="handleProfileClick" style="cursor:pointer;">
              {{ name }}
              <span v-if="isUserOnline" class="status-dot"></span>
            </div>
            <div class="address" @click.stop="handleAddressClick" style="cursor:pointer;text-decoration:underline;">{{ truncatedAddress }}</div>
          </div>
          <div class="header-actions">
            <div class="rate" :class="paid ? 'rate-paid' : ''" v-if="rate">{{ rate }}</div>            
            <div v-if="isOwnPost" class="post-actions">
              <button class="post-action-btn" @click.stop.prevent="startInlineEdit" title="Modifier">
                <img src="@/assets/icons/edit.svg" alt="Modifier" class="action-icon-small" />
              </button>
              <button class="post-action-btn delete" @click.stop="deletePost" title="Supprimer">
                <img src="@/assets/icons/trash.svg" alt="Supprimer" class="action-icon-small" />
              </button>
            </div>
          </div>
        </div>
        <div class="card-body">
          <p>{{ description }}</p>
          <div class="post-date-modal">
            <span class="post-date-time">{{ postDateTime }}</span>
          </div>
        </div>
        <div class="card-footer">
          <span
            :class="['icon', 'pastille', paid ? 'pastille-paid' : '', likedByMe ? 'liked' : '']"
            @click.stop="toggleLike"
            style="user-select: none;"
          >
            <img src="@/assets/icons/coeur.svg" alt="likes" class="icon-svg" />
            <span class="icon-number">{{ likes }}</span>
          </span>          <span :class="['icon', 'pastille', paid ? 'pastille-paid' : '', commentsCount > 0 ? 'has-comments' : '']">
            <img src="@/assets/icons/comment.svg" alt="views" class="icon-svg" />
            <span class="icon-number">{{ commentsCount }}</span>
          </span>
        </div>        
        <div class="modal-comments">
          
          <div class="comments-scroll-area">
            <div v-if="comments.length === 0" class="no-comments">Aucun commentaire pour l'instant.</div>
            <ul v-else class="comments-list">
              <li v-for="(comment, idx) in comments" :key="idx" class="comment-item" :id="`comment-${comment.id}`">
                <div class="comment-main">
                  <img class="comment-avatar" :src="comment.avatar || avatar" alt="avatar" />
                  <div class="comment-content">
                    <div class="comment-header">
                      <span class="comment-author">{{ comment.author }}</span>
                      <span class="comment-time">• {{ comment.time || 'il y a 1 min' }}</span>
                    </div>
                    <div v-if="editingComment === comment.id" class="comment-edit">
                      <input v-model="editCommentText" type="text" @keyup.enter="saveCommentEdit(comment.id)" />
                      <button @click="saveCommentEdit(comment.id)">Sauvegarder</button>
                      <button @click="cancelCommentEdit">Annuler</button>
                    </div>
                    <div v-else class="comment-text">{{ comment.text }}</div>                    <div class="comment-actions">
                      <button class="comment-action-icon" @click="replyTo(idx)" title="Répondre">
                        <img src="@/assets/icons/comment.svg" alt="Répondre" class="comment-icon" />
                      </button>
                      <button v-if="isOwnComment(comment)" class="comment-action-icon" @click="startEditComment(comment)" title="Modifier">
                        <img src="@/assets/icons/edit.svg" alt="Modifier" class="comment-icon" />
                      </button>
                      <button v-if="isOwnComment(comment)" class="comment-action-icon" @click="deleteComment(comment.id)" title="Supprimer">
                        <img src="@/assets/icons/trash.svg" alt="Supprimer" class="comment-icon" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <ul v-if="comment.replies && comment.replies.length" class="replies-list">
                  <li v-for="(reply, rIdx) in comment.replies" :key="rIdx" class="reply-item" :id="`comment-${reply.id}`">
                    <img class="comment-avatar" :src="reply.avatar || avatar" alt="avatar" />
                    <div class="comment-content">
                      <div class="comment-header">
                        <span class="comment-author">{{ reply.author }}</span>
                        <span class="comment-time">• {{ reply.time || 'il y a 1 min' }}</span>
                      </div>
                      
                      <div v-if="editingComment === reply.id" class="comment-edit">
                        <input v-model="editCommentText" type="text" @keyup.enter="saveCommentEdit(reply.id)" />
                        <button @click="saveCommentEdit(reply.id)">Sauvegarder</button>
                        <button @click="cancelCommentEdit">Annuler</button>
                      </div>
                      <div v-else class="comment-text">{{ reply.text }}</div>                      
                      <div class="comment-actions" v-if="isOwnComment(reply)">
                        <button class="comment-action-icon" @click="startEditComment(reply)" title="Modifier">
                          <img src="@/assets/icons/edit.svg" alt="Modifier" class="comment-icon" />
                        </button>
                        <button class="comment-action-icon" @click="deleteComment(reply.id)" title="Supprimer">
                          <img src="@/assets/icons/trash.svg" alt="Supprimer" class="comment-icon" />
                        </button>
                      </div>
                    </div>
                  </li>
                </ul>
                
                <div v-if="replyingTo === idx" class="add-reply">
                  <input v-model="replyText" type="text" placeholder="Votre réponse..." @keyup.enter="sendReply(idx)" />
                  <button @click="sendReply(idx)">Envoyer</button>
                </div>
              </li>
            </ul>
          </div>
            
          <div class="comments-footer">
            <div class="add-comment">
              <input v-model="newComment" type="text" placeholder="Écrire un commentaire..." @keyup.enter="addComment" :disabled="loadingComments" />
              <button @click="addComment" :disabled="!newComment.trim() || loadingComments">Envoyer</button>
            </div>          </div>
        </div>
      </div>
    </div>

    
    <div v-if="confirmDialog.show" class="modal-overlay confirmation-overlay" @click="cancelConfirmation">
      <div class="confirmation-dialog" @click.stop>
        <div class="confirmation-content">
          <p>{{ confirmDialog.message }}</p>
          <div class="confirmation-actions">
            <button @click="confirmAction" class="confirm-btn">Confirmer</button>
            <button @click="cancelConfirmation" class="cancel-btn">Annuler</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api'
import toast from '../services/toast'
import NotificationService from '../services/notificationService'
import socketService from '../services/socket'

export default {
  name: 'PostCard',
  inject: ['matomo'], // Injecter le service Matomo
  
  props: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    avatar: { type: String, required: true },
    rate: { type: String, default: '' },
    description: { type: String, required: true },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    paid: { type: Boolean, default: false },
    createdAt: { type: String, required: true },
    postId: { type: Number, required: true },
    likedByMe: { type: Boolean, default: false },
    commentsCount: { type: Number, default: 0 },
    profileToken: { type: String, default: '' },
    userId: { type: Number, required: true }
  },
  
  data() {
    return {
      showModal: false,
      charLimit: 270,
      comments: [], // On vide le tableau par défaut
      newComment: '',      replyingTo: null,
      replyText: '',
      loadingComments: false,
      loggedInUser: null,editingComment: null,
      editCommentText: '',
      editPostDescription: '',
      isEditingInline: false,

      confirmDialog: {
        show: false,
        message: '',
        confirmCallback: null
      },

      onlineUsers: new Set()
    }
  },
  computed: {
    isTruncated() {
      return this.description.length > this.charLimit;
    },
    truncatedDescription() {
      if (this.isTruncated) {
        return this.description.substring(0, this.charLimit);
      }
      return this.description;
    },
    truncatedAddress() {
      let max = 28;
      if (window.innerWidth <= 600) max = 20;
      if (this.address.length > max) {
        return this.address.substring(0, max) + '...';
      }
      return this.address;
    },
    postTimeAgo() {



      console.log('createdAt:', this.createdAt);
      if (!this.createdAt) return '';
      const postDate = new Date(this.createdAt);
      if (isNaN(postDate.getTime())) return '';
      const now = new Date();
      const diff = Math.floor((now - postDate) / 1000);
      if (diff < 60) return `${diff} sec`;
      if (diff < 3600) return `${Math.floor(diff/60)} min`;
      if (diff < 86400) return `${Math.floor(diff/3600)} h`;
      return `${Math.floor(diff/86400)} j`;
    },
    postDateTime() {

      if (!this.createdAt) return '';
      const date = new Date(this.createdAt);
      if (isNaN(date.getTime())) return '';
      const heures = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const jours = date.getDate();
      const mois = [
        'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
        'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'
      ];
      const moisStr = mois[date.getMonth()];
      const annee = date.getFullYear();      return `${heures}:${minutes} · ${jours} ${moisStr} ${annee}`;
    },    isOwnPost() {

      return this.loggedInUser && this.loggedInUser.id === this.userId;
    },

    isUserOnline() {
      return this.onlineUsers.has(this.userId);
    }
  },
  methods: {
    async openModal() {
      this.showModal = true;
      await this.fetchComments();
    },
    closeModal() {
      this.showModal = false;
      this.replyingTo = null;
      this.replyText = '';
      this.comments = [];
      this.errorComments = '';
    },
    async fetchComments() {
      this.loadingComments = true;
      this.errorComments = '';
      try {
        const res = await api.get(`/skills/${this.postId}/comments`);

        const all = res.data.map(c => ({
          id: c.id,
          author: c.User?.username || 'Utilisateur',
          avatar: c.User?.avatar || '',
          time: c.createdAt ? new Date(c.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
          text: c.content,
          parentId: c.parentId || null,
        }));

        const comments = all.filter(c => !c.parentId).map(parent => ({
          ...parent,
          replies: all.filter(r => r.parentId === parent.id)
        }));
        this.comments = comments;
      } catch (e) {
        this.errorComments = "Erreur lors du chargement des commentaires.";
        this.comments = [];
      } finally {
        this.loadingComments = false;
      }
    },    async addComment() {
      if (this.newComment.trim() !== '') {
        this.errorComments = '';
        this.successComment = '';
        try {
          const response = await api.post(`/skills/${this.postId}/comments`, { content: this.newComment });

          if (response.data.message) {
            toast.success(response.data.message);
          }
          
          this.successComment = 'Commentaire envoyé !';
          this.newComment = '';
          await this.fetchComments();
          this.$emit('comment-posted'); // Ajout : notifie le parent

          NotificationService.triggerNotificationCheck();

          this.$nextTick(() => {
            setTimeout(() => {
              this.scrollToNewComment(response.data.id);
            }, 100);
          });
        } catch (e) {
          if (e.response && e.response.status === 401) {
            this.errorComments = "Vous devez être connecté pour commenter.";
            toast.error("Vous devez être connecté pour commenter.");
          } else {
            this.errorComments = "Erreur lors de l'envoi du commentaire.";
            toast.error("Erreur lors de l'envoi du commentaire.");
          }
        }
      }
    },
    replyTo(idx) {
      this.replyingTo = idx;
      this.replyText = '';
    },    async sendReply(idx) {

      if (this.replyText.trim() !== '') {
        this.errorComments = '';
        try {
          const parentId = this.comments[idx].id;
          const response = await api.post(`/skills/${this.postId}/comments`, { content: this.replyText, parentId });

          if (response.data.message) {
            toast.success(response.data.message);
          }
            this.replyText = '';
          this.replyingTo = null;
          await this.fetchComments();

          NotificationService.triggerNotificationCheck();

          this.$nextTick(() => {
            setTimeout(() => {
              this.scrollToNewComment(response.data.id);
            }, 100);
          });
        } catch (e) {
          if (e.response && e.response.status === 401) {
            this.errorComments = "Vous devez être connecté pour répondre.";
            toast.error("Vous devez être connecté pour répondre.");
          } else {
            this.errorComments = "Erreur lors de l'envoi de la réponse.";
            toast.error("Erreur lors de l'envoi de la réponse.");
          }
        }
      }
    },
    toggleLike() {
      if (this.likedByMe) {
        this.$emit('dislike', this.postId);
      } else {
        this.$emit('like', this.postId);
      }    },
    
    handleProfileClick() {

      if (this.profileToken) {
        this.$router.push(`/profile/${this.profileToken}`);
      }
    },
      handleAddressClick() {

      this.$emit('addressClicked', this.address);

      this.$router.push(`/carte?address=${encodeURIComponent(this.address)}`);
    },

    startInlineEdit() {
      console.log('startInlineEdit appelé');
      this.editPostDescription = this.description;
      this.isEditingInline = true;

      this.$nextTick(() => {
        if (this.$refs.inlineTextarea) {
          this.$refs.inlineTextarea.focus();

          this.$refs.inlineTextarea.select();
        }
      });
    },
    
    async saveInlineEdit() {
      try {
        await api.patch(`/skills/${this.postId}`, {
          description: this.editPostDescription
        });

        this.$emit('post-updated', {
          postId: this.postId,
          description: this.editPostDescription
        });
          this.isEditingInline = false;
        toast.success('Post modifié avec succès !');
        
      } catch (e) {
        toast.error('Erreur lors de la modification du post.');
      }
    },
      cancelInlineEdit() {
      this.isEditingInline = false;
      this.editPostDescription = '';
    },
      async deletePost() {
      this.showConfirmation('Êtes-vous sûr de vouloir supprimer ce post ?', async () => {
        try {
          await api.delete(`/skills/${this.postId}`);

          this.$emit('post-deleted', this.postId);
            this.closeModal();
          toast.success('Post supprimé avec succès !');
        } catch (e) {
          toast.error('Erreur lors de la suppression du post.');
        }
      });
    },

    isOwnComment(comment) {
      return this.loggedInUser && comment.author === this.loggedInUser.username;
    },
    
    startEditComment(comment) {
      this.editingComment = comment.id;
      this.editCommentText = comment.text;
    },
    
    async saveCommentEdit(commentId) {
      try {
        await api.patch(`/skills/comments/${commentId}`, {
          content: this.editCommentText
        });
          this.editingComment = null;
        this.editCommentText = '';
        toast.success('Commentaire modifié !');
        await this.fetchComments();
      } catch (e) {
        toast.error('Erreur lors de la modification du commentaire.');
      }
    },
    
    cancelCommentEdit() {
      this.editingComment = null;
      this.editCommentText = '';
    },
      async deleteComment(commentId) {
      this.showConfirmation('Êtes-vous sûr de vouloir supprimer ce commentaire ?', async () => {        try {
          await api.delete(`/skills/comments/${commentId}`);
          toast.success('Commentaire supprimé avec succès !');
          await this.fetchComments();
          this.$emit('comment-deleted'); // Pour mettre à jour le compteur
        } catch (e) {
          toast.error('Erreur lors de la suppression du commentaire.');
        }
      });
    },

    async loadLoggedInUser() {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await api.get('/auth/me');
          this.loggedInUser = response.data;
        }      } catch (e) {
        console.error('Erreur lors du chargement de l\'utilisateur:', e);
      }
    },

    scrollToNewComment(commentId) {
      const commentElement = document.getElementById(`comment-${commentId}`);
      if (commentElement) {
        commentElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });

        commentElement.style.backgroundColor = '#fff4e3';
        commentElement.style.transition = 'background-color 0.3s ease';
        setTimeout(() => {
          commentElement.style.backgroundColor = '';
        }, 2000);
      }    },

    showConfirmation(message, confirmCallback) {
      this.confirmDialog.message = message;
      this.confirmDialog.confirmCallback = confirmCallback;
      this.confirmDialog.show = true;
    },

    confirmAction() {
      if (this.confirmDialog.confirmCallback) {
        this.confirmDialog.confirmCallback();
      }
      this.cancelConfirmation();
    },    cancelConfirmation() {
      this.confirmDialog.show = false;
      this.confirmDialog.message = '';
      this.confirmDialog.confirmCallback = null;
    },

    setupSocketListeners() {
      if (socketService.isConnected()) {
        socketService.onOnlineUsers(this.handleOnlineUsers);
        socketService.onUserConnected(this.handleUserConnected);
        socketService.onUserDisconnected(this.handleUserDisconnected);
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
    },    async initializeSocketConnection() {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {

        if (!socketService.isConnected()) {
          await socketService.connect(token);
        }

        this.setupSocketListeners();


        setTimeout(() => {
          if (socketService.isConnected()) {
            socketService.getOnlineUsers();
          }
        }, 500);
        
      } catch (error) {
        console.error('Erreur lors de l\'initialisation WebSocket dans PostCard:', error);
      }
    }},  mounted() {
    console.log('Avatar prop:', this.avatar);
    this.loadLoggedInUser();
    this.initializeSocketConnection();
  },
  beforeUnmount() {


  }
}
</script>

<style scoped>
.card {
  background: #FFF4E3;
  border-radius: 16px;
  padding: 22px 28px;
  box-shadow: 0 2px 8px #0001;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  width: 700px;
  max-width: 100%;
  cursor: pointer;
  transition: box-shadow 0.18s;
}


.carte-page .card {
  width: 100%;
}
.card-orange {
  background: #FFF4E3;
}
.card-paid {
  background: #ECBC76;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.post-actions {
  display: flex;
  gap: 4px;
}

.post-action-btn {
  background: rgba(245, 156, 26, 0.1);
  border: 1px solid rgba(245, 156, 26, 0.3);
  border-radius: 6px;
  padding: 4px 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.post-action-btn:hover {
  background: rgba(245, 156, 26, 0.2);
  border-color: rgba(245, 156, 26, 0.5);
}

.post-action-btn.delete {
  background: rgba(220, 53, 69, 0.1);
  border-color: rgba(220, 53, 69, 0.3);
}

.post-action-btn.delete:hover {
  background: rgba(220, 53, 69, 0.2);
  border-color: rgba(220, 53, 69, 0.5);
}
.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 2px solid #f59c1a;
}
.name {
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
}
.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #4CAF50;
  border-radius: 50%;
  margin-left: 4px;
}
.address {
  font-size: 0.92rem;
  color: #888;
}
.rate {
  background: #f59c1a;
  color: #fff;
  border-radius: 8px;
  padding: 4px 12px;
  font-size: 0.95rem;
  font-weight: bold;
  margin-left: auto;
  transition: background 0.16s;
}
.rate-paid {
  background: #28303F !important;
  color: #fff !important;
}
.card-body p {
  margin: 0;
  color: #444;
  font-size: 1rem;
}
.more {
  color: #763D03;
  font-weight: 500;
  margin-left: 2px;
  user-select: none;
}
.card-footer {
  display: flex;
  gap: 18px;
  margin-top: 6px;
}
.icon {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pastille {
  background: #ECBC76;
  border-radius: 22px;
  padding: 6px 14px 6px 8px;
  display: flex;
  align-items: center;
  min-width: 36px;
  transition: background 0.15s, box-shadow 0.15s;
  cursor: pointer;
}
.pastille-paid {
  background: #FFF4E3 !important;
}
.pastille-paid .icon-number {
  color: #28303F !important;
}
.pastille:hover {
  background: #e4a94f;
  box-shadow: 0 2px 8px #ecbc7640;
}
.pastille:hover .icon-number {
  color: #181b26;
}
.icon-svg {
  width: 30px;
  height: 23px;
  display: block;
}
.icon-number {
  color: #28303F;
  font-weight: 600;
  font-size: 1rem;
  margin-left: 4px;
}

.modal-overlay {
  position: fixed;
  z-index: 9999;
  inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInModal 0.22s;
}
@keyframes fadeInModal {
  from { opacity: 0; }
  to { opacity: 1; }
}
.modal-card {
  border-radius: 18px;
  padding: 22px 28px;
  width: 700px;
  max-width: 100%;
  box-shadow: 0 4px 28px #0002;
  position: relative;
  height: auto;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background: #fff !important;
}


.mobile-close-btn {
  display: none;
}


@media (max-width: 600px) {
  html, body {
    overflow-x: hidden !important;
  }
  
  .modal-overlay {
    overflow: hidden !important;
  }
}

.modal-card .card-header {
  margin-bottom: 18px;
}
.modal-card .card-body {
  margin-bottom: 22px;
}
.modal-card .card-body p {
  font-size: 1.09rem;
  line-height: 1.65;
}
.modal-card .card-footer {
  gap: 24px;
  margin-top: 0;
}
.modal-comments {
  margin-top: 28px;
  background: none;
  border-radius: 12px;
  padding: 0;
  box-shadow: none;
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 250px;
  max-height: 50vh;
}


.comments-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 18px 0 12px 0;
  max-height: calc(50vh - 80px);
}

.comments-scroll-area::-webkit-scrollbar {
  width: 6px;
}

.comments-scroll-area::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.comments-scroll-area::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.comments-scroll-area::-webkit-scrollbar-thumb:hover {
  background: #bbb;
}


.comments-footer {
  background: white;
  border-top: 1px solid #eee;
  padding: 16px 0 0 0;
  margin-top: auto;
  position: sticky;
  bottom: 0;
}

.comments-footer .message {
  margin-bottom: 8px;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.9rem;
}

.comments-footer .message.error {
  background: rgba(220, 53, 69, 0.1);
  color: #d00;
  border: 1px solid rgba(220, 53, 69, 0.2);
}

.comments-footer .message.success {
  background: rgba(76, 217, 100, 0.1);
  color: #4cd964;
  border: 1px solid rgba(76, 217, 100, 0.2);
}
.modal-comments h3 {
  margin: 0 0 10px 0;
  font-size: 1.08rem;
  color: #763D03;
}
.no-comments {
  color: #888;
  font-size: 0.97rem;
  margin-bottom: 10px;
  text-align: center;
  padding: 20px 0;
}
.comments-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.comment-item {
  margin-bottom: 7px;
  font-size: 0.98rem;
}
.comment-main {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 2px;
}
.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid #f59c1a;
  object-fit: cover;
  background: #fff;
}
.comment-content {
  flex: 1;
}
.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.98rem;
}
.comment-author {
  font-weight: 600;
  color: #28303F;
}
.comment-time {
  color: #888;
  font-size: 0.93rem;
}
.comment-text {
  color: #333;
  margin: 2px 0 4px 0;
  font-size: 1.01rem;
}
.comment-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 2px;
}
.comment-action-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.comment-action-icon:hover {
  background-color: rgba(236, 188, 118, 0.15);
}

.comment-icon {
  width: 16px;
  height: 16px;
  filter: brightness(0) saturate(100%) invert(19%) sepia(8%) saturate(1834%) hue-rotate(203deg) brightness(95%) contrast(88%);
  transition: transform 0.1s ease;
}

.comment-action-icon:hover .comment-icon {
  transform: scale(1.1);
}

.comment-edit {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 4px 0;
}

.comment-edit input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #e4a94f;
  border-radius: 6px;
  font-size: 0.95rem;
}

.comment-edit button {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.15s;
}

.comment-edit button:first-of-type {
  background: #f59c1a;
  color: white;
}

.comment-edit button:first-of-type:hover {
  background: #e4a94f;
}

.comment-edit button:last-of-type {
  background: #6c757d;
  color: white;
}

.comment-edit button:last-of-type:hover {
  background: #5a6268;
}
.replies-list {
  list-style: none;
  padding-left: 44px;
  margin: 0 0 6px 0;
}
.reply-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 2px;
}
.add-reply {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-left: 44px;
  margin-bottom: 8px;
}
.add-reply input {
  flex: 1;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #e4a94f;
  font-size: 1rem;
}
.add-reply button {
  background: #f59c1a;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 16px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.15s;
}
.add-reply button:hover {
  background: #e4a94f;
}
.add-comment {
  display: flex;
  gap: 8px;
  align-items: center;
}
.add-comment input {
  flex: 1;
  padding: 7px 12px;
  border-radius: 8px;
  border: 1.5px solid #e4a94f;
  font-size: 1rem;
  background: #FFF4E3;
  color: #28303F;
  transition: border 0.15s;
}
.add-comment input:focus {
  outline: none;
  border-color: #f59c1a;
  background: #fff8ef;
}
.add-comment button {
  background: #f59c1a;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 7px 22px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, box-shadow 0.15s;
  box-shadow: 0 1px 4px #ecbc7640;
}
.add-comment button:hover {
  background: #e4a94f;
  color: #181b26;
}
.post-date-modal {
  margin-top: 12px;
  color: #536471;
  font-size: 1.01rem;
  display: flex;
  align-items: center;
  gap: 7px;
  font-family: 'Segoe UI', 'Arial', sans-serif;
}
.post-date-time {
  font-weight: 400;
}
.post-date-dot {
  font-size: 1.2em;
  margin: 0 4px;
}
.post-date-views {
  font-weight: 500;
  color: #536471;
}
.post-time-ago-inline {
  color: #888;
  font-size: 0.93rem;
  margin-left: 10px;
  font-weight: 400;
  white-space: nowrap;
}


.user-info-row {
  display: flex;
  align-items: center;
  gap: 0;
}
@media (max-width: 900px) {
  .card,
  .modal-card {
    width: 95vw;
    padding: 18px 6vw;
    min-width: 0;
  }
  .modal-comments {
    max-height: 45vh;
  }
  .comments-scroll-area {
    max-height: calc(45vh - 80px);
    padding: 14px 0 10px 0;
  }
}
@media (max-width: 600px) {
  .card {
    width: 85vw;
    max-width: 100%;
    padding: 18px 12px 18px 12px;
    border-radius: 16px;
    box-shadow: 0 1px 10px #0001;
    box-sizing: border-box;
    margin-bottom: 10px;
  }
  
  .modal-card {
    width: 100vw !important;
    height: 100vh !important;
    max-width: 100vw !important;
    max-height: 100vh !important;
    min-width: 100vw !important;
    min-height: 100vh !important;
    border-radius: 0 !important;
    padding: 70px 15px 15px 15px !important;
    box-shadow: none !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    overflow-y: auto;
    animation: slideInFromBottom 0.3s ease-out;
    background: #fff !important;
    margin: 0 !important;
    border: none !important;
    box-sizing: border-box !important;
  }
  
  @keyframes slideInFromBottom {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  .modal-overlay {
    align-items: stretch !important;
    justify-content: stretch !important;
    background: rgba(0,0,0,0.8) !important;
    z-index: 9999 !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
  }  
  .mobile-close-btn {
    display: flex;
    position: fixed;
    top: 15px;
    left: 15px;
    width: 40px;
    height: 40px;
    background: transparent;
    border: none;
    cursor: pointer;
    z-index: 10001;
    transition: all 0.2s ease;
    color: #f59c1a;
    align-items: center;
    justify-content: center;
  }
    .mobile-close-btn:hover {
    color: #A64530;
  }
  
  .mobile-close-btn svg {
    width: 24px;
    height: 24px;
  }
  
  
  .modal-card .card-header {
    margin-bottom: 15px;
  }
  
  .modal-card .card-body {
    margin-bottom: 18px;
  }
  
  .modal-card .card-footer {
    margin-bottom: 15px;
  }
  
  .modal-comments {
    max-height: 55vh;
    min-height: 200px;
  }
  
  .comments-scroll-area {
    max-height: calc(55vh - 70px);
  }.modal-comments {
    max-height: 60vh;
    min-height: 200px;
  }
  .comments-scroll-area {
    max-height: calc(60vh - 70px);
  }
  .comments-footer {
    padding: 12px 0 0 0;
  }
  .card-header,
  .modal-card .card-header {
    flex-direction: row !important;    
    align-items: center;
    gap: 10px;
  }
  .avatar {
    width: 56px;        
    height: 56px;
  }
  .name {
    font-size: 1.08rem;
  }
  .address,
  .rate,
  .rate-paid {
    font-size: 0.95rem !important;
  }
  .rate,
  .rate-paid {
    padding: 4px 10px;
    border-radius: 6px;
    margin-left: auto;        
    margin-top: 0;
    font-size: 1rem !important;
  }
  .card-footer,
  .modal-card .card-footer {
    gap: 12px;
    margin-top: 8px;
  }
  .pastille, .pastille-paid {
    padding: 6px 10px 6px 6px;
    min-width: 28px;
    font-size: 0.95rem;
  }
  .icon-svg {
    width: 22px;
    height: 16px;
  }
  .icon-number {
    font-size: 0.97rem;
    margin-left: 3px;
  }
  .modal-card .card-header {
    margin-bottom: 12px;
  }
  .modal-card .card-body {
    margin-bottom: 16px;
  }
  .modal-card .card-body p {
    font-size: 1rem;
  }
}
@media (max-width: 420px) {
  .card,
  .modal-card {
    padding: 10px 10px 10px 10px;
    border-radius: 12px;
    width: 85vw;
    max-width: 100%;
    box-sizing: border-box;
  }
  .name, .address {
    font-size: 0.97rem;
  }
}
.comments-list .comment-item + .comment-item {
  margin-top: 18px;
  border-top: none;
}
.post-time-ago-inline {
  font-size: 0.85rem;
  color: #888;
  margin-left: 8px;
}
.liked {
  background: #E48700 !important;
  color: #fff !important;
  box-shadow: 0 2px 8px #e4870033;
}
.liked .icon-svg {
  filter: brightness(0) invert(1);
}
.liked .icon-number {
  color: #fff !important;
}


.inline-edit-container {
  background: #f8f9fa;
  border: 2px solid #f59c1a;
  border-radius: 8px;
  padding: 12px;
  margin: 4px 0;
}

.inline-edit-textarea {
  width: 100%;
  min-height: 80px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  background: white;
  box-sizing: border-box;
  margin-bottom: 8px;
}

.inline-edit-textarea:focus {
  outline: none;
  border-color: #f59c1a;
  box-shadow: 0 0 0 2px rgba(245, 156, 26, 0.2);
}

.inline-edit-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.inline-save-btn {
  background: #f59c1a;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background 0.15s;
}

.inline-save-btn:hover {
  background: #e4a94f;
}

.inline-cancel-btn {
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.15s;
}

.inline-cancel-btn:hover {
  background: #5a6268;
}

.inline-edit-hint {
  color: #888;
  font-size: 0.8rem;
  margin-left: auto;
  font-style: italic;
}

@media (max-width: 600px) {
  .inline-edit-container {
    padding: 8px;
  }
  
  .inline-edit-textarea {
    min-height: 60px;
    padding: 8px;
    font-size: 0.95rem;
  }
  
  .inline-edit-actions {
    gap: 6px;
  }
  
  .inline-save-btn,
  .inline-cancel-btn {
    padding: 6px 12px;
    font-size: 0.85rem;
  }
  
  .inline-edit-hint {
    font-size: 0.75rem;
    margin-left: 0;
    margin-top: 4px;
    width: 100%;
  }
}


.action-icon-small {
  width: 14px;
  height: 14px;
  vertical-align: middle;
  filter: brightness(0) saturate(100%) invert(47%) sepia(18%) saturate(1094%) hue-rotate(195deg) brightness(95%) contrast(87%);
}

.post-action-btn.delete .action-icon-small {
  filter: brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%);
}

.post-action-btn:hover .action-icon-small {
  filter: brightness(0) saturate(100%) invert(56%) sepia(88%) saturate(2574%) hue-rotate(24deg) brightness(100%) contrast(91%);
}

.post-action-btn.delete:hover .action-icon-small {
  filter: brightness(0) saturate(100%) invert(14%) sepia(93%) saturate(7495%) hue-rotate(4deg) brightness(98%) contrast(118%);
}




.confirmation-overlay {
  z-index: 1001;
}

.confirmation-dialog {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.confirmation-content p {
  margin: 0 0 1.5rem 0;
  font-size: 1.1rem;
  color: #333;
  text-align: center;
}

.confirmation-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.confirm-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.confirm-btn:hover {
  background: #c82333;
}

.cancel-btn {
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.cancel-btn:hover {
  background: #5a6268;
}
</style>
