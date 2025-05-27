<template>
  <div class="toast-container">
    <transition-group name="toast" tag="div" class="toast-list">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', `toast-${toast.type}`]"
        @click="removeToast(toast.id)"
      >
        <div class="toast-icon">
          <svg v-if="toast.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else-if="toast.type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else-if="toast.type === 'warning'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 8V12M12 16H12.01M10.29 3.86L1.82 18A2 2 0 0 0 3.24 21H20.76A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="toast-content">
          <div class="toast-title" v-if="toast.title">{{ toast.title }}</div>
          <div class="toast-message">{{ toast.message }}</div>
        </div>
        <button class="toast-close" @click.stop="removeToast(toast.id)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script>
export default {
  name: 'ToastContainer',
  data() {
    return {
      toasts: []
    }
  },
  mounted() {
    // Écouter les événements de toast globaux
    window.addEventListener('show-toast', this.handleToastEvent);
  },
  beforeUnmount() {
    window.removeEventListener('show-toast', this.handleToastEvent);
  },
  methods: {
    handleToastEvent(event) {
      this.addToast(event.detail);
    },
    
    addToast(toastData) {
      const toast = {
        id: Date.now() + Math.random(),
        type: toastData.type || 'info',
        title: toastData.title,
        message: toastData.message || '',
        duration: toastData.duration || 5000
      };
      
      this.toasts.push(toast);
      
      // Auto-remove après la durée spécifiée
      if (toast.duration > 0) {
        setTimeout(() => {
          this.removeToast(toast.id);
        }, toast.duration);
      }
    },
    
    removeToast(id) {
      const index = this.toasts.findIndex(toast => toast.id === id);
      if (index > -1) {
        this.toasts.splice(index, 1);
      }
    }
  }
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  pointer-events: none;
}

.toast-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 300px;
  max-width: 400px;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1), 0 8px 40px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(8px);
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.toast:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 32px rgba(0, 0, 0, 0.15), 0 12px 48px rgba(0, 0, 0, 0.12);
}

.toast-success {
  background: rgba(220, 252, 231, 0.95);
  color: #065f46;
  border-left: 4px solid #10b981;
}

.toast-error {
  background: rgba(254, 226, 226, 0.95);
  color: #991b1b;
  border-left: 4px solid #ef4444;
}

.toast-warning {
  background: rgba(255, 251, 235, 0.95);
  color: #92400e;
  border-left: 4px solid #f59e0b;
}

.toast-info {
  background: rgba(219, 234, 254, 0.95);
  color: #1e40af;
  border-left: 4px solid #3b82f6;
}

.toast-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.toast-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  line-height: 1.4;
}

.toast-message {
  font-size: 13px;
  line-height: 1.4;
  opacity: 0.95;
  word-wrap: break-word;
}

.toast-close {  flex-shrink: 0;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  padding: 2px;
  border-radius: 4px;
}

.toast-close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.05);
}

/* Animations */
.toast-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  transform: translateX(100%) scale(0.8);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%) scale(0.8);
  opacity: 0;
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .toast-container {
    top: 10px;
    right: 10px;
    left: 10px;
  }
  
  .toast {
    min-width: auto;
    max-width: none;
    margin: 0 auto;
  }
}
</style>
