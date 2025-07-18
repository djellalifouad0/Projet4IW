import api from './api'
import socketService from './socket'

class AuthService {
  
  static async getUserInfo() {
    try {
      const response = await api.get('/auth/me')
      const user = response.data

      const token = localStorage.getItem('token')
      if (token && user) {
        try {
          await socketService.connect(token)
          console.log('🔌 WebSocket connecté automatiquement pour:', user.username)
        } catch (socketError) {
          console.warn('⚠️ Erreur connexion WebSocket (fonctionnalité réduite):', socketError.message)

        }
      }
      
      return user
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error)
      throw error
    }
  }

  
  static async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token } = response.data

      localStorage.setItem('token', token)

      const user = await this.getUserInfo()
      
      return { token, user }
    } catch (error) {
      console.error('Erreur connexion:', error)
      throw error
    }
  }

  
  static logout() {

    if (socketService.isConnected()) {
      socketService.disconnect()
    }

    localStorage.removeItem('token')
  }

  
  static isAuthenticated() {
    return !!localStorage.getItem('token')
  }

  
  static async initializeWebSocket() {
    const token = localStorage.getItem('token')
    if (token && !socketService.isConnected()) {
      try {
        await socketService.connect(token)
        console.log('🔌 WebSocket réinitialisé avec succès')
        return true
      } catch (error) {
        console.warn('⚠️ Impossible de réinitialiser WebSocket:', error.message)
        return false
      }
    }
    return socketService.isConnected()
  }
}

export default AuthService

