<template>
  <div class="admin-panel-fullscreen">
    <!-- Header avec flèche de retour -->
    <div class="admin-header">
      <button @click="goBack" class="back-button" title="Retour au site">
        <ArrowLeft :size="20" />
      </button>
      <h1 class="admin-title">
        <Settings :size="24" class="title-icon" />
        Panneau d'Administration
      </h1>
      <div class="admin-user">
        <User :size="16" />
        <span>Connecté en tant qu'admin</span>
        <button @click="logout" class="logout-btn">
          <LogOut :size="16" />
          Déconnexion
        </button>
      </div>
    </div>    <!-- Navigation -->
    <nav class="admin-nav">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="{ active: activeTab === tab.id }"
        class="nav-tab"
      >
        <component :is="tab.icon" :size="20" class="tab-icon" />
        <span>{{ tab.label }}</span>
        <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
      </button>
    </nav>

    <!-- Contenu principal -->
    <main class="admin-content">
      <!-- Dashboard -->
      <div v-if="activeTab === 'dashboard'" class="dashboard">        <div class="stats-grid">
          <div class="stat-card">
            <h3><Users :size="20" class="stat-icon" /> Utilisateurs</h3>
            <div class="stat-number">{{ stats.overview?.totalUsers || 0 }}</div>
            <div class="stat-detail">
              <span class="active"><CheckCircle :size="14" /> {{ stats.overview?.activeUsers || 0 }} actifs</span>
              <span class="inactive"><XCircle :size="14" /> {{ stats.overview?.inactiveUsers || 0 }} inactifs</span>
            </div>
          </div>

          <div class="stat-card">
            <h3><Target :size="20" class="stat-icon" /> Compétences</h3>
            <div class="stat-number">{{ stats.overview?.totalSkills || 0 }}</div>
            <div class="stat-detail">Compétences publiées</div>
          </div>

          <div class="stat-card">
            <h3><MessageCircle :size="20" class="stat-icon" /> Conversations</h3>
            <div class="stat-number">{{ stats.overview?.totalConversations || 0 }}</div>
            <div class="stat-detail">{{ stats.overview?.totalMessages || 0 }} messages</div>
          </div>

          <div class="stat-card">
            <h3><Calendar :size="20" class="stat-icon" /> Rendez-vous</h3>
            <div class="stat-number">{{ stats.overview?.totalAppointments || 0 }}</div>
            <div class="stat-detail">{{ stats.overview?.pendingAppointments || 0 }} en attente</div>
          </div>

          <div class="stat-card">
            <h3><Zap :size="20" class="stat-icon" /> Cette semaine</h3>
            <div class="stat-number">{{ stats.overview?.newUsersThisWeek || 0 }}</div>
            <div class="stat-detail">Nouveaux utilisateurs</div>
          </div>

          <div class="stat-card">
            <h3><BarChart3 :size="20" class="stat-icon" /> Activité</h3>
            <div class="stat-number">{{ stats.overview?.messagesThisWeek || 0 }}</div>
            <div class="stat-detail">Messages cette semaine</div>
          </div>
        </div>        <!-- Graphiques -->
        <div class="charts-section">
          <div class="chart-card">
            <h3><BarChart3 :size="20" class="stat-icon" /> Nouveaux utilisateurs (7 derniers jours)</h3>
            <div class="chart-placeholder">
              <div v-if="stats.charts?.newUsers?.length" class="simple-chart">
                <div 
                  v-for="(day, index) in stats.charts.newUsers" 
                  :key="index"
                  class="chart-bar"
                  :style="{ height: (day.count * 20) + 'px' }"
                >
                  <span class="bar-value">{{ day.count }}</span>
                </div>
              </div>
              <p v-else>Aucune donnée disponible</p>
            </div>
          </div>
        </div>
      </div>      <!-- Gestion des utilisateurs -->
      <div v-if="activeTab === 'users'" class="users-section">        <div class="section-header">
          <h2><Users :size="20" class="section-icon" /> Gestion des Utilisateurs</h2>
          <div class="filters">
            <div class="search-group">
              <input 
                v-model="userFilters.search" 
                @input="debounceSearch"
                placeholder="Rechercher par nom ou email..."
                class="search-input"
              >              <button 
                v-if="userFilters.search" 
                @click="clearSearch" 
                class="clear-search"
                title="Effacer la recherche"
              >
                <XCircle :size="16" />
              </button>
            </div>            <select v-model="userFilters.status" @change="fetchUsers" class="filter-select">
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs seulement</option>
              <option value="inactive">Inactifs seulement</option>
            </select>            <select v-model="userFilters.role" @change="fetchUsers" class="filter-select">
              <option value="all">Tous les rôles</option>
              <option value="user">Utilisateurs</option>
              <option value="admin">Administrateurs</option>
            </select>
          </div>
        </div>

        <!-- Résumé des résultats -->
        <div v-if="users.pagination" class="results-summary">
          <span class="results-count">
            {{ users.pagination.totalItems }} utilisateur(s) trouvé(s)
            <span v-if="userFilters.search || userFilters.status !== 'all' || userFilters.role !== 'all'">
              avec les filtres appliqués
            </span>
          </span>          <button 
            v-if="userFilters.search || userFilters.status !== 'all' || userFilters.role !== 'all'" 
            @click="resetFilters" 
            class="btn btn-secondary btn-sm"
          >
            <Zap :size="14" class="btn-icon" />
            Réinitialiser les filtres
          </button>
        </div>        <div class="users-table-container">
          <div class="table-controls">
            <div class="table-info">
              Affichage de {{ ((users.pagination?.currentPage - 1) * users.pagination?.itemsPerPage + 1) || 0 }} 
              à {{ Math.min(users.pagination?.currentPage * users.pagination?.itemsPerPage, users.pagination?.totalItems) || 0 }} 
              sur {{ users.pagination?.totalItems || 0 }} utilisateurs
            </div>
            <div class="table-actions">              <button @click="exportUsers" class="btn btn-secondary btn-sm">
                <Download :size="14" class="btn-icon" />
                Exporter CSV
              </button>              <button @click="refreshUsers" class="btn btn-primary btn-sm">
                <Zap :size="14" class="btn-icon" />
                Actualiser
              </button>
            </div>
          </div>

          <div class="users-table" :class="{ 'loading': isLoading }">
            <table>
              <thead>
                <tr>
                  <th class="sortable" @click="sortBy('id')">
                    #ID
                    <span class="sort-icon" v-if="sortField === 'id'">
                      {{ sortDirection === 'asc' ? '↑' : '↓' }}
                    </span>
                  </th>
                  <th>Avatar</th>
                  <th class="sortable" @click="sortBy('username')">
                    Utilisateur
                    <span class="sort-icon" v-if="sortField === 'username'">
                      {{ sortDirection === 'asc' ? '↑' : '↓' }}
                    </span>
                  </th>
                  <th class="sortable" @click="sortBy('email')">
                    Email
                    <span class="sort-icon" v-if="sortField === 'email'">
                      {{ sortDirection === 'asc' ? '↑' : '↓' }}
                    </span>
                  </th>
                  <th>Statut</th>
                  <th>Rôle</th>
                  <th class="sortable" @click="sortBy('skillsCount')">
                    Compétences
                    <span class="sort-icon" v-if="sortField === 'skillsCount'">
                      {{ sortDirection === 'asc' ? '↑' : '↓' }}
                    </span>
                  </th>
                  <th class="sortable" @click="sortBy('messagesCount')">
                    Messages
                    <span class="sort-icon" v-if="sortField === 'messagesCount'">
                      {{ sortDirection === 'asc' ? '↑' : '↓' }}
                    </span>
                  </th>
                  <th class="sortable" @click="sortBy('averageRating')">
                    Note moyenne
                    <span class="sort-icon" v-if="sortField === 'averageRating'">
                      {{ sortDirection === 'asc' ? '↑' : '↓' }}
                    </span>
                  </th>
                  <th class="sortable" @click="sortBy('createdAt')">
                    Inscrit le
                    <span class="sort-icon" v-if="sortField === 'createdAt'">
                      {{ sortDirection === 'asc' ? '↑' : '↓' }}
                    </span>
                  </th>
                  <th class="actions-column">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!users.users?.length && !isLoading" class="no-results">
                  <td colspan="11" class="text-center">                    <div class="empty-state">
                      <span class="empty-icon"><Users :size="48" /></span>
                      <p>Aucun utilisateur trouvé</p>
                      <button @click="resetFilters" class="btn btn-primary btn-sm">
                        Voir tous les utilisateurs
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-for="user in users.users" :key="user.id" class="user-row">
                  <td class="user-id">
                    #{{ user.id }}
                  </td>                  <td class="user-avatar-cell">
                    <img 
                      :src="user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'User')}&background=ECBC76&color=fff&size=64&bold=true`" 
                      :alt="user.username"
                      class="user-avatar"
                      @error="handleImageError"
                    />
                  </td>
                  <td class="user-details">
                    <div class="user-info">
                      <strong class="username">{{ user.username }}</strong>
                      <span class="user-email-mobile">{{ user.email }}</span>
                    </div>
                  </td>
                  <td class="user-email-desktop">{{ user.email }}</td>                  <td class="user-status">
                    <span :class="['status-badge', user.isActive ? 'active' : 'inactive']">
                      <CheckCircle v-if="user.isActive" :size="12" class="status-icon" />
                      <XCircle v-else :size="12" class="status-icon" />
                      {{ user.isActive ? 'Actif' : 'Inactif' }}
                    </span>
                  </td>                  <td class="user-role">
                    <span :class="['role-badge', user.role]">
                      <Shield v-if="user.role === 'admin'" :size="12" class="role-icon" />
                      <User v-else :size="12" class="role-icon" />
                      {{ user.role === 'admin' ? 'Admin' : 'Utilisateur' }}
                    </span>
                  </td>
                  <td class="user-stats">
                    <span class="stat-number">{{ user.stats?.skillsCount || 0 }}</span>
                  </td>
                  <td class="user-stats">
                    <span class="stat-number">{{ user.stats?.messagesCount || 0 }}</span>
                  </td>                  <td class="user-rating">
                    <div class="rating-display">
                      <span class="rating-value"><Star :size="12" class="rating-icon" /> {{ user.stats?.averageRating?.toFixed(1) || '0.0' }}</span>
                      <small class="rating-count">({{ user.stats?.totalRatings || 0 }})</small>
                    </div>
                  </td>
                  <td class="user-date">{{ formatDate(user.createdAt) }}</td>                  <td class="user-actions">
                    <div class="actions">                      <button 
                        @click="viewUserDetails(user.id)"
                        class="btn btn-info btn-sm"
                        title="Voir détails"
                      >
                        <Eye :size="14" />
                      </button>
                      <button 
                        @click="editUser(user)"
                        class="btn btn-secondary btn-sm"
                        title="Modifier"
                      >
                        <Edit :size="14" />
                      </button>
                      <button 
                        @click="toggleUserBan(user.id)"
                        :class="['btn', 'btn-sm', user.isActive ? 'btn-warning' : 'btn-success']"
                        :title="user.isActive ? 'Bannir' : 'Débannir'"
                      >
                        <XCircle v-if="user.isActive" :size="14" />
                        <CheckCircle v-else :size="14" />
                      </button>
                      <button 
                        v-if="user.role !== 'admin'"
                        @click="deleteUser(user.id)"
                        class="btn btn-danger btn-sm"
                        title="Supprimer"
                      >
                        <Trash2 :size="14" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="users.pagination" class="pagination">
          <button 
            @click="changePage(users.pagination.currentPage - 1)"
            :disabled="users.pagination.currentPage <= 1"
            class="btn btn-secondary"
          >
            ← Précédent
          </button>
          <span class="page-info">
            Page {{ users.pagination.currentPage }} / {{ users.pagination.totalPages }}
            ({{ users.pagination.totalItems }} utilisateurs)
          </span>
          <button 
            @click="changePage(users.pagination.currentPage + 1)"
            :disabled="users.pagination.currentPage >= users.pagination.totalPages"
            class="btn btn-secondary"
          >
            Suivant →
          </button>
        </div>
      </div>

      <!-- Gestion des compétences -->
      <div v-if="activeTab === 'skills'" class="skills-section">        <div class="section-header">
          <h2><Target :size="20" class="section-icon" /> Gestion des Compétences</h2>
          <input 
            v-model="skillSearch" 
            @input="searchSkills"
            placeholder="Rechercher une compétence..."
            class="search-input"
          >
        </div>

        <div class="skills-grid">          <div v-for="skill in skills.skills" :key="skill.id" class="skill-card">
            <div class="skill-header">
              <h3>{{ skill.description.substring(0, 50) }}{{ skill.description.length > 50 ? '...' : '' }}</h3>              <button @click="deleteSkill(skill.id)" class="btn btn-danger btn-sm">
                <Trash2 :size="16" />
              </button>
            </div>
            <p class="skill-description">{{ skill.description }}</p>            <div class="skill-meta">
              <span class="author">
                <User :size="14" class="meta-icon" /> {{ skill.author?.username }}
              </span>
              <span class="date">
                <Calendar :size="14" class="meta-icon" /> {{ formatDate(skill.createdAt) }}
              </span>
              <span class="category">
                <Target :size="14" class="meta-icon" /> {{ skill.category }}
              </span>
            </div>
          </div>
        </div>

        <!-- Pagination compétences -->
        <div v-if="skills.pagination" class="pagination">
          <button 
            @click="changeSkillsPage(skills.pagination.currentPage - 1)"
            :disabled="skills.pagination.currentPage <= 1"
            class="btn btn-secondary"
          >
            ← Précédent
          </button>
          <span class="page-info">
            Page {{ skills.pagination.currentPage }} / {{ skills.pagination.totalPages }}
          </span>
          <button 
            @click="changeSkillsPage(skills.pagination.currentPage + 1)"
            :disabled="skills.pagination.currentPage >= skills.pagination.totalPages"
            class="btn btn-secondary"
          >
            Suivant →
          </button>
        </div>
      </div>

      <!-- Gestion des conversations -->
      <div v-if="activeTab === 'conversations'" class="conversations-section">        <div class="section-header">
          <h2><MessageCircle :size="20" class="section-icon" /> Gestion des Conversations</h2>
        </div>

        <div class="conversations-table">
          <table>
            <thead>
              <tr>
                <th>Participants</th>
                <th>Messages</th>
                <th>Dernier message</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="conv in conversations.conversations" :key="conv.id">
                <td>                  <div class="participants">
                    <div class="participant">
                      <img :src="conv.user1?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.user1?.username || 'User')}&background=ECBC76&color=fff&size=64&bold=true`" :alt="conv.user1?.username" class="avatar-sm" />
                      {{ conv.user1?.username }}
                    </div>
                    <span class="separator"><ArrowLeft :size="12" style="transform: rotate(180deg)" /></span>
                    <div class="participant">
                      <img :src="conv.user2?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.user2?.username || 'User')}&background=ECBC76&color=fff&size=64&bold=true`" :alt="conv.user2?.username" class="avatar-sm" />
                      {{ conv.user2?.username }}
                    </div>
                  </div>
                </td>
                <td>{{ conv.messagesCount }}</td>
                <td>
                  <div v-if="conv.lastMessage" class="last-message">
                    <strong>{{ conv.lastMessage.senderName }}:</strong>
                    <span>{{ truncateText(conv.lastMessage.content, 50) }}</span>
                  </div>
                  <span v-else class="no-message">Aucun message</span>
                </td>
                <td>{{ formatDate(conv.lastMessageAt || conv.createdAt) }}</td>                <td>
                  <div class="actions">
                    <button 
                      @click="viewConversation(conv.id)"
                      class="btn btn-info btn-sm"
                      title="Voir la conversation"
                    >
                      <Eye :size="16" />
                    </button>
                    <button 
                      @click="deleteConversation(conv.id)"
                      class="btn btn-danger btn-sm"
                      title="Supprimer la conversation"
                    >
                      <Trash2 :size="16" />
                    </button>
                  </div>
                </td></tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination conversations -->
        <div v-if="conversations.pagination" class="pagination">
          <button 
            @click="changeConversationsPage(conversations.pagination.currentPage - 1)"
            :disabled="conversations.pagination.currentPage <= 1"
            class="btn btn-secondary"
          >
            ← Précédent
          </button>
          <span class="page-info">
            Page {{ conversations.pagination.currentPage }} / {{ conversations.pagination.totalPages }}
            ({{ conversations.pagination.totalItems }} conversations)
          </span>
          <button 
            @click="changeConversationsPage(conversations.pagination.currentPage + 1)"
            :disabled="conversations.pagination.currentPage >= conversations.pagination.totalPages"
            class="btn btn-secondary"
          >
            Suivant →
          </button>
        </div>
      </div>

      <!-- Gestion des rendez-vous -->
      <div v-if="activeTab === 'appointments'" class="appointments-section">        <div class="section-header">
          <h2><Calendar :size="20" class="section-icon" /> Gestion des Rendez-vous</h2>
          <select v-model="appointmentStatus" @change="fetchAppointments" class="filter-select">
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="accepted">Acceptés</option>
            <option value="declined">Refusés</option>
            <option value="cancelled">Annulés</option>
          </select>
        </div>

        <div class="appointments-table">
          <table>
            <thead>              <tr>
                <th>Titre</th>
                <th>Demandeur</th>
                <th>Destinataire</th>
                <th>Date RDV</th>
                <th>Statut</th>
                <th>Lieu</th>
                <th>Créé le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="appointment in appointments.appointments" :key="appointment.id">
                <td>
                  <strong>{{ appointment.title }}</strong>
                  <div class="description">{{ appointment.description }}</div>
                </td>                <td>
                  <div class="user-info">
                    <img :src="appointment.requester?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(appointment.requester?.username || 'User')}&background=ECBC76&color=fff&size=64&bold=true`" :alt="appointment.requester?.username" class="avatar-sm" />
                    {{ appointment.requester?.username }}
                  </div>
                </td>
                <td>
                  <div class="user-info">
                    <img :src="appointment.receiver?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(appointment.receiver?.username || 'User')}&background=ECBC76&color=fff&size=64&bold=true`" :alt="appointment.receiver?.username" class="avatar-sm" />
                    {{ appointment.receiver?.username }}
                  </div>
                </td>
                <td>{{ formatDateTime(appointment.appointmentDate) }}</td>
                <td>
                  <span :class="['status', 'status-' + appointment.status]">
                    {{ getStatusLabel(appointment.status) }}
                  </span>                </td>
                <td>{{ appointment.location || 'Non spécifié' }}</td>
                <td>{{ formatDate(appointment.createdAt) }}</td>                <td>
                  <div class="actions">
                    <button 
                      @click="viewAppointmentDetails(appointment.id)"
                      class="btn btn-info btn-sm"
                      title="Voir détails"
                    >
                      <Eye :size="16" />
                    </button>
                    <button 
                      v-if="appointment.status === 'pending'"
                      @click="updateAppointmentStatus(appointment.id, 'accepted')"
                      class="btn btn-success btn-sm"
                      title="Accepter"
                    >
                      <CheckCircle :size="16" />
                    </button>
                    <button 
                      v-if="appointment.status === 'pending'"
                      @click="updateAppointmentStatus(appointment.id, 'declined')"
                      class="btn btn-warning btn-sm"
                      title="Refuser"
                    >
                      <XCircle :size="16" />
                    </button>
                    <button 
                      @click="deleteAppointment(appointment.id)"
                      class="btn btn-danger btn-sm"
                      title="Supprimer"
                    >
                      <Trash2 :size="16" />
                    </button>
                  </div>
                </td></tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination rendez-vous -->
        <div v-if="appointments.pagination" class="pagination">
          <button 
            @click="changeAppointmentsPage(appointments.pagination.currentPage - 1)"
            :disabled="appointments.pagination.currentPage <= 1"
            class="btn btn-secondary"
          >
            ← Précédent
          </button>
          <span class="page-info">
            Page {{ appointments.pagination.currentPage }} / {{ appointments.pagination.totalPages }}
            ({{ appointments.pagination.totalItems }} rendez-vous)
          </span>
          <button 
            @click="changeAppointmentsPage(appointments.pagination.currentPage + 1)"
            :disabled="appointments.pagination.currentPage >= appointments.pagination.totalPages"
            class="btn btn-secondary"
          >
            Suivant →
          </button>
        </div>
      </div>
    </main>

    <!-- Modal détails utilisateur -->
    <div v-if="selectedUser" class="modal-overlay" @click="closeUserModal">
      <div class="modal" @click.stop>        <div class="modal-header">
          <h2><User :size="20" class="modal-icon" /> Détails de {{ selectedUser.user?.username }}</h2>
          <button @click="closeUserModal" class="btn btn-secondary"><XCircle :size="16" /></button>
        </div>
        <div class="modal-content">
          <div class="user-details">            <div class="user-profile">
              <img :src="selectedUser.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.user?.username || 'User')}&background=ECBC76&color=fff&size=128&bold=true`" :alt="selectedUser.user?.username" class="profile-avatar" />
              <div>
                <h3>{{ selectedUser.user?.username }}</h3>
                <p>{{ selectedUser.user?.email }}</p>
                <span :class="['status', selectedUser.user?.isActive ? 'active' : 'inactive']">
                  {{ selectedUser.user?.isActive ? 'Actif' : 'Inactif' }}
                </span>
              </div>
            </div>

            <div class="stats-summary">
              <div class="stat">
                <strong>{{ selectedUser.stats?.conversationsCount || 0 }}</strong>
                <span>Conversations</span>
              </div>
              <div class="stat">
                <strong>{{ selectedUser.stats?.sentMessages || 0 }}</strong>
                <span>Messages envoyés</span>
              </div>
              <div class="stat">
                <strong>{{ selectedUser.stats?.receivedMessages || 0 }}</strong>
                <span>Messages reçus</span>
              </div>
              <div class="stat">
                <strong>{{ selectedUser.stats?.appointmentsCount || 0 }}</strong>
                <span>Rendez-vous</span>
              </div>
            </div>
          </div>
        </div>      </div>
    </div>

    <!-- Modal de modification d'utilisateur -->
    <div v-if="editingUser" class="modal-overlay" @click="closeEditModal">
      <div class="modal edit-user-modal" @click.stop>        <div class="modal-header">
          <h2><Edit :size="20" class="modal-icon" /> Modifier l'utilisateur</h2>
          <button @click="closeEditModal" class="btn btn-secondary"><XCircle :size="16" /></button>
        </div>
        <div class="modal-content">
          <form @submit.prevent="saveUserChanges" class="edit-user-form">
            <div class="form-group">
              <label for="edit-username">Nom d'utilisateur</label>
              <input 
                id="edit-username"
                v-model="editForm.username" 
                type="text" 
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label for="edit-email">Email</label>
              <input 
                id="edit-email"
                v-model="editForm.email" 
                type="email" 
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label for="edit-role">Rôle</label>
              <select 
                id="edit-role"
                v-model="editForm.role" 
                class="form-select"
              >
                <option value="user">Utilisateur</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input 
                  v-model="editForm.isActive" 
                  type="checkbox"
                  class="form-checkbox"
                />
                <span class="checkbox-text">Compte actif</span>
              </label>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeEditModal" class="btn btn-secondary">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isLoading">
                {{ isLoading ? 'Sauvegarde...' : 'Sauvegarder' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Toast notifications -->
    <div v-if="toast.show" :class="['toast', 'toast-' + toast.type]">
      {{ toast.message }}
    </div>
  </div>
</template>

<script>
import adminService from '../services/adminService'
import { 
  ArrowLeft,
  BarChart3,
  Users,
  Target,
  MessageCircle,
  Calendar,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Mail,
  Shield,
  Clock,
  Zap,
  LogOut,
  Star
} from 'lucide-vue-next'

export default {
  name: 'AdminPanel',  components: {
    ArrowLeft,
    BarChart3,
    Users,
    Target,
    MessageCircle,
    Calendar,
    Search,
    Filter,
    Plus,
    Edit,
    Trash2,
    Eye,
    Download,
    ChevronLeft,
    ChevronRight,
    Settings,
    CheckCircle,
    XCircle,
    AlertCircle,
    User,
    Mail,
    Shield,
    Clock,
    Zap,
    LogOut,
    Star
  },
  data() {
    return {
      activeTab: 'dashboard',
      stats: {},
      users: { users: [], pagination: null },
      skills: { skills: [], pagination: null },
      conversations: { conversations: [], pagination: null },      appointments: { appointments: [], pagination: null },
      selectedUser: null,
      editingUser: null,
      editForm: {
        username: '',
        email: '',
        role: 'user',
        isActive: true
      },
      isLoading: false,      userFilters: {
        search: '',
        status: 'all',
        role: 'all',
        page: 1
      },
      sortField: 'createdAt',
      sortDirection: 'desc',
      searchTimeout: null,skillSearch: '',      skillPage: 1,
      conversationPage: 1,
      appointmentPage: 1,
      appointmentStatus: 'all',
      toast: {
        show: false,
        message: '',
        type: 'success'
      },      tabs: [
        { id: 'dashboard', label: 'Dashboard', icon: 'BarChart3' },
        { id: 'users', label: 'Utilisateurs', icon: 'Users', count: 0 },
        { id: 'skills', label: 'Compétences', icon: 'Target', count: 0 },
        { id: 'conversations', label: 'Conversations', icon: 'MessageCircle', count: 0 },
        { id: 'appointments', label: 'Rendez-vous', icon: 'Calendar', count: 0 }
      ]
    }
  },  async created() {
    // Vérifier l'accès admin
    try {
      const hasAccess = await adminService.checkAdminAccess()
      if (!hasAccess) {
        this.showToast('Accès non autorisé', 'error')
        this.$router.push('/')
        return
      }
    } catch (error) {
      this.showToast('Erreur de vérification des droits', 'error')
      this.$router.push('/')
      return
    }

    await this.fetchDashboardStats()
    await this.fetchUsers()
  },
  methods: {    async fetchDashboardStats() {
      try {
        this.stats = await adminService.getDashboardStats()
        
        // Mettre à jour les compteurs dans les onglets
        this.tabs.find(t => t.id === 'users').count = this.stats.overview?.totalUsers || 0
        this.tabs.find(t => t.id === 'skills').count = this.stats.overview?.totalSkills || 0
        this.tabs.find(t => t.id === 'conversations').count = this.stats.overview?.totalConversations || 0
        this.tabs.find(t => t.id === 'appointments').count = this.stats.overview?.totalAppointments || 0
      } catch (error) {
        this.showToast('Erreur lors du chargement des statistiques', 'error')
      }
    },    async fetchUsers() {
      try {
        this.isLoading = true
        const params = {
          page: this.userFilters.page,
          limit: 10, // Limiter à 10 utilisateurs par page
          search: this.userFilters.search,
          status: this.userFilters.status,
          role: this.userFilters.role,
          sortField: this.sortField,
          sortDirection: this.sortDirection
        }
        this.users = await adminService.getUsers(params)
      } catch (error) {
        this.showToast('Erreur lors du chargement des utilisateurs', 'error')
      } finally {
        this.isLoading = false
      }
    },

    async fetchSkills() {
      try {
        const params = {
          page: this.skillPage,
          search: this.skillSearch
        }
        this.skills = await adminService.getSkills(params)
      } catch (error) {
        this.showToast('Erreur lors du chargement des compétences', 'error')
      }
    },    async fetchConversations() {
      try {
        const params = { page: this.conversationPage || 1 }
        this.conversations = await adminService.getConversations(params)
      } catch (error) {
        this.showToast('Erreur lors du chargement des conversations', 'error')
      }
    },    async fetchAppointments() {
      try {
        const params = { 
          status: this.appointmentStatus,
          page: this.appointmentPage || 1
        }
        this.appointments = await adminService.getAppointments(params)
      } catch (error) {
        this.showToast('Erreur lors du chargement des rendez-vous', 'error')
      }
    },

    async viewUserDetails(userId) {
      try {
        this.selectedUser = await adminService.getUserDetails(userId)
      } catch (error) {
        this.showToast('Erreur lors du chargement des détails utilisateur', 'error')
      }
    },

    editUser(user) {
      this.editingUser = user
      this.editForm = {
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    },

    closeEditModal() {
      this.editingUser = null
      this.editForm = {
        username: '',
        email: '',
        role: 'user',
        isActive: true
      }
    },

    async saveUserChanges() {
      if (!this.editingUser) return

      this.isLoading = true
      try {
        const response = await adminService.updateUser(this.editingUser.id, this.editForm)
        
        // Mettre à jour l'utilisateur dans la liste
        const userIndex = this.users.users.findIndex(u => u.id === this.editingUser.id)
        if (userIndex !== -1) {
          this.users.users[userIndex] = { ...this.users.users[userIndex], ...response.user }
        }

        this.showToast('Utilisateur modifié avec succès', 'success')
        this.closeEditModal()
      } catch (error) {
        const message = error.response?.data?.error || 'Erreur lors de la modification'
        this.showToast(message, 'error')
      } finally {
        this.isLoading = false
      }
    },

    async toggleUserBan(userId) {
      if (!confirm('Êtes-vous sûr de vouloir changer le statut de cet utilisateur ?')) return
      
      try {
        await adminService.toggleUserBan(userId)
        this.showToast('Statut utilisateur modifié', 'success')
        await this.fetchUsers()
        await this.fetchDashboardStats()
      } catch (error) {
        this.showToast('Erreur lors de la modification du statut', 'error')
      }
    },

    async deleteUser(userId) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur ?')) return
      
      try {
        await adminService.deleteUser(userId)
        this.showToast('Utilisateur supprimé', 'success')
        await this.fetchUsers()
        await this.fetchDashboardStats()
      } catch (error) {
        this.showToast('Erreur lors de la suppression', 'error')
      }
    },    async deleteSkill(skillId) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette compétence ?')) return
      
      try {
        await adminService.deleteSkill(skillId)
        this.showToast('Compétence supprimée', 'success')
        await this.fetchSkills()
        await this.fetchDashboardStats()
      } catch (error) {
        console.error('Erreur suppression compétence:', error)
        const message = error.response?.data?.error || 'Erreur lors de la suppression'
        this.showToast(message, 'error')
      }
    },

    // Navigation et filtres
    changePage(page) {
      this.userFilters.page = page
      this.fetchUsers()
    },

    changeSkillsPage(page) {
      this.skillPage = page
      this.fetchSkills()
    },    // Recherche et filtres améliorés
    debounceSearch() {
      // Annuler le timeout précédent si il existe
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      
      // Créer un nouveau timeout
      this.searchTimeout = setTimeout(() => {
        this.searchUsers()
      }, 300) // Attendre 300ms après la dernière frappe
    },

    searchUsers() {
      this.userFilters.page = 1
      this.fetchUsers()
    },

    clearSearch() {
      this.userFilters.search = ''
      this.searchUsers()
    },

    resetFilters() {
      this.userFilters = {
        search: '',
        status: 'all',
        role: 'all',
        page: 1
      }
      this.sortField = 'createdAt'
      this.sortDirection = 'desc'
      this.fetchUsers()
    },

    // Tri des colonnes
    sortBy(field) {
      if (this.sortField === field) {
        // Si on clique sur la même colonne, inverser la direction
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
      } else {
        // Nouvelle colonne, commencer par l'ordre croissant
        this.sortField = field
        this.sortDirection = 'asc'
      }
      this.userFilters.page = 1
      this.fetchUsers()
    },

    // Actions du tableau
    refreshUsers() {
      this.fetchUsers()
    },

    exportUsers() {
      // Fonction pour exporter les utilisateurs en CSV
      try {
        const csvContent = this.generateCSV(this.users.users)
        this.downloadCSV(csvContent, 'utilisateurs.csv')
        this.showToast('Export CSV généré avec succès', 'success')
      } catch (error) {
        this.showToast('Erreur lors de l\'export CSV', 'error')
      }
    },

    generateCSV(users) {
      const headers = ['ID', 'Nom d\'utilisateur', 'Email', 'Statut', 'Rôle', 'Compétences', 'Messages', 'Note moyenne', 'Date d\'inscription']
      const csvRows = [headers.join(',')]
      
      users.forEach(user => {
        const row = [
          user.id,
          `"${user.username}"`,
          `"${user.email}"`,
          user.isActive ? 'Actif' : 'Inactif',
          user.role === 'admin' ? 'Admin' : 'Utilisateur',
          user.stats?.skillsCount || 0,
          user.stats?.messagesCount || 0,
          user.stats?.averageRating?.toFixed(1) || '0.0',
          this.formatDate(user.createdAt)
        ]
        csvRows.push(row.join(','))
      })
      
      return csvRows.join('\n')
    },

    downloadCSV(csvContent, filename) {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', filename)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    },

    handleImageError(event) {
      event.target.src = '/default-avatar.png'
    },

    searchSkills() {
      this.skillPage = 1
      this.fetchSkills()
    },

    // Gestion des onglets
    async switchTab(tabId) {
      this.activeTab = tabId
      
      switch (tabId) {
        case 'users':
          if (!this.users.users.length) await this.fetchUsers()
          break
        case 'skills':
          if (!this.skills.skills.length) await this.fetchSkills()
          break
        case 'conversations':
          if (!this.conversations.conversations.length) await this.fetchConversations()
          break
        case 'appointments':
          if (!this.appointments.appointments.length) await this.fetchAppointments()
          break
      }
    },

    closeUserModal() {
      this.selectedUser = null
    },

    // Utilitaires
    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR')
    },

    formatDateTime(date) {
      return new Date(date).toLocaleString('fr-FR')
    },

    truncateText(text, length) {
      return text.length > length ? text.substring(0, length) + '...' : text
    },

    getStatusLabel(status) {
      const labels = {
        'pending': 'En attente',
        'accepted': 'Accepté',
        'declined': 'Refusé',
        'cancelled': 'Annulé'
      }
      return labels[status] || status
    },

    showToast(message, type = 'success') {
      this.toast = { show: true, message, type }
      setTimeout(() => {
        this.toast.show = false
      }, 3000)
    },    logout() {
      localStorage.removeItem('token')
      this.$router.push('/login')
    },

    goBack() {
      this.$router.push('/')
    },    // Méthodes appelées par les watchers
    viewConversation(convId) {
      // Rediriger vers la conversation ou ouvrir un modal détaillé
      this.showToast('Fonctionnalité à implémenter', 'info')
    },

    // Méthodes pour les conversations
    async deleteConversation(convId) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette conversation ? Tous les messages seront définitivement supprimés.')) return
      
      try {
        await adminService.deleteConversation(convId)
        this.showToast('Conversation supprimée', 'success')
        await this.fetchConversations()
        await this.fetchDashboardStats()
      } catch (error) {
        this.showToast('Erreur lors de la suppression de la conversation', 'error')
      }
    },

    changeConversationsPage(page) {
      this.conversationPage = page
      this.fetchConversations()
    },

    // Méthodes pour les rendez-vous
    async viewAppointmentDetails(appointmentId) {
      try {
        const response = await adminService.getAppointmentDetails(appointmentId)
        const appointment = response.appointment
        
        const details = `
Titre: ${appointment.title}
Description: ${appointment.description}
Date: ${this.formatDateTime(appointment.appointmentDate)}
Lieu: ${appointment.location || 'Non spécifié'}
Demandeur: ${appointment.requester.username} (${appointment.requester.email})
Destinataire: ${appointment.receiver.username} (${appointment.receiver.email})
Statut: ${this.getStatusLabel(appointment.status)}
Créé le: ${this.formatDateTime(appointment.createdAt)}
        `.trim()
        
        alert(details) // Vous pouvez remplacer par un modal plus élégant
      } catch (error) {
        this.showToast('Erreur lors du chargement des détails', 'error')
      }
    },

    async updateAppointmentStatus(appointmentId, status) {
      const statusLabels = {
        'accepted': 'accepter',
        'declined': 'refuser',
        'cancelled': 'annuler'
      }
      
      if (!confirm(`Êtes-vous sûr de vouloir ${statusLabels[status]} ce rendez-vous ?`)) return
      
      try {
        await adminService.updateAppointmentStatus(appointmentId, status)
        this.showToast(`Rendez-vous ${statusLabels[status]} avec succès`, 'success')
        await this.fetchAppointments()
        await this.fetchDashboardStats()
      } catch (error) {
        this.showToast('Erreur lors de la mise à jour du statut', 'error')
      }
    },

    async deleteAppointment(appointmentId) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement ce rendez-vous ?')) return
      
      try {        await adminService.deleteAppointment(appointmentId)
        this.showToast('Rendez-vous supprimé', 'success')
        await this.fetchAppointments()
        await this.fetchDashboardStats()
      } catch (error) {
        this.showToast('Erreur lors de la suppression du rendez-vous', 'error')
      }
    },

    changeAppointmentsPage(page) {
      this.appointmentPage = page
      this.fetchAppointments()
    },

    changeAppointmentsPage(page) {
      this.appointmentPage = page
      this.fetchAppointments()
    }
  },

  watch: {
    activeTab(newTab) {
      this.switchTab(newTab)
    }
  }
}
</script>

