import MatomoService from '../services/matomoService.js'

export default {
  install(app) {
    const matomoService = new MatomoService()
    
    // Fournir le service Matomo via provide/inject
    app.provide('matomo', matomoService)
    
    // Ajouter également comme propriété globale (optionnel)
    app.config.globalProperties.$matomo = matomoService
  }
}
