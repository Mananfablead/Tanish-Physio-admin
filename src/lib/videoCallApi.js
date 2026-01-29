import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const apiClient = axios.create({
    baseURL: `${API_BASE_URL}/api/video-call`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Admin Video Call API Service
export const adminVideoCallApi = {
    // Get all call logs with filters
    getCallLogs: async (params = {}) => {
        const response = await apiClient.get('/logs', { params });
        return response.data;
    },

    // Get call quality metrics for a session
    getCallQualityMetrics: async (sessionId) => {
        const response = await apiClient.get(`/logs/${sessionId}/metrics`);
        return response.data;
    },

    // Get currently active calls
    getActiveCalls: async () => {
        const response = await apiClient.get('/active');
        return response.data;
    },

    // Force end a call
    forceEndCall: async (sessionId, reason) => {
        const response = await apiClient.post('/force-end', {
            sessionId,
            reason,
        });
        return response.data;
    },

    // Mute a participant
    muteParticipant: async (sessionId, userId) => {
        const response = await apiClient.post('/mute-participant', {
            sessionId,
            userId,
        });
        return response.data;
    },
};

// Admin Chat API Service
export const adminChatApi = {
    // Get chat messages for a session
    getMessages: async (sessionId) => {
        const response = await apiClient.get(`/${sessionId}`);
        return response.data;
    },

    // Send a chat message
    sendMessage: async (sessionId, message) => {
        const response = await apiClient.post('/send', {
            sessionId,
            message,
        });
        return response.data;
    },
};

export default adminVideoCallApi;