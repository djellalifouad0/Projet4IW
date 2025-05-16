import { createRouter, createWebHistory } from 'vue-router'
import LoginForm from '../components/LoginForm.vue'
import RegisterForm from '../components/RegisterForm.vue'
import Home from '../components/Home.vue'
import Navbar from '../components/Navbar.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: LoginForm },
  { path: '/register', component: RegisterForm }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router