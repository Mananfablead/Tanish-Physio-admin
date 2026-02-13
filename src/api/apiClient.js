import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Only set Content-Type to application/json if not FormData
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Check if this is a token expiration/invalid token error
      const isTokenError =
        error.response?.data?.message?.includes("Invalid or expired token") ||
        error.response?.data?.message?.includes("Access token required") ||
        error.response?.data?.message?.includes("User not found");

      if (isTokenError) {
        // Remove token from localStorage
        localStorage.removeItem("token");

        // Update the Redux store by dispatching logout
        // Dispatch logout action to clear the auth state
        const event = new CustomEvent("tokenExpired", {
          detail: { message: "Token expired" },
        });
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
  PUBLIC_PROFILE: "/auth/profile/:userId",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",

  // subscriptions
  SUBSCRIPTIONS: "/subscriptions",
  SUBSCRIPTIONS_CREATE_ORDER: "/subscriptions/create-order",
  SUBSCRIPTION_PLANS: "/subscriptions/plans",
  SUBSCRIPTION_PLAN_BY_ID: "/subscriptions/plans/:id",
  SUBSCRIPTIONS_ADMIN_ALL: "/subscriptions/admin/all",

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
  CREATE_SERVICES: "/services",
  SERVICES: "/services/admin/all",
  SERVICE_BY_ID: "/services/:id",
  GET_SERVICE_BY_ID: "/services/admin/:id",
  GET_SERVICE_BY_SLUG: "/services/admin/slug/:slug",
  SERVICE_REMOVE_MEDIA: "/services/:id/remove-media",

  // sessions
  SESSIONS: "/sessions/all",
  SESSION_BY_ID: "/sessions/:id",
  RESCHEDULE_SESSION: "sessions/admin/:id/reschedule",
  DELETE_SESSION: "sessions/admin/:id",
  ACCEPT_SESSION: "sessions/accept/:id",
  REJECT_SESSION: "sessions/reject/:id",

  // therapists
  THERAPISTS: "/therapists",
  THERAPIST_BY_ID: "/therapists/:id",

  // notifications
  NOTIFICATIONS: "/notifications",
  NOTIFICATION_BY_ID: "/notifications/:id",
  NOTIFICATION_MARK_READ: "/notifications/:id/read",

  // bookings
  BOOKINGS: "/bookings/admin/all",
  BOOKING_BY_ID: "/bookings/:id",

  // questionnaires
  QUESTIONNAIRES: "/questionnaires",
  QUESTIONNAIRE_BY_ID: "/questionnaires/:id",

  // payments
  PAYMENTS: "/payments",
  PAYMENTS_ADMIN_ALL: "/payments/admin/all",
  PAYMENT_BY_ID: "/payments/admin/:paymentId",
  PAYMENTS_CREATE_ORDER: "/payments/create-order",
  PAYMENTS_VERIFY: "/payments/verify",
  PAYMENTS_WEBHOOK: "/payments/webhook",
  PAYMENTS_SUBSCRIPTION_ORDER: "/payments/create-subscription-order",
  PAYMENTS_VERIFY_SUBSCRIPTION: "/payments/verify-subscription",

  // testimonials
  TESTIMONIALS: "/testimonials",
  TESTIMONIALS_CREATE: "/testimonials/create",
  TESTIMONIALS_PUBLIC: "/testimonials/public",
  TESTIMONIALS_FEATURED: "/testimonials/public/featured",
  TESTIMONIALS_STATS: "/testimonials/stats",
  TESTIMONIAL_BY_ID: "/testimonials/:id",
  TESTIMONIAL_STATUS: "/testimonials/:id/status",
  TESTIMONIAL_FEATURED: "/testimonials/:id/featured",

  // reports
  DASHBOARD_REPORT: "/reports/admin/dashboard",
  USERS_REPORT: "/reports/users",
  SESSIONS_REPORT: "/reports/sessions",
  REVENUE_REPORT: "/reports/revenue",
  THERAPISTS_REPORT: "/reports/therapists", 

  // cms
  CMS_HERO_PUBLIC: "/cms/public/hero",
  CMS_HERO_ADMIN: "/cms/admin/hero",
  CMS_STEPS_PUBLIC: "/cms/public/steps",
  CMS_STEPS_ADMIN: "/cms/admin/steps",
  CMS_CONDITIONS_PUBLIC: "/cms/public/conditions",
  CMS_CONDITIONS_ADMIN: "/cms/admin/conditions",
  CMS_WHY_US_PUBLIC: "/cms/public/whyUs",
  CMS_WHY_US_ADMIN: "/cms/admin/whyUs",
  CMS_FAQ_PUBLIC: "/cms/public/faq",
  CMS_FAQ_ADMIN: "/cms/admin/faq",
  CMS_TERMS_PUBLIC: "/cms/public/terms",
  CMS_TERMS_ADMIN: "/cms/admin/terms",
  CMS_FEATURED_THERAPIST_PUBLIC: "/cms/public/featuredTherapist",
  CMS_FEATURED_THERAPIST_ADMIN: "/cms/admin/featuredTherapist",
  CMS_CONTACT_PUBLIC: "/cms/public/contact",
  CMS_CONTACT_ADMIN: "/cms/admin/contact",
  CMS_ABOUT_PUBLIC: "/cms/public/about",
  CMS_ABOUT_ADMIN: "/cms/admin/about",
  CMS_ALL_ADMIN: "/cms/admin/all",
  // contact messages
  CONTACT_MESSAGES: "/cms/admin/contact-messages",
  CONTACT_MESSAGES_STATS: "/cms/admin/contact-messages-stats",
  CONTACT_MESSAGE_BY_ID: "/cms/admin/contact-messages/:id",
};
export const availabilityAPI = {
  // Get all availability
  getAll: () => apiClient.get(API.AVAILABILITY),

  // Get availability by therapist
  getByTherapist: (therapistId) =>
    apiClient.get(`${API.AVAILABILITY_BY_THERAPIST}/${therapistId}`),

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
  getById: (id) =>
    apiClient.get(`${API.QUESTIONNAIRE_BY_ID.replace(":id", id)}`),

  // Create new questionnaire
  create: (data) => {
    // Format questions according to the specified API structure
    const formattedQuestions = data.questions
      ? data.questions.map((q, index) => ({
          question: String(q.question),
          type: String(q.type),
          order: Number(q.order !== undefined ? q.order : index + 1),
          required: Boolean(q.required !== undefined ? q.required : true),
          active: Boolean(q.active !== undefined ? q.active : true),
          options: q.options || [],
        }))
      : [];

    const payload = {
      title: String(data.title || "Health Assessment Questionnaire"),
      description: String(
        data.description || "Please answer these health-related questions"
      ),
      isActive: Boolean(data.isActive !== undefined ? data.isActive : true),
      questions: formattedQuestions,
    };
    return apiClient.post(API.QUESTIONNAIRES, payload);
  },

  // Update questionnaire
  update: (id, data) => {
    // Normalize questions according to backend contract
    const normalizedQuestions = data.questions
      ? data.questions.map((q, index) => ({
          question: String(q.question),
          type: String(q.type),
          order: Number(
            q.order !== undefined && q.order !== null ? q.order : index + 1
          ),
          required: Boolean(q.required),
          active: q.active !== undefined ? Boolean(q.active) : true,
          options: q.options || [],
          min: q.min,
          max: q.max,
        }))
      : [];

    const payload = {
      title: data.title,
      description: data.description,
      questions: normalizedQuestions,
      isActive: data.isActive,
    };
    return apiClient.put(
      `${API.QUESTIONNAIRE_BY_ID.replace(":id", id)}`,
      payload
    );
  },

  // Update questions in questionnaire
  updateQuestions: (id, data) => {
    // Ensure data is in the correct format { questions: Question[] }
    const payload = Array.isArray(data) ? { questions: data } : data;
    return apiClient.put(
      `${API.QUESTIONNAIRE_BY_ID.replace(":id", id)}/questions`,
      payload
    );
  },

  // Delete questionnaire
  delete: (id) =>
    apiClient.delete(`${API.QUESTIONNAIRE_BY_ID.replace(":id", id)}`),

  // Activate questionnaire
  activate: (id) =>
    apiClient.put(`${API.QUESTIONNAIRE_BY_ID.replace(":id", id)}/activate`),
};
export const subscriptionAPI = {
  // Get all subscription plans
  getPlans: () => apiClient.get(API.SUBSCRIPTIONS),

  // Create subscription order
  createOrder: (data) => apiClient.post(API.SUBSCRIPTIONS_CREATE_ORDER, data),

  // Get all subscription plans (admin)
  getAllPlans: () => apiClient.get(API.SUBSCRIPTION_PLANS),

  // Get subscription plan by ID (admin)
  getPlanById: (id) =>
    apiClient.get(`${API.SUBSCRIPTION_PLAN_BY_ID.replace(":id", id)}`),

  // Create subscription plan (admin)
  createPlan: (data) => apiClient.post(API.SUBSCRIPTION_PLANS, data),

  // Update subscription plan (admin)
  updatePlan: (id, data) =>
    apiClient.put(`${API.SUBSCRIPTION_PLAN_BY_ID.replace(":id", id)}`, data),

  // Delete subscription plan (admin)
  deletePlan: (id) =>
    apiClient.delete(`${API.SUBSCRIPTION_PLAN_BY_ID.replace(":id", id)}`),
  
  // Get all user subscriptions (admin)
  getAllUserSubscriptions: () => apiClient.get(API.SUBSCRIPTIONS_ADMIN_ALL),
};

