<template>
  <div class="home-content">
    <div class="search-bar">
      <input type="text" placeholder="Rechercher des skills" />
    </div>
    <div class="filters-bar">
      <button class="filter-btn">Filtrer par <span>▼</span></button>
      <button class="publish-btn">+ Publier</button>
    </div>
    <div class="cards">
      <PostCard
        v-for="n in 3"
        :key="n"
        name="Fouad Andrieu"
        address="242 Rue du Faubourg Saint-Antoine, 75012 Paris"
        :avatar="'https://randomuser.me/api/portraits/men/32.jpg'"
        :rate="n === 3 ? '12€/h' : ''"
        description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen."
        :likes="6"
        :views="n === 2 ? 6 : 8"
        :showMore="true"
        :online="true"
      />
    </div>
  </div>
</template>

<script>
import PostCard from './PostCard.vue'
export default { name: 'Home', components: { PostCard } }
</script>

<style scoped>
.home-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;   /* centre le contenu par défaut */
  padding: 1.2rem 1rem;
  min-height: 100vh;
  background: #FFFEF9;
}

.search-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.search-bar input {
  width: 700px;
  max-width: 100%;
  padding: 18px 32px;
  border-radius: 18px;
  border: none;
  background: #fff;
  font-size: 1.18rem;
  box-shadow: 0 2px 16px #0001;
  color: #d48a2f;
  font-weight: 500;
}

.filters-bar {
  display: flex;
  justify-content: space-between;
  width: 700px;
  max-width: 100%;
  margin: 0 auto 40px auto;
  gap: 32px;
  margin-top: 10px;
}

.filters-bar .filter-btn {
  background: #fff;
  border: none;
  border-radius: 10px;
  padding: 14px 32px;
  font-size: 1.08rem;
  color: #d48a2f;
  cursor: pointer;
  box-shadow: 0 2px 8px #0001;
  font-weight: 500;
}

.filters-bar .publish-btn {
  background: #f59c1a;
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 14px 38px;
  font-size: 1.18rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px #0001;
}

.cards {
  display: flex;
  flex-direction: column;
  gap: 22px;
  align-items: center;
}

/* reste inchangé */
</style>
