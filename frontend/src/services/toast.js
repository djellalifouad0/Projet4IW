
class ToastService {

  success(message, title = null, duration = 5000) {
    this.show({
      type: 'success',
      title: title,
      message: message,
      duration: duration
    });
  }

  error(message, title = null, duration = 7000) {
    this.show({
      type: 'error',
      title: title,
      message: message,
      duration: duration
    });
  }

  warning(message, title = null, duration = 6000) {
    this.show({
      type: 'warning',
      title: title,
      message: message,
      duration: duration
    });
  }

  info(message, title = null, duration = 5000) {
    this.show({
      type: 'info',
      title: title,
      message: message,
      duration: duration
    });
  }

  show(options) {
    const event = new CustomEvent('show-toast', {
      detail: options
    });
    window.dispatchEvent(event);
  }

  saveSuccess() {
    this.success('Les modifications ont été enregistrées avec succès !', 'Succès');
  }

  deleteSuccess() {
    this.success('L\'élément a été supprimé avec succès !', 'Suppression réussie');
  }

  updateSuccess() {
    this.success('La mise à jour a été effectuée avec succès !', 'Mise à jour réussie');
  }

  serverError() {
    this.error('Une erreur serveur est survenue. Veuillez réessayer.', 'Erreur serveur');
  }

  networkError() {
    this.error('Problème de connexion réseau. Vérifiez votre connexion internet.', 'Erreur réseau');
  }

  validationError(message = 'Veuillez vérifier les informations saisies.') {
    this.warning(message, 'Données invalides');
  }

  loginSuccess() {
    this.success('Connexion réussie ! Bienvenue !', 'Connexion');
  }

  logoutSuccess() {
    this.info('Vous avez été déconnecté avec succès.', 'Déconnexion');
  }

  uploadSuccess() {
    this.success('Le fichier a été téléchargé avec succès !', 'Téléchargement réussi');
  }

  commentAdded() {
    this.success('Votre commentaire a été ajouté !', 'Commentaire publié');
  }

  ratingAdded() {
    this.success('Votre avis a été publié avec succès !', 'Avis publié');
  }

  ratingUpdated() {
    this.success('Votre avis a été modifié avec succès !', 'Avis modifié');
  }
}

const toastService = new ToastService();

export default toastService;

