import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import Home from '../components/Home.vue'
import LoginForm from '../components/LoginForm.vue'
import RegisterForm from '../components/RegisterForm.vue'

// Lazy loading généralisé pour toutes les routes sauf Home, Login et Register
const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', component: Home },
      { path: 'dashboard', component: () => import('../components/Dashboard.vue') },
      { path: 'profile', component: () => import('../components/Profile.vue') },
      { path: 'profile/:profileToken', component: () => import('../components/Profile.vue') },
      { path: 'carte', component: () => import('../components/Carte.vue') },
      { path: 'discussions', component: () => import('../components/Discussions.vue') },
      { path: 'notifications', component: () => import('../components/Notifications.vue') },
      { path: 'parametres', component: () => import('../components/Settings.vue') },
    ]
  },
  { 
    path: '/admin', 
    component: () => import('../components/AdminPanel.vue'),
    meta: { requiresAdmin: true }
  },
  { path: '/login', component: LoginForm },
  { path: '/register', component: RegisterForm },
  { path: '/:pathMatch(.*)*', redirect: '/' } // Redirection 404 vers l'accueil
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Protection des routes admin
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAdmin) {
    const token = localStorage.getItem('token')
    if (!token) {
      next('/login')
      return
    }    try {
      // Vérifier si l'utilisateur est admin via l'API
      const api = (await import('../services/api')).default
      const response = await api.get('/auth/me')
      
      console.log('Response from /auth/me:', response.data)
      console.log('User role:', response.data.role)
      
      if (response.data.role !== 'admin') {
        console.log('User is not admin, redirecting to home')
        next('/')
        return
      }
      
      console.log('User is admin, allowing access')
    } catch (error) {
      console.error('Error checking admin status:', error)
      next('/login')
      return
    }
  }
  
  next()
})

export default router