// Service API endpoints
export const serviceAPI = {
  // Get all services
  getAll: () => apiClient.get(API.SERVICES),

  // Get service by ID
  getById: (id) => apiClient.get(`${API.GET_SERVICE_BY_ID.replace(":id", id)}`),

  // Get service by slug
  getBySlug: (slug) => apiClient.get(`${API.GET_SERVICE_BY_SLUG.replace(":slug", slug)}`),

  // Create service
  create: (data) => apiClient.post(API.CREATE_SERVICES, data),

  // Update service
  update: (id, data) =>
    apiClient.put(`${API.SERVICE_BY_ID.replace(":id", id)}`, data),

  // Delete service
  delete: (id) => apiClient.delete(`${API.SERVICE_BY_ID.replace(":id", id)}`),

  // Remove media from service
  removeMedia: (id, mediaData) =>
    apiClient.put(`${API.SERVICE_REMOVE_MEDIA.replace(":id", id)}`, mediaData),
};

// Session API endpoints
export const sessionAPI = {
  // Get all sessions
  getAll: () => apiClient.get(API.SESSIONS),

  // Get upcoming sessions
  getUpcoming: () => apiClient.get(`${API.SESSIONS}/upcoming`),

  // Get all upcoming sessions
  getAllUpcoming: () => apiClient.get(`${API.SESSIONS}/upcoming`),

  // Get session by ID
  getById: (id) => apiClient.get(`${API.SESSION_BY_ID.replace(":id", id)}`),

  // Create session
  create: (data) => apiClient.post(API.SESSIONS, data),

  // Update session
  update: (id, data) =>
    apiClient.put(`${API.SESSION_BY_ID.replace(":id", id)}`, data),

  // Reschedule session
  reschedule: (id, data) =>
    apiClient.put(`${API.RESCHEDULE_SESSION.replace(":id", id)}`, data),

  // Update session status
  updateStatus: (id, data) =>
    apiClient.put(`${API.DELETE_SESSION.replace(":id", id)}`, data),

  // Delete session by admin
  deleteById: (id) => apiClient.delete(`${API.DELETE_SESSION.replace(":id", id)}`),

  // Delete session
  delete: (id) => apiClient.delete(`${API.SESSION_BY_ID.replace(":id", id)}`),

  // Accept session
  accept: (id) => apiClient.put(`${API.ACCEPT_SESSION.replace(":id", id)}`),

  // Reject session
  reject: (id) => apiClient.put(`${API.REJECT_SESSION.replace(":id", id)}`),
};

