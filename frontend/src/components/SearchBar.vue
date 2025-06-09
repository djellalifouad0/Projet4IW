<template>
  <div class="search-bar">
    <div class="search-input-wrapper">
      <img src="@/assets/icons/search.svg" alt="search" class="search-icon" />
      <input
        type="text"
        :placeholder="placeholder"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchBar',
  props: {
    modelValue: String,
    placeholder: {
      type: String,
      default: 'Rechercher des skills'
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
}
.search-icon {
  position: absolute;
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  pointer-events: none;
}
.search-input-wrapper input {
  width: 100%;
  padding: 18px 32px 18px 54px;
  border-radius: 18px;
  border: none;
  background: var(--input-bg);
  font-size: 1.18rem;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
  color: var(--text-primary);
  font-weight: 500;
  transition: background 0.3s ease, color 0.3s ease;
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
    padding: 14px 14px 14px 44px;
    border-radius: 13px;
  }
  .search-icon {
    width: 18px;
    height: 18px;
  }
}
</style>
