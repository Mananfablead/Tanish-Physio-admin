import React, { useState, useEffect, useRef } from "react";
import useSocket from "@/hooks/useSocket";
import { adminChatApi } from "@/lib/adminChatApi";

interface Message {
  _id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  senderType: "user" | "admin" | "therapist";
  userId?: string;
  userName?: string;
  sessionId?: string;
}

const AdminLiveChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<Set<string>>(new Set());

  const { socket, emit, on } = useSocket("admin-support-room", "support");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial messages
  useEffect(() => {
    loadInitialMessages();
  }, []);

  // Set up socket listeners for real-time messages
  useEffect(() => {
    if (!socket) return;

    const cleanupFunctions: (() => void)[] = [];

    // Listen for new support messages from users
    const cleanupNewMessage = on("admin-new-message", (data: any) => {
      console.log("Received new message for admin:", data);

      const newMsg: Message = {
        _id: data.message?._id || Date.now().toString(),
        content: data.content || data.message?.message || "",
        senderId: data.senderId || data.userId || "",
        senderName: data.senderName || data.userName || "User",
        timestamp:
          data.timestamp || data.message?.createdAt || new Date().toISOString(),
        senderType: data.senderType === "admin" ? "admin" : "user",
        userId: data.userId,
        userName: data.userName,
        sessionId: data.sessionId,
      };

      setMessages((prev) => [...prev, newMsg]);

      // Track active users
      if (data.userId) {
        setActiveUsers((prev) => new Set(prev).add(data.userId));
      }

      scrollToBottom();
    });

    // Listen for new support messages in admin room
    const cleanupSupportMessage = on("new-support-message", (data: any) => {
      console.log("Received support message:", data);

      const newMsg: Message = {
        _id: data.message?._id || Date.now().toString(),
        content: data.content || data.message?.message || "",
        senderId: data.senderId || data.userId || "",
        senderName: data.senderName || data.userName || "User",
        timestamp:
          data.timestamp || data.message?.createdAt || new Date().toISOString(),
        senderType: data.senderType === "admin" ? "admin" : "user",
        userId: data.userId,
        userName: data.userName,
        sessionId: data.sessionId,
      };

      setMessages((prev) => [...prev, newMsg]);
      scrollToBottom();
    });

    // Connection status
    const cleanupConnect = on("connect", () => {
      console.log("Admin socket connected");
      setConnected(true);
      // Join admin support room
      emit("join-room", { sessionId: "admin-support-room" });
    });

    const cleanupDisconnect = on("disconnect", () => {
      console.log("Admin socket disconnected");
      setConnected(false);
    });

    if (cleanupNewMessage) cleanupFunctions.push(cleanupNewMessage);
    if (cleanupSupportMessage) cleanupFunctions.push(cleanupSupportMessage);
    if (cleanupConnect) cleanupFunctions.push(cleanupConnect);
    if (cleanupDisconnect) cleanupFunctions.push(cleanupDisconnect);

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [socket, on, emit]);

  const loadInitialMessages = async () => {
    try {
      setIsLoading(true);
      // Load recent default-chat messages
      const response = await adminChatApi.getChatMessages({
        messageType: "default-chat",
        limit: 50,
        sortBy: "timestamp",
        sortOrder: "desc",
      });

      if (response.success && response.data?.messages) {
        const formattedMessages = response.data.messages
          .map((msg: any) => ({
            _id: msg._id,
            content: msg.message,
            senderId: msg.senderId._id,
            senderName: msg.senderId.name,
            timestamp: msg.createdAt,
            senderType: msg.senderType,
            userId: msg.senderId._id,
            userName: msg.senderId.name,
          }))
          .reverse(); // Reverse to show oldest first

        setMessages(formattedMessages);

        // Track active users from initial messages
        const userIds = new Set(
          response.data.messages.map((msg: any) => msg.senderId._id)
        );
        setActiveUsers(userIds);
      }
    } catch (error) {
      console.error("Error loading initial messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageToSend = newMessage.trim();
      setNewMessage("");

      // Add to UI immediately
      const tempMessage: Message = {
        _id: `temp_${Date.now()}`,
        content: messageToSend,
        senderId: "admin",
        senderName: "Admin",
        timestamp: new Date().toISOString(),
        senderType: "admin",
      };

      setMessages((prev) => [...prev, tempMessage]);

      // Send via API
      const response = await adminChatApi.sendAdminReply({
        sessionId: null, // For default chat
        message: messageToSend,
        messageType: "default-chat",
      });

      if (response.success) {
        // Replace temp message with actual message
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempMessage._id
              ? {
                  ...msg,
                  _id: response.data.message._id,
                  timestamp: response.data.message.createdAt,
                }
              : msg
          )
        );
      } else {
        // Remove temp message if failed
        setMessages((prev) =>
          prev.filter((msg) => msg._id !== tempMessage._id)
        );
        throw new Error(response.message);
      }

      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove temp message
      setMessages((prev) => prev.filter((msg) => !msg._id.startsWith("temp_")));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
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
              <div>
                <h3 className="font-bold text-xl text-gray-900">Live Support Chat</h3>
                <p className="text-sm text-gray-600">Manage customer conversations</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                connected 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${
                  connected ? "bg-green-500" : "bg-red-500"
                }`}></span>
                {connected ? "Connected" : "Disconnected"}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                {activeUsers.size} active users
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={loadInitialMessages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gradient-to-b from-gray-50 to-white">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No support messages yet</p>
            <p className="text-sm mt-1">Waiting for user messages...</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${
                msg.senderType === "admin" ? "justify-end" : "justify-start"
              } animate-slideIn`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-5 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                  msg.senderType === "admin"
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md"
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm"
                }`}
              >
                {msg.senderType !== "admin" && (
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs font-bold">
                        {msg.senderName?.charAt(0) || msg.userName?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-blue-600">
                        {msg.senderName || msg.userName || "User"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{msg.content}</p>
                {msg.senderType === "admin" && (
                  <p className="text-xs mt-2 text-blue-100 opacity-80">
                    {formatTime(msg.timestamp)}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-white rounded-b-lg">
        <div className="flex items-end space-x-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your reply to users..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            style={{ minHeight: "60px", maxHeight: "120px" }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !connected}
            className={`px-4 py-2 rounded-lg font-medium ${
              newMessage.trim() && connected
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Messages will be sent to all users in real-time
        </p>
      </div>
    </div>
  );
};

export default AdminLiveChat;
