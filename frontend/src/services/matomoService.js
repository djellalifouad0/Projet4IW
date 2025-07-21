class MatomoService {
  constructor() {
    this.matomoUrl = import.meta.env.VITE_MATOMO_URL || 'http://localhost:8080';
    this.siteId = import.meta.env.VITE_MATOMO_SITE_ID || '2';
    this.sessionStartTime = Date.now();
    this.pageLoadTime = Date.now();

    this.initMatomo();
  }

  initMatomo() {

    console.log('Initializing Matomo Analytics...');

    window._paq = window._paq || [];
    window._paq.push(['setTrackerUrl', `${this.matomoUrl}/matomo.php`]);
    window._paq.push(['setSiteId', this.siteId]);
    window._paq.push(['trackPageView']);
    window._paq.push(['enableLinkTracking']);

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

  sendEventToMatomo(eventData) {
    if (this.useFallbackMode) {

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

  trackEvent(category, action, name = null, value = null) {
    console.log('Tracking event:', { category, action, name, value });
    
    if (typeof window !== 'undefined' && window._paq) {
      window._paq.push(['trackEvent', category, action, name, value]);
    }

    this.sendEventToMatomo({
      category,
      action,
      name,
      value
    });
  }

  trackPostPublishClick() {
    this.trackEvent('Post', 'Publish Click', 'Post Publish Button');
  }

  trackPostLike(postId) {
    this.trackEvent('Post', 'Like', `Post ${postId}`);
  }

  trackPostComment(postId) {
    this.trackEvent('Post', 'Comment', `Post ${postId}`);
  }

  trackPostView(postId) {
    this.trackEvent('Post', 'View', `Post ${postId}`);
  }

  trackProfileView(userId) {
    this.trackEvent('Profile', 'View', `User ${userId}`);
  }

  trackSearchExecuted(searchTerm) {
    this.trackEvent('Search', 'Execute', searchTerm);
  }

  trackFilterClick(filterType, filterValue) {
    this.trackEvent('Filter', 'Click', `${filterType}: ${filterValue}`);
  }

  trackClearSearchClick() {
    this.trackEvent('Search', 'Clear', 'Clear Search Button');
  }

  trackMapClick() {
    this.trackEvent('Map', 'Click', 'Map View');
  }

  trackHomepageTimeSpent() {
    const timeSpent = Date.now() - this.pageLoadTime;
    this.trackEvent('Homepage', 'Time Spent', 'Homepage Session', Math.round(timeSpent / 1000));
  }

  trackConversationStarted(userId) {
    this.trackEvent('Conversation', 'Start', `With User ${userId}`);
  }

  trackMessageSent(conversationId) {
    this.trackEvent('Message', 'Send', `Conversation ${conversationId}`);
  }

  trackAppointmentCreated(appointmentId) {
    this.trackEvent('Appointment', 'Create', `Appointment ${appointmentId}`);
  }

  trackAppointmentAccepted(appointmentId) {
    this.trackEvent('Appointment', 'Accept', `Appointment ${appointmentId}`);
  }

  trackNotificationPanelOpened() {
    this.trackEvent('Notification', 'Panel Open', 'Notification Center');
  }

  trackRatingGiven(userId, rating) {
    this.trackEvent('Rating', 'Give', `User ${userId}`, rating);
  }

  trackReportSubmitted(contentType, contentId) {
    this.trackEvent('Report', 'Submit', `${contentType} ${contentId}`);
  }

  trackProfileCompletion(completionRate) {
    this.trackEvent('Profile', 'Completion', 'Profile Fields', completionRate);
  }

  trackPostLoadTime(loadTime) {
    this.trackEvent('Performance', 'Post Load Time', 'Load Duration', loadTime);
  }

  trackNotificationClick(notificationId) {
    this.trackEvent('Notification', 'Click', `Notification ${notificationId}`);
  }

  trackFeatureUsage(featureName) {
    this.trackEvent('Feature', 'Use', featureName);
  }

  trackPageView(pageName) {
    if (typeof window !== 'undefined' && window._paq) {
      window._paq.push(['setDocumentTitle', pageName]);
      window._paq.push(['trackPageView']);
    }
  }

  trackUserSession(userId) {
    if (typeof window !== 'undefined' && window._paq) {
      window._paq.push(['setUserId', userId]);
    }
  }

  trackError(errorMessage, errorUrl) {
    this.trackEvent('Error', 'JavaScript Error', `${errorMessage} at ${errorUrl}`);
  }

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

  startPageTimer() {
    this.pageLoadTime = Date.now();
  }

  endPageTimer(pageName) {
    const timeSpent = Date.now() - this.pageLoadTime;
    this.trackEvent('Page', 'Time Spent', pageName, Math.round(timeSpent / 1000));
  }
}

const matomoService = new MatomoService();
export default matomoService;

