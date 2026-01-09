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

export default apiClient;

export const API = {
  // auth 
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  PROFILE: "/auth/profile",
  FORGOT_PASSWORD: "/auth/forgot-password",
  
  // subscriptions
  SUBSCRIPTIONS: "/subscriptions",
  SUBSCRIPTIONS_CREATE_ORDER: "/subscriptions/create-order",

  // availability
  AVAILABILITY: "/availability",
  AVAILABILITY_BY_THERAPIST: "/availability/therapist",

  UPDATE_PROFILE:  "/auth/profile",
  UPDATE_PASSWORD: "/auth/update-password",
  UPDATE_PROFILE_PICTURE: "/auth/profile-picture",
  // users
  USERS: "/users",
  USER_BY_ID: "/users/:id",
  
  // services
  SERVICES: "/services",
  SERVICE_BY_ID: "/services/:id",
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
};
export const questionnaireAPI = {
  // Get all questionnaires
  getAll: () => apiClient.get('/questionnaires'),
  
  // Get active questionnaire
  getActive: () => apiClient.get('/questionnaires/active'),
  
  // Get questionnaire by ID
  getById: (id) => apiClient.get(`/questionnaires/${id}`),
  
  // Create new questionnaire
  create: (data) => {
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
      min: q.min,
      max: q.max
    })) : [];
    
    const payload = {
      ...data,
      questions: normalizedQuestions
    };
    return apiClient.post('/questionnaires', payload);
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
      min: q.min,
      max: q.max
    })) : [];
    
    const payload = {
      ...data,
      questions: normalizedQuestions
    };
    return apiClient.put(`/questionnaires/${id}`, payload);
  },
  
  // Update only questions of a questionnaire
  updateQuestions: (id, questions) => {
    // Normalize questions according to backend contract
    const normalizedQuestions = questions ? questions.map((q, index) => ({
      question: String(q.question),
      type: String(q.type),
      order: Number(
        q.order !== undefined && q.order !== null
          ? q.order
          : index + 1
      ),
      required: Boolean(q.required),
      active: q.active !== undefined ? Boolean(q.active) : true,
      min: q.min,
      max: q.max
    })) : [];
    
    return apiClient.put(`/questionnaires/${id}/questions`, { questions: normalizedQuestions });
  },
  
  // Delete questionnaire
  delete: (id) => apiClient.delete(`/questionnaires/${id}`),
  
  // Activate questionnaire
  activate: (id) => apiClient.put(`/questionnaires/${id}/activate`),
};
export const subscriptionAPI = {
  // Get all subscription plans
  getPlans: () => apiClient.get(API.SUBSCRIPTIONS),
  
  // Create subscription order
  createOrder: (data) => apiClient.post(API.SUBSCRIPTIONS_CREATE_ORDER, data),
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