<style scoped>
.admin-panel-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  min-height: 100vh;
  background-color: var(--primary-bg);
  z-index: 1000;
  overflow-y: auto;
}

.admin-header {
  background: var(--accent);
  color: var(--white);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow);
  position: relative;
}

.back-button {
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 0.75rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 1rem;
  z-index: 10;
}

.back-button:hover {
  background: rgba(255,255,255,0.3);
  transform: translateX(-2px);
}

.back-button svg {
  width: 24px;
  height: 24px;
}

.admin-title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
  flex: 1;
  text-align: center;
  padding-left: 4rem; /* Compensation pour la flèche de retour */
}

.admin-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logout-btn {
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.3s;
}

.logout-btn:hover {
  background: rgba(255,255,255,0.3);
}

.admin-nav {
  background: var(--white);
  padding: 0 2rem;
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid var(--primary-light);
  overflow-x: auto;
}

.nav-tab {
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
  white-space: nowrap;
  color: var(--dark);
}

.nav-tab:hover {
  background-color: var(--primary-bg);
  color: var(--accent);
}

.nav-tab.active {
  border-bottom-color: var(--accent);
  color: var(--accent);
  background-color: var(--primary-bg);
}

.tab-icon {
  font-size: 1.2rem;
}

.tab-count {
  background: var(--accent);
  color: var(--white);
  padding: 0.2rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  min-width: 1.5rem;
  text-align: center;
}

