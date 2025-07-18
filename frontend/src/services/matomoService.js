class MatomoService {
  constructor() {
    this.matomoUrl = import.meta.env.VITE_MATOMO_URL || 'http://localhost:8080';
    this.siteId = import.meta.env.VITE_MATOMO_SITE_ID || '1';
    this.sessionStartTime = Date.now();
    this.pageLoadTime = Date.now();
    
    // Initialiser Matomo
    this.initMatomo();
  }

  initMatomo() {
    // Version qui envoie vraiment les données à Matomo
    console.log('Initializing Matomo Analytics...');
    
    // Créer l'objet _paq et configurer Matomo
    window._paq = window._paq || [];
    window._paq.push(['setTrackerUrl', `${this.matomoUrl}/matomo.php`]);
    window._paq.push(['setSiteId', this.siteId]);
    window._paq.push(['trackPageView']);
    window._paq.push(['enableLinkTracking']);
    
    // Charger le script Matomo de façon sécurisée
    const script = document.createElement('script');
    script.async = true;
    script.src = `${this.matomoUrl}/matomo.js`;
    script.onerror = () => {
      console.warn('Matomo script could not be loaded, using fallback mode');
      this.useFallbackMode = true;
    };
    document.head.appendChild(script);
    
    console.log('Matomo configured for site:', this.siteId);
  }

  // Méthode pour envoyer les données en mode fallback
  sendEventToMatomo(eventData) {
    if (this.useFallbackMode) {
      // Envoyer directement à l'API Matomo via fetch
      const params = new URLSearchParams({
        idsite: this.siteId,
        rec: 1,
        action_name: eventData.action || 'Event',
        e_c: eventData.category || 'General',
        e_a: eventData.action || 'Action',
        e_n: eventData.name || '',
        e_v: eventData.value || '',
        rand: Math.random().toString(36)
      });
      
      fetch(`${this.matomoUrl}/matomo.php?${params}`, {
        method: 'GET',
        mode: 'no-cors'
      }).catch(err => console.warn('Matomo tracking failed:', err));
    }
  }

  // Méthode générique pour tracker un événement
  trackEvent(category, action, name = null, value = null) {
    console.log('Tracking event:', { category, action, name, value });
    
    if (typeof window !== 'undefined' && window._paq) {
      window._paq.push(['trackEvent', category, action, name, value]);
    }
    
    // Envoyer aussi en mode fallback pour s'assurer que ça marche
    this.sendEventToMatomo({
      category,
      action,
      name,
      value
    });
  }

  // KPI 1: Post Publish Clicks
  trackPostPublishClick() {
    this.trackEvent('Post', 'Publish Click', 'Post Publish Button');
  }

  // KPI 2: Post Likes
  trackPostLike(postId) {
    this.trackEvent('Post', 'Like', `Post ${postId}`);
  }

  // KPI 3: Post Comments
  trackPostComment(postId) {
    this.trackEvent('Post', 'Comment', `Post ${postId}`);
  }

  // KPI 4: Post Views
  trackPostView(postId) {
    this.trackEvent('Post', 'View', `Post ${postId}`);
  }

  // KPI 5: Profile Views
  trackProfileView(userId) {
    this.trackEvent('Profile', 'View', `User ${userId}`);
  }

  // KPI 6: Search Executed
  trackSearchExecuted(searchTerm) {
    this.trackEvent('Search', 'Execute', searchTerm);
  }

  // KPI 7: Filter Clicks
  trackFilterClick(filterType, filterValue) {
    this.trackEvent('Filter', 'Click', `${filterType}: ${filterValue}`);
  }

  // KPI 8: Clear Search Clicks
  trackClearSearchClick() {
    this.trackEvent('Search', 'Clear', 'Clear Search Button');
  }

  // KPI 9: Map Clicks
  trackMapClick() {
    this.trackEvent('Map', 'Click', 'Map View');
  }

  // KPI 10: Homepage Time Spent
  trackHomepageTimeSpent() {
    const timeSpent = Date.now() - this.pageLoadTime;
    this.trackEvent('Homepage', 'Time Spent', 'Homepage Session', Math.round(timeSpent / 1000));
  }

  // KPI 11: Conversations Started
  trackConversationStarted(userId) {
    this.trackEvent('Conversation', 'Start', `With User ${userId}`);
  }

  // KPI 12: Messages Sent
  trackMessageSent(conversationId) {
    this.trackEvent('Message', 'Send', `Conversation ${conversationId}`);
  }

  // KPI 13: Appointments Created
  trackAppointmentCreated(appointmentId) {
    this.trackEvent('Appointment', 'Create', `Appointment ${appointmentId}`);
  }

  // KPI 14: Appointments Accepted
  trackAppointmentAccepted(appointmentId) {
    this.trackEvent('Appointment', 'Accept', `Appointment ${appointmentId}`);
  }

  // KPI 15 & 20: Notifications Viewed / Panel Opened
  trackNotificationPanelOpened() {
    this.trackEvent('Notification', 'Panel Open', 'Notification Center');
  }

  // KPI 16: Ratings Given
  trackRatingGiven(userId, rating) {
    this.trackEvent('Rating', 'Give', `User ${userId}`, rating);
  }

  // KPI 17: Reports Submitted
  trackReportSubmitted(contentType, contentId) {
    this.trackEvent('Report', 'Submit', `${contentType} ${contentId}`);
  }

  // KPI 18: Profile Completion Rate
  trackProfileCompletion(completionRate) {
    this.trackEvent('Profile', 'Completion', 'Profile Fields', completionRate);
  }

  // KPI 19: Post Load Time
  trackPostLoadTime(loadTime) {
    this.trackEvent('Performance', 'Post Load Time', 'Load Duration', loadTime);
  }

  // KPI 29: Notification Click Rate
  trackNotificationClick(notificationId) {
    this.trackEvent('Notification', 'Click', `Notification ${notificationId}`);
  }

  // KPI 30: Feature Adoption Rate
  trackFeatureUsage(featureName) {
    this.trackEvent('Feature', 'Use', featureName);
  }

  // Tracker les pages vues
  trackPageView(pageName) {
    if (typeof window !== 'undefined' && window._paq) {
      window._paq.push(['setDocumentTitle', pageName]);
      window._paq.push(['trackPageView']);
    }
  }

  // Tracker les utilisateurs actifs
  trackUserSession(userId) {
    if (typeof window !== 'undefined' && window._paq) {
      window._paq.push(['setUserId', userId]);
    }
  }

  // Tracker les erreurs personnalisées
  trackError(errorMessage, errorUrl) {
    this.trackEvent('Error', 'JavaScript Error', `${errorMessage} at ${errorUrl}`);
  }

  // Tracker les temps de chargement des posts
  startPostLoadTimer() {
    this.postLoadStartTime = Date.now();
  }

  endPostLoadTimer() {
    if (this.postLoadStartTime) {
      const loadTime = Date.now() - this.postLoadStartTime;
      this.trackPostLoadTime(Math.round(loadTime));
      this.postLoadStartTime = null;
    }
  }

  // Tracker le temps passé sur une page
  startPageTimer() {
    this.pageLoadTime = Date.now();
  }

  endPageTimer(pageName) {
    const timeSpent = Date.now() - this.pageLoadTime;
    this.trackEvent('Page', 'Time Spent', pageName, Math.round(timeSpent / 1000));
  }
}

// Instance singleton
const matomoService = new MatomoService();
export default matomoService;
