<template>
  <div class="home-content">
    <div class="search-bar">
      <div class="search-input-wrapper">
        <img src="@/assets/icons/search.svg" alt="search" class="search-icon" />
        <input type="text" placeholder="Rechercher des skills" />
      </div>
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
        description="Je suis passionné par l’apprentissage collaboratif et l’accompagnement de développeurs débutants ou confirmés sur leurs projets. J’organise chaque mois des sessions de code, de la revue de projets, et des masterclass sur les meilleures pratiques front-end et back-end. J’ai déjà accompagné plus de trente personnes sur divers sujets, avec un focus particulier sur Vue.js, React, Node.js, mais aussi sur l’automatisation des tâches avec des outils modernes. Si tu veux progresser, surmonter un blocage, ou tout simplement partager ta passion, n’hésite pas à me contacter ici. Les sessions sont toujours adaptées à tes besoins, on avance à ton rythme, et toujours dans la bonne humeur. Mon objectif : faire progresser toute la communauté ensemble ! 🚀🚀🚀"
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
  align-items: center;
  padding: 1.2rem 1rem;
  min-height: 100vh;
  background: #FFFEF9;
}

/* Search bar & input + icon */
.search-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
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
  padding: 18px 32px 18px 54px; /* padding-left pour l’icône */
  border-radius: 18px;
  border: none;
  background: #fff;
  font-size: 1.18rem;
  box-shadow: 0 2px 16px #0001;
  color: #d48a2f;
  font-weight: 500;
}

/* Filters bar + boutons */
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
  background: #ECBC76;
  color: #111;
  border: none;
  border-radius: 10px;
  padding: 14px 32px;
  font-size: 1.08rem;
  cursor: pointer;
  box-shadow: 0 2px 8px #0001;
  font-weight: 500;
  transition: background 0.18s;
}
.filters-bar .filter-btn span {
  margin-left: 8px;
}
.filters-bar .publish-btn {
  background: #E48700;
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 14px 38px;
  font-size: 1.18rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px #0001;
  transition: background 0.18s;
}

/* Cards grid */
.cards {
  display: flex;
  flex-direction: column;
  gap: 22px;
  align-items: center;
}
</style>
