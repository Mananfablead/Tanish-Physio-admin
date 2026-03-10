import React, { useState, useEffect, useRef } from "react";
import useSocket from "@/hooks/useSocket";
import { adminChatApi } from "../lib/adminChatApi";
import { renderTextWithLinks } from "../utils/linkUtils";

interface ChatMessage {
  _id: string;
  messageId: string;
  sessionId: {
    _id: string;
    date: string;
    time: string;
    type: string;
  } | null;
  senderId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  senderType: "user" | "therapist" | "admin";
  message: string;
  read: boolean;
  messageType: "live-chat" | "video-call-chat" | "default-chat";
  replyTo: string | null;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface LiveChatSession {
  sessionId: string;
  sessionInfo: {
    _id: string;
    date: string;
    time: string;
    type: string;
    userId: {
      _id: string;
      name: string;
    };
    therapistId: {
      _id: string;
      name: string;
    };
    status: string;
  };
  userMessages: ChatMessage[];
  therapistMessages: ChatMessage[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

const VideoCallChatHistory = () => {
  const [chats, setChats] = useState<LiveChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<LiveChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newReply, setNewReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>({
    totalMessages: 0,
    unreadMessages: 0,
    todayMessages: 0,
    messagesByType: [],
    messagesBySender: [],
  });
  const [filter, setFilter] = useState({
    messageType: "live-chat",
    page: 1,
    limit: 50,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalMessages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const { socket, connected, on } = useSocket();
  const messagesEndRef = useRef(null);

  // Load initial data
  useEffect(() => {
    loadChatSessions();
    loadStats();
  }, [filter]);

  const loadChatSessions = async () => {
    try {
      setLoading(true);
      const response = await adminChatApi.getChatMessages(filter);
      
      // Group messages by session ID to create session objects
      const messages = response.data.messages || [];
      const sessionsMap = new Map<string, LiveChatSession>();
      
      messages.forEach((msg: ChatMessage) => {
        const sessionId = msg.sessionId ? msg.sessionId._id : "no-session-" + msg._id;
        if (!sessionsMap.has(sessionId)) {
          sessionsMap.set(sessionId, {
            sessionId: sessionId,
            sessionInfo: {
              _id: sessionId,
              date: msg.sessionId?.date || new Date().toISOString(),
              time: msg.sessionId?.time || new Date().toLocaleTimeString(),
              type: msg.sessionId?.type || "video-call",
              userId: { _id: "", name: "" }, // Will be populated from messages
              therapistId: { _id: "", name: "" }, // Will be populated from messages
              status: "completed"
            },
            userMessages: [],
            therapistMessages: [],
            lastMessage: msg.message,
            lastMessageTime: msg.createdAt,
            unreadCount: 0
          });
        }
        
        const session = sessionsMap.get(sessionId)!;
        
        // Capture actual user and therapist names from messages
        if (msg.senderType === "user" && !session.sessionInfo.userId.name) {
          session.sessionInfo.userId = {
            _id: msg.senderId._id,
            name: msg.senderId.name
          };
        } else if (msg.senderType === "therapist" && !session.sessionInfo.therapistId.name) {
          session.sessionInfo.therapistId = {
            _id: msg.senderId._id,
            name: msg.senderId.name
          };
        }
        
        if (msg.senderType === "user") {
          session.userMessages.push(msg);
        } else if (msg.senderType === "therapist") {
          session.therapistMessages.push(msg);
        }
        
        // Update last message if this is newer
        if (new Date(msg.createdAt) > new Date(session.lastMessageTime)) {
          session.lastMessage = msg.message;
          session.lastMessageTime = msg.createdAt;
        }
      });
      
      setChats(Array.from(sessionsMap.values()));
      setPagination(response.data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalMessages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      });
    } catch (error) {
      console.error("Error loading chat sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await adminChatApi.getChatStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadSessionMessages = async (session: LiveChatSession) => {
    try {
      setLoading(true);
      setSelectedSession(session);

      // Fetch actual messages for this session
      const response = await adminChatApi.getChatMessages({
        sessionId: session.sessionId,
        messageType: "live-chat",
        limit: 100,
      });
      
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error("Error loading session messages:", error);
      // Fallback to mock data if API fails
      const mockMessages: ChatMessage[] = [
        {
          _id: "1",
          messageId: "mock-1",
          sessionId: session.sessionId ? { _id: session.sessionId, date: "", time: "", type: "" } : null,
          message: "Hello! I need help with my appointment.",
          senderId: {
            _id: "user123",
            name: session.sessionInfo.userId.name || "Unknown User",
            email: "user@example.com",
            role: "patient"
          },
          senderType: "user",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          messageType: "live-chat",
          read: true,
          replyTo: null,
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
          __v: 0
        },
        {
          _id: "2",
          messageId: "mock-2",
          sessionId: session.sessionId ? { _id: session.sessionId, date: "", time: "", type: "" } : null,
          message: "Hi there! I'm here to help. What can I assist you with today?",
          senderId: {
            _id: "therapist123",
            name: session.sessionInfo.therapistId.name || "Unknown Therapist",
            email: "therapist@example.com",
            role: "therapist"
          },
          senderType: "therapist",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          messageType: "live-chat",
          read: true,
          replyTo: null,
          updatedAt: new Date(Date.now() - 1800000).toISOString(),
          __v: 0
        }
      ];

      setMessages(mockMessages);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!newReply.trim() || !selectedSession) return;

    try {
      setLoading(true);

      // Send reply to the user (in session context)
      await adminChatApi.sendAdminReply({
        sessionId: selectedSession.sessionId,
        message: newReply,
        messageType: "live-chat",
      });

      // Add the reply to the message list
      const replyMessage: ChatMessage = {
        _id: Date.now().toString(),
        messageId: "admin-reply-" + Date.now(),
        sessionId: selectedSession.sessionId ? { _id: selectedSession.sessionId, date: "", time: "", type: "" } : null,
        message: newReply,
        senderId: {
          _id: "admin123",
          name: "Admin",
          email: "admin@example.com",
          role: "admin"
        },
        senderType: "admin",
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        messageType: "live-chat",
        read: true,
        replyTo: null,
        updatedAt: new Date().toISOString(),
        __v: 0
      };

      setMessages((prev) => [...prev, replyMessage]);
      setNewReply("");
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-6">
          Live Chat History
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-foreground">
              Live Chat Messages
            </h3>
            <p className="text-2xl font-bold text-blue-600">
              {stats.messagesByType?.find(
                (item: any) => item._id === "live-chat"
              )?.count || 0}
            </p>
          </div>
          <div className="bg-card p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-foreground">
              Total Messages
            </h3>
            <p className="text-2xl font-bold text-purple-600">
              {stats.totalMessages || 0}
            </p>
          </div>
          <div className="bg-card p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-foreground">
              Today's Messages
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {stats.todayMessages || 0}
            </p>
          </div>
          <div className="bg-card p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-foreground">
              Unread Messages
            </h3>
            <p className="text-2xl font-bold text-orange-600">
              {stats.unreadMessages || 0}
            </p>
          </div>
        </div>

        {/* Pagination Info */}
        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {chats.length} of {pagination.totalMessages} messages
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter(prev => ({...prev, page: Math.max(1, prev.page - 1)}))}
              disabled={!pagination.hasPrevPage || loading}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setFilter(prev => ({...prev, page: Math.min(pagination.totalPages, prev.page + 1)}))}
              disabled={!pagination.hasNextPage || loading}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Chat List Panel */}
          <div className="w-full md:w-1/3 bg-card rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-foreground">
                Live Chats
              </h2>
              <div className="mt-2 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Search chats..."
                  className="flex-1 border border-input rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-[50vh] md:max-h-[calc(100vh-250px)]">
              {chats.length > 0 ? (
                chats.map((chat) => (
                  <div
                    key={chat.sessionId}
                    className={`p-4 border-b cursor-pointer hover:bg-accent ${
                      selectedSession && selectedSession.sessionId === chat.sessionId
                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                        : ""
                    }`}
                    onClick={() => loadSessionMessages(chat)}
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium text-foreground">
                        Session: {chat.sessionInfo.type || "Unknown Type"}
                      </h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        Video Call
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">👤 User:</span> {chat.sessionInfo.userId.name || "Unknown User"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">👨‍⚕️ Therapist:</span> {chat.sessionInfo.therapistId.name || "Unknown Therapist"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">📅 Date:</span> {chat.sessionInfo.date}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">⏰ Time:</span> {chat.sessionInfo.time}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      Last: {chat.lastMessage}
                    </p>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>{formatDate(chat.lastMessageTime)}</span>
                      <span>Messages: {chat.userMessages.length + chat.therapistMessages.length}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  {loading ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                      <p>Loading chats...</p>
                    </div>
                  ) : (
                    <div>
                      <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium">No live chats found</h3>
                      <p className="mt-1 text-muted-foreground">
                        There are no live chat sessions to display
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Chat Conversation Panel */}
          <div className="w-full md:flex-1 bg-card rounded-lg shadow flex flex-col">
            {selectedSession ? (
              <>
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold text-foreground">
                    💬 Session Chat: {selectedSession.sessionInfo.type || "Unknown Type"}
                  </h2>
                  <div className="text-sm text-muted-foreground mt-2 space-y-1">
                    <p><span className="font-medium">👤 User:</span> {selectedSession.sessionInfo.userId.name || "Unknown User"}</p>
                    <p><span className="font-medium">👨‍⚕️ Therapist:</span> {selectedSession.sessionInfo.therapistId.name || "Unknown Therapist"}</p>
                    <p><span className="font-medium">📅 Date:</span> {selectedSession.sessionInfo.date}</p>
                    <p><span className="font-medium">⏰ Time:</span> {selectedSession.sessionInfo.time}</p>
                  </div>
                </div>

                {/* Messages Area - WhatsApp-like display */}
                <div className="flex-1 overflow-y-auto p-4 bg-muted max-h-[50vh] md:max-h-[calc(100vh-300px)]">
                  {messages.length > 0 ? (
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div
                          key={msg._id}
                          className={`flex ${msg.senderType === "user" || msg.senderType === "therapist" ? "justify-start" : "justify-end"}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                              msg.senderType === "user"
                                ? "bg-white text-foreground border border-gray-200 rounded-bl-none"
                                : msg.senderType === "therapist"
                                ? "bg-green-100 text-foreground rounded-br-none"
                                : "bg-blue-500 text-white rounded-br-none"
                            } shadow-sm`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs font-medium ${
                                msg.senderType === "user" 
                                  ? "text-blue-600" 
                                  : msg.senderType === "therapist" 
                                  ? "text-green-700" 
                                  : "text-white"
                              }`}>
                                {msg.senderType === "user" 
                                  ? "👤 " + (msg.senderId.name || "User")
                                  : msg.senderType === "therapist" 
                                  ? "👨‍⚕️ " + (msg.senderId.name || "Therapist")
                                  : "🛡️ Admin"}
                              </span>
                              <span className={`text-xs ${
                                msg.senderType === "user" 
                                  ? "text-gray-500" 
                                  : msg.senderType === "therapist" 
                                  ? "text-green-600" 
                                  : "text-blue-100"
                              }`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="text-sm">{renderTextWithLinks(msg.message)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground mt-8">
                      <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium">No messages yet</h3>
                      <p className="mt-1 text-muted-foreground">
                        Start a conversation by sending a message
                      </p>
                    </div>
                  )}
                  <div
                    ref={messagesEndRef as React.RefObject<HTMLDivElement>}
                  />
                </div>

                {/* Reply Area */}
                <div className="border-t p-4">
                  <div className="flex flex-col md:flex-row items-end md:items-end space-x-0 md:space-x-2 gap-2">
                    <textarea
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type your reply (will be sent as admin message in live chat)..."
                      className="w-full flex-1 border border-input rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                      rows={2}
                      style={{ minHeight: "60px", maxHeight: "120px" }}
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={!newReply.trim() || loading}
                      className={`w-full md:w-auto px-4 py-2 rounded-lg ${
                        newReply.trim() && !loading
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      }`}
                    >
                      {loading ? "Sending..." : "Reply"}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Your reply will be sent as an admin message in the live chat
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto mb-4 text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium">
                    Select a live chat to view
                  </h3>
                  <p className="mt-1">
                    Choose a live chat conversation from the list to view and
                    reply
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallChatHistory;
