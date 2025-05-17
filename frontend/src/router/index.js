import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import Home from '../components/Home.vue'
import LoginForm from '../components/LoginForm.vue'
import RegisterForm from '../components/RegisterForm.vue'
import Carte from '../components/Carte.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', component: Home },
      { path: 'carte', component: Carte },
      // d'autres pages ici avec menu si besoin
    ]
  },
  { path: '/login', component: LoginForm },
  { path: '/register', component: RegisterForm }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
