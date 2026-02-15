import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const adminChatApiClient = axios.create({
  baseURL: `${API_BASE_URL}/admin-chat`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
adminChatApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Define TypeScript interfaces
export interface ChatMessage {
  _id: string;
  sessionId: string | null;
  senderId: {
    _id: string;
    name: string;
    email: string;
  };
  senderType: "user" | "therapist" | "admin";
  message: string;
  timestamp: string;
  read: boolean;
  messageType: "live-chat" | "video-call-chat" | "default-chat";
  createdAt: string;
  updatedAt: string;
}

export interface ChatStats {
  totalMessages: number;
  unreadMessages: number;
  todayMessages: number;
  messagesByType: Array<{ _id: string; count: number }>;
  messagesBySender: Array<{ _id: string; count: number }>;
}

export interface ActiveChat {
  sessionId: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  userInfo: {
    _id: string;
    name: string;
    email: string;
  };
  sessionInfo: {
    date: string;
    time: string;
  };
}

// Admin Chat API Service
export const adminChatApi = {
  // Get all chat messages for admin view
  getChatMessages: async (
    params: {
      page?: number;
      limit?: number;
      messageType?: string;
      messageTypes?: string[];
      senderId?: string;
      sessionId?: string;
      sortBy?: string;
      sortOrder?: string;
    } = {}
  ) => {
    const response = await adminChatApiClient.get("/", { params });
    return response.data;
  },

  // Get chat messages for a specific user
  getUserChatMessages: async (userId: string, params = {}) => {
    const response = await adminChatApiClient.get(`/user/${userId}`, {
      params,
    });
    return response.data;
  },

  // Get support/private chat messages by chatRoom
  getSupportMessages: async (chatRoom: string) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    const response = await fetch(`${API_BASE_URL}/chat/support/${encodeURIComponent(chatRoom)}`, {
      headers: {
        Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get unread messages count
  getUnreadMessagesCount: async () => {
    const response = await adminChatApiClient.get("/unread-count");
    return response.data;
  },

  // Mark messages as read
  markMessagesAsRead: async (messageIds: string[]) => {
    const response = await adminChatApiClient.put("/mark-read", { messageIds });
    return response.data;
  },

  // Send admin reply
  sendAdminReply: async (data: {
    sessionId: string;
    message: string;
    messageType: string;
    replyTo?: string;
  }) => {
    const response = await adminChatApiClient.post("/reply", data);
    return response.data;
  },

  // Get active chats (chats with unread messages)
  getActiveChats: async () => {
    const response = await adminChatApiClient.get("/active-chats");
    return response.data;
  },

  // Get chat statistics
  getChatStats: async () => {
    const response = await adminChatApiClient.get("/stats");
    return response.data;
  },

  // Get admin online status
  getAdminOnlineStatus: async () => {
    const response = await adminChatApiClient.get("/admin-status");
    return response.data;
  },
};

export default adminChatApiClient;
