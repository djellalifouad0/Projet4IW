import api from './api'
import socketService from './socket'

class AuthService {
  /**
   * Récupérer les informations de l'utilisateur connecté
   */
  static async getUserInfo() {
    try {
      const response = await api.get('/auth/me')
      const user = response.data
      
      // Initialiser la connexion WebSocket si l'utilisateur est connecté
      const token = localStorage.getItem('token')
      if (token && user) {
        try {
          await socketService.connect(token)
          console.log('🔌 WebSocket connecté automatiquement pour:', user.username)
        } catch (socketError) {
          console.warn('⚠️ Erreur connexion WebSocket (fonctionnalité réduite):', socketError.message)
          // Ne pas échouer complètement si WebSocket ne fonctionne pas
        }
      }
      
      return user
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error)
      throw error
    }
  }

  /**
   * Connexion utilisateur
   */
  static async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token } = response.data
      
      // Stocker le token
      localStorage.setItem('token', token)
      
      // Récupérer les infos utilisateur et initialiser WebSocket
      const user = await this.getUserInfo()
      
      return { token, user }
    } catch (error) {
      console.error('Erreur connexion:', error)
      throw error
    }
  }

  /**
   * Déconnexion utilisateur
   */
  static logout() {
    // Fermer la connexion WebSocket
    if (socketService.isConnected()) {
      socketService.disconnect()
    }
    
    // Supprimer le token
    localStorage.removeItem('token')
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  static isAuthenticated() {
    return !!localStorage.getItem('token')
  }

  /**
   * Initialiser la connexion WebSocket manuellement
   */
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
