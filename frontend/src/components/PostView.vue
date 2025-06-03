<template>
  <div class="post-view-container">
    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Chargement du post...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      <div class="error-message">
        <h3>Erreur</h3>
        <p>{{ error }}</p>
        <button @click="$router.go(-1)" class="back-btn">Retour</button>
      </div>
    </div>

    <!-- Post content -->
    <div v-else-if="post" class="post-view-content">
      <div class="post-view-header">
        <button @click="$router.go(-1)" class="back-btn">
          ← Retour
        </button>
        <h1>Post de {{ post.User?.username }}</h1>
      </div>

      <div class="post-view-main">
        <!-- Post Card Component -->
        <PostCard
          :name="post.User?.username || ''"
          :address="post.location || ''"
          :avatar="post.User?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.User?.username || 'User')}&background=ECBC76&color=fff&size=64&bold=true`"
          :rate="post.pricePerHour ? post.pricePerHour + '€/h' : ''"
          :likes="post.likes || 0"
          :views="post.views || 0"
          :online="true"
          :paid="!!post.pricePerHour"
          :description="post.description"
          :createdAt="post.createdAt || ''"
          :postId="post.id"
          :likedByMe="post.likedByMe"
          :commentsCount="post.commentsCount || 0"
          :profileToken="post.User?.profileToken || ''"
          :userId="post.userId"
          @like="likePost"
          @dislike="dislikePost"
          @comment-posted="refreshPost"
          @post-updated="handlePostUpdated"
          @post-deleted="handlePostDeleted"
          class="post-view-card"
        />

        <!-- Additional post information -->
        <div class="post-info-panel">
          <div class="post-stats">
            <h3>Statistiques</h3>
            <div class="stat-item">
              <img src="@/assets/icons/coeur.svg" alt="Likes" class="stat-icon" />
              <span>{{ post.likes || 0 }} j'aime</span>
            </div>
            <div class="stat-item">
              <img src="@/assets/icons/comment.svg" alt="Comments" class="stat-icon" />
              <span>{{ post.commentsCount || 0 }} commentaires</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Publié le :</span>
              <span>{{ formatDate(post.createdAt) }}</span>
            </div>
            <div v-if="post.updatedAt && post.updatedAt !== post.createdAt" class="stat-item">
              <span class="stat-label">Modifié le :</span>
              <span>{{ formatDate(post.updatedAt) }}</span>
            </div>
          </div>

          <!-- Related posts from same user -->
          <div v-if="relatedPosts.length > 0" class="related-posts">
            <h3>Autres posts de {{ post.User?.username }}</h3>
            <div class="related-posts-list">
              <div
                v-for="relatedPost in relatedPosts"
                :key="relatedPost.id"
                class="related-post-item"
                @click="navigateToPost(relatedPost.id)"
              >
                <div class="related-post-content">
                  <p class="related-post-description">{{ truncateText(relatedPost.description, 100) }}</p>
                  <div class="related-post-meta">
                    <span class="related-post-date">{{ formatDateShort(relatedPost.createdAt) }}</span>
                    <span v-if="relatedPost.pricePerHour" class="related-post-price">{{ relatedPost.pricePerHour }}€/h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PostCard from './PostCard.vue'
import api from '../services/api'

