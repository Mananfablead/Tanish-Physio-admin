import React, { useState, useEffect, useRef } from "react";
import useSocket from "@/hooks/useSocket";
import { adminChatApi } from "../lib/adminChatApi";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  _id: string | number;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string | Date;
  senderType: "user" | "admin" | "therapist";
}

interface ChatStats {
  totalMessages?: number;
  unreadMessages?: number;
  todayMessages?: number;
  messagesByType?: Array<{ _id: string; count: number }>;
  messagesBySender?: Array<{ _id: string; count: number }>;
}

interface ActiveChat {
  sessionId?: string;
  _id?: string;
  unreadCount?: number;
  lastMessage?: string;
  lastMessageTime?: string;
  userInfo?:
    | {
        _id?: string;
        name?: string;
        email?: string;
      }
    | Array<{
        _id?: string;
        name?: string;
        email?: string;
      }>;
  sessionInfo?:
    | {
        date?: string;
        time?: string;
      }
    | Array<{
        date?: string;
        time?: string;
      }>;
}

interface ChatMessage {
  _id: string;
  sessionId?: string;
  senderId:
    | {
        _id: string;
        name: string;
        email: string;
      }
    | string;
  senderType: "user" | "therapist" | "admin";
  message: string;
  timestamp: string;
  read: boolean;
  messageType: "live-chat" | "video-call-chat" | "default-chat";
  createdAt: string;
  updatedAt: string;
}