// Therapist API endpoints
export const therapistAPI = {
  // Get all therapists
  getAll: () => apiClient.get(API.THERAPISTS),

  // Get therapist by ID
  getById: (id) => apiClient.get(`${API.THERAPIST_BY_ID.replace(":id", id)}`),

  // Create therapist
  create: (data) => apiClient.post(API.THERAPISTS, data),

  // Update therapist
  update: (id, data) =>
    apiClient.put(`${API.THERAPIST_BY_ID.replace(":id", id)}`, data),

  // Delete therapist
  delete: (id) => apiClient.delete(`${API.THERAPIST_BY_ID.replace(":id", id)}`),
};

// User API endpoints
export const userAPI = {
  // Get all users
  getAll: (params) => apiClient.get(API.USERS, { params }),

  // Get user by ID
  getById: (id) => apiClient.get(`${API.USER_BY_ID.replace(":id", id)}`),
};

// Notification API endpoints
export const notificationAPI = {
  // Get all notifications
  getAll: () => apiClient.get(API.NOTIFICATIONS),

  // Send notification
  send: (data) => apiClient.post(API.NOTIFICATIONS, data),

  // Mark notification as read
  markAsRead: (id) => {
    return apiClient.put(`${API.NOTIFICATION_MARK_READ.replace(":id", id)}`);
  },

  // Delete notification
  delete: (id) => {
    return apiClient.delete(`${API.NOTIFICATION_BY_ID.replace(":id", id)}`);
  },

  // Delete all notifications (would need backend endpoint)
  deleteAll: () => {
    return apiClient.delete(API.NOTIFICATIONS);
  },
};

