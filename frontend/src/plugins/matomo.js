import matomoService from '../services/matomoService.js'

export default {
  install(app) {

    app.config.globalProperties.$matomo = matomoService
    app.provide('matomo', matomoService)

    const router = app.config.globalProperties.$router
    
    if (router) {

      router.beforeEach((to, from, next) => {

        if (from.name) {
          matomoService.endPageTimer(from.name)
        }
        next()
      })
      
      router.afterEach((to) => {

        matomoService.trackPageView(to.name || to.path)
        matomoService.startPageTimer()
      })
    }

    window.addEventListener('error', (event) => {
      matomoService.trackError(event.message, event.filename)
    })

    window.addEventListener('unhandledrejection', (event) => {
      matomoService.trackError(event.reason.toString(), window.location.href)
    })
  }
}

