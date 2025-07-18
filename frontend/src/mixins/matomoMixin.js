// Mixin pour ajouter facilement le tracking Matomo aux composants
export default {
  methods: {
    // Méthodes de tracking simplifiées
    $trackEvent(category, action, name = null, value = null) {
      if (this.$matomo) {
        this.$matomo.trackEvent(category, action, name, value)
      }
    },

    // KPI 1: Post Publish Clicks
    $trackPostPublishClick() {
      this.$trackEvent('Post', 'Publish Click', 'Post Publish Button')
    },

    // KPI 2: Post Likes
    $trackPostLike(postId) {
      this.$trackEvent('Post', 'Like', `Post ${postId}`)
    },

    // KPI 3: Post Comments
    $trackPostComment(postId) {
      this.$trackEvent('Post', 'Comment', `Post ${postId}`)
    },

    // KPI 4: Post Views
    $trackPostView(postId) {
      this.$trackEvent('Post', 'View', `Post ${postId}`)
    },

    // KPI 5: Profile Views
    $trackProfileView(userId) {
      this.$trackEvent('Profile', 'View', `User ${userId}`)
    },

    // KPI 6: Search Executed
    $trackSearchExecuted(searchTerm) {
      this.$trackEvent('Search', 'Execute', searchTerm)
    },

    // KPI 7: Filter Clicks
    $trackFilterClick(filterType, filterValue) {
      this.$trackEvent('Filter', 'Click', `${filterType}: ${filterValue}`)
    },

    // KPI 8: Clear Search Clicks
    $trackClearSearchClick() {
      this.$trackEvent('Search', 'Clear', 'Clear Search Button')
    },

    // KPI 9: Map Clicks
    $trackMapClick() {
      this.$trackEvent('Map', 'Click', 'Map View')
    },

    // KPI 11: Conversations Started
    $trackConversationStarted(userId) {
      this.$trackEvent('Conversation', 'Start', `With User ${userId}`)
    },

    // KPI 12: Messages Sent
    $trackMessageSent(conversationId) {
      this.$trackEvent('Message', 'Send', `Conversation ${conversationId}`)
    },

    // KPI 13: Appointments Created
    $trackAppointmentCreated(appointmentId) {
      this.$trackEvent('Appointment', 'Create', `Appointment ${appointmentId}`)
    },

    // KPI 14: Appointments Accepted
    $trackAppointmentAccepted(appointmentId) {
      this.$trackEvent('Appointment', 'Accept', `Appointment ${appointmentId}`)
    },

    // KPI 15 & 20: Notifications Panel Opened
    $trackNotificationPanelOpened() {
      this.$trackEvent('Notification', 'Panel Open', 'Notification Center')
    },

    // KPI 16: Ratings Given
    $trackRatingGiven(userId, rating) {
      this.$trackEvent('Rating', 'Give', `User ${userId}`, rating)
    },

    // KPI 17: Reports Submitted
    $trackReportSubmitted(contentType, contentId) {
      this.$trackEvent('Report', 'Submit', `${contentType} ${contentId}`)
    },

    // KPI 29: Notification Click
    $trackNotificationClick(notificationId) {
      this.$trackEvent('Notification', 'Click', `Notification ${notificationId}`)
    },

    // KPI 30: Feature Adoption
    $trackFeatureUsage(featureName) {
      this.$trackEvent('Feature', 'Use', featureName)
    },

    // Tracking des erreurs
    $trackError(errorMessage, errorUrl = window.location.href) {
      this.$trackEvent('Error', 'JavaScript Error', `${errorMessage} at ${errorUrl}`)
    },

    // Tracking du temps passé
    $trackTimeSpent(category, label, timeInSeconds) {
      this.$trackEvent(category, 'Time Spent', label, timeInSeconds)
    }
  },

  // Hook pour tracker automatiquement les vues de pages
  mounted() {
    if (this.$matomo && this.$options.name) {
      this.$matomo.trackPageView(this.$options.name)
    }
  }
}