// Booking API endpoints
export const bookingAPI = {
  // Get all bookings
  getAll: () => apiClient.get(API.BOOKINGS),

  // Get booking by ID
  getById: (id) => apiClient.get(`${API.BOOKING_BY_ID.replace(":id", id)}`),

  // Create booking
  create: (data) => apiClient.post(API.BOOKINGS, data),

  // Update booking
  update: (id, data) =>
    apiClient.put(`${API.BOOKING_BY_ID.replace(":id", id)}`, data),

  // Delete booking
  delete: (id) => apiClient.delete(`${API.BOOKING_BY_ID.replace(":id", id)}`),
};

// Payment API endpoints
export const paymentAPI = {
  // Get all payments (admin)
  getAll: () => apiClient.get(API.PAYMENTS_ADMIN_ALL),

  // Get payment by ID (admin)
  getById: (paymentId) => apiClient.get(API.PAYMENT_BY_ID.replace(':paymentId', paymentId)),

  // Create payment order
  createOrder: (data) => apiClient.post(API.PAYMENTS_CREATE_ORDER, data),

  // Verify payment
  verify: (data) => apiClient.post(API.PAYMENTS_VERIFY, data),

  // Create subscription order
  createSubscriptionOrder: (data) =>
    apiClient.post(API.PAYMENTS_SUBSCRIPTION_ORDER, data),

  // Verify subscription payment
  verifySubscription: (data) =>
    apiClient.post(API.PAYMENTS_VERIFY_SUBSCRIPTION, data),

  // Handle payment webhook
  handleWebhook: (data) => apiClient.post(API.PAYMENTS_WEBHOOK, data),
};

// Reports API endpoints
export const reportAPI = {
  // Get dashboard report
  getDashboardReport: (params) => apiClient.get(API.DASHBOARD_REPORT, { params }),

  // Get user reports
  getUserReport: (params) => apiClient.get(API.USERS_REPORT, { params }),

  // Get session reports
  getSessionReport: (params) => apiClient.get(API.SESSIONS_REPORT, { params }),

  // Get revenue reports
  getRevenueReport: (params) => apiClient.get(API.REVENUE_REPORT, { params }),

  // Get therapist reports
  getTherapistReport: (params) => apiClient.get(API.THERAPISTS_REPORT, { params }),
};

