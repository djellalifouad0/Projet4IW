
export default {
  methods: {

    $trackEvent(category, action, name = null, value = null) {
      if (this.$matomo) {
        this.$matomo.trackEvent(category, action, name, value)
      }
    },

    $trackPostPublishClick() {
      this.$trackEvent('Post', 'Publish Click', 'Post Publish Button')
    },

    $trackPostLike(postId) {
      this.$trackEvent('Post', 'Like', `Post ${postId}`)
    },

    $trackPostComment(postId) {
      this.$trackEvent('Post', 'Comment', `Post ${postId}`)
    },

    $trackPostView(postId) {
      this.$trackEvent('Post', 'View', `Post ${postId}`)
    },

    $trackProfileView(userId) {
      this.$trackEvent('Profile', 'View', `User ${userId}`)
    },

    $trackSearchExecuted(searchTerm) {
      this.$trackEvent('Search', 'Execute', searchTerm)
    },

    $trackFilterClick(filterType, filterValue) {
      this.$trackEvent('Filter', 'Click', `${filterType}: ${filterValue}`)
    },

    $trackClearSearchClick() {
      this.$trackEvent('Search', 'Clear', 'Clear Search Button')
    },

    $trackMapClick() {
      this.$trackEvent('Map', 'Click', 'Map View')
    },

    $trackConversationStarted(userId) {
      this.$trackEvent('Conversation', 'Start', `With User ${userId}`)
    },

    $trackMessageSent(conversationId) {
      this.$trackEvent('Message', 'Send', `Conversation ${conversationId}`)
    },

    $trackAppointmentCreated(appointmentId) {
      this.$trackEvent('Appointment', 'Create', `Appointment ${appointmentId}`)
    },

    $trackAppointmentAccepted(appointmentId) {
      this.$trackEvent('Appointment', 'Accept', `Appointment ${appointmentId}`)
    },

    $trackNotificationPanelOpened() {
      this.$trackEvent('Notification', 'Panel Open', 'Notification Center')
    },

    $trackRatingGiven(userId, rating) {
      this.$trackEvent('Rating', 'Give', `User ${userId}`, rating)
    },

    $trackReportSubmitted(contentType, contentId) {
      this.$trackEvent('Report', 'Submit', `${contentType} ${contentId}`)
    },

    $trackNotificationClick(notificationId) {
      this.$trackEvent('Notification', 'Click', `Notification ${notificationId}`)
    },

    $trackFeatureUsage(featureName) {
      this.$trackEvent('Feature', 'Use', featureName)
    },

    $trackError(errorMessage, errorUrl = window.location.href) {
      this.$trackEvent('Error', 'JavaScript Error', `${errorMessage} at ${errorUrl}`)
    },

    $trackTimeSpent(category, label, timeInSeconds) {
      this.$trackEvent(category, 'Time Spent', label, timeInSeconds)
    }
  },

  mounted() {
    if (this.$matomo && this.$options.name) {
      this.$matomo.trackPageView(this.$options.name)
    }
  }
}