const LiveChatHistory = () => {
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newReply, setNewReply] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<ChatStats>({
    totalMessages: 0,
    unreadMessages: 0,
    todayMessages: 0,
    messagesByType: [],
    messagesBySender: [],
  } as ChatStats);
  const [activeChats, setActiveChats] = useState<ActiveChat[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [chatsError, setChatsError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [activeChatsError, setActiveChatsError] = useState<string | null>(null);
  
  // New state for filtering and search
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "unread" | "today">("all");
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "name">("latest");

  const { socket, connected, on } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper function to get user name from chat data
  const getUserName = (chat: any): string => {
    console.log("Chat data for name display:", chat);

    try {
      // Handle default chat messages (no session) - userId present
      if (chat.userId && chat.userInfo) {
        console.log("Processing default chat with userId:", chat.userId);
        if (typeof chat.userInfo === "object" && chat.userInfo !== null) {
          if ("name" in chat.userInfo && chat.userInfo.name) {
            console.log(
              "Found name in default chat userInfo:",
              chat.userInfo.name
            );
            return chat.userInfo.name;
          }
          if ("email" in chat.userInfo && chat.userInfo.email) {
            console.log(
              "Using email as fallback for default chat:",
              chat.userInfo.email
            );
            return chat.userInfo.email;
          }
        }
      }

      // Handle session-based chats
      if (chat.userInfo) {
        console.log("Processing session-based chat userInfo:", chat.userInfo);
        if (Array.isArray(chat.userInfo) && chat.userInfo[0]) {
          if (chat.userInfo[0].name) {
            console.log("Found name in array userInfo:", chat.userInfo[0].name);
            return chat.userInfo[0].name;
          }
          if (chat.userInfo[0].email) {
            console.log(
              "Using email from array userInfo:",
              chat.userInfo[0].email
            );
            return chat.userInfo[0].email;
          }
        } else if (
          typeof chat.userInfo === "object" &&
          chat.userInfo !== null
        ) {
          if ("name" in chat.userInfo && chat.userInfo.name) {
            console.log("Found name in object userInfo:", chat.userInfo.name);
            return chat.userInfo.name;
          }
          if ("email" in chat.userInfo && chat.userInfo.email) {
            console.log(
              "Using email from object userInfo:",
              chat.userInfo.email
            );
            return chat.userInfo.email;
          }
        }
      }

      // Try to get name from senderId if it's an object
      if (
        chat.senderId &&
        typeof chat.senderId === "object" &&
        chat.senderId.name
      ) {
        console.log("Using senderId name:", chat.senderId.name);
        return chat.senderId.name;
      }

      // Last resort - check if there's any name-like field
      if (chat.senderName) {
        console.log("Using senderName:", chat.senderName);
        return chat.senderName;
      }

      console.log("No user name found, using fallback");
      return "Unknown User";
    } catch (error) {
      console.error("Error extracting user name:", error);
      return "Unknown User";
    }
  };

  // Load initial data
  useEffect(() => {
    console.log("Admin LiveChatHistory loading initial data");
    loadChats();
    loadStats();
    loadActiveChats();
  }, []);

  // Set up socket listeners for real-time updates
  useEffect(() => {
    if (!socket || !connected) return;

    const cleanupFunctions = [];

    // Listen for new messages from users
    const cleanupNewMessage = on("admin-new-message", (data) => {
      // Refresh active chats to show new messages
      loadActiveChats();

      // If this chat is currently selected, update messages
      // Handle different possible session ID structures
      const currentSessionId =
        selectedChat?.sessionId ||
        selectedChat?._id ||
        selectedChat?.sessionId?._id;

      if (
        selectedChat &&
        currentSessionId?.toString() === data.sessionId?.toString()
      ) {
        setMessages((prev) => [
          ...prev,
          {
            _id: Date.now(),
            content: data.content,
            senderId: data.senderId,
            senderName: data.senderName,
            timestamp: data.timestamp || new Date(),
            senderType: data.senderType,
          },
        ]);
      }
    });

    // Clean up listeners on unmount
    if (cleanupNewMessage) cleanupFunctions.push(cleanupNewMessage);

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [socket, connected, on, selectedChat]);

  const loadChats = async () => {
    try {
      setLoading(true);
      setChatsError(null);
      console.log("Loading chats...");
      const response = await adminChatApi.getChatMessages({
        messageType: "live-chat",
        limit: 50,
      });
      console.log("Chats response:", response);
      setChats(response.data.messages || []);
    } catch (error: any) {
      console.error("Error loading chats:", error);
      setChatsError(error.message || "Failed to load chats");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setStatsError(null);
      const response = await adminChatApi.getChatStats();
      setStats(response.data);
    } catch (error: any) {
      console.error("Error loading stats:", error);
      setStatsError(error.message || "Failed to load stats");
    }
  };

  const loadActiveChats = async () => {
    try {
      console.log("Loading active chats...");
      const response = await adminChatApi.getActiveChats();

      console.log("API Response:", response);
      console.log("Active chats data:", response.data?.activeChats);

      const chatData = response.data?.activeChats || [];

      // Simple deduplication by userId
      const uniqueChats = chatData.filter(
        (chat, index, self) =>
          index ===
          self.findIndex(
            (c) =>
              c.userId?.toString() === chat.userId?.toString() ||
              c.sessionId?.toString() === chat.sessionId?.toString()
          )
      );

      console.log("Original count:", chatData.length);
      console.log("After deduplication:", uniqueChats.length);

      setActiveChats(uniqueChats);
      setActiveChatsError(null);
    } catch (error: any) {
      console.error("Error loading active chats:", error);
      setActiveChatsError(error.message || "Failed to load active chats");
      setActiveChats([]);
    }
  };

  const loadChatMessages = async (chat) => {
    try {
      console.log("Loading messages for chat:", chat);
      setLoading(true);
      setSelectedChat(chat);

      // Fetch actual messages for this user/chat
      let response;

      // Handle different data structures for chat identification
      const sessionId = chat.sessionId || chat._id || chat.sessionId?._id;
      const userId =
        chat.userInfo?._id ||
        (chat.userInfo &&
          Array.isArray(chat.userInfo) &&
          chat.userInfo[0]?._id) ||
        chat.senderId?._id ||
        (chat.senderId &&
          typeof chat.senderId === "object" &&
          chat.senderId._id);

      if (sessionId && sessionId !== "null") {
        // Check if sessionId is not null (as string or actual null)
        // For session-based chats
        console.log("Fetching session messages for:", sessionId);
        response = await adminChatApi.getChatMessages({
          sessionId: sessionId,
          limit: 50,
          sortBy: "timestamp",
          sortOrder: "asc",
        });
      } else {
        // For default chat (no session)
        console.log("Fetching default chat messages");
        response = await adminChatApi.getChatMessages({
          messageType: "default-chat",
          limit: 50,
          sortBy: "timestamp",
          sortOrder: "asc",
        });
      }

      console.log("API Response:", response);

      if (response?.success && response?.data?.messages) {
        // Format messages properly
        const formattedMessages = response.data.messages.map((msg) => ({
          _id: msg._id,
          content: msg.message,
          senderId: msg.senderId._id || msg.senderId,
          senderName: msg.senderId?.name || msg.senderId?.email || "User",
          timestamp: msg.createdAt || msg.timestamp,
          senderType: msg.senderType,
        }));

        console.log("Formatted messages:", formattedMessages);
        setMessages(formattedMessages);
      } else {
        console.log("No messages found, using fallback");
        // Fallback to mock data if API fails
        const mockMessages: Message[] = [
          {
            _id: 1,
            content: "Hello, I have a question about my therapy session.",
            senderId: userId || "unknown",
            senderName:
              chat.userInfo?.name ||
              (chat.userInfo &&
                Array.isArray(chat.userInfo) &&
                chat.userInfo[0]?.name) ||
              chat.senderId?.name ||
              (chat.senderId &&
                typeof chat.senderId === "object" &&
                chat.senderId.name) ||
              "User",
            timestamp: new Date(Date.now() - 3600000),
            senderType: "user" as "user" | "admin" | "therapist",
          },
          {
            _id: 2,
            content: "Sure, I can help with that. What would you like to know?",
            senderId: "admin123",
            senderName: "Admin",
            timestamp: new Date(Date.now() - 1800000),
            senderType: "admin" as "user" | "admin" | "therapist",
          },
        ];
        setMessages(mockMessages);
      }
    } catch (error) {
      console.error("Error loading chat messages:", error);
      // Show error message to user
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!newReply.trim() || !selectedChat) return;

    try {
      setLoading(true);

      // Send reply to the user - handle different possible session ID structures
      const sessionId =
        selectedChat.sessionId ||
        selectedChat._id ||
        selectedChat.sessionId?._id;

      // Determine messageType based on whether session exists
      const messageType = sessionId ? "live-chat" : "default-chat";

      await adminChatApi.sendAdminReply({
        sessionId: sessionId || null, // Send null for default chat
        message: newReply,
        messageType: messageType,
      });

      // Add the reply to the message list
      const replyMessage: Message = {
        _id: Date.now(),
        content: newReply,
        senderId: "admin123", // This would be the actual admin ID
        senderName: "Admin",
        timestamp: new Date(),
        senderType: "admin" as "user" | "admin" | "therapist",
      };

      setMessages((prev) => [...prev, replyMessage]);
      setNewReply("");

      // Refresh active chats
      loadActiveChats();
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  // Filter and sort chats
  const filteredAndSortedChats = React.useMemo(() => {
    let filtered = [...chats];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(chat => 
        getUserName(chat).toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply type filter
    if (filterType === "unread") {
      // Filter for unread messages (you'll need to implement this logic)
      filtered = filtered.filter(chat => chat.read === false);
    } else if (filterType === "today") {
      const today = new Date().toDateString();
      filtered = filtered.filter(chat => 
        new Date(chat.createdAt).toDateString() === today
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "name":
          return getUserName(a).localeCompare(getUserName(b));
        case "latest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
    return filtered;
  }, [chats, searchTerm, filterType, sortBy, getUserName]);

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Live Chat History
              </h1>
              <p className="text-muted-foreground">
                Manage and respond to customer support conversations
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-card p-2 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
                <span className="text-sm text-muted-foreground">
                  {connected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <button
                onClick={() => {
                  loadChats();
                  loadStats();
                  loadActiveChats();
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-800">Total Messages</h3>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {stats.totalMessages || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-xl border border-red-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-red-800">Unread</h3>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {stats.unreadMessages || 0}
                </p>
              </div>
              <div className="p-3 bg-red-500 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-green-800">Today's Messages</h3>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {stats.todayMessages || 0}
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-purple-800">Active Chats</h3>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {activeChats.length}
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex gap-6">
          {/* Enhanced Chat List Panel */}
          <div className="w-1/3 bg-card rounded-xl shadow-lg border border-border">
            {/* Enhanced Header with Search and Filters */}
            <div className="p-4 border-b bg-gradient-to-r from-card to-muted">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Chat Conversations
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {filteredAndSortedChats.length} chats
                  </span>
                </div>
              </div>
              
              {/* Search and Filter Controls */}
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search chats..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                <div className="flex space-x-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="flex-1 px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  >
                    <option value="all">All Chats</option>
                    <option value="unread">Unread</option>
                    <option value="today">Today</option>
                  </select>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="flex-1 px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  >
                    <option value="latest">Latest</option>
                    <option value="oldest">Oldest</option>
                    <option value="name">Name</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Chat List */}
            <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
              <AnimatePresence>
                {filteredAndSortedChats.length > 0 ? (
                  filteredAndSortedChats.map((chat, index) => (
                    <motion.div
                      key={typeof chat._id === "string" ? chat._id : JSON.stringify(chat)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 border-b cursor-pointer transition-all duration-200 ${
                        selectedChat &&
                        String(selectedChat.sessionId || selectedChat._id) ===
                          String(chat.sessionId || chat._id)
                          ? "bg-blue-50 border-l-4 border-l-blue-500 shadow-sm"
                          : "hover:bg-accent hover:shadow-sm"
                      }`}
                      onClick={async () => {
                        console.log("Loading chat messages for:", chat);
                        await loadChatMessages(chat);
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-foreground truncate flex-1">
                          {getUserName(chat)}
                        </h4>
                        <div className="flex items-center space-x-2 ml-2">
                          {chat.read === false && (
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          )}
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(chat.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mb-1">
                        {chat.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(chat.createdAt).toLocaleDateString()}
                        </span>
                        {chat.read === false && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                            Unread
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 text-center text-muted-foreground"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="font-medium">No chats found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Enhanced Chat Conversation Panel */}
          <div className="flex-1 bg-card rounded-xl shadow-lg border border-border flex flex-col overflow-hidden">
            {selectedChat ? (
              <>
                {/* Enhanced Chat Header */}
                <div className="p-4 border-b bg-gradient-to-r from-card to-muted">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground flex items-center">
                        <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        Chat with {getUserName(selectedChat)}
                      </h2>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-sm text-muted-foreground">
                          Session:{" "}
                          {(selectedChat.sessionInfo &&
                            typeof selectedChat.sessionInfo === "object" &&
                            selectedChat.sessionInfo.date) ||
                            (selectedChat.sessionInfo &&
                              Array.isArray(selectedChat.sessionInfo) &&
                              selectedChat.sessionInfo[0]?.date) ||
                            "N/A"}
                        </p>
                        <span className="text-muted-foreground">•</span>
                        <p className="text-sm text-muted-foreground">
                          {(selectedChat.sessionInfo &&
                            typeof selectedChat.sessionInfo === "object" &&
                            selectedChat.sessionInfo.time) ||
                            (selectedChat.sessionInfo &&
                              Array.isArray(selectedChat.sessionInfo) &&
                              selectedChat.sessionInfo[0]?.time) ||
                            "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => loadChatMessages(selectedChat)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                        title="Refresh conversation"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setSelectedChat(null)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                        title="Close conversation"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Enhanced Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-muted to-background max-h-[calc(100vh-350px)]">
                  <AnimatePresence>
                    {messages.length > 0 ? (
                      messages.map((msg, index) => (
                        <motion.div
                          key={msg._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex ${
                            msg.senderType === "admin"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                              msg.senderType === "admin"
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                                : "bg-white text-foreground border border-border rounded-bl-md"
                            }`}
                          >
                            {msg.senderType !== "admin" && (
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                {msg.senderName || "User"}
                              </p>
                            )}
                            <p className="text-sm">{msg.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                msg.senderType === "admin"
                                  ? "text-blue-100"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-muted-foreground mt-8"
                      >
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <h3 className="font-medium text-foreground">No messages yet</h3>
                        <p className="text-sm mt-1">Start the conversation by sending a message</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                {/* Enhanced Reply Area */}
                <div className="border-t bg-gradient-to-r from-card to-muted p-4">
                  <div className="flex items-end space-x-3">
                    <div className="flex-1 relative">
                      <textarea
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your reply..."
                        className="w-full border border-input rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 shadow-sm bg-background"
                        rows={2}
                        style={{ minHeight: "60px", maxHeight: "120px" }}
                      />
                      <div className="absolute right-3 bottom-3 flex items-center space-x-1">
                        <button
                          onClick={() => {}}
                          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                          title="Attach file"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {}}
                          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                          title="Emoji"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendReply}
                      disabled={!newReply.trim() || loading}
                      className={`px-5 py-3 rounded-xl font-medium shadow-md transition-all duration-200 ${
                        newReply.trim() && !loading
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/30"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Sending...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>Send</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </div>
                      )}
                    </motion.button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-muted-foreground max-w-md"
                >
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground">
                    Choose a chat from the list to view messages and respond to customers
                  </p>
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Tip:</span> Use the search and filter options to quickly find specific conversations
                    </p>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveChatHistory;