.admin-content {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Dashboard */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--white);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  text-align: center;
  border: 2px solid var(--primary-bg);
  transition: border-color 0.3s ease;
}

.stat-card:hover {
  border-color: var(--primary-light);
}

.stat-card h3 {
  margin: 0 0 1rem 0;
  color: var(--dark);
  font-size: 1rem;
  font-weight: 600;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--accent);
  margin-bottom: 0.5rem;
}

.stat-detail {
  color: var(--dark);
  font-size: 0.9rem;
}

.stat-detail .active {
  color: #4CAF50;
  margin-right: 1rem;
}

.stat-detail .inactive {
  color: var(--danger);
}

.charts-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.chart-card {
  background: var(--white);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  border: 2px solid var(--primary-bg);
}

.chart-card h3 {
  color: var(--title-color);
  margin-bottom: 1rem;
}

.simple-chart {
  display: flex;
  align-items: end;
  gap: 1rem;
  height: 200px;
  padding: 1rem 0;
}

.chart-bar {
  background: var(--accent);
  min-height: 20px;
  width: 40px;
  border-radius: 4px 4px 0 0;
  position: relative;
  display: flex;
  align-items: end;
  justify-content: center;
}

.bar-value {
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
  padding: 0.2rem;
}

/* Sections */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-header h2 {
  margin: 0;
  color: var(--title-color);
  font-weight: 600;
}

