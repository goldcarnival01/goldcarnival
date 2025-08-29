import axios from 'axios';

// Use VITE_API_URL for the full backend URL, then append /api
// Avoid falling back to localhost in production builds hosted on Render/Vercel
const resolvedBackendUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location?.origin?.includes('localhost')
  ? 'http://localhost:3000'
  : undefined);

const API_BASE_URL = resolvedBackendUrl
  ? `${resolvedBackendUrl}/api`
  : 'https://gold-carnival-backend-hnaf.onrender.com/api';

console.log('🔗 API Base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
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
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.tokens;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Token refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  // Allow more time for email dispatch on some SMTP providers
  forgotPasswordLong: (email) => api.post('/auth/forgot-password', { email }, { timeout: 25000 }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (profileData) => api.put('/user/profile', profileData),
  getWallets: () => api.get('/user/wallets'),
  getTransactions: (params) => api.get('/user/transactions', { params }),
  getStats: () => api.get('/user/stats'),
  changePassword: (passwords) => api.put('/user/change-password', passwords),
  deleteAccount: (password) => api.delete('/user/account', { data: { password } }),
};

// Jackpot API
export const jackpotAPI = {
  getAll: () => api.get('/jackpots'),
  getById: (id) => api.get(`/jackpots/${id}`),
  getStats: (id) => api.get(`/jackpots/${id}/stats`),
  getTimer: (id) => api.get(`/jackpots/${id}/timer`),
  getLatestWinners: () => api.get('/jackpots/winners/latest'),
};

// Ticket API
export const ticketAPI = {
  purchase: (ticketData) => api.post('/tickets/purchase', ticketData),
  getMyTickets: (params) => api.get('/tickets/my-tickets', { params }),
  getTicket: (id) => api.get(`/tickets/${id}`),
  getHistory: (params) => api.get('/tickets/history', { params }),
  getWinnings: (params) => api.get('/tickets/winnings', { params }),
};

// Wallet API
export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  deposit: (depositData) => api.post('/wallet/deposit', depositData),
  withdraw: (withdrawData) => api.post('/wallet/withdraw', withdrawData),
  getTransactions: (params) => api.get('/wallet/transactions', { params }),
  getCryptoCurrencies: () => api.get('/wallet/crypto-currencies'),
  getMinAmount: (params) => api.get('/wallet/min-amount', { params }),
  getEstimatePrice: (params) => api.get('/wallet/estimate-price', { params }),
};

// NOWPayments API
export const nowpaymentsAPI = {
  getCurrencies: () => api.get('/nowpayments/currencies'),
  getMinAmount: (params) => api.get('/nowpayments/min-amount', { params }),
  getEstimate: (params) => api.get('/nowpayments/estimate', { params }),
  createPayment: (paymentData) => api.post('/nowpayments/create-payment', paymentData),
  createPlanPayment: (planData) => api.post('/nowpayments/create-plan-payment', planData),
  getPaymentStatus: (paymentId) => api.get(`/nowpayments/payment-status/${paymentId}`),
  createWithdrawal: (withdrawalData) => api.post('/nowpayments/create-withdrawal', withdrawalData),
  getPayoutStatus: (payoutId) => api.get(`/nowpayments/payout-status/${payoutId}`),
  getWithdrawalFee: (params) => api.get('/nowpayments/withdrawal-fee', { params }),
  createInvoicePayment: (paymentData) => api.post('/nowpayments/create-invoice-payment', paymentData),
  getPaymentButton: (invoiceId, style) => api.get(`/nowpayments/public/payment-button/${invoiceId}`, { params: { style } }),
  getPaymentButtonHtml: (invoiceId, style) => api.get(`/nowpayments/public/payment-button-html/${invoiceId}`, { params: { style } }),
  testWebhook: (testData) => api.post('/nowpayments/test-webhook', testData),
};

// Transaction API
export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  getStats: () => api.get('/transactions/stats/summary'),
};

// Referral API
export const referralAPI = {
  getStats: () => api.get('/referrals/stats'),
  getList: (params) => api.get('/referrals/list', { params }),
  getLink: () => api.get('/referrals/link'),
  getCommissions: (params) => api.get('/referrals/commissions', { params }),
};

// Plans API
export const plansAPI = {
  getAll: (params) => api.get('/plans', { params }),
  getById: (id) => api.get(`/plans/${id}`),
  // Admin endpoints
  getAllAdmin: () => api.get('/plans/admin/all'),
  create: (planData) => api.post('/plans/admin', planData),
  update: (id, planData) => api.put(`/plans/admin/${id}`, planData),
  delete: (id) => api.delete(`/plans/admin/${id}`),
  toggle: (id) => api.patch(`/plans/admin/${id}/toggle`),
};

// User Plans API
export const userPlansAPI = {
  getMyPlans: () => api.get('/user-plans/my-plans'),
  getHistory: (params) => api.get('/user-plans/history', { params }),
  purchase: (planData) => api.post('/user-plans/purchase', planData),
  cancel: (id) => api.patch(`/user-plans/${id}/cancel`),
  // Admin endpoints
  getAllAdmin: (params) => api.get('/user-plans/admin/all', { params }),
  createAdmin: (planData) => api.post('/user-plans/admin/create', planData),
  verify: (id) => api.patch(`/user-plans/admin/${id}/verify`),
  unverify: (id) => api.patch(`/user-plans/admin/${id}/unverify`),
  reject: (id) => api.delete(`/user-plans/admin/${id}/reject`),
};

// Admin API
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
  verifyUser: (id) => api.post(`/admin/users/${id}/verify`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  resetUserPassword: (id, newPassword) => api.post(`/admin/users/${id}/reset-password`, newPassword ? { newPassword } : {}),
  viewUserPassword: (id, token) => api.post(`/admin/users/${id}/view-password`, { token }),
  viewUserPasswordSimple: (id) => api.get(`/admin/users/${id}/password`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  
  // Jackpots
  getJackpots: (params) => api.get('/admin/jackpots', { params }),
  getJackpot: (id) => api.get(`/admin/jackpots/${id}`),
  createJackpot: (data) => api.post('/admin/jackpots', data),
  updateJackpot: (id, data) => api.put(`/admin/jackpots/${id}`, data),
  deleteJackpot: (id) => api.delete(`/admin/jackpots/${id}`),
  
  // Transactions
  getTransactions: (params) => api.get('/admin/transactions', { params }),
  
  // Tickets
  getTickets: (params) => api.get('/admin/tickets', { params }),
  
  // Wallets
  getWallets: (params) => api.get('/admin/wallets', { params }),
  
  // Roles
  getRoles: () => api.get('/admin/roles'),
  
  // Settings
  getSettings: (params) => api.get('/admin/settings', { params }),
  updateSetting: (key, value) => api.put(`/admin/settings/${key}`, { value }),
  createSetting: (data) => api.post('/admin/settings', data),
  deleteSetting: (key) => api.delete(`/admin/settings/${key}`),
  
  // Languages
  getLanguages: () => api.get('/admin/languages'),
  
  // Pages
  getPages: (params) => api.get('/admin/pages', { params }),
  createPage: (data) => api.post('/admin/pages', data),
  updatePage: (id, data) => api.put(`/admin/pages/${id}`, data),
  deletePage: (id) => api.delete(`/admin/pages/${id}`),
};

// Health check
export const healthAPI = {
  check: () => axios.get(`${API_BASE_URL.replace('/api', '')}/health`),
};

export default api; 