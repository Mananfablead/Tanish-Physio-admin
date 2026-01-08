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
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  PROFILE: "/auth/profile",
};

// Questionnaire API endpoints
export const questionnaireAPI = {
  // Get all questionnaires
  getAll: () => apiClient.get('/questionnaires'),
  
  // Get active questionnaire
  getActive: () => apiClient.get('/questionnaires/active'),
  
  // Get questionnaire by ID
  getById: (id) => apiClient.get(`/questionnaires/${id}`),
  
  // Create new questionnaire
  create: (data) => apiClient.post('/questionnaires', data),
  
  // Update questionnaire
  update: (id, data) => apiClient.put(`/questionnaires/${id}`, data),
  
  // Update only questions of a questionnaire
  updateQuestions: (id, questions) => apiClient.put(`/questionnaires/${id}/questions`, { questions }),
  
  // Delete questionnaire
  delete: (id) => apiClient.delete(`/questionnaires/${id}`),
  
  // Activate questionnaire
  activate: (id) => apiClient.put(`/questionnaires/${id}/activate`),
};
