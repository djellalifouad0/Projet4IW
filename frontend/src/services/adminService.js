import api from './api'

class AdminService {
  // Dashboard
  async getDashboardStats() {
    const response = await api.get('/admin/dashboard')
    return response.data
  }

  // Utilisateurs
  async getUsers(params = {}) {
    const response = await api.get('/admin/users', { params })
    return response.data
  }

  async getUserDetails(userId) {
    const response = await api.get(`/admin/users/${userId}`)
    return response.data
  }

  async updateUser(userId, userData) {
    const response = await api.put(`/admin/users/${userId}`, userData)
    return response.data
  }

  async toggleUserBan(userId) {
    const response = await api.patch(`/admin/users/${userId}/ban`)
    return response.data
  }

  async deleteUser(userId) {
    const response = await api.delete(`/admin/users/${userId}`)
    return response.data
  }

  // Compétences
  async getSkills(params = {}) {
    const response = await api.get('/admin/skills', { params })
    return response.data
  }

  async deleteSkill(skillId) {
    const response = await api.delete(`/admin/skills/${skillId}`)
    return response.data
  }

  // Conversations
  async getConversations(params = {}) {
    const response = await api.get('/admin/conversations', { params })
    return response.data
  }

  async deleteConversation(conversationId) {
    const response = await api.delete(`/admin/conversations/${conversationId}`)
    return response.data
  }

  // Rendez-vous
  async getAppointments(params = {}) {
    const response = await api.get('/admin/appointments', { params })
    return response.data
  }

  async getAppointmentDetails(appointmentId) {
    const response = await api.get(`/admin/appointments/${appointmentId}`)
    return response.data
  }

  async updateAppointmentStatus(appointmentId, status) {
    const response = await api.patch(`/admin/appointments/${appointmentId}/status`, { status })
    return response.data
  }

  async deleteAppointment(appointmentId) {
    const response = await api.delete(`/admin/appointments/${appointmentId}`)
    return response.data
  }

  // Messages signalés
  async getFlaggedMessages() {
    const response = await api.get('/admin/messages/flagged')
    return response.data
  }

  // Vérifier si l'utilisateur est admin
  async checkAdminAccess() {
    try {
      await this.getDashboardStats()
      return true
    } catch (error) {
      if (error.response?.status === 403) {
        return false
      }
      throw error
    }
  }
}

export default new AdminService()
