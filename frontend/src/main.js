import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import matomoPlugin from './plugins/matomo.js'

import './assets/styles/base.css'
import './assets/styles/layout.css'
import './assets/styles/forms.css'
import './assets/styles/theme.css'

const app = createApp(App)

// Utiliser le plugin Matomo
app.use(matomoPlugin)
app.use(router)

app.mount('#app')
