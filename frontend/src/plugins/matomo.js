import matomoService from '../services/matomoService.js'

export default {
  install(app) {
    // Rendre le service Matomo disponible dans tous les composants
    app.config.globalProperties.$matomo = matomoService
    app.provide('matomo', matomoService)
    
    // Configuration des trackers automatiques
    const router = app.config.globalProperties.$router
    
    if (router) {
      // Tracker automatiquement les changements de route
      router.beforeEach((to, from, next) => {
        // Tracker le temps passé sur la page précédente
        if (from.name) {
          matomoService.endPageTimer(from.name)
        }
        next()
      })
      
      router.afterEach((to) => {
        // Tracker la nouvelle page
        matomoService.trackPageView(to.name || to.path)
        matomoService.startPageTimer()
      })
    }
    
    // Tracker les erreurs JavaScript globales
    window.addEventListener('error', (event) => {
      matomoService.trackError(event.message, event.filename)
    })
    
    // Tracker les erreurs de promesses non gérées
    window.addEventListener('unhandledrejection', (event) => {
      matomoService.trackError(event.reason.toString(), window.location.href)
    })
  }
}
