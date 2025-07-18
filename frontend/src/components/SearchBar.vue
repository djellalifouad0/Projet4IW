<template>
  <div class="search-bar">
    <form @submit.prevent="handleSearch" class="search-input-wrapper">
      <img src="@/assets/icons/search.svg" alt="search" class="search-icon" />
      <input
        type="text"
        :placeholder="placeholder"
        v-model="searchQuery"
        @input="$emit('update:modelValue', searchQuery)"
      />
      <button type="submit" class="search-submit-btn" :disabled="!searchQuery.trim()">
        Rechercher
      </button>
    </form>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'SearchBar',
  props: {
    modelValue: String,
    placeholder: {
      type: String,
      default: 'Rechercher des services, compétences...'
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const router = useRouter()

    return {
      router
    }
  },
  data() {
    return {
      searchQuery: this.modelValue || ''
    }
  },
  watch: {
    modelValue(newValue) {
      this.searchQuery = newValue || ''
    }
  },
  methods: {
    handleSearch() {
      if (!this.searchQuery.trim()) return

      if (this.$matomo) {
        this.$matomo.trackSearchExecuted(this.searchQuery.trim())
      }

      this.$router.push({
        path: '/',
        query: { search: this.searchQuery.trim() }
      })

      this.$emit('search', this.searchQuery.trim())
    }
  }
}
</script>

<style scoped>
.search-bar {
  display: flex;
  justify-content: center;
  margin-top: 22px;     
}
.search-input-wrapper {
  position: relative;
  width: 700px;
  max-width: 100%;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  pointer-events: none;
  z-index: 2;
}
.search-input-wrapper input {
  flex: 1;
  padding: 18px 120px 18px 54px;
  border-radius: 18px;
  border: none;
  background: #fff;
  font-size: 1.18rem;
  box-shadow: 0 2px 16px #0001;
  color: #28303F;
  font-weight: 500;
}
.search-input-wrapper input::placeholder {
  color: #999;
  font-weight: 400;
}
.search-submit-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: #ECBC76;
  color: #28303F;
  border: none;
  border-radius: 12px;
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;
}
.search-submit-btn:hover:not(:disabled) {
  background: #e6b056;
  transform: translateY(-50%) translateY(-1px);
}
.search-submit-btn:disabled {
  background: #ccc;
  color: #888;
  cursor: not-allowed;
}


.dark-theme .search-input-wrapper input {
  background: #2d3748 !important;
  color: #e2e8f0 !important;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.3) !important;
}

.dark-theme .search-input-wrapper input::placeholder {
  color: #a0aec0 !important;
}

.dark-theme .search-submit-btn {
  background: #ECBC76 !important;
  color: #1a202c !important;
}

.dark-theme .search-submit-btn:hover:not(:disabled) {
  background: #e6b056 !important;
  box-shadow: 0 2px 8px rgba(236, 188, 118, 0.4) !important;
}

.dark-theme .search-submit-btn:disabled {
  background: #4a5568 !important;
  color: #a0aec0 !important;
}

@media (max-width: 900px) {
  .search-input-wrapper {
    width: 100%;
    padding-left: 2vw;
    padding-right: 2vw;
    box-sizing: border-box;
  }
  .search-icon {
    left: 30px;
  }
  .search-submit-btn {
    padding: 8px 12px;
    font-size: 0.85rem;
  }
}
@media (max-width: 700px) {
  .search-bar {
    margin-top: 18px; 
  }
  .search-input-wrapper {
    padding-left: 3vw;
    padding-right: 3vw;
  }
}
@media (max-width: 480px) {
  .search-input-wrapper {
    padding-left: 4vw;
    padding-right: 4vw;
  }
  .search-input-wrapper input {
    font-size: 1rem;
    padding: 14px 100px 14px 44px;
    border-radius: 13px;
  }
  .search-icon {
    width: 18px;
    height: 18px;
  }
  .search-submit-btn {
    padding: 6px 10px;
    font-size: 0.8rem;
    border-radius: 8px;
  }
}
</style>