.filters {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-input {
  padding: 0.75rem 1rem;
  border: 1.5px solid var(--primary-light);
  border-radius: var(--border-radius);
  font-size: 1rem;
  min-width: 250px;
  background: var(--white);
  color: var(--dark);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(228, 135, 0, 0.1);
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1.5px solid var(--primary-light);
  border-radius: var(--border-radius);
  background: var(--white);
  cursor: pointer;
  color: var(--dark);
  transition: border-color 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: var(--accent);
}

/* Tables */
.users-table, .conversations-table, .appointments-table {
  background: var(--white);
  border-radius: var(--border-radius);
  overflow-x: auto;
  overflow-y: hidden;
  box-shadow: var(--shadow);
  border: 2px solid var(--primary-bg);
}

/* Barre de scroll personnalisée */
.users-table::-webkit-scrollbar,
.conversations-table::-webkit-scrollbar,
.appointments-table::-webkit-scrollbar {
  height: 8px;
}

.users-table::-webkit-scrollbar-track,
.conversations-table::-webkit-scrollbar-track,
.appointments-table::-webkit-scrollbar-track {
  background: var(--primary-bg);
  border-radius: 4px;
}

.users-table::-webkit-scrollbar-thumb,
.conversations-table::-webkit-scrollbar-thumb,
.appointments-table::-webkit-scrollbar-thumb {
  background: var(--primary-light);
  border-radius: 4px;
}

.users-table::-webkit-scrollbar-thumb:hover,
.conversations-table::-webkit-scrollbar-thumb:hover,
.appointments-table::-webkit-scrollbar-thumb:hover {
  background: var(--accent);
}

table {
  width: 100%;
  min-width: 800px; /* Assure une largeur minimale pour éviter que le tableau soit trop compressé */
  border-collapse: collapse;
}

th {
  background: var(--primary-bg);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--dark);
  border-bottom: 2px solid var(--primary-light);
  white-space: nowrap; /* Empêche le retour à la ligne dans les en-têtes */
}

