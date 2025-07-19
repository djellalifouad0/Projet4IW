import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import Home from '../components/Home.vue'
import LoginForm from '../components/LoginForm.vue'
import RegisterForm from '../components/RegisterForm.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', component: Home },
      { path: 'dashboard', component: () => import('../components/Dashboard.vue') },
      { path: 'analytics', component: () => import('../components/AnalyticsDashboard.vue') },      { path: 'profile', component: () => import('../components/Profile.vue') },
      { path: 'profile/:profileToken', component: () => import('../components/Profile.vue') },
      { path: 'post/:id', component: () => import('../components/PostView.vue') },
      { path: 'carte', component: () => import('../components/Carte.vue') },
      { path: 'discussions', component: () => import('../components/Discussions.vue') },
      { path: 'notifications', component: () => import('../components/Notifications.vue') },
      { path: 'parametres', component: () => import('../components/Settings.vue') },
      { path: 'appointments/payment/:appointmentId', component: () => import('../pages/PaymentPage.vue') },
      { path: 'appointments/payment-success', component: () => import('../components/PaymentSuccess.vue') },
    ]
  },
  { path: '/login', component: LoginForm },
  { path: '/register', component: RegisterForm },
  { path: '/:pathMatch(.*)*', redirect: '/' } // Redirection 404 vers l'accueil
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

