import React, { useState, useEffect, useRef } from "react";
import { useAdminChatSocket } from "@/hooks/useSocket";
import { adminChatApi } from "../lib/adminChatApi";
import { renderTextWithLinks } from "../utils/linkUtils";
import axios from 'axios';

interface Attachment {
  type: string;
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
}

interface Message {
  _id: string | number;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string | Date;
  senderType: "user" | "admin" | "therapist";
  attachments?: Attachment[];
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
  attachments?: Attachment[];
}

const LiveChatHistory = () => {
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newReply, setNewReply] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stats, setStats] = useState<ChatStats>({
    totalMessages: 0,
    unreadMessages: 0,
    todayMessages: 0,
    messagesByType: [],
    messagesBySender: [],
  } as ChatStats);
  const [activeChats, setActiveChats] = useState<ActiveChat[]>([]);
  const [oneOnOneChats, setOneOnOneChats] = useState<ActiveChat[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [chatsError, setChatsError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [activeChatsError, setActiveChatsError] = useState<string | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  const { socket, connected, on, emit } = useAdminChatSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper function to get ONLY client/user name (filter out admin names)
  const getClientNameOnly = (chat: any): string => {
    try {
      // First priority: always use userInfo (the client in this 1-on-1 chat)
      if (chat.userInfo) {
        if (Array.isArray(chat.userInfo) && chat.userInfo[0]) {
          if (chat.userInfo[0].name) return chat.userInfo[0].name;
          if (chat.userInfo[0].email) return chat.userInfo[0].email;
        } else if (typeof chat.userInfo === "object" && chat.userInfo !== null) {
          if ("name" in chat.userInfo && chat.userInfo.name) return chat.userInfo.name;
          if ("email" in chat.userInfo && chat.userInfo.email) return chat.userInfo.email;
        }
      }
      // Fallback: use senderName only if it's not from admin
      if (chat.senderName && chat.senderType !== "admin") {
        return chat.senderName;
      }
      if (chat.userName && chat.senderType !== "admin") {
        return chat.userName;
      }
      return "Unknown User";
    } catch (error) {
      return "Unknown User";
    }
  };

  // Helper function to get user name from chat data
  const getUserName = (chat: any): string => {
    console.log("Chat data for name display:", chat);

    try {
      // First check for senderName (real-time socket messages)
      if (chat.senderName) {
        console.log("Using senderName:", chat.senderName);
        return chat.senderName;
      }

      // Check for userName (alternative field name)
      if (chat.userName) {
        console.log("Using userName:", chat.userName);
        return chat.userName;
      }

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
    if (!socket || !connected) {
      console.log("Socket not ready for listeners:", { socket: !!socket, connected });
      return;
    }

    console.log("Setting up socket listeners for LiveChatHistory");
    const cleanupFunctions = [];

    // Listen for real-time messages (message-received from socket emit)
    const cleanupMessageReceived = on("message-received", (data) => {
      console.log("Received message-received event in LiveChatHistory:", data);
      console.log("senderType value:", data.senderType, "Type:", typeof data.senderType);
      console.log("Attachments in message:", data.attachments);

      // Check if this message matches the currently selected chat
      if (selectedChat && data.chatRoom) {
        const chatRoom = selectedChat.sessionId || selectedChat._id;
        console.log("Checking if chatRoom matches - current:", chatRoom, "data.chatRoom:", data.chatRoom);

        if (chatRoom?.toString() === data.chatRoom?.toString()) {
          console.log("Adding message to current chat from message-received event");
          console.log("Message attachments being added:", data.attachments);

          // Check for duplicate before adding
          setMessages((prev) => {
            // Check if message already exists by _id or messageId
            const isDuplicate = prev.some(m =>
              m._id === data._id || m._id === (data.messageId)
            );

            if (isDuplicate) {
              console.log("Duplicate message detected, skipping");
              return prev;
            }

            // Determine correct senderType - check multiple possibilities
            let finalSenderType = data.senderType;
            if (!finalSenderType) {
              // If senderType is missing, try to infer from other fields
              if (data.senderId && typeof data.senderId === 'string' && data.senderId.includes('admin')) {
                finalSenderType = 'admin';
              } else {
                finalSenderType = 'user';
              }
            }
            console.log("Final senderType being set:", finalSenderType);

            return [
              ...prev,
              {
                _id: data._id || data.messageId || Date.now(),
                content: data.content || '',
                senderId: data.senderId,
                senderName: data.senderName || 'User',
                timestamp: data.timestamp || new Date().toISOString(),
                senderType: finalSenderType,
                attachments: data.attachments || [],
              },
            ];
          });

          // Scroll to bottom after adding message
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    });

    // Listen for new support messages (1-on-1 chats)
    const cleanupSupportMessage = on("new-support-message", (data) => {
      console.log("Received new support message in LiveChatHistory:", data);

      // If a message is in a support room, add it to oneOnOneChats if not already there
      if (data.chatRoom && data.chatRoom.startsWith('support-')) {
        setOneOnOneChats((prev) => {
          // Check if this user already exists in oneOnOneChats
          const existing = prev.find((c) => c.sessionId === data.chatRoom);
          if (existing) {
            // Update last message and time, but only update userInfo if it's from a user (not admin)
            return prev.map((c) =>
              c.sessionId === data.chatRoom
                ? {
                  ...c,
                  lastMessage: data.content || data.message?.message || '',
                  lastMessageTime: data.timestamp || new Date().toISOString(),
                  // Only update userInfo if message is from user, keep existing if from admin
                  userInfo: data.senderType === 'user' ? (data.userId ? { _id: data.userId, name: data.senderName || data.userName } : c.userInfo) : c.userInfo
                }
                : c
            );
          } else {
            // Add new user to oneOnOneChats - only add if message is from user
            if (data.senderType === 'user') {
              return [
                ...prev,
                {
                  sessionId: data.chatRoom,
                  _id: data.chatRoom,
                  lastMessage: data.content || data.message?.message || '',
                  lastMessageTime: data.timestamp || new Date().toISOString(),
                  userInfo: { _id: data.userId, name: data.senderName || data.userName || 'User' },
                  unreadCount: 1
                }
              ];
            }
            return prev;
          }
        });
      }

      // Skip adding to message list - let message-received listener handle it
      // This prevents duplicate messages
    });

    // Also listen for admin-new-message for backwards compatibility
    const cleanupNewMessage = on("admin-new-message", (data) => {
      console.log("Received admin-new-message in LiveChatHistory:", data);

      // Skip if this is a support room message - message-received already handled it
      if (data.chatRoom && data.chatRoom.startsWith('support-')) {
        console.log("Skipping admin-new-message for support room - message-received handles it");
        return;
      }

      // Refresh active chats to show new messages for non-support messages
      loadActiveChats();

      // If this chat is currently selected, update messages
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
            attachments: data.attachments || [],
          },
        ]);

        // Scroll to bottom after adding message
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    });

    // Clean up listeners on unmount
    if (cleanupMessageReceived) cleanupFunctions.push(cleanupMessageReceived);
    if (cleanupSupportMessage) cleanupFunctions.push(cleanupSupportMessage);
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

      // Fetch both default-chat (support rooms) and live-chat messages
      const [defaultResponse, liveResponse] = await Promise.all([
        adminChatApi.getChatMessages({
          messageType: "default-chat",
          limit: 50,
        }).catch(() => ({ data: { messages: [] } })),
        adminChatApi.getChatMessages({
          messageType: "live-chat",
          limit: 50,
        }).catch(() => ({ data: { messages: [] } }))
      ]);

      // Combine all messages
      const msgs = [
        ...(defaultResponse.data?.messages || []),
        ...(liveResponse.data?.messages || [])
      ];

      console.log("Chats response:", { defaultResponse, liveResponse });
      setChats(msgs);

      // Build 1-on-1 chats (support rooms) by grouping messages with `chatRoom` or by senderId for non-session chats
      try {
        const groups = new Map();
        const userInfoMap = new Map(); // Store user info separately to get client data

        msgs.forEach((m: any) => {
          // For support rooms: use chatRoom if present
          // For default chat: group by userId
          let key = null;

          if (m.chatRoom && m.chatRoom.startsWith('support-')) {
            key = m.chatRoom;
          } else if (!m.sessionId || m.sessionId === null || m.messageType === 'default-chat') {
            // Group default-chat messages by senderId
            key = `user-${m.senderId?._id || m.senderId}`;
          }

          if (!key) return;

          // For support rooms, store client user info only (senderType === "user")
          if (m.chatRoom && m.chatRoom.startsWith('support-') && m.senderType === 'user' && m.senderId) {
            userInfoMap.set(key, m.senderId);
          }

          const existing = groups.get(key) || { key, lastMessage: null, lastMessageTime: null, userInfo: null, unreadCount: 0 };
          // pick latest message
          const created = new Date(m.createdAt || m.timestamp || Date.now());
          if (!existing.lastMessageTime || created > new Date(existing.lastMessageTime)) {
            existing.lastMessage = m.message || m.content || '';
            existing.lastMessageTime = created.toISOString();
          }
          groups.set(key, existing);
        });

        const oneOnOne = Array.from(groups.values()).map((g: any) => ({
          sessionId: g.key,
          _id: g.key,
          unreadCount: g.unreadCount || 0,
          lastMessage: g.lastMessage,
          lastMessageTime: g.lastMessageTime,
          userInfo: userInfoMap.get(g.key) || g.userInfo,
        }));

        console.log("Built 1-on-1 chats:", oneOnOne);
        setOneOnOneChats(oneOnOne);
      } catch (e) {
        console.error('Error building 1-on-1 chats:', e);
        setOneOnOneChats([]);
      }
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

      // If this chat is a support/chatRoom entry (our one-on-one key), use support route
      const chatRoom = chat.chatRoom || chat.sessionId || chat._id;
      const isSupportRoom = typeof chatRoom === 'string' && chatRoom.startsWith('support-');

      // Join the room via socket so we can send/receive messages
      if (socket && connected) {
        console.log('Joining room via socket:', chatRoom);
        emit('join-room', { sessionId: chatRoom });
        setCurrentRoomId(chatRoom);
      }

      if (isSupportRoom) {
        console.log('Fetching support-room messages for:', chatRoom);
        response = await adminChatApi.getSupportMessages(chatRoom);
      } else {
        // Handle different data structures for chat identification
        const sessionId = chat.sessionId || chat._id || chat.sessionId?._id;

        if (sessionId && sessionId !== 'null') {
          // For session-based chats
          console.log('Fetching session messages for:', sessionId);
          response = await adminChatApi.getChatMessages({
            sessionId: sessionId,
            limit: 50,
            sortBy: 'timestamp',
            sortOrder: 'asc',
          });
        } else {
          // For default chat (no session)
          console.log('Fetching default chat messages');
          response = await adminChatApi.getChatMessages({
            messageType: 'default-chat',
            limit: 50,
            sortBy: 'timestamp',
            sortOrder: 'asc',
          });
        }
      }

      console.log('API Response:', response);

      if (response?.success && response?.data?.messages) {
        // Format messages properly
        const formattedMessages = response.data.messages.map((msg) => ({
          _id: msg._id,
          content: msg.message,
          senderId: msg.senderId._id || msg.senderId,
          senderName: msg.senderId?.name || msg.senderId?.email || 'User',
          timestamp: msg.createdAt || msg.timestamp,
          senderType: msg.senderType,
          attachments: msg.attachments || [],
        }));

        console.log('Formatted messages:', formattedMessages);
        setMessages(formattedMessages);
      } else {
        console.log('No messages found, using fallback');
        // Fallback to mock data if API fails
        const mockMessages: Message[] = [
          {
            _id: 1,
            content: "Hello, I have a question about my therapy session.",
            senderId: "unknown",
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
      const messageToSend = newReply.trim();

      // Send reply to the user - handle different possible session ID structures
      const sessionId =
        selectedChat.sessionId ||
        selectedChat._id ||
        selectedChat.sessionId?._id;

      // Check if this is a support room
      const isSupportRoom = typeof sessionId === 'string' && sessionId.startsWith('support-');

      setNewReply("");

      if (isSupportRoom && socket && connected && currentRoomId) {
        // For support rooms, send via socket
        const messageId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });

        console.log('Sending message via socket to support room:', currentRoomId);

        emit('send-message', {
          roomId: currentRoomId,
          roomType: 'individual',
          message: {
            content: messageToSend,
            messageId
          }
        });
      } else {
        // For regular sessions, use REST API
        const messageType = sessionId ? "live-chat" : "default-chat";

        const response = await adminChatApi.sendAdminReply({
          sessionId: sessionId || null,
          message: messageToSend,
          messageType: messageType,
        });

        if (!response.success) {
          throw new Error(response.message || 'Failed to send message');
        }
      }

      // Refresh active chats
      loadActiveChats();
    } catch (error) {
      console.error("Error sending reply:", error);
      // Remove the temporary message on error
      setMessages((prev) => prev.slice(0, -1));
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

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const validFiles = Array.from(files).filter(file =>
        file.type.startsWith('image/') || file.type.startsWith('video/')
      );

      if (validFiles.length !== files.length) {
        alert('Only image and video files are allowed!');
      }

      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  // Remove selected file
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload files to server
  const uploadFiles = async (files: File[]) => {
    const uploadedAttachments = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const token = localStorage.getItem("admin_token");
        const response = await axios.post('/api/chat/upload-file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          uploadedAttachments.push(response.data.data.file);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }

    return uploadedAttachments;
  };

  // Handle send reply with files
  const handleSendReplyWithFiles = async () => {
    if ((!newReply.trim() && selectedFiles.length === 0) || !selectedChat) return;

    try {
      setUploading(true);

      // Upload files first
      let attachments = [];
      if (selectedFiles.length > 0) {
        attachments = await uploadFiles(selectedFiles);
      }

      // Send reply to the user - handle different possible session ID structures
      const sessionId =
        selectedChat.sessionId ||
        selectedChat._id ||
        selectedChat.sessionId?._id;

      // Check if this is a support room
      const isSupportRoom = typeof sessionId === 'string' && sessionId.startsWith('support-');

      setNewReply("");
      setSelectedFiles([]);

      if (isSupportRoom && socket && connected && currentRoomId) {
        // For support rooms, send via socket
        const messageId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });

        console.log('Sending message via socket to support room:', currentRoomId);

        emit('send-message', {
          roomId: currentRoomId,
          roomType: 'individual',
          message: {
            content: newReply.trim(),
            messageId,
            attachments
          }
        });
      } else {
        // For regular sessions, use REST API
        const messageType = sessionId ? "live-chat" : "default-chat";

        const response = await adminChatApi.sendAdminReply({
          sessionId: sessionId || null,
          message: newReply.trim(),
          messageType: messageType,
        });

        if (!response.success) {
          throw new Error(response.message || 'Failed to send message');
        }
      }

      // Refresh active chats
      loadActiveChats();
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setUploading(false);
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
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
        </div> */}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Chat List Panel */}
          <div className="w-full md:w-1/3 bg-card rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-foreground">
                1-on-1 Chats
              </h2>
            </div>
            <div className="overflow-y-auto max-h-[50vh] md:max-h-[calc(100vh-250px)]">
              {oneOnOneChats.length > 0 ? (
                oneOnOneChats.map((chat) => (
                  <div
                    key={chat.sessionId || JSON.stringify(chat)}
                    className={`p-4 border-b cursor-pointer hover:bg-accent ${selectedChat &&
                        String(selectedChat.sessionId || selectedChat._id) ===
                        String(chat.sessionId || chat._id)
                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                        : ""
                      }`}
                    onClick={() => loadChatMessages(chat)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">
                          {getClientNameOnly(chat)}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {chat.lastMessage || "No messages yet"}
                        </p>
                      </div>
                      {chat.unreadCount > 0 && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full ml-2">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleString() : "—"}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  <p>No 1-on-1 chats yet</p>
                  <p className="text-xs mt-1">Messages from users will appear here</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Conversation Panel */}
          <div className="w-full md:flex-1 bg-card rounded-lg shadow flex flex-col">
            {selectedChat ? (
              <>
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold text-foreground">
                    Chat with {getClientNameOnly(selectedChat)}
                  </h2>
                  {/* <p className="text-sm text-muted-foreground">
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
                  </p> */}
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted max-h-[50vh] md:max-h-[calc(100vh-300px)] flex flex-col">
                  {messages.length > 0 ? (
                    messages.map((msg) => {
                      const isAdmin = msg.senderType !== "user";

                      return (
                        <div
                          key={msg._id}
                          className={`flex w-full ${isAdmin ? "justify-end" : "justify-start"
                            }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg flex flex-col ${isAdmin
                                ? "bg-blue-500 text-white rounded-br-none"
                                : "bg-gray-100 text-black border rounded-bl-none"
                              }`}
                          >
                            {msg.senderType !== "admin" && msg.senderName && (
                              <p className="text-xs font-semibold mb-1">
                                {msg.senderName}
                              </p>
                            )}
                            <p className="text-sm">{renderTextWithLinks(msg.content)}</p>
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {msg.attachments.map((attachment, index) => (
                                  <div key={index} className="relative">
                                    {attachment.type === 'image' ? (
                                      <img
                                        src={attachment.url}
                                        alt={attachment.originalName}
                                        className="max-w-full h-auto rounded-lg cursor-pointer max-h-48"
                                        onClick={() => window.open(attachment.url, '_blank')}
                                      />
                                    ) : attachment.type === 'video' ? (
                                      <div className="flex flex-col">
                                        <video
                                          src={attachment.url}
                                          controls
                                          className="max-w-full max-h-64 rounded-lg"
                                        >
                                          Your browser does not support the video tag.
                                        </video>
                                        <div className="mt-1 text-xs text-muted-foreground">
                                          {attachment.originalName} ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <div>
                                          <p className="text-sm font-medium text-gray-800">{attachment.originalName}</p>
                                          <p className="text-xs text-gray-500">
                                            {(attachment.size / 1024 / 1024).toFixed(2)} MB
                                          </p>
                                        </div>
                                        <button
                                          onClick={() => window.open(attachment.url, '_blank')}
                                          className="ml-auto text-blue-500 hover:text-blue-700"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                          </svg>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            <p
                              className={`text-xs mt-1 ${msg.senderType === "admin"
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
                      )
                    })
                  ) : (
                    <div className="text-center text-muted-foreground mt-8">
                      <p>No messages yet</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Area */}
                <div className="border-t p-4">
                  {/* Selected files preview */}
                  {selectedFiles.length > 0 && (
                    <div className="mb-2 p-2 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Selected files:</span>
                        <button
                          onClick={() => setSelectedFiles([])}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center bg-white px-2 py-1 rounded border text-xs">
                            <span className="truncate max-w-[120px]">{file.name}</span>
                            <button
                              onClick={() => removeFile(index)}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-end space-x-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"
                      title="Upload files"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </button>
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
                      onClick={handleSendReplyWithFiles}
                      disabled={(!newReply.trim() && selectedFiles.length === 0) || loading || uploading}
                      className={`px-4 py-2 rounded-lg ${(newReply.trim() || selectedFiles.length > 0) && !loading && !uploading
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                        }`}
                    >
                      {uploading ? "Uploading..." : loading ? "Sending..." : "Send"}
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
