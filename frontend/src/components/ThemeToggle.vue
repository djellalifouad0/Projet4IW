<template>
  <button 
    @click="toggleTheme" 
    class="theme-toggle-btn"
    :class="{ 'dark': isDarkMode }"
    :title="isDarkMode ? 'Passer en mode clair' : 'Passer en mode sombre'"
  >
    <svg v-if="!isDarkMode" class="theme-icon sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="5"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
    <svg v-else class="theme-icon moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
    <span class="theme-label">{{ isDarkMode ? 'Mode clair' : 'Mode sombre' }}</span>
  </button>
</template>

<script>
import { useTheme } from '../composables/useTheme'

export default {
  name: 'ThemeToggle',
  setup() {
    const { isDarkMode, toggleTheme } = useTheme()
    
    return {
      isDarkMode,
      toggleTheme
    }
  }
}
</script>

<style scoped>
.theme-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
  justify-content: center;
}

.theme-toggle-btn:hover {
  background: var(--hover-bg);
  border-color: var(--accent);
  transform: translateY(-1px);
}

.theme-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.sun-icon {
  color: #f59e0b;
}

.moon-icon {
  color: #6366f1;
}

.theme-toggle-btn:hover .theme-icon {
  transform: rotate(15deg);
}

.theme-label {
  font-weight: 600;
  transition: color 0.3s ease;
}

/* Style compact pour la navbar */
.theme-toggle-btn.compact {
  min-width: auto;
  padding: 0.4rem;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  justify-content: center;
}

.theme-toggle-btn.compact .theme-label {
  display: none;
}

.theme-toggle-btn.compact .theme-icon {
  width: 20px;
  height: 20px;
}

/* Responsive */
@media (max-width: 768px) {
  .theme-toggle-btn {
    min-width: auto;
    padding: 0.4rem 0.8rem;
  }
  
  .theme-label {
    display: none;
  }
}

@media (max-width: 480px) {
  .theme-toggle-btn {
    padding: 0.4rem;
    border-radius: 50%;
    width: 40px;
    height: 40px;
  }
}
</style>
