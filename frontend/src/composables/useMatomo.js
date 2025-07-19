import { ref, onMounted, onUnmounted } from 'vue'
import matomoService from '../services/matomoService.js'

export function useMatomo() {
  const pageStartTime = ref(Date.now())

  const trackPageView = (pageName) => {
    matomoService.trackPageView(pageName)
  }

  const trackEvent = (category, action, name = null, value = null) => {
    matomoService.trackEvent(category, action, name, value)
  }

  const trackPostPublishClick = () => {
    matomoService.trackPostPublishClick()
  }

  const trackPostLike = (postId) => {
    matomoService.trackPostLike(postId)
  }

  const trackPostComment = (postId) => {
    matomoService.trackPostComment(postId)
  }

  const trackPostView = (postId) => {
    matomoService.trackPostView(postId)
  }

  const trackProfileView = (userId) => {
    matomoService.trackProfileView(userId)
  }

  const trackSearchExecuted = (searchTerm) => {
    matomoService.trackSearchExecuted(searchTerm)
  }

  const trackFilterClick = (filterType, filterValue) => {
    matomoService.trackFilterClick(filterType, filterValue)
  }

  const trackClearSearchClick = () => {
    matomoService.trackClearSearchClick()
  }

  const trackMapClick = () => {
    matomoService.trackMapClick()
  }

  const trackConversationStarted = (userId) => {
    matomoService.trackConversationStarted(userId)
  }

  const trackMessageSent = (conversationId) => {
    matomoService.trackMessageSent(conversationId)
  }

  const trackAppointmentCreated = (appointmentId) => {
    matomoService.trackAppointmentCreated(appointmentId)
  }

  const trackAppointmentAccepted = (appointmentId) => {
    matomoService.trackAppointmentAccepted(appointmentId)
  }

  const trackNotificationPanelOpened = () => {
    matomoService.trackNotificationPanelOpened()
  }

  const trackRatingGiven = (userId, rating) => {
    matomoService.trackRatingGiven(userId, rating)
  }

  const trackReportSubmitted = (contentType, contentId) => {
    matomoService.trackReportSubmitted(contentType, contentId)
  }

  const trackNotificationClick = (notificationId) => {
    matomoService.trackNotificationClick(notificationId)
  }

  const trackFeatureUsage = (featureName) => {
    matomoService.trackFeatureUsage(featureName)
  }

  const startPageTimer = () => {
    pageStartTime.value = Date.now()
    matomoService.startPageTimer()
  }

  const endPageTimer = (pageName) => {
    if (pageStartTime.value) {
      const timeSpent = Date.now() - pageStartTime.value
      matomoService.trackEvent('Page', 'Time Spent', pageName, Math.round(timeSpent / 1000))
    }
    matomoService.endPageTimer(pageName)
  }

  const trackError = (errorMessage, errorUrl) => {
    matomoService.trackError(errorMessage, errorUrl)
  }

  const trackUserSession = (userId) => {
    matomoService.trackUserSession(userId)
  }

  return {

    pageStartTime,

    trackPageView,
    trackEvent,
    startPageTimer,
    endPageTimer,
    trackError,
    trackUserSession,

    trackPostPublishClick,
    trackPostLike,
    trackPostComment,
    trackPostView,
    trackProfileView,
    trackSearchExecuted,
    trackFilterClick,
    trackClearSearchClick,
    trackMapClick,
    trackConversationStarted,
    trackMessageSent,
    trackAppointmentCreated,
    trackAppointmentAccepted,
    trackNotificationPanelOpened,
    trackRatingGiven,
    trackReportSubmitted,
    trackNotificationClick,
    trackFeatureUsage
  }
}