export default {
  name: 'PostView',
  components: {
    PostCard
  },
  data() {
    return {
      post: null,
      relatedPosts: [],
      loading: true,
      error: null
    }
  },
  async created() {
    const postId = this.$route.params.id
    if (postId) {
      await this.loadPost(postId)
      await this.loadRelatedPosts()
    } else {
      this.error = 'ID du post manquant'
      this.loading = false
    }
  },
  watch: {
    // Watch for route changes to handle navigation between posts
    '$route.params.id': {
      async handler(newId) {
        if (newId) {
          this.loading = true
          this.error = null
          await this.loadPost(newId)
          await this.loadRelatedPosts()
        }
      }
    }
  },
  methods: {
    async loadPost(postId) {
      try {
        this.loading = true
        this.error = null
        
        const response = await api.get(`/skills/${postId}`)
        this.post = response.data

        // Load comments count
        try {
          const commentsResponse = await api.get(`/skills/${postId}/comments`)
          this.post.commentsCount = Array.isArray(commentsResponse.data) ? commentsResponse.data.length : 0
        } catch (commentsError) {
          console.warn('Could not load comments count:', commentsError)
          this.post.commentsCount = 0
        }

      } catch (error) {
        console.error('Error loading post:', error)
        if (error.response?.status === 404) {
          this.error = 'Post introuvable'
        } else {
          this.error = 'Erreur lors du chargement du post'
        }
      } finally {
        this.loading = false
      }
    },

    async loadRelatedPosts() {
      if (!this.post?.User?.id) return

      try {
        // Load all posts from the same user
        const response = await api.get(`/users/${this.post.User.id}/posts`)
        // Filter out the current post and limit to 5 related posts
        this.relatedPosts = response.data
          .filter(post => post.id !== this.post.id)
          .slice(0, 5)
      } catch (error) {
        console.warn('Could not load related posts:', error)
        this.relatedPosts = []
      }
    },

    async likePost(postId) {
      try {
        await api.post(`/skills/${postId}/like`)
        this.post.likedByMe = true
        this.post.likes = (this.post.likes || 0) + 1
      } catch (error) {
        console.error('Error liking post:', error)
      }
    },

    async dislikePost(postId) {
      try {
        await api.delete(`/skills/${postId}/unlike`)
        this.post.likedByMe = false
        this.post.likes = Math.max((this.post.likes || 0) - 1, 0)
      } catch (error) {
        console.error('Error disliking post:', error)
      }
    },

    async refreshPost() {
      // Reload the post to get updated comment count
      await this.loadPost(this.$route.params.id)
    },

    handlePostUpdated(updatedPost) {
      if (this.post && this.post.id === updatedPost.postId) {
        this.post.description = updatedPost.description
      }
    },

    handlePostDeleted(postId) {
      if (this.post && this.post.id === postId) {
        // Redirect back since the post was deleted
        this.$router.go(-1)
      }
    },

    navigateToPost(postId) {
      this.$router.push(`/post/${postId}`)
    },

    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    formatDateShort(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        month: 'short',
        day: 'numeric'
      })
    },

    truncateText(text, maxLength) {
      if (!text) return ''
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }
  }
}
</script>

<style scoped>
.post-view-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 120px);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #f59c1a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
}

.error-message {
  text-align: center;
  background: #fff4e3;
  border: 2px solid #f59c1a;
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
}

.error-message h3 {
  color: #e48700;
  margin: 0 0 15px 0;
  font-size: 1.5rem;
}

.error-message p {
  color: #666;
  margin: 0 0 20px 0;
  font-size: 1.1rem;
}

.post-view-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #ecbc76;
}

.back-btn {
  background: #f59c1a;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn:hover {
  background: #e48700;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 156, 26, 0.3);
}

.post-view-header h1 {
  margin: 0;
  color: #e48700;
  font-size: 2rem;
  font-weight: 700;
}

.post-view-main {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
}

.post-view-card {
  width: 100% !important;
  max-width: none !important;
}

.post-info-panel {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.post-stats,
.related-posts {
  background: #fff4e3;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.post-stats h3,
.related-posts h3 {
  margin: 0 0 15px 0;
  color: #e48700;
  font-size: 1.2rem;
  font-weight: 600;
  border-bottom: 2px solid #ecbc76;
  padding-bottom: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  color: #333;
}

.stat-icon {
  width: 20px;
  height: 20px;
  opacity: 0.7;
}

.stat-label {
  font-weight: 600;
  color: #666;
  min-width: 80px;
}

.related-posts-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.related-post-item {
  background: white;
  border: 1px solid #ecbc76;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.related-post-item:hover {
  background: #fffbf5;
  border-color: #f59c1a;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(245, 156, 26, 0.2);
}

.related-post-description {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 0.95rem;
  line-height: 1.4;
}

.related-post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #666;
}

.related-post-price {
  background: #ecbc76;
  color: #333;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
}

/* Responsive design */
@media (max-width: 1024px) {
  .post-view-main {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .post-info-panel {
    order: -1;
  }
}

@media (max-width: 768px) {
  .post-view-container {
    padding: 15px;
  }

  .post-view-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .post-view-header h1 {
    font-size: 1.5rem;
  }

  .post-info-panel {
    flex-direction: row;
    gap: 15px;
  }

  .post-stats,
  .related-posts {
    flex: 1;
  }
}

@media (max-width: 600px) {
  .post-info-panel {
    flex-direction: column;
  }

  .back-btn {
    padding: 8px 16px;
    font-size: 0.9rem;
  }
}
</style>
