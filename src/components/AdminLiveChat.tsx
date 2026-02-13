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
        setActiveUsers(userIds as unknown as Set<string>);
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
    <div className="flex flex-col h-full bg-white rounded-lg border shadow-sm">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Live Support Chat</h3>
            <div className="flex items-center space-x-2 mt-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  connected ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-sm text-gray-600">
                {connected ? "Connected" : "Disconnected"}
              </span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-600">
                {activeUsers.size} active users
              </span>
            </div>
          </div>
          <button
            onClick={loadInitialMessages}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
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
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.senderType === "admin"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800 border border-gray-200"
                }`}
              >
                {msg.senderType !== "admin" && (
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    {msg.senderName || msg.userName || "User"}
                  </p>
                )}
                <p className="text-sm">{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.senderType === "admin"
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </p>
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
