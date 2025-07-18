<template>
  <nav class="breadcrumb" aria-label="Fil d'Ariane" v-if="breadcrumbs.length > 1">
    <ol class="breadcrumb-list">
      <li 
        v-for="(crumb, index) in breadcrumbs" 
        :key="index" 
        class="breadcrumb-item"
        :class="{ 'active': index === breadcrumbs.length - 1 }"
      >
        <router-link 
          v-if="index < breadcrumbs.length - 1" 
          :to="crumb.path"
          class="breadcrumb-link"
          :aria-label="`Aller à ${crumb.title}`"
        >
          {{ crumb.title }}
        </router-link>
        <span v-else class="breadcrumb-current" aria-current="page">
          {{ crumb.title }}
        </span>
        <span v-if="index < breadcrumbs.length - 1" class="breadcrumb-separator" aria-hidden="true">
          /
        </span>
      </li>
    </ol>
  </nav>
</template>

<script>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { SEOService } from '../services/seoService.js'

export default {
  name: 'Breadcrumb',
  setup() {
    const route = useRoute()

    const breadcrumbConfig = {
      '/': { title: 'Accueil', path: '/' },
      '/dashboard': { title: 'Dashboard', path: '/dashboard' },
      '/profile': { title: 'Mon Profil', path: '/profile' },
      '/carte': { title: 'Carte', path: '/carte' },
      '/discussions': { title: 'Discussions', path: '/discussions' },
      '/notifications': { title: 'Notifications', path: '/notifications' },
      '/parametres': { title: 'Paramètres', path: '/parametres' },
      '/login': { title: 'Connexion', path: '/login' },
      '/register': { title: 'Inscription', path: '/register' }
    }

    const breadcrumbs = computed(() => {
      const path = route.path
      const crumbs = []

      // Toujours commencer par l'accueil (sauf si on y est déjà)
      if (path !== '/') {
        crumbs.push(breadcrumbConfig['/'])
      }

      // Gérer les routes avec paramètres
      if (path.startsWith('/profile/') && path !== '/profile') {
        crumbs.push(breadcrumbConfig['/profile'])
        crumbs.push({ 
          title: 'Profil utilisateur', 
          path: path 
        })
      } else if (path.startsWith('/post/')) {
        crumbs.push({ title: 'Publications', path: '/' })
        crumbs.push({ 
          title: 'Publication', 
          path: path 
        })
      } else if (breadcrumbConfig[path]) {
        crumbs.push(breadcrumbConfig[path])
      }

      return crumbs
    })

    // Générer les données structurées pour le breadcrumb
    const generateBreadcrumbSchema = () => {
      if (breadcrumbs.value.length <= 1) return null

      return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.value.map((crumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.title,
          "item": `${SEOService.baseUrl}${crumb.path}`
        }))
      }
    }

    // Ajouter les données structurées au DOM
    const addBreadcrumbSchema = () => {
      const schema = generateBreadcrumbSchema()
      if (schema) {
        // Supprimer l'ancien script s'il existe
        const existingScript = document.querySelector('script[data-breadcrumb-schema]')
        if (existingScript) {
          existingScript.remove()
        }

        // Ajouter le nouveau script
        const script = document.createElement('script')
        script.type = 'application/ld+json'
        script.setAttribute('data-breadcrumb-schema', 'true')
        script.textContent = JSON.stringify(schema)
        document.head.appendChild(script)
      }
    }

    // Mettre à jour les données structurées quand les breadcrumbs changent
    watch(breadcrumbs, addBreadcrumbSchema, { immediate: true })

    return {
      breadcrumbs
    }
  }
}
</script>

<style scoped>
.breadcrumb {
  margin: 1rem 0;
  padding: 0.5rem 0;
}

.breadcrumb-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 0.875rem;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-link {
  color: #666;
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: #007bff;
  text-decoration: underline;
}

.breadcrumb-current {
  color: #333;
  font-weight: 500;
}

.breadcrumb-separator {
  margin: 0 0.5rem;
  color: #999;
}

.breadcrumb-item.active .breadcrumb-current {
  color: #007bff;
}

/* Mode sombre */
.dark-theme .breadcrumb-link {
  color: #ccc;
}

.dark-theme .breadcrumb-link:hover {
  color: #4da6ff;
}

.dark-theme .breadcrumb-current {
  color: #fff;
}

.dark-theme .breadcrumb-separator {
  color: #666;
}

.dark-theme .breadcrumb-item.active .breadcrumb-current {
  color: #4da6ff;
}

/* Responsive */
@media (max-width: 768px) {
  .breadcrumb {
    margin: 0.5rem 0;
  }
  
  .breadcrumb-list {
    font-size: 0.75rem;
  }
  
  .breadcrumb-separator {
    margin: 0 0.25rem;
  }
}
</style>
