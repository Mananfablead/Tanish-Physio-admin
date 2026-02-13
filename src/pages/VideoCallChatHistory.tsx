import React, { useState, useEffect, useRef } from "react";
import useSocket from "@/hooks/useSocket";
import { adminChatApi } from "../lib/adminChatApi";

const VideoCallChatHistory = () => {
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
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
    messageTypes: ["video-call-chat", "live-chat"],
    page: 1,
    limit: 20,
  });

  const { socket, connected, on } = useSocket();
  const messagesEndRef = useRef(null);

  // Load initial data
  useEffect(() => {
    loadChats();
    loadStats();
  }, [filter]);

  const loadChats = async () => {
    try {
      setLoading(true);
      // Filter for both video call chat and live chat messages
      const response = await adminChatApi.getChatMessages({
        ...filter,
        messageTypes: ["video-call-chat", "live-chat"],
      });
      setChats(response.data.messages || []);
    } catch (error) {
      console.error("Error loading video call chats:", error);
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

  const loadChatMessages = async (chat: any) => {
    try {
      setLoading(true);
      setSelectedChat(chat);

      // In a real implementation, we would fetch messages for this specific chat
      // For now, we'll simulate with some mock data
      const mockMessages = [
        {
          _id: 1,
          content: "Good morning! Ready for our session?",
          senderId: "therapist123",
          senderName: "Dr. Smith",
          timestamp: new Date(Date.now() - 3600000),
          senderType: "therapist",
        },
        {
          _id: 2,
          content: "Yes, I'm ready. How do I start the exercises?",
          senderId: chat.senderId._id,
          senderName: chat.senderId.name,
          timestamp: new Date(Date.now() - 1800000),
          senderType: "user",
        },
        {
          _id: 3,
          content:
            "Let's start with the warm-up routine I showed you last time.",
          senderId: "therapist123",
          senderName: "Dr. Smith",
          timestamp: new Date(Date.now() - 600000),
          senderType: "therapist",
        },
      ];

      setMessages(mockMessages);
    } catch (error) {
      console.error("Error loading video call chat messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!newReply.trim() || !selectedChat) return;

    try {
      setLoading(true);

      // Send reply to the user (in video call context)
      await adminChatApi.sendAdminReply({
        sessionId: selectedChat.sessionId,
        message: newReply,
        messageType: "video-call-chat",
      });

      // Add the reply to the message list
      const replyMessage = {
        _id: Date.now(),
        content: newReply,
        senderId: "admin123", // This would be the actual admin ID
        senderName: "Admin",
        timestamp: new Date(),
        senderType: "admin",
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
          Video Call Chat History
        </h1>
        <div className="flex gap-6">
          {/* Chat List Panel */}
          <div className="w-1/3 bg-card rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-foreground">
                Video Call Chats
              </h2>
              <div className="mt-2 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Search chats..."
                  className="flex-1 border border-input rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
              {chats.length > 0 ? (
                chats.map((chat) => (
                  <div
                    key={chat._id}
                    className={`p-4 border-b cursor-pointer hover:bg-accent ${
                      selectedChat && selectedChat._id === chat._id
                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                        : ""
                    }`}
                    onClick={() => loadChatMessages(chat)}
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium text-foreground">
                        {chat.senderId.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          chat.senderType === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : chat.senderType === "therapist"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {chat.senderType}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.message}
                    </p>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{formatDate(chat.createdAt)}</span>
                      <span>
                        {chat.messageType === "live-chat"
                          ? "Live Chat"
                          : "Video Call"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  {loading
                    ? "Loading..."
                    : "No video call or live chat history"}
                </div>
              )}
            </div>
          </div>

          {/* Chat Conversation Panel */}
          <div className="flex-1 bg-card rounded-lg shadow flex flex-col">
            {selectedChat ? (
              <>
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold text-foreground">
                    {selectedChat.messageType === "live-chat"
                      ? "Live Chat"
                      : "Video Call Chat"}{" "}
                    with {selectedChat.senderId.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedChat.sessionId ? (
                      <>
                        Session: {selectedChat.sessionId.date} at{" "}
                        {selectedChat.sessionId.time} • Type:{" "}
                        {selectedChat.messageType === "live-chat"
                          ? "Live Chat"
                          : "Video Call"}
                      </>
                    ) : (
                      <>
                        Type:{" "}
                        {selectedChat.messageType === "live-chat"
                          ? "Live Chat"
                          : "Video Call"}
                      </>
                    )}
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
                              : msg.senderType === "therapist"
                              ? "bg-secondary text-secondary-foreground"
                              : msg.senderType === "user"
                              ? "bg-background text-foreground border"
                              : "bg-muted text-muted-foreground"
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
                      <p>No messages in this chat</p>
                    </div>
                  )}
                  <div
                    ref={messagesEndRef as React.RefObject<HTMLDivElement>}
                  />
                </div>

                {/* Reply Area */}
                <div className="border-t p-4">
                  <div className="flex items-end space-x-2">
                    <textarea
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type your reply (will be sent as admin message)..."
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
                      {loading ? "Sending..." : "Reply"}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Your reply will be sent as an admin message to the user
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
                  <h3 className="text-lg font-medium">Select a chat to view</h3>
                  <p className="mt-1">
                    Choose a video call or live chat conversation from the list
                    to view and reply
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
