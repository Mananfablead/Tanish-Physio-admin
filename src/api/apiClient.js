import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Check if this is a token expiration/invalid token error
      const isTokenError = error.response?.data?.message?.includes('Invalid or expired token') ||
        error.response?.data?.message?.includes('Access token required') ||
        error.response?.data?.message?.includes('User not found');

      if (isTokenError) {
        // Remove token from localStorage
        localStorage.removeItem("token");

        // Update the Redux store by dispatching logout
        // Dispatch logout action to clear the auth state
        const event = new CustomEvent('tokenExpired', { detail: { message: 'Token expired' } });
        window.dispatchEvent(event);

        // Redirect to login page
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

export const API = {
  // auth 
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  PROFILE: "/auth/profile",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",


  // subscriptions
  SUBSCRIPTIONS: "/subscriptions",
  SUBSCRIPTIONS_CREATE_ORDER: "/subscriptions/create-order",
  SUBSCRIPTION_PLANS: "/subscriptions/plans",
  SUBSCRIPTION_PLAN_BY_ID: "/subscriptions/plans/:id",

  // availability
  AVAILABILITY: "/availability",
  AVAILABILITY_BY_THERAPIST: "/availability/therapist",


  UPDATE_PROFILE: "/auth/profile",
  UPDATE_PASSWORD: "/auth/update-password",
  UPDATE_PROFILE_PICTURE: "/auth/profile",
  // Update profile
  // users
  USERS: "/users",
  USER_BY_ID: "/users/:id",

  // services
  SERVICES: "/services",
  SERVICE_BY_ID: "/services/:id",

  // sessions
  SESSIONS: "/sessions",
  SESSION_BY_ID: "/sessions/:id",

  // therapists
  THERAPISTS: "/therapists",
  THERAPIST_BY_ID: "/therapists/:id",

  // notifications
  NOTIFICATIONS: "/notifications",
  NOTIFICATION_BY_ID: "/notifications/:id",
  NOTIFICATION_MARK_READ: "/notifications/:id/read",

  // bookings
  BOOKINGS: "/bookings",
  BOOKING_BY_ID: "/bookings/:id",

  // questionnaires
  QUESTIONNAIRES: "/questionnaires",
  QUESTIONNAIRE_BY_ID: "/questionnaires/:id",

  // payments
  PAYMENTS: "/payments",
  PAYMENTS_ADMIN_ALL: "/payments/admin/all",
  PAYMENTS_CREATE_ORDER: "/payments/create-order",
  PAYMENTS_VERIFY: "/payments/verify",
  PAYMENTS_WEBHOOK: "/payments/webhook",
  PAYMENTS_SUBSCRIPTION_ORDER: "/payments/create-subscription-order",
  PAYMENTS_VERIFY_SUBSCRIPTION: "/payments/verify-subscription",
};
export const availabilityAPI = {
  // Get all availability
  getAll: () => apiClient.get(API.AVAILABILITY),

  // Get availability by therapist
  getByTherapist: (therapistId) => apiClient.get(`${API.AVAILABILITY_BY_THERAPIST}/${therapistId}`),

  // Create availability
  create: (data) => apiClient.post(API.AVAILABILITY, data),

  // Update availability
  update: (id, data) => apiClient.put(`${API.AVAILABILITY}/${id}`, data),

  // Delete availability
  delete: (id) => apiClient.delete(`${API.AVAILABILITY}/${id}`),

  // Bulk update availability
  bulkUpdate: (data) => apiClient.post(`${API.AVAILABILITY}/bulk-update`, data),
};
export const questionnaireAPI = {
  // Get all questionnaires
  getAll: () => apiClient.get(API.QUESTIONNAIRES),

  // Get active questionnaire
  getActive: () => apiClient.get(`${API.QUESTIONNAIRES}/active`),

  // Get questionnaire by ID
  getById: (id) => apiClient.get(`${API.QUESTIONNAIRE_BY_ID.replace(':id', id)}`),

  // Create new questionnaire
  create: (data) => {
    // Format questions according to the specified API structure
    const formattedQuestions = data.questions ? data.questions.map((q, index) => ({
      question: String(q.question),
      type: String(q.type),
      order: Number(q.order !== undefined ? q.order : index + 1),
      required: Boolean(q.required !== undefined ? q.required : true),
      active: Boolean(q.active !== undefined ? q.active : true),
      options: q.options || []
    })) : [];

    const payload = {
      title: String(data.title || "Health Assessment Questionnaire"),
      description: String(data.description || "Please answer these health-related questions"),
      isActive: Boolean(data.isActive !== undefined ? data.isActive : true),
      questions: formattedQuestions
    };
    return apiClient.post(API.QUESTIONNAIRES, payload);
  },

  // Update questionnaire
  update: (id, data) => {
    // Normalize questions according to backend contract
    const normalizedQuestions = data.questions ? data.questions.map((q, index) => ({
      question: String(q.question),
      type: String(q.type),
      order: Number(
        q.order !== undefined && q.order !== null
          ? q.order
          : index + 1
      ),
      required: Boolean(q.required),
      active: q.active !== undefined ? Boolean(q.active) : true,
      options: q.options || [],
      min: q.min,
      max: q.max
    })) : [];

    const payload = {
      title: data.title,
      description: data.description,
      questions: normalizedQuestions,
      isActive: data.isActive
    };
    return apiClient.put(`${API.QUESTIONNAIRE_BY_ID.replace(':id', id)}`, payload);
  },



  // Update questions in questionnaire
  updateQuestions: (id, data) => {
    // Ensure data is in the correct format { questions: Question[] }
    const payload = Array.isArray(data) ? { questions: data } : data;
    return apiClient.put(`${API.QUESTIONNAIRE_BY_ID.replace(':id', id)}/questions`, payload);
  },

  // Delete questionnaire
  delete: (id) => apiClient.delete(`${API.QUESTIONNAIRE_BY_ID.replace(':id', id)}`),

  // Activate questionnaire
  activate: (id) => apiClient.put(`${API.QUESTIONNAIRE_BY_ID.replace(':id', id)}/activate`),
};
export const subscriptionAPI = {
  // Get all subscription plans
  getPlans: () => apiClient.get(API.SUBSCRIPTIONS),

  // Create subscription order
  createOrder: (data) => apiClient.post(API.SUBSCRIPTIONS_CREATE_ORDER, data),

  // Get all subscription plans (admin)
  getAllPlans: () => apiClient.get(API.SUBSCRIPTION_PLANS),

  // Get subscription plan by ID (admin)
  getPlanById: (id) => apiClient.get(`${API.SUBSCRIPTION_PLAN_BY_ID.replace(':id', id)}`),

  // Create subscription plan (admin)
  createPlan: (data) => apiClient.post(API.SUBSCRIPTION_PLANS, data),

  // Update subscription plan (admin)
  updatePlan: (id, data) => apiClient.put(`${API.SUBSCRIPTION_PLAN_BY_ID.replace(':id', id)}`, data),

  // Delete subscription plan (admin)
  deletePlan: (id) => apiClient.delete(`${API.SUBSCRIPTION_PLAN_BY_ID.replace(':id', id)}`),
};

// Service API endpoints
export const serviceAPI = {
  // Get all services
  getAll: () => apiClient.get(API.SERVICES),

  // Get service by ID
  getById: (id) => apiClient.get(`${API.SERVICE_BY_ID.replace(':id', id)}`),

  // Create service
  create: (data) => apiClient.post(API.SERVICES, data),

  // Update service
  update: (id, data) => apiClient.put(`${API.SERVICE_BY_ID.replace(':id', id)}`, data),

  // Delete service
  delete: (id) => apiClient.delete(`${API.SERVICE_BY_ID.replace(':id', id)}`),
};

// Session API endpoints
export const sessionAPI = {
  // Get all sessions
  getAll: () => apiClient.get(API.SESSIONS),

  // Get upcoming sessions
  getUpcoming: () => apiClient.get(`${API.SESSIONS}/upcoming`),

  // Get session by ID
  getById: (id) => apiClient.get(`${API.SESSION_BY_ID.replace(':id', id)}`),

  // Create session
  create: (data) => apiClient.post(API.SESSIONS, data),

  // Update session
  update: (id, data) => apiClient.put(`${API.SESSION_BY_ID.replace(':id', id)}`, data),

  // Delete session
  delete: (id) => apiClient.delete(`${API.SESSION_BY_ID.replace(':id', id)}`),
};

// Therapist API endpoints
export const therapistAPI = {
  // Get all therapists
  getAll: () => apiClient.get(API.THERAPISTS),

  // Get therapist by ID
  getById: (id) => apiClient.get(`${API.THERAPIST_BY_ID.replace(':id', id)}`),

  // Create therapist
  create: (data) => apiClient.post(API.THERAPISTS, data),

  // Update therapist
  update: (id, data) => apiClient.put(`${API.THERAPIST_BY_ID.replace(':id', id)}`, data),

  // Delete therapist
  delete: (id) => apiClient.delete(`${API.THERAPIST_BY_ID.replace(':id', id)}`),
};

// Notification API endpoints
export const notificationAPI = {
  // Get all notifications
  getAll: () => apiClient.get(API.NOTIFICATIONS),

  // Send notification
  send: (data) => apiClient.post(API.NOTIFICATIONS, data),

  // Mark notification as read
  markAsRead: (id) => apiClient.put(`${API.NOTIFICATION_MARK_READ.replace(':id', id)}`),
};

// Booking API endpoints
export const bookingAPI = {
  // Get all bookings
  getAll: () => apiClient.get(API.BOOKINGS),

  // Get booking by ID
  getById: (id) => apiClient.get(`${API.BOOKING_BY_ID.replace(':id', id)}`),

  // Create booking
  create: (data) => apiClient.post(API.BOOKINGS, data),

  // Update booking
  update: (id, data) => apiClient.put(`${API.BOOKING_BY_ID.replace(':id', id)}`, data),

  // Delete booking
  delete: (id) => apiClient.delete(`${API.BOOKING_BY_ID.replace(':id', id)}`),
};

// Payment API endpoints
export const paymentAPI = {
  // Get all payments (admin)
  getAll: () => apiClient.get(API.PAYMENTS_ADMIN_ALL),

  // Create payment order
  createOrder: (data) => apiClient.post(API.PAYMENTS_CREATE_ORDER, data),

  // Verify payment
  verify: (data) => apiClient.post(API.PAYMENTS_VERIFY, data),

  // Create subscription order
  createSubscriptionOrder: (data) => apiClient.post(API.PAYMENTS_SUBSCRIPTION_ORDER, data),

  // Verify subscription payment
  verifySubscription: (data) => apiClient.post(API.PAYMENTS_VERIFY_SUBSCRIPTION, data),

  // Handle payment webhook
  handleWebhook: (data) => apiClient.post(API.PAYMENTS_WEBHOOK, data),
};
