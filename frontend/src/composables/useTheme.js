import { ref, computed, watch } from 'vue'

// État réactif du thème
const isDarkMode = ref(false)

// Initialiser le thème depuis le localStorage
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
  } else {
    // Utiliser la préférence système par défaut
    isDarkMode.value = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme()
}

// Appliquer le thème au document
const applyTheme = () => {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark-mode')
    document.documentElement.classList.remove('light-mode')
  } else {
    document.documentElement.classList.add('light-mode')
    document.documentElement.classList.remove('dark-mode')
  }
}

// Sauvegarder le thème dans le localStorage
const saveTheme = () => {
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
}

// Composable useTheme
export const useTheme = () => {
  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
    applyTheme()
    saveTheme()
  }

  const setTheme = (theme) => {
    isDarkMode.value = theme === 'dark'
    applyTheme()
    saveTheme()
  }

  const currentTheme = computed(() => isDarkMode.value ? 'dark' : 'light')

  // Watcher pour appliquer automatiquement les changements
  watch(isDarkMode, () => {
    applyTheme()
    saveTheme()
  })

  return {
    isDarkMode,
    currentTheme,
    toggleTheme,
    setTheme,
    initTheme
  }
}

// Écouter les changements de préférence système
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      isDarkMode.value = e.matches
      applyTheme()
    }
  })
}