// Testimonial API endpoints
export const testimonialAPI = {
  // Get all testimonials (admin)
  getAll: (params) => apiClient.get(API.TESTIMONIALS, { params }),

  // Get testimonial stats (admin)
  getStats: () => apiClient.get(API.TESTIMONIALS_STATS),

  // Get testimonial by ID (admin)
  getById: (id) => apiClient.get(API.TESTIMONIAL_BY_ID.replace(':id', id)),

  // Create testimonial (admin)
  create: (data) => {
    // Check if data contains a video file
    if (data.video && data.video instanceof File) {
      const formData = new FormData();
      formData.append('video', data.video);
      // Add other fields
      Object.keys(data).forEach(key => {
        if (key !== 'video') {
          if (typeof data[key] === 'object' && data[key] !== null) {
            formData.append(key, JSON.stringify(data[key]));
          } else {
            formData.append(key, data[key]);
          }
        }
      });
      return apiClient.post(API.TESTIMONIALS, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      return apiClient.post(API.TESTIMONIALS, data);
    }
  },

  // Update testimonial (admin)
  update: (id, data) => {
    // Check if data contains a video file
    if (data.video && data.video instanceof File) {
      const formData = new FormData();
      formData.append('video', data.video);
      // Add other fields
      Object.keys(data).forEach(key => {
        if (key !== 'video') {
          if (typeof data[key] === 'object' && data[key] !== null) {
            formData.append(key, JSON.stringify(data[key]));
          } else {
            formData.append(key, data[key]);
          }
        }
      });
      return apiClient.put(API.TESTIMONIAL_BY_ID.replace(':id', id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      return apiClient.put(API.TESTIMONIAL_BY_ID.replace(':id', id), data);
    }
  },

  // Update testimonial status (admin)
  updateStatus: (id, status) => apiClient.put(API.TESTIMONIAL_STATUS.replace(':id', id), { status }),

  // Toggle featured status (admin)
  toggleFeatured: (id) => apiClient.patch(API.TESTIMONIAL_FEATURED.replace(':id', id)),

  // Delete testimonial (admin)
  delete: (id) => apiClient.delete(API.TESTIMONIAL_BY_ID.replace(':id', id)),

  // Get public testimonials
  getPublic: () => apiClient.get(API.TESTIMONIALS_PUBLIC),

  // Get featured testimonials
  getFeatured: () => apiClient.get(API.TESTIMONIALS_FEATURED),
};

// Contact Messages API endpoints
export const contactMessageAPI = {
  // Get all contact messages
  getAll: (params) => apiClient.get(API.CONTACT_MESSAGES, { params }),

  // Get contact message by ID
  getById: (id) => apiClient.get(API.CONTACT_MESSAGE_BY_ID.replace(':id', id)),

  // Update contact message status/reply
  update: (id, data) => apiClient.put(API.CONTACT_MESSAGE_BY_ID.replace(':id', id), data),

  // Delete contact message
  delete: (id) => apiClient.delete(API.CONTACT_MESSAGE_BY_ID.replace(':id', id)),

  // Get contact messages statistics
  getStats: () => apiClient.get(API.CONTACT_MESSAGES_STATS),
};

// CMS API endpoints
export const cmsAPI = {
  // Hero section
  getHeroPublic: () => apiClient.get(API.CMS_HERO_PUBLIC),
  getHeroAdmin: () => apiClient.get(API.CMS_HERO_ADMIN),
  updateHero: (data) => {
    // Check if image data contains actual file objects (not just URLs)
    if (data.image && typeof data.image !== 'string') {
      const formData = new FormData();
      formData.append('image', data.image);
      // Add other fields except image
      Object.keys(data).forEach(key => {
        if (key !== 'image') {
          formData.append(key, data[key]);
        }
      });
      return apiClient.put(API.CMS_HERO_ADMIN, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      return apiClient.put(API.CMS_HERO_ADMIN, data);
    }
  },

  // Steps section
  getStepsPublic: () => apiClient.get(API.CMS_STEPS_PUBLIC),
  getStepsAdmin: () => apiClient.get(API.CMS_STEPS_ADMIN),
  createStep: (data) => {
    // Check if image data contains actual file objects (not just URLs)
    if (data.image && typeof data.image !== 'string') {
      const formData = new FormData();
      formData.append('image', data.image);
      // Add other fields except image
      Object.keys(data).forEach(key => {
        if (key !== 'image') {
          formData.append(key, data[key]);
        }
      });
      return apiClient.post(API.CMS_STEPS_ADMIN, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      return apiClient.post(API.CMS_STEPS_ADMIN, data);
    }
  },
  updateStep: (id, data) => {
    // Check if image data contains actual file objects (not just URLs)
    if (data.image && typeof data.image !== 'string') {
      const formData = new FormData();
      formData.append('image', data.image);
      // Add other fields except image
      Object.keys(data).forEach(key => {
        if (key !== 'image') {
          formData.append(key, data[key]);
        }
      });
      return apiClient.put(`${API.CMS_STEPS_ADMIN}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      return apiClient.put(`${API.CMS_STEPS_ADMIN}/${id}`, data);
    }
  },
  deleteStep: (id) => apiClient.delete(`${API.CMS_STEPS_ADMIN}/${id}`),

  // Conditions section
  getConditionsPublic: () => apiClient.get(API.CMS_CONDITIONS_PUBLIC),
  getConditionsAdmin: () => apiClient.get(API.CMS_CONDITIONS_ADMIN),
  createConditions: (data) => {
    const formData = new FormData();
    
    // Append basic fields
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('isPublic', data.isPublic ? 'true' : 'false');
    
    // Append conditions with indexed keys format
    if (data.conditions && Array.isArray(data.conditions)) {
      data.conditions.forEach((condition, index) => {
        formData.append(`conditions[${index}][title]`, condition.name || '');
        formData.append(`conditions[${index}][content]`, ''); // Empty content as per backend expectation
        
        // Append image only if it's a File object
        if (condition.image && condition.image instanceof File) {
          formData.append(`conditions[${index}][image]`, condition.image);
        }
      });
    }
    
    return apiClient.post(API.CMS_CONDITIONS_ADMIN, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateConditions: (data) => {
    const formData = new FormData();
    
    // Append basic fields
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('isPublic', data.isPublic ? 'true' : 'false');
    
    // Append conditions with indexed keys format
    if (data.conditions && Array.isArray(data.conditions)) {
      data.conditions.forEach((condition, index) => {
        formData.append(`conditions[${index}][title]`, condition.name || '');
        formData.append(`conditions[${index}][content]`, ''); // Empty content as per backend expectation
        
        // Append image only if it's a File object
        if (condition.image && condition.image instanceof File) {
          formData.append(`conditions[${index}][image]`, condition.image);
        }
      });
    }
    
    return apiClient.put(API.CMS_CONDITIONS_ADMIN, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Add a single condition
  addSingleCondition: (data) => {
    const formData = new FormData();
    
    // Append condition data
    formData.append('title', data.title || data.name || '');
    formData.append('content', data.content || '');
    
    // Append image if it's a File object
    if (data.image && data.image instanceof File) {
      formData.append('image', data.image);
    }
    
    return apiClient.post(`${API.CMS_CONDITIONS_ADMIN}/single`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Update a single condition by index
  updateSingleCondition: (index, data) => {
    const formData = new FormData();
    
    // Append condition data
    formData.append('title', data.title || data.name || '');
    formData.append('content', data.content || '');
    
    // Append image if it's a File object
    if (data.image && data.image instanceof File) {
      formData.append('image', data.image);
    }
    
    return apiClient.put(`${API.CMS_CONDITIONS_ADMIN}/single/${index}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Delete a single condition by index
  deleteSingleCondition: (index) => {
    return apiClient.delete(`${API.CMS_CONDITIONS_ADMIN}/single/${index}`);
  },
  updateConditionsById: (id, data) => {
    const formData = new FormData();
    
    // Append basic fields
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('isPublic', data.isPublic ? 'true' : 'false');
    
    // Append conditions with indexed keys format
    if (data.conditions && Array.isArray(data.conditions)) {
      data.conditions.forEach((condition, index) => {
        formData.append(`conditions[${index}][title]`, condition.name || '');
        formData.append(`conditions[${index}][content]`, ''); // Empty content as per backend expectation
        
        // Append image only if it's a File object
        if (condition.image && condition.image instanceof File) {
          formData.append(`conditions[${index}][image]`, condition.image);
        }
      });
    }
    
    return apiClient.put(`${API.CMS_CONDITIONS_ADMIN}/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Why Us section
  getWhyUsPublic: () => apiClient.get(API.CMS_WHY_US_PUBLIC),
  getWhyUsAdmin: () => apiClient.get(API.CMS_WHY_US_ADMIN),
  updateWhyUs: (data) => apiClient.put(API.CMS_WHY_US_ADMIN, data),

  // FAQ section
  getFaqsPublic: () => apiClient.get(API.CMS_FAQ_PUBLIC),
  getFaqsAdmin: () => apiClient.get(API.CMS_FAQ_ADMIN),
  createFaq: (data) => apiClient.post(API.CMS_FAQ_ADMIN, data),
  updateFaq: (id, data) => apiClient.put(`${API.CMS_FAQ_ADMIN}/${id}`, data),
  deleteFaq: (id) => apiClient.delete(`${API.CMS_FAQ_ADMIN}/${id}`),

  // Terms section
  getTermsPublic: () => apiClient.get(API.CMS_TERMS_PUBLIC),
  getTermsAdmin: () => apiClient.get(API.CMS_TERMS_ADMIN),
  updateTerms: (data) => apiClient.put(API.CMS_TERMS_ADMIN, data),

  // Featured Therapist section
  getFeaturedTherapistPublic: () => apiClient.get(API.CMS_FEATURED_THERAPIST_PUBLIC),
  getFeaturedTherapistAdmin: () => apiClient.get(API.CMS_FEATURED_THERAPIST_ADMIN),
  updateFeaturedTherapist: (data) => {
    // Check if image data contains actual file objects (not just URLs)
    if (data.image && typeof data.image !== 'string') {
      const formData = new FormData();
      formData.append('image', data.image);
      // Add other fields except image
      Object.keys(data).forEach(key => {
        if (key !== 'image') {
          formData.append(key, data[key]);
        }
      });
      return apiClient.put(API.CMS_FEATURED_THERAPIST_ADMIN, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      return apiClient.put(API.CMS_FEATURED_THERAPIST_ADMIN, data);
    }
  },

  // Contact section
  getContactPublic: () => apiClient.get(API.CMS_CONTACT_PUBLIC),
  getContactAdmin: () => apiClient.get(API.CMS_CONTACT_ADMIN),
  updateContact: (data) => apiClient.put(API.CMS_CONTACT_ADMIN, data),

  // About section
  getAboutPublic: () => apiClient.get(API.CMS_ABOUT_PUBLIC),
  getAboutAdmin: () => apiClient.get(API.CMS_ABOUT_ADMIN),
  updateAbout: (data) => {
    // Check if images data contains actual file objects (not just URLs)
    const hasImageFiles = data.images && Array.isArray(data.images) && 
                          data.images.some(img => img instanceof File);
    
    if (hasImageFiles) {
      const formData = new FormData();
      
      // Append all image files
      data.images.forEach((image, index) => {
        if (image instanceof File) {
          formData.append('images', image);
        }
      });
      
      // Add other fields except images array
      Object.keys(data).forEach(key => {
        if (key !== 'images') {
          if (typeof data[key] === 'object' && data[key] !== null) {
            formData.append(key, JSON.stringify(data[key]));
          } else {
            formData.append(key, data[key]);
          }
        }
      });
      
      return apiClient.put(API.CMS_ABOUT_ADMIN, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      return apiClient.put(API.CMS_ABOUT_ADMIN, data);
    }
  },

  // Get all CMS data
  getAllCmsData: () => apiClient.get(API.CMS_ALL_ADMIN),
};