/* Largeurs spécifiques pour les colonnes du tableau utilisateurs */
.users-table th:nth-child(1), /* Avatar */
.users-table td:nth-child(1) {
  width: 60px;
  min-width: 60px;
}

.users-table th:nth-child(2), /* Utilisateur */
.users-table td:nth-child(2) {
  width: 150px;
  min-width: 150px;
}

.users-table th:nth-child(3), /* Email */
.users-table td:nth-child(3) {
  width: 200px;
  min-width: 200px;
}

.users-table th:nth-child(4), /* Statut */
.users-table td:nth-child(4) {
  width: 80px;
  min-width: 80px;
}

.users-table th:nth-child(5), /* Compétences */
.users-table td:nth-child(5) {
  width: 100px;
  min-width: 100px;
}

.users-table th:nth-child(6), /* Messages */
.users-table td:nth-child(6) {
  width: 80px;
  min-width: 80px;
}

.users-table th:nth-child(7), /* Note moyenne */
.users-table td:nth-child(7) {
  width: 120px;
  min-width: 120px;
}

.users-table th:nth-child(8), /* Inscrit le */
.users-table td:nth-child(8) {
  width: 100px;
  min-width: 100px;
}

.users-table th:nth-child(9), /* Actions */
.users-table td:nth-child(9) {
  width: 150px;
  min-width: 150px;
  position: sticky;
  right: 0;
  background: inherit;
  z-index: 1;
}

