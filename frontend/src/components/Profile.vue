<template>
  <div class="profile-content">
    <h1 class="profile-title">Mon profil</h1>
    <div class="profile-card">
      <img class="profile-avatar" src="https://randomuser.me/api/portraits/men/32.jpg" alt="Avatar utilisateur" />
      <div class="profile-infos">
        <h2 class="profile-name">Fouad Andrieu</h2>
        <p class="profile-email">fouad.andrieu@email.com</p>
        <div class="profile-actions">
          <button class="profile-btn">Modifier le profil</button>
          <button class="profile-btn profile-btn-secondary">Changer le mot de passe</button>
        </div>
      </div>
    </div>
    <div class="profile-section">
      <h3>À propos</h3>
      <p class="profile-about">Développeur passionné par l'échange de compétences et l'entraide. Disponible pour des missions freelance et des collaborations sur SkillSwap !</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Profile',
}
</script>

<style scoped>
.profile-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.2rem 1rem 2.2rem 1rem;
  background: #FFFEF9;
  width: 1000px;
  max-width: 100%;
  margin: 0 auto;
}
.profile-title {
  font-size: 2.1rem;
  color: #E48700;
  margin-bottom: 0.7rem;
  font-weight: bold;
}
.profile-card {
  display: flex;
  align-items: center;
  background: #FFF4E3;
  border-radius: 14px;
  box-shadow: 0 2px 8px #0001;
  padding: 2rem 2.5rem;
  margin-bottom: 2.2rem;
  min-width: 320px;
  max-width: 700px;
  width: 100%;
}
.profile-avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  margin-right: 2rem;
  border: 3px solid #ECBC76;
  background: #fff;
}
.profile-infos {
  flex: 1;
}
.profile-name {
  font-size: 1.35rem;
  color: #28303F;
  margin: 0 0 0.3rem 0;
}
.profile-email {
  color: #E48700;
  margin-bottom: 1.1rem;
}
.profile-actions {
  display: flex;
  gap: 1rem;
}
.profile-btn {
  background: #ECBC76;
  color: #28303F;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.3rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.18s;
}
.profile-btn:hover {
  background: #E48700;
  color: #fff;
}
.profile-btn-secondary {
  background: #fff;
  color: #E48700;
  border: 1px solid #E48700;
}
.profile-btn-secondary:hover {
  background: #E48700;
  color: #fff;
}
.profile-section {
  background: #FFF4E3;
  border-radius: 10px;
  box-shadow: 0 2px 8px #0001;
  padding: 1.5rem 2rem;
  max-width: 700px;
  width: 100%;
}
.profile-section h3 {
  color: #E48700;
  margin-bottom: 0.7rem;
}
.profile-about {
  color: #28303F;
  font-size: 1.08rem;
  margin: 0;
}
@media (max-width: 700px) {
  .profile-card, .profile-section {
    padding: 1.2rem 0.7rem;
    min-width: 0;
    max-width: 100%;
  }
  .profile-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.2rem;
  }
  .profile-avatar {
    margin-right: 0;
    margin-bottom: 1rem;
  }
}
</style>
