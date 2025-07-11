<template>
  <button 
    @click="toggleTheme" 
    class="theme-toggle-btn"
    :title="isDark ? 'Passer en mode clair' : 'Passer en mode sombre'"
    aria-label="Basculer le thème"
  >
    <!-- Icône soleil pour le mode clair -->
    <svg v-if="!isDark" class="theme-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
      <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2"/>
    </svg>
    
    <!-- Icône lune pour le mode sombre -->
    <svg v-else class="theme-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" stroke-width="2" fill="currentColor"/>
    </svg>
    
    <span class="theme-text">Changer thème</span>
  </button>
</template>

<script>
export default {
  name: 'ThemeToggle',
  data() {
    return {
      isDark: false
    }
  },
  mounted() {
    // Vérifier le thème sauvegardé ou la préférence système
    const savedTheme = localStorage.getItem('theme')
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    this.isDark = savedTheme === 'dark' || (!savedTheme && systemDark)
    this.applyTheme()
    
    // Écouter les changements de préférence système
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.isDark = e.matches
        this.applyTheme()
      }
    })
  },
  methods: {
    toggleTheme() {
      this.isDark = !this.isDark
      this.applyTheme()
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light')
    },
    applyTheme() {
      if (this.isDark) {
        document.documentElement.classList.add('dark-theme')
      } else {
        document.documentElement.classList.remove('dark-theme')
      }
    }
  }
}
</script>

<style scoped>
.theme-toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  color: #28303F;
  min-width: 44px;
  min-height: 44px;
}

.theme-toggle-btn:hover {
  background: rgba(236, 188, 118, 0.1);
  color: #E48700;
  transform: scale(1.05);
}

.theme-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.theme-text {
  font-size: 1.08rem;
  font-weight: 500;
  white-space: nowrap;
}

.theme-toggle-btn:hover .theme-icon {
  transform: rotate(15deg);
}

/* Styles pour le dark mode */
.dark-theme .theme-toggle-btn {
  color: #cbd5e0;
}

.dark-theme .theme-toggle-btn:hover {
  background: rgba(244, 164, 116, 0.1);
  color: #F4A474;
}

/* Animation fluide lors du changement */
.theme-toggle-btn .theme-icon {
  animation: iconFadeIn 0.3s ease;
}

@keyframes iconFadeIn {
  from {
    opacity: 0;
    transform: rotate(-15deg) scale(0.8);
  }
  to {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
}

/* Responsive */
@media (max-width: 1350px) {
  .theme-toggle-btn {
    min-width: 40px;
    min-height: 40px;
    padding: 6px 10px;
  }
  
  .theme-icon {
    width: 18px;
    height: 18px;
  }
  
  .theme-text {
    font-size: 1.08rem;
  }
}

@media (max-width: 768px) {
  .theme-text {
    display: none;
  }
  
  .theme-toggle-btn {
    padding: 6px;
    gap: 0;
  }
}
</style>