td {
  padding: 1rem;
  border-bottom: 1px solid var(--primary-light);
  vertical-align: middle;
  white-space: nowrap; /* Empêche le retour à la ligne par défaut */
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--dark);
}

/* Pour les cellules qui peuvent avoir du contenu long, permettre le wrap */
.users-table td:nth-child(2), /* Utilisateur */
.users-table td:nth-child(3) { /* Email */
  white-space: normal;
  word-break: break-word;
}

tr:hover {
  background-color: var(--primary-bg);
}

/* Colonne Actions sticky à droite */
.users-table tr:hover td:nth-child(9) {
  background-color: var(--primary-bg);
}

.users-table th:nth-child(9) {
  background: var(--primary-bg);
  box-shadow: -2px 0 5px rgba(228, 135, 0, 0.1);
}

.user-avatar, .avatar-sm {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-role {
  background: var(--primary-light);
  padding: 0.2rem 0.5rem;
  border-radius: 0.3rem;
  font-size: 0.8rem;
  color: var(--dark);
  font-weight: 500;
}

.status {
  padding: 0.3rem 0.8rem;
  border-radius: 2rem;
  font-size: 0.85rem;
  font-weight: 500;
}

.status.active {
  background: #e8f5e8;
  color: #2e7d32;
}

.status.inactive {
  background: #ffebee;
  color: var(--danger);
}

.status-pending {
  background: #fff8e1;
  color: var(--accent);
}

.status-accepted {
  background: #e8f5e8;
  color: #2e7d32;
}

.status-declined, .status-cancelled {
  background: #ffebee;
  color: var(--danger);
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.actions {
  display: flex;
  gap: 0.3rem;
  flex-wrap: nowrap;
  justify-content: center;
}

.actions .btn {
  min-width: 35px;
  padding: 0.4rem 0.6rem;
  font-size: 0.9rem;
}

/* Icônes générales */
.title-icon,
.section-icon,
.modal-icon,
.stat-icon,
.meta-icon,
.btn-icon,
.status-icon,
.role-icon,
.rating-icon {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}

.title-icon {
  margin-right: 0.75rem;
  color: var(--white);
}

.section-icon {
  margin-right: 0.5rem;
  color: var(--accent);
}

.modal-icon {
  margin-right: 0.5rem;
  color: var(--accent);
}

.stat-icon {
  margin-right: 0.5rem;
  color: var(--accent);
}

.meta-icon {
  margin-right: 0.25rem;
  opacity: 0.7;
}

.btn-icon {
  margin-right: 0.5rem;
}

.status-icon {
  margin-right: 0.25rem;
}

.role-icon {
  margin-right: 0.25rem;
}

.rating-icon {
  margin-right: 0.25rem;
  color: #ffc107;
}

/* Amélioration des badges */
.status-badge,
.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.status-badge.active {
  background: #e8f5e8;
  color: #2d5a3d;
  border: 1px solid #4caf50;
}

.status-badge.active .status-icon {
  color: #4caf50;
}

.status-badge.inactive {
  background: #ffeaea;
  color: #a94442;
  border: 1px solid #d32f2f;
}

.status-badge.inactive .status-icon {
  color: #d32f2f;
}

.role-badge.admin {
  background: #fff3e0;
  color: #e65100;
  border: 1px solid var(--accent);
}

.role-badge.admin .role-icon {
  color: var(--accent);
}

.role-badge.user {
  background: #e3f2fd;
  color: #1565c0;
  border: 1px solid #2196f3;
}

.role-badge.user .role-icon {
  color: #2196f3;
}

/* Amélioration des sections header */
.section-header h2 {
  display: flex;
  align-items: center;
  margin: 0;
  color: var(--title-color);
  font-weight: 600;
  font-size: 1.5rem;
}

/* Amélioration des meta info des compétences */
.skill-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.9rem;
  color: var(--accent);
}

.skill-meta span {
  display: flex;
  align-items: center;
}

/* Amélioration des boutons avec icônes */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  text-decoration: none;
  font-weight: 500;
}

