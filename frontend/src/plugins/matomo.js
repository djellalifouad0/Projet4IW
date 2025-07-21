import VueMatomo from 'vue-matomo'

export default {
  install(app) {
    app.use(VueMatomo, {
      host: 'https://srv908931.hstgr.cloud/matomo/', // ton instance
      siteId: 2, // idSite correct
      trackerFileName: 'matomo', // optionnel
      enableLinkTracking: true,
      requireConsent: false,
      trackInitialView: true,
      enableHeartBeatTimer: true,
      heartBeatTimerInterval: 15,
    })

    // Si tu veux forcer un pageview supplémentaire à l'install
    if (window._paq) {
      window._paq.push(['trackPageView'])
    }
  }
}
