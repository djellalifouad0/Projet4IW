import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './assets/styles/base.css'
import './assets/styles/layout.css'
import './assets/styles/forms.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
