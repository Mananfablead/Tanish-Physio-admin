import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
    baseURL: `${API_BASE_URL}/video-call`,
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

    // Get participants for a session
    getSessionParticipants: async (sessionId) => {
        const response = await apiClient.get(`/session/${sessionId}/participants`);
        return response.data;
    },

    // Generate join link for admin monitoring
    generateJoinLink: async (sessionId, userId, role) => {
        const response = await apiClient.post('/generate-join-link', {
            sessionId,
            userId,
            role,
        });
        return response.data;
    },

    // Create call log
    createCallLog: async (sessionId, groupSessionId, type, participants) => {
        console.log('📤 createCallLog called with:', { sessionId, groupSessionId, type, participants });
        console.log('📤 apiClient baseURL:', apiClient.defaults.baseURL);

        try {
            const response = await apiClient.post('/logs', {
                sessionId,
                groupSessionId,
                type,
                participants
            });
            console.log('📥 createCallLog response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ createCallLog error:', error);
            console.error('❌ Error response:', error.response?.data);
            throw error;
        }
    },

    // Recording APIs
    startRecording: async (callLogId) => {
        const response = await apiClient.post('/recording/start', {
            callLogId
        });
        return response.data;
    },

    stopRecording: async (callLogId) => {
        const response = await apiClient.post('/recording/stop', {
            callLogId
        });
        return response.data;
    },

    uploadRecording: async (file, callLogId) => {
        const formData = new FormData();
        formData.append('recording', file);
        formData.append('callLogId', callLogId);

        const response = await apiClient.post('/recording/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    uploadRecordingImage: async (file, callLogId) => {
        const formData = new FormData();
        formData.append('recordingImage', file);
        formData.append('callLogId', callLogId);

        const response = await apiClient.post('/recording/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    getUserRecordings: async (params = {}) => {
        const queryParams = new URLSearchParams(params);
        const response = await apiClient.get(`/recordings/user${queryParams.toString() ? '?' + queryParams.toString() : ''}`);
        return response.data;
    },

    getAllRecordings: async (params = {}) => {
        const queryParams = new URLSearchParams(params);
        const response = await apiClient.get(`/recordings${queryParams.toString() ? '?' + queryParams.toString() : ''}`);
        return response.data;
    },

    getRecordingById: async (id) => {
        const response = await apiClient.get(`/recordings/${id}`);
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