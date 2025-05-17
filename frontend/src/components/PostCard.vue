<template>
  <div>
    <!-- Post Card -->
    <div :class="['card', paid ? 'card-paid' : 'card-orange']" @click="openModal">
      <div class="card-header" @click.stop>
        <img class="avatar" :src="avatar" alt="avatar" @click.stop />
        <div>
          <div class="name" @click.stop>
            {{ name }}
            <span v-if="online" class="status-dot"></span>
          </div>
          <div class="address" @click.stop>{{ address }}</div>
        </div>
        <div
          class="rate"
          :class="paid ? 'rate-paid' : ''"
          v-if="rate"
          @click.stop
        >{{ rate }}</div>
      </div>
      <div class="card-body">
        <p>
          {{ truncatedDescription }}
          <span v-if="isTruncated" class="more">...afficher plus</span>
        </p>
      </div>
      <div class="card-footer" @click.stop>
        <span :class="['icon', 'pastille', paid ? 'pastille-paid' : '']">
          <img src="@/assets/icons/coeur.svg" alt="likes" class="icon-svg" />
          <span class="icon-number">{{ likes }}</span>
        </span>
        <span :class="['icon', 'pastille', paid ? 'pastille-paid' : '']" @click.stop="openModal">
          <img src="@/assets/icons/comment.svg" alt="views" class="icon-svg" />
          <span class="icon-number">{{ views }}</span>
        </span>
      </div>
    </div>

    <!-- MODALE -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div :class="['modal-card', paid ? 'card-paid' : 'card-orange']" @click.stop>
        <div class="card-header">
          <img class="avatar" :src="avatar" alt="avatar" />
          <div>
            <div class="name">
              {{ name }}
              <span v-if="online" class="status-dot"></span>
            </div>
            <div class="address">{{ address }}</div>
          </div>
          <div class="rate" :class="paid ? 'rate-paid' : ''" v-if="rate">{{ rate }}</div>
        </div>
        <div class="card-body">
          <p>{{ description }}</p>
        </div>
        <div class="card-footer">
          <span :class="['icon', 'pastille', paid ? 'pastille-paid' : '']">
            <img src="@/assets/icons/coeur.svg" alt="likes" class="icon-svg" />
            <span class="icon-number">{{ likes }}</span>
          </span>
          <span :class="['icon', 'pastille', paid ? 'pastille-paid' : '']">
            <img src="@/assets/icons/comment.svg" alt="views" class="icon-svg" />
            <span class="icon-number">{{ views }}</span>
          </span>
        </div>
        <!-- Section Commentaires -->
        <div class="modal-comments">
          <h3>Commentaires</h3>
          <div v-if="comments.length === 0" class="no-comments">Aucun commentaire pour l'instant.</div>
          <ul v-else class="comments-list">
            <li v-for="(comment, idx) in comments" :key="idx" class="comment-item">
              <div class="comment-main">
                <img class="comment-avatar" :src="comment.avatar || avatar" alt="avatar" />
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author">{{ comment.author }}</span>
                    <span class="comment-time">• {{ comment.time || 'il y a 1 min' }}</span>
                  </div>
                  <div class="comment-text">{{ comment.text }}</div>
                  <div class="comment-actions">
                    <button class="comment-action" @click="replyTo(idx)">Répondre</button>
                  </div>
                </div>
              </div>
              <!-- Réponses -->
              <ul v-if="comment.replies && comment.replies.length" class="replies-list">
                <li v-for="(reply, rIdx) in comment.replies" :key="rIdx" class="reply-item">
                  <img class="comment-avatar" :src="reply.avatar || avatar" alt="avatar" />
                  <div class="comment-content">
                    <div class="comment-header">
                      <span class="comment-author">{{ reply.author }}</span>
                      <span class="comment-time">• {{ reply.time || 'il y a 1 min' }}</span>
                    </div>
                    <div class="comment-text">{{ reply.text }}</div>
                  </div>
                </li>
              </ul>
              <!-- Champ de réponse -->
              <div v-if="replyingTo === idx" class="add-reply">
                <input v-model="replyText" type="text" placeholder="Votre réponse..." @keyup.enter="sendReply(idx)" />
                <button @click="sendReply(idx)">Envoyer</button>
              </div>
            </li>
          </ul>
          <div class="add-comment">
            <input v-model="newComment" type="text" placeholder="Écrire un commentaire..." @keyup.enter="addComment" />
            <button @click="addComment">Envoyer</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PostCard',
  props: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    avatar: { type: String, required: true },
    rate: { type: String, default: '' },
    description: { type: String, required: true },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    paid: { type: Boolean, default: false },
    online: { type: Boolean, default: false }
  },
  data() {
    return {
      showModal: false,
      charLimit: 270,
      comments: [
        {
          author: 'Alice',
          avatar: '',
          time: 'il y a 2 min',
          text: 'Super post !',
          replies: [
            { author: 'Bob', avatar: '', time: 'il y a 1 min', text: 'Merci Alice !' }
          ]
        },
        {
          author: 'Bob',
          avatar: '',
          time: 'il y a 5 min',
          text: 'Merci pour le partage.',
          replies: []
        }
      ],
      newComment: '',
      replyingTo: null,
      replyText: ''
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
    }
  },
  methods: {
    openModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.replyingTo = null;
      this.replyText = '';
    },
    addComment() {
      if (this.newComment.trim() !== '') {
        this.comments.push({
          author: 'Moi',
          avatar: '',
          time: 'à l’instant',
          text: this.newComment,
          replies: []
        });
        this.newComment = '';
      }
    },
    replyTo(idx) {
      this.replyingTo = idx;
      this.replyText = '';
    },
    sendReply(idx) {
      if (this.replyText.trim() !== '') {
        this.comments[idx].replies.push({
          author: 'Moi',
          avatar: '',
          time: 'à l’instant',
          text: this.replyText
        });
        this.replyText = '';
        this.replyingTo = null;
      }
    }
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
  background: #4cd964;
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
/* MODALE */
.modal-overlay {
  position: fixed;
  z-index: 99;
  inset: 0;
  background: rgba(0,0,0,0.36);
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
  height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
/* Espaces verticaux dans la modale */
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
  background: #fff8ef;
  border-radius: 12px;
  padding: 18px 18px 12px 18px;
  box-shadow: 0 1px 6px #0001;
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
}
.comments-list {
  list-style: none;
  padding: 0;
  margin: 0 0 12px 0;
  /* plus de scroll interne, prend toute la largeur */
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
.comment-action {
  background: none;
  border: none;
  color: #f59c1a;
  font-size: 0.97rem;
  cursor: pointer;
  padding: 0 4px;
  border-radius: 4px;
  transition: background 0.13s;
}
.comment-action:hover {
  background: #fff4e3;
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
  margin-top: 10px;
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
@media (max-width: 900px) {
  .card,
  .modal-card {
    width: 95vw;
    padding: 18px 6vw;
    min-width: 0;
  }
}
@media (max-width: 600px) {
  .card,
  .modal-card {
    width: 100%;
    max-width: 100%;
    padding: 18px 12px 18px 12px;
    border-radius: 16px;
    box-shadow: 0 1px 10px #0001;
    box-sizing: border-box;
    margin-bottom: 10px;
  }
  .card-header,
  .modal-card .card-header {
    flex-direction: row !important;    /* Toujours en row */
    align-items: center;
    gap: 10px;
  }
  .avatar {
    width: 56px;        /* Plus grosse photo */
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
    margin-left: auto;        /* Toujours aligné à droite */
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
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  .name, .address {
    font-size: 0.97rem;
  }
}

</style>
