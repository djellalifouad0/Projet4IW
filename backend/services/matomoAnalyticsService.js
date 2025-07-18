
class MatomoAnalyticsService {
  constructor() {
    this.matomoUrl = process.env.MATOMO_URL || 'http://matomo:80';
    this.siteId = process.env.MATOMO_SITE_ID || '1';
    this.token = process.env.MATOMO_TOKEN || '';
  }

  async makeRequest(params) {
    const url = new URL(`${this.matomoUrl}/index.php`);
    url.searchParams.append('module', 'API');
    url.searchParams.append('format', 'JSON');
    url.searchParams.append('idSite', this.siteId);
    url.searchParams.append('token_auth', this.token);
    
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });

    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la requête Matomo:', error);
      return null;
    }
  }

  async getPostPublishClicks(period = 'day', date = 'today') {
    return this.makeRequest({
      method: 'Events.getCategory',
      period,
      date,
      label: 'Post'
    });
  }

  async getPostLikes(period = 'day', date = 'today') {
    return this.makeRequest({
      method: 'Events.getAction',
      period,
      date,
      label: 'Like'
    });
  }

  async getPostComments(period = 'day', date = 'today') {
    return this.makeRequest({
      method: 'Events.getAction',
      period,
      date,
      label: 'Comment'
    });
  }

  async getPostViews(period = 'day', date = 'today') {
    return this.makeRequest({
      method: 'Events.getAction',
      period,
      date,
      label: 'View'
    });
  }

  async getProfileViews(period = 'day', date = 'today') {
    return this.makeRequest({
      method: 'Events.getCategory',
      period,
      date,
      label: 'Profile'
    });
  }

  async getSearchExecuted(period = 'day', date = 'today') {
    return this.makeRequest({
      method: 'Events.getCategory',
      period,
      date,
      label: 'Search'
    });
  }

  async getFilterClicks(period = 'day', date = 'today') {
    return this.makeRequest({
      method: 'Events.getCategory',
      period,
      date,
      label: 'Filter'
    });
  }

  async getClearSearchClicks(period = 'day', date = 'today') {
    return this.makeRequest({
      method: 'Events.getAction',
      period,
      date,
      label: 'Clear'
    });
  }

  async getMapClicks(period = 'day', date = 'today') {
    return this.makeRequest({
      method: 'Events.getCategory',
      period,
      date,
      label: 'Map'
    });
  }

  async getHomepageTimeSpent(period = 'day', date = 'today') {
    return this.makeRequest({
      method: 'Events.getCategory',
      period,
      date,
      label: 'Homepage'
    });
  }

  async getConversationsStarted(period = 'day', date = 'today') {
    return this.makeRequest({
      method: 'Events.getCategory',
      period,
      date,
      label: 'Conversation'
    });
  }

  async getMessagesSent(period = 'day', date = 'today') {
    return this.makeRequest({
      method: 'Events.getCategory',
      period,
      date,
      label: 'Message'
    });
  }

  async getDailyActiveUsers(date = 'today') {
    return this.makeRequest({
      method: 'VisitsSummary.getUniqueVisitors',
      period: 'day',
      date
    });
  }

  async getWeeklyActiveUsers(date = 'today') {
    return this.makeRequest({
      method: 'VisitsSummary.getUniqueVisitors',
      period: 'week',
      date
    });
  }

  async getMonthlyActiveUsers(date = 'today') {
    return this.makeRequest({
      method: 'VisitsSummary.getUniqueVisitors',
      period: 'month',
      date
    });
  }

  async getAllKPIs(period = 'day', date = 'today') {
    try {
      const [
        postPublishClicks,
        postLikes,
        postComments,
        postViews,
        profileViews,
        searchExecuted,
        filterClicks,
        clearSearchClicks,
        mapClicks,
        homepageTimeSpent,
        conversationsStarted,
        messagesSent,
        dailyActiveUsers,
        weeklyActiveUsers,
        monthlyActiveUsers
      ] = await Promise.all([
        this.getPostPublishClicks(period, date),
        this.getPostLikes(period, date),
        this.getPostComments(period, date),
        this.getPostViews(period, date),
        this.getProfileViews(period, date),
        this.getSearchExecuted(period, date),
        this.getFilterClicks(period, date),
        this.getClearSearchClicks(period, date),
        this.getMapClicks(period, date),
        this.getHomepageTimeSpent(period, date),
        this.getConversationsStarted(period, date),
        this.getMessagesSent(period, date),
        this.getDailyActiveUsers(date),
        this.getWeeklyActiveUsers(date),
        this.getMonthlyActiveUsers(date)
      ]);

      return {
        postPublishClicks: this.extractEventCount(postPublishClicks),
        postLikes: this.extractEventCount(postLikes),
        postComments: this.extractEventCount(postComments),
        postViews: this.extractEventCount(postViews),
        profileViews: this.extractEventCount(profileViews),
        searchExecuted: this.extractEventCount(searchExecuted),
        filterClicks: this.extractEventCount(filterClicks),
        clearSearchClicks: this.extractEventCount(clearSearchClicks),
        mapClicks: this.extractEventCount(mapClicks),
        homepageTimeSpent: this.extractEventValue(homepageTimeSpent),
        conversationsStarted: this.extractEventCount(conversationsStarted),
        messagesSent: this.extractEventCount(messagesSent),
        dailyActiveUsers: dailyActiveUsers?.value || 0,
        weeklyActiveUsers: weeklyActiveUsers?.value || 0,
        monthlyActiveUsers: monthlyActiveUsers?.value || 0
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des KPI:', error);
      return null;
    }
  }

  extractEventCount(data) {
    if (!data || !Array.isArray(data)) return 0;
    return data.reduce((total, item) => total + (item.nb_events || 0), 0);
  }

  extractEventValue(data) {
    if (!data || !Array.isArray(data)) return 0;
    return data.reduce((total, item) => total + (item.sum_event_value || 0), 0);
  }

  async getDashboardData(period = 'day', date = 'today') {
    const kpis = await this.getAllKPIs(period, date);
    
    if (!kpis) return null;

    return {
      summary: {
        totalEvents: Object.values(kpis).reduce((sum, value) => sum + (typeof value === 'number' ? value : 0), 0),
        activeUsers: kpis.dailyActiveUsers,
        engagementRate: kpis.postLikes && kpis.postViews ? (kpis.postLikes / kpis.postViews * 100).toFixed(2) + '%' : '0%'
      },
      kpis: {
        userEngagement: {
          postPublishClicks: kpis.postPublishClicks,
          postLikes: kpis.postLikes,
          postComments: kpis.postComments,
          postViews: kpis.postViews
        },
        userActivity: {
          profileViews: kpis.profileViews,
          searchExecuted: kpis.searchExecuted,
          filterClicks: kpis.filterClicks,
          mapClicks: kpis.mapClicks
        },
        communication: {
          conversationsStarted: kpis.conversationsStarted,
          messagesSent: kpis.messagesSent
        },
        userMetrics: {
          dailyActiveUsers: kpis.dailyActiveUsers,
          weeklyActiveUsers: kpis.weeklyActiveUsers,
          monthlyActiveUsers: kpis.monthlyActiveUsers
        },
        timeMetrics: {
          homepageTimeSpent: kpis.homepageTimeSpent
        }
      }
    };
  }
}

module.exports = MatomoAnalyticsService;

