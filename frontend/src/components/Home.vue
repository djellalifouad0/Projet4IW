<template>
  <div class="home-content">
    <div class="filters-bar">
      <button class="filter-btn">Filtrer par <span>▼</span></button>
      <button class="publish-btn">+ Publier</button>
    </div>

    <div class="cards">
      <!-- Post normal -->
      <PostCard
        name="Fouad Andrieu"
        address="242 Rue du Faubourg Saint-Antoine, 75012 Paris"
        :avatar="'https://randomuser.me/api/portraits/men/32.jpg'"
        rate=""
        :likes="6"
        :views="8"
        :online="true"
        :description="'Ici c’est un post normal, visible pour tous, sans indication de tarif. Le contenu s’affiche classiquement et le fond reste clair (#FFF4E3). Tu peux interagir avec ce post comme d’habitude. Si le texte dépasse 270 caractères, ...afficher plus s’affichera automatiquement. Profite des fonctionnalités standards de la plateforme pour poster, liker, commenter, etc.'"
      />

      <!-- Post service payant -->
      <PostCard
        name="Laurane Dupont"
        address="88 Rue Oberkampf, 75011 Paris"
        :avatar="'https://randomuser.me/api/portraits/women/44.jpg'"
        rate="18€/h"
        :likes="8"
        :views="15"
        :online="true"
        :paid="true"
        :description="'Ceci est un post de service payant : tu vois le fond en #ECBC76, les pastilles like/comment en #FFF4E3, et l’étiquette de tarif en haut à droite est sur fond #28303F avec texte blanc. Le contenu long sera coupé à 270 caractères avec ...afficher plus si besoin. Ce type de post est idéal pour mettre en avant des offres professionnelles ou des prestations à tarif horaire.'"
      />
    </div>
  </div>
</template>

<script>
import PostCard from './PostCard.vue'

export default {
  name: 'Home',
  components: { PostCard }
}
</script>

<style scoped>
.home-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.2rem 1rem 2.2rem 1rem;
  background: #FFFEF9;
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
@media (max-width: 900px) {
  .filters-bar,
  .cards {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    padding-left: 2vw;
    padding-right: 2vw;
  }
  .cards {
    gap: 16px;
  }
  .home-content, .cards {
    padding-bottom: 50px; 
  }
}
@media (max-width: 700px) {
  .filters-bar,
  .cards {
    padding-left: 3vw;
    padding-right: 3vw;
  }
  .filters-bar {
    gap: 12px;
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 18px;
  }
  .filters-bar .filter-btn,
  .filters-bar .publish-btn {
    width: 100%;
    padding: 14px 0;
    border-radius: 12px;
    font-size: 1rem;
  }
  .cards {
    gap: 12px;
  }
}
@media (max-width: 480px) {
  .filters-bar,
  .cards {
    padding-left: 4vw;
    padding-right: 4vw;
  }
  .filters-bar .filter-btn,
  .filters-bar .publish-btn {
    padding: 11px 0;
    font-size: 0.98rem;
    border-radius: 8px;
  }
}
</style>
