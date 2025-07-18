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
      { 
        path: '', 
        component: Home,
        meta: {
          title: 'SkillSwap - Accueil | Échangez vos compétences',
          description: 'Découvrez SkillSwap, la plateforme qui connecte les passionnés pour échanger des compétences. Rejoignez notre communauté d\'apprentissage collaboratif.',
          keywords: 'accueil skillswap, échange compétences, communauté apprentissage, plateforme skills',
          ogType: 'website'
        }
      },
      { 
        path: 'dashboard', 
        component: () => import('../components/Dashboard.vue'),
        meta: {
          title: 'Dashboard - SkillSwap | Gérez vos échanges',
          description: 'Accédez à votre tableau de bord SkillSwap. Suivez vos échanges de compétences, vos rendez-vous et votre progression.',
          keywords: 'dashboard, tableau de bord, gestion échanges, suivi compétences',
          requiresAuth: true
        }
      },
      { 
        path: 'profile', 
        component: () => import('../components/Profile.vue'),
        meta: {
          title: 'Profil - SkillSwap | Votre espace personnel',
          description: 'Gérez votre profil SkillSwap. Ajoutez vos compétences, consultez vos évaluations et personnalisez votre expérience.',
          keywords: 'profil utilisateur, compétences personnelles, évaluations, paramètres compte',
          requiresAuth: true
        }
      },
      { 
        path: 'profile/:profileToken', 
        component: () => import('../components/Profile.vue'),
        meta: {
          title: 'Profil utilisateur - SkillSwap',
          description: 'Découvrez le profil d\'un membre de la communauté SkillSwap, ses compétences et ses évaluations.',
          keywords: 'profil public, compétences utilisateur, évaluations, membre communauté',
          ogType: 'profile'
        }
      },
      { 
        path: 'post/:id', 
        component: () => import('../components/PostView.vue'),
        meta: {
          title: 'Publication - SkillSwap',
          description: 'Découvrez cette publication sur SkillSwap et participez aux échanges de compétences.',
          keywords: 'publication, post, échange compétences, discussion, communauté',
          ogType: 'article'
        }
      },
      { 
        path: 'carte', 
        component: () => import('../components/Carte.vue'),
        meta: {
          title: 'Carte - SkillSwap | Trouvez des experts près de vous',
          description: 'Explorez la carte interactive SkillSwap pour découvrir des experts et apprenants dans votre région.',
          keywords: 'carte interactive, experts locaux, géolocalisation, proximité compétences'
        }
      },
      { 
        path: 'discussions', 
        component: () => import('../components/Discussions.vue'),
        meta: {
          title: 'Discussions - SkillSwap | Communiquez avec la communauté',
          description: 'Participez aux discussions SkillSwap. Échangez avec d\'autres membres, posez vos questions et partagez vos expériences.',
          keywords: 'discussions, messagerie, communauté, échanges, communication',
          requiresAuth: true
        }
      },
      { 
        path: 'notifications', 
        component: () => import('../components/Notifications.vue'),
        meta: {
          title: 'Notifications - SkillSwap | Restez informé',
          description: 'Consultez vos notifications SkillSwap. Ne manquez aucune opportunité d\'échange ou message important.',
          keywords: 'notifications, alertes, messages, mises à jour, informations',
          requiresAuth: true,
          noindex: true // Page privée, ne pas indexer
        }
      },
      { 
        path: 'parametres', 
        component: () => import('../components/Settings.vue'),
        meta: {
          title: 'Paramètres - SkillSwap | Personnalisez votre expérience',
          description: 'Configurez vos paramètres SkillSwap. Gérez vos préférences, votre confidentialité et vos notifications.',
          keywords: 'paramètres, configuration, préférences, confidentialité, notifications',
          requiresAuth: true,
          noindex: true // Page privée, ne pas indexer
        }
      },
    ]
  },
  { 
    path: '/login', 
    component: LoginForm,
    meta: {
      title: 'Connexion - SkillSwap | Accédez à votre compte',
      description: 'Connectez-vous à votre compte SkillSwap pour accéder à vos échanges de compétences et votre communauté.',
      keywords: 'connexion, login, accès compte, authentification'
    }
  },
  { 
    path: '/register', 
    component: RegisterForm,
    meta: {
      title: 'Inscription - SkillSwap | Rejoignez la communauté',
      description: 'Inscrivez-vous sur SkillSwap et commencez à échanger vos compétences avec une communauté passionnée.',
      keywords: 'inscription, registration, nouveau compte, rejoindre communauté'
    }
  },
  { path: '/:pathMatch(.*)*', redirect: '/' } // Redirection 404 vers l'accueil
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Amélioration UX : gestion du scroll pour le SEO
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Guard global pour le SEO
router.beforeEach((to, from, next) => {
  // Mettre à jour le titre de la page
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  next()
})

export default router