.btn-sm {
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
}

.btn-info {
  background: var(--accent);
  color: var(--white);
}

.btn-info:hover {
  opacity: 0.9;
}

.btn-warning {
  background: var(--primary-light);
  color: var(--dark);
}

.btn-warning:hover {
  opacity: 0.9;
}

.btn-success {
  background: #4CAF50;
  color: var(--white);
}

.btn-success:hover {
  opacity: 0.9;
}

.btn-danger {
  background: var(--danger);
  color: var(--white);
}

.btn-danger:hover {
  opacity: 0.9;
}

.btn-secondary {
  background: #6c757d;
  color: var(--white);
}

.btn-secondary:hover {
  opacity: 0.9;
}

.btn-primary {
  background: var(--accent);
  color: var(--white);
}

.btn-primary:hover {
  opacity: 0.9;
}

/* Skills Grid */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.skill-card {
  background: var(--white);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  border: 2px solid var(--primary-bg);
  transition: border-color 0.3s ease;
}

.skill-card:hover {
  border-color: var(--primary-light);
}

.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
}

.skill-header h3 {
  margin: 0;
  color: var(--dark);
  flex: 1;
  font-weight: 600;
}

.skill-description {
  color: var(--dark);
  margin-bottom: 1rem;
  line-height: 1.5;
  opacity: 0.8;
}

