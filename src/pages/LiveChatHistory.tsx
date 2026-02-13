import React, { useState, useEffect, useRef } from "react";
import useSocket from "@/hooks/useSocket";
import { adminChatApi } from "../lib/adminChatApi";

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

  return (
    <div className=" bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            Live Chat History
          </h1>
          <button
            onClick={() => {
              loadChats();
              loadStats();
              loadActiveChats();
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-foreground">
              Total Messages
            </h3>
            <p className="text-2xl font-bold text-blue-600">
              {stats.totalMessages || 0}
            </p>
          </div>
          <div className="bg-card p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-foreground">Unread</h3>
            <p className="text-2xl font-bold text-red-600">
              {stats.unreadMessages || 0}
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
              Active Chats
            </h3>
            <p className="text-2xl font-bold text-purple-600">
              {activeChats.length}
            </p>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Chat List Panel */}
          <div className="w-1/3 bg-card rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-foreground">
                Active Chats
              </h2>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
              {activeChats.length > 0 ? (
                activeChats.map((chat) => (
                  <div
                    key={chat.sessionId || JSON.stringify(chat)}
                    className={`p-4 border-b cursor-pointer hover:bg-accent ${
                      selectedChat &&
                      selectedChat.sessionId?.toString() ===
                        chat.sessionId?.toString()
                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                        : ""
                    }`}
                    onClick={() => loadChatMessages(chat)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-foreground">
                          {getUserName(chat)}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {chat.lastMessage}
                        </p>
                      </div>
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        {chat.unreadCount} new
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(chat.lastMessageTime).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No active chats
                </div>
              )}

              <div className="p-4 border-t">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  All Chats
                </h3>
                {chats.length > 0 ? (
                  chats.map((chat) => (
                    <div
                      key={
                        typeof chat._id === "string"
                          ? chat._id
                          : JSON.stringify(chat)
                      }
                      className={`p-3 border-b cursor-pointer hover:bg-accent ${
                        selectedChat &&
                        String(selectedChat.sessionId || selectedChat._id) ===
                          String(chat.sessionId || chat._id)
                          ? "bg-blue-50"
                          : ""
                      }`}
                      onClick={async () => {
                        // Load actual messages for this chat
                        await loadChatMessages(chat);
                      }}
                    >
                      <h4 className="font-medium text-foreground">
                        {getUserName(chat)}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(chat.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No chat history
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat Conversation Panel */}
          <div className="flex-1 bg-card rounded-lg shadow flex flex-col">
            {selectedChat ? (
              <>
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold text-foreground">
                    Chat with {getUserName(selectedChat)}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Session:{" "}
                    {(selectedChat.sessionInfo &&
                      typeof selectedChat.sessionInfo === "object" &&
                      selectedChat.sessionInfo.date) ||
                      (selectedChat.sessionInfo &&
                        Array.isArray(selectedChat.sessionInfo) &&
                        selectedChat.sessionInfo[0]?.date) ||
                      "N/A"}{" "}
                    at{" "}
                    {(selectedChat.sessionInfo &&
                      typeof selectedChat.sessionInfo === "object" &&
                      selectedChat.sessionInfo.time) ||
                      (selectedChat.sessionInfo &&
                        Array.isArray(selectedChat.sessionInfo) &&
                        selectedChat.sessionInfo[0]?.time) ||
                      "N/A"}
                  </p>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted max-h-[calc(100vh-300px)]">
                  {messages.length > 0 ? (
                    messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex ${
                          msg.senderType === "admin"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.senderType === "admin"
                              ? "bg-primary text-primary-foreground"
                              : msg.senderType === "user"
                              ? "bg-background text-foreground border"
                              : "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.senderType === "admin"
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground mt-8">
                      <p>No messages yet</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Area */}
                <div className="border-t p-4">
                  <div className="flex items-end space-x-2">
                    <textarea
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your reply..."
                      className="flex-1 border border-input rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                      rows={2}
                      style={{ minHeight: "60px", maxHeight: "120px" }}
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={!newReply.trim() || loading}
                      className={`px-4 py-2 rounded-lg ${
                        newReply.trim() && !loading
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      }`}
                    >
                      {loading ? "Sending..." : "Send"}
                    </button>
                  </div>
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
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium">Select a chat to view</h3>
                  <p className="mt-1">
                    Choose a conversation from the list to view and reply
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

export default LiveChatHistory;
