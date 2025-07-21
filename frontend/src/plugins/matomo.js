import VueMatomo from 'vue-matomo'

export default {
  install(app) {
    app.use(VueMatomo, {
      // 🔷 Configure ton Matomo ici
      host: 'https://srv908931.hstgr.cloud/matomo/', // <-- ton instance Matomo
      siteId: 2, // <-- ton ID de site
      trackerFileName: 'matomo', // facultatif, par défaut déjà correct
      enableLinkTracking: true,
      requireConsent: false,
      trackInitialView: true, // pour la première page
      enableHeartBeatTimer: true,
      heartBeatTimerInterval: 15,
    })

    // 🔷 Optionnel : déclenche un pageview explicite
    if (window._paq) {
      window._paq.push(['trackPageView'])
    }
  }
}