.skill-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.9rem;
  color: var(--accent);
}

/* Conversations */
.participants {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.participant {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.separator {
  color: #ccc;
}

.last-message {
  max-width: 200px;
}

.description {
  font-size: 0.9rem;
  color: var(--dark);
  margin-top: 0.25rem;
  opacity: 0.7;
}

.no-message {
  color: #ccc;
  font-style: italic;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
  background: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  border: 2px solid var(--primary-bg);
}

.page-info {
  color: var(--dark);
  font-size: 0.9rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--white);
  border-radius: var(--border-radius);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: var(--shadow);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid var(--primary-light);
  background: var(--primary-bg);
}

.modal-header h2 {
  margin: 0;
  color: var(--title-color);
  font-weight: 600;
}

.modal-content {
  padding: 1.5rem;
}

/* Modal de modification d'utilisateur */
.edit-user-modal {
  max-width: 500px;
}

.edit-user-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--dark);
  font-size: 0.9rem;
}

.form-input,
.form-select {
  padding: 0.75rem;
  border: 1.5px solid var(--primary-light);
  border-radius: var(--border-radius);
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  background: var(--white);
  color: var(--dark);
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(228, 135, 0, 0.1);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem 0;
}

.form-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-text {
  font-weight: 500;
  color: var(--dark);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--primary-light);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat {
  text-align: center;
  padding: 1rem;
  background: var(--primary-bg);
  border-radius: var(--border-radius);
  border: 1px solid var(--primary-light);
}

.stat strong {
  display: block;
  font-size: 1.5rem;
  color: var(--accent);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.stat span {
  font-size: 0.9rem;
  color: var(--dark);
}

/* Toast */
.toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: var(--border-radius);
  color: var(--white);
  font-weight: 500;
  z-index: 1100;
  animation: slideIn 0.3s ease;
}

.toast-success {
  background: #4CAF50;
}

.toast-error {
  background: var(--danger);
}

.toast-info {
  background: var(--accent);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Filtres cohérents avec le reste de l'interface */
.filters {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-group {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 2.5rem;
  border: 2px solid var(--primary-light);
  border-radius: var(--border-radius);
  font-size: 1rem;
  background: var(--white);
  color: var(--dark);
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(228, 135, 0, 0.1);
}

.clear-search {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--dark);
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.3s ease;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.clear-search:hover {
  opacity: 1;
  color: var(--danger);
}

.filter-select {
  padding: 0.75rem;
  border: 2px solid var(--primary-light);
  border-radius: var(--border-radius);
  background: var(--white);
  color: var(--dark);
  font-size: 1rem;
  cursor: pointer;
  transition: border-color 0.3s ease;
  min-width: 150px;
}

.filter-select:focus {
  outline: none;
  border-color: var(--accent);
}

/* Résumé des résultats */
.results-summary {
  background: var(--primary-bg);
  padding: 1rem;
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
  border: 2px solid var(--primary-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.results-count {
  font-weight: 600;
  color: var(--dark);
}

/* Tableau utilisateurs - styles cohérents */
.users-table-container {
  background: var(--white);
  border: 2px solid var(--primary-light);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow);
}

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--primary-bg);
  padding: 1rem;
  border-bottom: 2px solid var(--primary-light);
}

.table-info {
  color: var(--dark);
  font-size: 0.9rem;
  font-weight: 500;
}

.table-actions {
  display: flex;
  gap: 0.5rem;
}

.users-table {
  overflow-x: auto;
}

.users-table table {
  width: 100%;
  border-collapse: collapse;
  background: var(--white);
}

.users-table th {
  background: var(--primary-bg);
  color: var(--dark);
  font-weight: 600;
  text-align: left;
  padding: 1rem 0.75rem;
  border-bottom: 2px solid var(--primary-light);
  font-size: 0.9rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.users-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.3s ease;
}

.users-table th.sortable:hover {
  background: var(--primary-light);
}

.sort-icon {
  margin-left: 0.5rem;
  font-weight: bold;
  color: var(--accent);
}

.users-table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--primary-light);
  vertical-align: middle;
}

.users-table tr:nth-child(even) {
  background: var(--primary-bg);
}

.users-table tr:hover {
  background: rgba(228, 135, 0, 0.05);
}

/* Colonnes spécifiques */
.user-id {
  font-weight: 600;
  color: var(--accent);
  font-size: 0.9rem;
}

.user-avatar-cell {
  width: 60px;
  text-align: center;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--primary-light);
}

.user-details .username {
  font-weight: 600;
  color: var(--dark);
  display: block;
  margin-bottom: 0.25rem;
}

.user-email-mobile {
  font-size: 0.85rem;
  color: var(--dark);
  opacity: 0.7;
  display: none;
}

.user-email-desktop {
  font-size: 0.9rem;
  color: var(--dark);
}

.user-stats .stat-number {
  font-weight: 600;
  color: var(--accent);
  display: block;
  text-align: center;
}

.rating-display {
  text-align: center;
}

.rating-value {
  font-weight: 600;
  color: var(--accent);
  display: block;
}

.rating-count {
  font-size: 0.8rem;
  color: var(--dark);
  opacity: 0.6;
}

.user-date {
  font-size: 0.85rem;
  color: var(--dark);
  white-space: nowrap;
}

/* Actions cohérentes avec les autres sections */
.user-actions {
  white-space: nowrap;
}

.actions {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

/* État vide */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--dark);
}

.empty-state .empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  margin-bottom: 1.5rem;
  opacity: 0.7;
}

/* Loading state */
.users-table.loading {
  position: relative;
  opacity: 0.6;
}

.users-table.loading::after {
  content: 'Chargement...';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--white);
  padding: 1rem 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  z-index: 100;
  font-weight: 600;
  color: var(--accent);
}

/* Responsive */
@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .admin-content {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .filters {
    flex-direction: column;
    gap: 0.75rem;
  }

  .search-group {
    min-width: auto;
  }

  .filter-select {
    min-width: auto;
  }

  .table-controls {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .table-actions {
    justify-content: center;
  }

  .results-summary {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
    gap: 0.75rem;
  }

  /* Tableau responsive */
  .users-table table {
    min-width: 800px;
  }

  .user-email-mobile {
    display: block;
  }

  .user-email-desktop {
    display: none;
  }

  .skills-grid {
    grid-template-columns: 1fr;
  }

  .user-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .actions {
    flex-wrap: wrap;
    justify-content: center;
  }

  .participants {
    flex-direction: column;
    align-items: flex-start;
  }

  table {
    font-size: 0.9rem;
  }

  th, td {
    padding: 0.75rem 0.5rem;
  }

  .btn-sm {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
}
</style>
