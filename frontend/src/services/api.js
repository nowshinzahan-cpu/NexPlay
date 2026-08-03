import axios from 'axios';

const API_BASE_URL = import.meta?.env?.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Token refresh queue — prevents multiple simultaneous refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request to retry after refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken
          });

          if (data.success) {
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            processQueue(null, data.data.accessToken);
            originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
            return api(originalRequest);
          }
        }
        processQueue(new Error('No refresh token'));
      } catch (refreshError) {
        processQueue(refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  refresh: (refreshToken) => api.post('/api/auth/refresh', { refreshToken }),
  getMe: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout')
};

// Password Reset API
export const passwordAPI = {
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  verifyOTP: (email, otp) => api.post('/api/auth/verify-otp', { email, otp }),
  resendOTP: (email) => api.post('/api/auth/resend-otp', { email }),
  resetPassword: (resetToken, newPassword, confirmPassword) =>
    api.post('/api/auth/reset-password', { resetToken, newPassword, confirmPassword })
};

// User API
export const userAPI = {
  getProfile: () => api.get('/api/user/profile'),
  updateProfile: (data) => api.put('/api/user/profile', data),
  changePassword: (data) => api.put('/api/user/change-password', data)
};

// Company API
export const companyAPI = {
  getProfile: () => api.get('/api/company/profile'),
  updateProfile: (data) => api.put('/api/company/profile', data),
  uploadLogo: (formData) =>
    api.post('/api/company/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getPublicProfile: (id) => api.get(`/api/company/profile/${id}`),
  // Advertisements
  getAdvertisements: (params) => api.get('/api/company/advertisements', { params }),
  getAdvertisement: (id) => api.get(`/api/company/advertisements/${id}`),
  createAdvertisement: (data) => api.post('/api/company/advertisements', data),
  updateAdvertisement: (id, data) => api.put(`/api/company/advertisements/${id}`, data),
  deleteAdvertisement: (id) => api.delete(`/api/company/advertisements/${id}`),
  // Campaigns
  getCampaigns: (params) => api.get('/api/company/campaigns', { params }),
  getCampaign: (id) => api.get(`/api/company/campaigns/${id}`),
  createCampaign: (data) => api.post('/api/company/campaigns', data),
  updateCampaign: (id, data) => api.put(`/api/company/campaigns/${id}`, data),
  deleteCampaign: (id) => api.delete(`/api/company/campaigns/${id}`)
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/api/admin/dashboard/stats'),
  getUsers: (params) => api.get('/api/admin/users', { params }),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
  toggleUserStatus: (id, isActive) =>
    api.patch(`/api/admin/users/${id}/status`, { isActive }),
  getCompanies: (params) => api.get('/api/admin/companies', { params }),
  getPendingCompanies: (params) => api.get('/api/admin/companies/pending', { params }),
  getCompanyById: (id) => api.get(`/api/admin/companies/${id}`),
  verifyCompany: (id, status, rejectionReason) =>
    api.patch(`/api/admin/companies/${id}/verify`, { status, rejectionReason }),
  deleteCompany: (id) => api.delete(`/api/admin/companies/${id}`),
  toggleCompanyStatus: (id, isActive) =>
    api.patch(`/api/admin/companies/${id}/status`, { isActive }),
  // Advertisements (admin)
  getAdvertisements: (params) => api.get('/api/admin/advertisements', { params }),
  updateAdStatus: (id, status, rejectionReason) =>
    api.patch(`/api/admin/advertisements/${id}/status`, { status, rejectionReason }),
  // Campaigns (admin)
  getCampaigns: (params) => api.get('/api/admin/campaigns', { params }),
  updateCampaignStatus: (id, status, rejectionReason) =>
    api.patch(`/api/admin/campaigns/${id}/status`, { status, rejectionReason }),
  // Featured content
  getFeaturedContent: (params) => api.get('/api/admin/contents/featured', { params }),
  toggleFeaturedContent: (id, isFeatured) => api.patch(`/api/admin/contents/${id}/featured`, { isFeatured }),
  // Broadcast notification
  broadcastNotification: (data) => api.post('/api/admin/notifications/broadcast', data),
  getActivityLog: (params) => api.get('/api/admin/activity-log', { params })
};

// Content API (public)
export const contentAPI = {
  search: (params) => api.get('/api/content/search', { params }),
  getTrending: () => api.get('/api/content/trending'),
  getPopular: () => api.get('/api/content/popular'),
  getRecommended: () => api.get('/api/content/recommended'),
  getLatestUpdates: () => api.get('/api/content/latest-updates'),
  getUpcoming: () => api.get('/api/content/upcoming'),
  getWhereToWatch: () => api.get('/api/content/where-to-watch'),
  getById: (id) => api.get(`/api/content/${id}`),
  suggest: (q) => api.get('/api/content/suggestions', { params: { q } })
};

// Watchlist API
export const watchlistAPI = {
  getWatchlist: (params) => api.get('/api/user/watchlist', { params }),
  checkWatchlist: (contentId) => api.get(`/api/user/watchlist/check/${contentId}`),
  addToWatchlist: (contentId) => api.post(`/api/user/watchlist/${contentId}`),
  removeFromWatchlist: (contentId) => api.delete(`/api/user/watchlist/${contentId}`)
};

// Reviews API
export const reviewAPI = {
  getContentReviews: (contentId, params) => api.get(`/api/content/${contentId}/reviews`, { params }),
  createReview: (contentId, data) => api.post(`/api/content/${contentId}/reviews`, data),
  updateReview: (contentId, data) => api.put(`/api/content/${contentId}/reviews`, data),
  deleteReview: (contentId) => api.delete(`/api/content/${contentId}/reviews`),
  getMyReviews: (params) => api.get('/api/user/reviews', { params })
};

// Sports API
export const sportsAPI = {
  getSports: (params) => api.get('/api/sports', { params }),
  getLiveSports: () => api.get('/api/sports/live'),
  getUpcomingSports: () => api.get('/api/sports/upcoming'),
  getCompletedSports: (params) => api.get('/api/sports/completed', { params }),
  getSportTypes: () => api.get('/api/sports/types'),
  getSportById: (id) => api.get(`/api/sports/${id}`),
  createSport: (data) => api.post('/api/sports', data),
  updateSport: (id, data) => api.put(`/api/sports/${id}`, data),
  deleteSport: (id) => api.delete(`/api/sports/${id}`)
};

// Platforms API
export const platformAPI = {
  getActivePlatforms: () => api.get('/api/platforms'),
  getAllPlatforms: (params) => api.get('/api/platforms/all', { params }),
  createPlatform: (data) => api.post('/api/platforms', data),
  updatePlatform: (id, data) => api.put(`/api/platforms/${id}`, data),
  deletePlatform: (id) => api.delete(`/api/platforms/${id}`)
};

// Company Upcoming Content API
export const upcomingContentAPI = {
  getMyUpcoming: (params) => api.get('/api/company/upcoming', { params }),
  getMyAllContent: (params) => api.get('/api/company/upcoming/all', { params }),
  createUpcoming: (data) => api.post('/api/company/upcoming', data),
  updateUpcoming: (id, data) => api.put(`/api/company/upcoming/${id}`, data),
  deleteUpcoming: (id) => api.delete(`/api/company/upcoming/${id}`)
};

// Personalized Recommendations
export const recommendationAPI = {
  getRecommendations: (params) => api.get('/api/user/recommendations', { params })
};

// Notifications API
export const notificationAPI = {
  getNotifications: (params) => api.get('/api/notifications', { params }),
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/api/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/api/notifications/${id}`),
  createAnnouncement: (data) => api.post('/api/notifications/announcement', data)
};

// Sprint 3 — Match Center API
export const matchAPI = {
  getLiveMatches: () => api.get('/api/matches/live'),
  getTodayMatches: () => api.get('/api/matches/today'),
  getUpcomingMatches: (params) => api.get('/api/matches/upcoming', { params }),
  getMatchById: (id) => api.get(`/api/matches/${id}`),
  getStandings: (competitionId) => api.get(`/api/standings/${competitionId}`),
  createMatch: (data) => api.post('/api/matches', data),
  updateMatch: (id, data) => api.put(`/api/matches/${id}`, data),
  addMatchEvent: (id, data) => api.post(`/api/matches/${id}/events`, data)
};

// Sprint 3 — Broadcaster API
export const broadcasterAPI = {
  getAll: () => api.get('/api/admin/broadcasters'),
  getById: (id) => api.get(`/api/admin/broadcasters/${id}`),
  create: (data) => api.post('/api/admin/broadcasters', data),
  update: (id, data) => api.put(`/api/admin/broadcasters/${id}`, data),
  delete: (id) => api.delete(`/api/admin/broadcasters/${id}`),
  getMatchStreams: (matchId, params) => api.get(`/api/matches/${matchId}/streams`, { params }),
  createStream: (data) => api.post('/api/admin/broadcasters/streams', data),
  deleteStream: (id) => api.delete(`/api/admin/broadcasters/streams/${id}`)
};

// Sprint 3 — Favorites API
export const favoriteAPI = {
  getFavorites: (params) => api.get('/api/favorites', { params }),
  checkFavorite: (type, refId) => api.get('/api/favorites/check', { params: { type, refId } }),
  addFavorite: (data) => api.post('/api/favorites', data),
  removeFavorite: (data) => api.delete('/api/favorites', { data })
};

// Sprint 3 — Notification Preferences API
export const notificationPreferenceAPI = {
  get: () => api.get('/api/notification-preferences'),
  update: (data) => api.put('/api/notification-preferences', data)
};

// Sprint 4 — Item Reviews API (new 1-5 star system)
export const itemReviewAPI = {
  getItemReviews: (itemId, params) => api.get(`/api/items/${itemId}/reviews`, { params }),
  getRatingSummary: (itemId, itemType) => api.get(`/api/items/${itemId}/rating-summary`, { params: { itemType } }),
  createReview: (data) => api.post('/api/reviews', data),
  updateReview: (id, data) => api.put(`/api/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/api/reviews/${id}`),
  markHelpful: (id) => api.post(`/api/reviews/${id}/helpful`)
};

// Sprint 4 — Discussion Forum API
export const discussionAPI = {
  getDiscussions: (params) => api.get('/api/discussions', { params }),
  getDiscussionById: (id) => api.get(`/api/discussions/${id}`),
  createDiscussion: (data) => api.post('/api/discussions', data),
  updateDiscussion: (id, data) => api.put(`/api/discussions/${id}`, data),
  deleteDiscussion: (id) => api.delete(`/api/discussions/${id}`),
  getComments: (discussionId, params) => api.get(`/api/discussions/${discussionId}/comments`, { params }),
  createComment: (discussionId, data) => api.post(`/api/discussions/${discussionId}/comments`, data),
  updateComment: (id, data) => api.put(`/api/comments/${id}`, data),
  deleteComment: (id) => api.delete(`/api/comments/${id}`),
  toggleCommentLike: (id) => api.post(`/api/comments/${id}/like`),
  lockDiscussion: (id) => api.patch(`/api/moderation/discussions/${id}/lock`),
  pinDiscussion: (id) => api.patch(`/api/moderation/discussions/${id}/pin`)
};

// Sprint 4 — Report API
export const reportAPI = {
  createReport: (data) => api.post('/api/reports', data)
};

// Sprint 4 — Moderation API
export const moderationAPI = {
  getReports: (params) => api.get('/api/moderation/reports', { params }),
  resolveReport: (id, data) => api.patch(`/api/moderation/reports/${id}`, data),
  getStats: () => api.get('/api/moderation/stats')
};

// Sprint 4 — Gamification API
export const gamificationAPI = {
  getLeaderboard: (params) => api.get('/api/leaderboard', { params }),
  getUserStats: () => api.get('/api/user/stats'),
  getAllBadges: () => api.get('/api/badges'),
  getPointsHistory: (params) => api.get('/api/user/points-history', { params })
};



export default api;
