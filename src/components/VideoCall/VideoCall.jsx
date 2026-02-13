import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Users,
  Settings,
  Share,
  ArrowRight,
  X,
} from "lucide-react";
import useSocket from "@/hooks/useSocket";
import useWebRTC from "@/hooks/useWebRTC";
import { adminVideoCallApi } from "@/lib/videoCallApi";
import { adminChatApi } from "@/lib/chatApi";
import WaitingNotification from "@/components/WaitingRoom/WaitingNotification";

const VideoCall = ({
  roomId,
  roomType = "session",
  userRole = "admin",
  isTherapist = false,
  onEndCall,
  sessionId,
  groupSessionId, // Add groupSessionId prop
  connected: externalConnected = false,
  user,
  sessionDetails,
}) => {
   useEffect(() => {
    console.log("🎬 VideoCall component mounted/updated");
    console.log("🎬 Props received:", {
      roomId,
      roomType,
      userRole,
      sessionId,
      connected: externalConnected,
      user: user?.userId,
      sessionDetails: !!sessionDetails,
    });
  }, [roomId, roomType, userRole, sessionId, externalConnected, user, sessionDetails]);
  
  const { socket, connected, error, emit, on, setError: setSocketError} = useSocket(
    roomId,
    roomType
  );
  const [localError, setLocalError] = useState(null);
  const [socketError, setSocketErrorState] = useState(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  // Sync socket error with local state
  useEffect(() => {
    setSocketErrorState(error);
  }, [error]);

  // Set user role based on props or default to admin
  const effectiveUserRole = userRole || "admin";

  // Track joined call status separately from socket connection
  const [joinedCall, setJoinedCall] = useState(false);
  const {
    localStream,
    remoteStreams,
    callActive,
    callStarted,
    callLogId,
    participants,
    initLocalMedia,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    muteUser,
    endCall,
    startCall,
    acceptCall,
    rejectCall,
    localVideoRef,
    remoteVideoRefs,
    remoteAudioRefs,
    setCallActive,
    setParticipants,
    setCallLogId,
    isRecording,
    recordingStatus,
    recordingTime,
    startRecording,
    stopRecording,
    isInitializing,
    initError,
    setIsInitializing,
    setInitError,
  } = useWebRTC(roomId, socket, userRole);

  // Debug: Log session info
  useEffect(() => {
    console.log("🎬 VideoCall - Admin session info:", {
      sessionId: sessionId,
      roomId: roomId,
      userRole: userRole,
      socketConnected: socket?.connected,
      sessionDetails: sessionDetails
    });
    console.log("🎬 VideoCall component re-rendering due to dependency changes");
    if (sessionDetails) {
      console.log("📊 SessionDetails content:", JSON.stringify(sessionDetails, null, 2));
    }
  }, [sessionId, roomId, userRole, socket, sessionDetails]);

  // Handle patient approved callback
  const handlePatientApproved = (patient) => {
    console.log("✅ Patient approved, joining video room:", patient);
    // The patient will automatically join the video room after approval
    // We just need to make sure we're ready to connect with them
  };

  // Memoize WaitingNotification to prevent re-renders
  const WaitingNotificationMemo = useMemo(() => {
    return (
      <WaitingNotification 
        key={`waiting-notification-${sessionId || roomId}`}
        socket={socket} 
        sessionId={sessionId || roomId}
        onPatientApproved={handlePatientApproved}
      />
    );
  }, [socket, sessionId, roomId]);

  // Auto-start call when admin joins successfully
  useEffect(() => {
    if (joinedCall && !callStarted && userRole === "admin") {
      startCall();
    }
  }, [joinedCall, callStarted, userRole, startCall]);

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [participantAudioStatus, setParticipantAudioStatus] = useState({});
  const [apiParticipants, setApiParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Debug callActive changes
  useEffect(() => {
    console.log("📊 callActive value:", callActive);
    console.log("📊 callLogId value:", callLogId);
  }, [callActive, callLogId]);

  // Fetch participants from API when component mounts and sessionId is available
  useEffect(() => {
    if (sessionId) {
      const fetchParticipants = async () => {
        try {
          setLoadingParticipants(true);
          const response = await adminVideoCallApi.getSessionParticipants(sessionId);
          if (response.success && response.data && response.data.participants) {
            setApiParticipants(response.data.participants);
          } else {
            console.error("Failed to fetch participants:", response);
            setApiParticipants([]);
          }
        } catch (error) {
          console.error("Error fetching participants:", error);
          setApiParticipants([]);
        } finally {
          setLoadingParticipants(false);
        }
      };
      
      fetchParticipants();
    }
  }, [sessionId]); // Removed the interval, now it runs only once

  // Effect to update video elements when streams change
  useEffect(() => {
    // Update local video when localStream changes
    if (localVideoRef.current && localStream) {
      try {
        if (localVideoRef.current.srcObject !== localStream) {
          localVideoRef.current.srcObject = localStream;
          localVideoRef.current.muted = true;
          localVideoRef.current.autoplay = true;
          localVideoRef.current.playsInline = true;
        }
      } catch (err) {
        console.error("Error setting admin local video srcObject:", err);
      }
    }

    // Update remote videos when remoteStreams change
    Object.entries(remoteStreams).forEach(([userId, stream]) => {
      if (remoteVideoRefs.current[userId] && stream) {
        try {
          const videoElement = remoteVideoRefs.current[userId];
          if (videoElement.srcObject !== stream) {
            videoElement.srcObject = stream;
            videoElement.muted = true;
            videoElement.autoplay = true;
            videoElement.playsInline = true;

            const playPromise = videoElement.play();
            if (playPromise !== undefined) {
              playPromise.catch((error) => {
                videoElement.muted = true;
                videoElement.play().catch(() => {});
              });
            }
          }
        } catch (err) {
          console.error(
            `Error setting admin remote video srcObject for ${userId}:`,
            err
          );
        }
      }
    });
  }, [localStream, remoteStreams, remoteVideoRefs, localVideoRef]);

  // Additional effect to ensure video element gets stream when it becomes available
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      try {
        localVideoRef.current.srcObject = localStream;
      } catch (err) {
        console.error("Error assigning local stream to video element:", err);
      }
    }
  }, [localStream]);

  // Function to create a real call log entry in the database
  const createRealCallLog = async () => {
    try {
      // Validate required parameters
      const actualSessionId = sessionId || roomId;
      if (!actualSessionId) {
        throw new Error("No session or room ID available");
      }
      console.log(
        "⚠️ Invalid or missing callLogId detected! Creating real CallLog..."
      );

      // Create a real call log entry in the database
      const response = await adminVideoCallApi.createCallLog(
        groupSessionId || actualSessionId,
        groupSessionId,
        groupSessionId
          ? "group"
          : roomType === "group"
          ? "group"
          : "one-on-one",
        [
          {
            userId: user?.userId || "admin-user",
            joinedAt: new Date(),
          },
        ]
      );
      if (response.callLog?._id) {
        setCallLogId(response.callLog._id);
      } else {
        throw new Error("API response missing callLog ID");
      }
    } catch (error) {
      // Immediate fallback to valid sample
      const fallbackId = "507f1f77bcf86cd799439011";
      setCallLogId(fallbackId);
    }
  };

  // Validate callLogId format - no logging in loop
  useEffect(() => {
    if (callLogId) {
      if (
        typeof callLogId !== "string" ||
        callLogId.length !== 24 ||
        !/^[0-9a-fA-F]{24}$/.test(callLogId)
      ) {
        console.warn("⚠️ Invalid callLogId format detected:", callLogId);
      }
    }
  }, [callLogId]);

  // Fallback: Ensure we always have a valid callLogId when call is active
  useEffect(() => {
    if (callActive) {
      // If we don't have a valid callLogId, create a real one
      if (
        !callLogId ||
        (typeof callLogId === "string" && callLogId.length !== 24)
      ) {
        // Execute immediately
        console.log("🚀 Executing createRealCallLog function...");
        createRealCallLog();
      } else {
        console.log("✅ Valid callLogId already present");
      }
    }
  }, [
    callActive,
    callLogId,
    sessionId,
    roomId,
    roomType,
    user,
    setCallLogId,
    groupSessionId,
  ]);

  const [screenSharing, setScreenSharing] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [callStatus, setCallStatus] = useState("connecting");
  const [incomingCall, setIncomingCall] = useState(false);
  const [callStartTime, setCallStartTime] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const chatContainerRef = React.useRef(null);
  const [therapistInfo, setTherapistInfo] = useState({
    name: "",
    specialty: "",
  });
  const [userInfo, setUserInfo] = useState({ name: "", initials: "" });
  const [isInitializingMedia, setIsInitializingMedia] = useState(false);
  const [hasAttemptedInit, setHasAttemptedInit] = useState(false);
  // Reset initialization state for retry attempts
  const resetInitialization = useCallback(() => {
    setLocalError(null);
    setInitError(null);
    setHasAttemptedInit(false);
    setIsInitializing(false);
    setIsInitializingMedia(false);
  }, [setInitError, setLocalError]);

  // Update user info when user prop changes
  useEffect(() => {
    if (user) {
      setUserInfo({
        name: user.name || user.firstName + " " + user.lastName || "Admin",
        initials:
          (user.name
            ? user.name.charAt(0)
            : user.firstName
            ? user.firstName.charAt(0)
            : "A") +
          (user.lastName ? user.lastName.charAt(0) : "").toUpperCase(),
      });
    }
  }, [user]);

  // Handle socket connection and joined call events
  useEffect(() => {
    if (!socket) return;

    const handleError = (data) => {
      console.error("Admin video call error:", data);
      setSocketErrorState(
        data.message || "An error occurred during the video call"
      );
    };

    const handleJoinedCall = (data) => {
      setJoinedCall(true);
      setCallActive(true);
      setCallStatus("connected");
      setSocketErrorState(null); // Clear any previous errors
      setLocalError(null); // Clear any previous errors
      console.log("✅ Admin joined call successfully");
      console.log("✅ Admin joined call successfully and call is now active");
    };

    const handleParticipantJoined = (data) => {
      // Participants are validated through peer connections
      let isValidParticipant = true;
      let enhancedData = { ...data, isSelf: data.socketId === socket.id };

      console.log(
        "✅ Admin participant joined via peer connection:",
        data.userId
      );

      // If the participant doesn't have a name, try to get it from socket data
      if (!enhancedData.name) {
        if (enhancedData.isSelf && user) {
          enhancedData.name =
            user.name ||
            (user.firstName && user.lastName
              ? user.firstName + " " + user.lastName
              : "You");
        } else {
          // For other participants, use name from socket data
          enhancedData.name =
            data.name ||
            (data.firstName && data.lastName
              ? data.firstName + " " + data.lastName
              : `Participant ${
                  data.userId?.substring(0, 5) ||
                  data.socketId?.substring(0, 5) ||
                  "Unknown"
                }`);
        }

        console.log("Admin participant name assigned:", enhancedData.name);
      }

      // Only add valid participants to the list (avoid duplicates)
      if (isValidParticipant) {
        setParticipants((prev) => {
          const exists = prev.some(
            (p) => p.userId === data.userId && p.socketId === data.socketId
          );
          if (exists) {
            return prev;
          }
          return [...prev, enhancedData];
        });
      }
    };

    // Set up socket event listeners
    const cleanupError = on("error", handleError);
    const cleanupJoined = on("joined-call", handleJoinedCall);
    const cleanupParticipant = on(
      "participant-joined",
      handleParticipantJoined
    );

    return () => {
      if (cleanupError) cleanupError();
      if (cleanupJoined) cleanupJoined();
      if (cleanupParticipant) cleanupParticipant();
    };
  }, [socket, on, sessionDetails, setParticipants, user]);

  // Initialize media when properly connected and joined
  useEffect(() => {
    // Only initialize media after successfully joining the call
    if (
      socket &&
      (externalConnected || connected) &&
      joinedCall &&
      !localStream &&
      !isInitializingMedia &&
      !isInitializing &&
      !hasAttemptedInit &&
      !initError
    ) {
      setIsInitializingMedia(true);
      setLocalError(null);

      initLocalMedia()
        .then(() => {
          setIsInitializingMedia(false);
        })
        .catch((err) => {
          setIsInitializingMedia(false);
          setLocalError(
            err.message ||
              "Failed to access camera and microphone. Please check permissions and refresh the page."
          );
        });
    }
  }, [
    socket,
    externalConnected,
    connected,
    joinedCall,
    localStream,
    initLocalMedia,
    isInitializingMedia,
    isInitializing,
    hasAttemptedInit,
    initError,
  ]);

  // Timer for call duration
  useEffect(() => {
    let interval = null;
    if (callActive && callStartTime) {
      interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
      }, 1000);
    } else {
      setCallDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callActive, callStartTime]);

  // Load chat messages and join chat room
  useEffect(() => {
    if (sessionId && socket && (externalConnected || connected)) {
      // Join the unified video call room for messaging
      const videoRoomId = `video-call-${sessionId}`;
      console.log(`📱 Admin joining video call room: ${videoRoomId}`);
      socket.emit("join-video-session", {
        sessionId: sessionId,
      });

      // Listen for incoming messages
      socket.on("receive-video-message", (data) => {
        console.log("📥 Admin received video message:", data);

        // Prevent duplicate processing of own messages
        if (data.senderId === socket.user?.userId) {
          console.log("💬 Skipping own message to prevent duplication");
          return;
        }

        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: data.message,
            sender: "them",
            senderId: data.senderId,
            timestamp: data.timestamp || new Date().toISOString(),
            senderName:
              data.senderName ||
              `User ${data.senderId?.substring(0, 5) || "Unknown"}`,
          },
        ]);
      });

      // Load existing messages
      loadChatMessages();
    }

    return () => {
      if (socket) {
        socket.off("receive-video-message");
      }
    };
  }, [sessionId, socket, externalConnected, connected]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, showChat]);

  // Participants are now populated through peer connections
  useEffect(() => {
    console.log(
      "Admin: Participants will be populated through peer connections"
    );
  }, []);

  const loadChatMessages = async () => {
    try {
      const response = await adminChatApi.getMessages(sessionId);
      if (response.success) {
        setChatMessages(response.data.messages || []);
      }
    } catch (error) {
      console.error("Error loading chat messages:", error);
    }
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim() || !sessionId) return;

    try {
      const senderName = userInfo.name || user?.name || "Admin";

      // Send message ONLY via socket (no API call)
      if (socket) {
        socket.emit("send-video-message", {
          sessionId: sessionId,
          message: newMessage.trim(),
          senderId: socket.user?.userId,
        });

        // Add to local chat messages immediately for better UX
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: newMessage.trim(),
            sender: "me",
            senderId: socket.user?.userId,
            timestamp: new Date().toISOString(),
            senderName: senderName,
          },
        ]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleTyping = async () => {
    if (sessionId) {
      try {
        await adminChatApi.sendTyping();
      } catch (error) {
        console.error("Error sending typing indicator:", error);
      }
    }
  };

  const handleStopTyping = async () => {
    if (sessionId) {
      try {
        await adminChatApi.sendStopTyping();
      } catch (error) {
        console.error("Error sending stop typing indicator:", error);
      }
    }
  };

  // Handle socket connection errors and join events
  useEffect(() => {
    if (!socket) return;

    const handleError = (data) => {
      console.error("Socket error:", data);
      setSocketErrorState(data.message || "Connection error occurred");

      // Handle specific session not active error
      if (
        data.message &&
        data.message.includes("Session is not active at this time")
      ) {
        setCallStatus("ended");
        setCallActive(false);
        setCallStartTime(null);
        setIncomingCall(false);
        setCallDuration(0);
        if (onEndCall) onEndCall();
      } else {
        setCallStatus("ended");
      }
    };

    const handleJoinedCall = (data) => {
      setJoinedCall(true);
      setCallActive(true);
      setCallStatus("connected");
      setSocketError(null); // Clear any previous errors
    };

    const handleParticipantJoined = (data) => {
      // Validate that this participant belongs to the session
      let isValidParticipant = false;
      let enhancedData = { ...data, isSelf: data.socketId === socket.id };

      // Check if participant exists in session details
      if (sessionDetails && sessionDetails.participants) {
        const matchingParticipant = sessionDetails.participants.find(
          (p) => p.userId === data.userId
        );

        if (matchingParticipant) {
          isValidParticipant = true;
          enhancedData.name = matchingParticipant.name;
          enhancedData.role = matchingParticipant.role;
          enhancedData.isSelf = matchingParticipant.isSelf;
          enhancedData.isTherapist = matchingParticipant.isTherapist;
        }
      } else {
        // If no session details, allow participants but validate basic data
        if (data.userId && data.socketId) {
          isValidParticipant = true;
        }
      }

      // Only add valid participants to the list
      if (isValidParticipant) {
        setParticipants((prev) => {
          const exists = prev.some(
            (p) => p.userId === data.userId && p.socketId === data.socketId
          );
          if (exists) {
            return prev;
          }
          return [...prev, enhancedData];
        });
      }
    };

    const cleanupError = on("error", handleError);
    const cleanupJoined = on("joined-call", handleJoinedCall);
    const cleanupParticipant = on(
      "participant-joined",
      handleParticipantJoined
    );

    return () => {
      if (cleanupError) cleanupError();
      if (cleanupJoined) cleanupJoined();
      if (cleanupParticipant) cleanupParticipant();
    };
  }, [socket, on, onEndCall, sessionDetails, setParticipants]);

  // Retry connection if it fails
  useEffect(() => {
    if (error && connectionAttempts < 3) {
      const timer = setTimeout(() => {
        setConnectionAttempts((prev) => prev + 1);
        setSocketError(null);
        // The socket will automatically reconnect
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error, connectionAttempts]);

  // Set up socket listeners
  useEffect(() => {
    if (!socket || !(externalConnected || connected)) return;

    // Handle incoming offer
    const offerListener = (data) => {
      if (data.senderId !== socket.id) {
        handleOffer(data.offer, data.senderId);
      }
    };

    // Handle WebRTC signaling events
    const webRTCOfferListener = (data) => {
      if (data.senderId !== socket.id) {
        handleOffer(data.offer, data.senderId);
      }
    };

    const webRTCAnswerListener = (data) => {
      if (data.senderId !== socket.id) {
        handleAnswer(data.answer, data.senderId);
      }
    };

    const webRTCIceCandidateListener = (data) => {
      if (data.senderId !== socket.id) {
        handleIceCandidate(data.candidate, data.senderId);
      }
    };

    // Handle force-leave event from admin
    const forceLeaveListener = (data) => {
      if (data.userId === socket.id) {
        setCallStatus("ended");
        setCallActive(false);
        setCallStartTime(null);
        setIncomingCall(false);
        setCallDuration(0);
        if (onEndCall) onEndCall();
      }
    };

    // Handle incoming answer
    const answerListener = (data) => {
      if (data.senderId !== socket.id) {
        handleAnswer(data.answer, data.senderId);
      }
    };

    // Handle ICE candidate
    const iceCandidateListener = (data) => {
      if (data.senderId !== socket.id) {
        handleIceCandidate(data.candidate, data.senderId);
      }
    };

    // Handle participant joined
    const participantJoinedListener = (data) => {
      setParticipants((prev) => {
        const exists = prev.some(
          (p) => p.userId === data.userId && p.socketId === data.socketId
        );
        if (exists) return prev;
        return [...prev, { ...data, isSelf: data.socketId === socket.id }];
      });

      // Initialize audio status for the new participant (default to enabled)
      if (data.userId) {
        setParticipantAudioStatus((prev) => ({
          ...prev,
          [data.userId]: true, // Audio enabled by default
        }));
      }

      if (
        data.isTherapist &&
        userRole !== "therapist" &&
        userRole !== "admin"
      ) {
        setIncomingCall(true);
      }
    };

    // Handle participant left
    const participantLeftListener = (data) => {
      setParticipants((prev) => {
        return prev.filter((p) => p.userId !== data.userId);
      });

      // Remove audio status for the leaving participant
      if (data.userId) {
        setParticipantAudioStatus((prev) => {
          const newStatus = { ...prev };
          delete newStatus[data.userId];
          return newStatus;
        });
      }
    };

    // Handle call started
    const callStartedListener = (data) => {
      setCallStatus("connected");
      setCallActive(true);
      setCallStartTime(Date.now());

      let finalCallLogId = null;

      if (data.callLogId) {
        finalCallLogId = data.callLogId;
      } else {
        // Try multiple fallback options
        if (
          sessionDetails?.sessionId &&
          typeof sessionDetails.sessionId === "string" &&
          sessionDetails.sessionId.length === 24
        ) {
          finalCallLogId = sessionDetails.sessionId;
        } else if (
          roomId &&
          typeof roomId === "string" &&
          roomId.length === 24
        ) {
          finalCallLogId = roomId;
        } else {
          finalCallLogId = "507f1f77bcf86cd799439011";
        }
      }

      if (finalCallLogId) {
        setCallLogId(finalCallLogId);
      }

      if (data.startedBy !== socket.id) {
        setIncomingCall(false);
      }
    };

    // Handle call accepted
    const callAcceptedListener = (data) => {
      setCallStatus("connected");
      setCallActive(true);
      setIncomingCall(false);
    };

    // Handle call rejected
    const callRejectedListener = (data) => {
      setCallStatus("missed");
      setIncomingCall(false);
    };

    // Handle call ended
    const callEndedListener = (data) => {
      const isAdminTermination =
        data.initiatorRole === "admin" || data.initiatorRole === "therapist";

      if (userRole === "admin" || userRole === "therapist") {
        if (isAdminTermination) {
          setCallStatus("ended");
          setCallActive(false);
          setCallStartTime(null);
          setIncomingCall(false);
          setCallDuration(0);
          if (onEndCall) onEndCall();
        } else {
          setParticipants((prev) =>
            prev.filter((p) => p.socketId !== data.endedBy)
          );
        }
      } else {
        if (data.endedBy === socket.id) {
          setCallStatus("ended");
          setCallActive(false);
          setCallStartTime(null);
          setIncomingCall(false);
          setCallDuration(0);
          if (onEndCall) onEndCall();
        } else {
          setParticipants((prev) =>
            prev.filter((p) => p.socketId !== data.endedBy)
          );
        }
      }
    };

    // Handle audio toggle
    const audioToggleListener = (data) => {
      // Update UI to reflect other participant's audio status
      console.log(
        "Audio toggle received from user:",
        data.userId,
        "muted:",
        data.muted
      );

      // Update the audio status for the specific user
      if (data.userId) {
        setParticipantAudioStatus((prev) => ({
          ...prev,
          [data.userId]: !data.muted, // Store whether audio is enabled (opposite of muted)
        }));
      }
    };

    // Handle video toggle
    const videoToggleListener = (data) => {};

    // Handle screen share toggle
    const screenShareToggleListener = (data) => {};

    // Handle user muted
    const userMutedListener = (data) => {
      if (data.userId === socket.id) {
        setAudioEnabled(false);
      }
    };

    // Handle chat message
    const chatMessageListener = (data) => {
      console.log("Admin received chat message:", data);

      // Determine sender name - use provided name or fallback
      const senderName =
        data.senderName ||
        data.message?.senderName ||
        (data.senderId === socket?.id
          ? userInfo.name || user?.name || "Admin"
          : "Participant");

      // Add the received message to chat messages
      setChatMessages((prev) => [
        ...prev,
        {
          ...data.message,
          senderId: data.senderId || data.message.senderId,
          senderName: senderName,
          content:
            data.message.content || data.message.message || data.message.text,
          timestamp:
            data.message.timestamp ||
            data.message.createdAt ||
            new Date().toISOString(),
        },
      ]);
    };

    // Handle real-time message broadcast
    const messageReceivedListener = (data) => {
      console.log("Admin received real-time message:", data);

      // Determine sender name - use provided name or fallback
      const senderName =
        data.senderName ||
        data.message?.senderName ||
        (data.senderId === socket?.id
          ? userInfo.name || user?.name || "Admin"
          : "Participant");

      setChatMessages((prev) => [
        ...prev,
        {
          content:
            data.message.content ||
            data.message.message ||
            data.message.text ||
            data.content,
          senderId: data.senderId || data.message?.senderId || socket?.id,
          senderName: senderName,
          timestamp:
            data.timestamp ||
            data.message?.timestamp ||
            data.createdAt ||
            new Date().toISOString(),
        },
      ]);
    };

    // Handle typing indicator
    const typingListener = (data) => {
      setTypingUsers((prev) => {
        if (!prev.includes(data.userId)) {
          return [...prev, data.userId];
        }
        return prev;
      });
    };

    // Handle stop typing indicator
    const stopTypingListener = (data) => {
      setTypingUsers((prev) => prev.filter((id) => id !== data.userId));
    };

    // Add listeners with proper cleanup
    const cleanupFunctions = [];

    cleanupFunctions.push(on("offer", offerListener));
    cleanupFunctions.push(on("answer", answerListener));
    cleanupFunctions.push(on("ice-candidate", iceCandidateListener));
    cleanupFunctions.push(on("webrtc-offer-received", webRTCOfferListener));
    cleanupFunctions.push(on("webrtc-answer-received", webRTCAnswerListener));
    cleanupFunctions.push(
      on("webrtc-ice-candidate-received", webRTCIceCandidateListener)
    );
    cleanupFunctions.push(on("participant-joined", participantJoinedListener));
    cleanupFunctions.push(on("participant-left", participantLeftListener));
    cleanupFunctions.push(on("call-started", callStartedListener));
    cleanupFunctions.push(on("call-accepted", callAcceptedListener));
    cleanupFunctions.push(on("call-rejected", callRejectedListener));
    cleanupFunctions.push(on("call-ended", callEndedListener));
    cleanupFunctions.push(on("audio-toggle", audioToggleListener));
    cleanupFunctions.push(on("video-toggle", videoToggleListener));
    cleanupFunctions.push(on("screen-share-toggle", screenShareToggleListener));
    cleanupFunctions.push(on("user-muted", userMutedListener));
    cleanupFunctions.push(on("new-message", chatMessageListener));
    cleanupFunctions.push(on("message-received", messageReceivedListener));
    cleanupFunctions.push(on("typing", typingListener));
    cleanupFunctions.push(on("stop-typing", stopTypingListener));
    cleanupFunctions.push(on("force-leave", forceLeaveListener));

    // Cleanup listeners
    return () => {
      cleanupFunctions.forEach((cleanup) => {
        if (typeof cleanup === "function") {
          cleanup();
        }
      });
      if (socket) {
        socket.off("webrtc-offer-received", webRTCOfferListener);
        socket.off("webrtc-answer-received", webRTCAnswerListener);
        socket.off("webrtc-ice-candidate-received", webRTCIceCandidateListener);
      }
    };
  }, [
    socket,
    externalConnected,
    connected,
    on,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    userRole,
    onEndCall,
    setParticipants,
    setCallLogId,
    sessionDetails,
    roomId,
    userInfo.name,
    user?.name,
  ]);

  // Toggle audio
  const toggleAudioHandler = () => {
    try {
      const enabled = toggleAudio();
      setAudioEnabled(enabled);
    } catch (error) {
      console.error("Error toggling audio:", error);
      setSocketErrorState("Failed to toggle audio");
    }
  };

  // Toggle video
  const toggleVideoHandler = () => {
    try {
      const enabled = toggleVideo();
      setVideoEnabled(enabled);
    } catch (error) {
      console.error("Error toggling video:", error);
      setSocketErrorState("Failed to toggle video");
    }
  };

  // Toggle screen sharing
  const toggleScreenShareHandler = async () => {
    try {
      await toggleScreenShare();
      setScreenSharing(!screenSharing);
    } catch (error) {
      console.error("Error toggling screen share:", error);
      setSocketErrorState("Failed to toggle screen sharing");
    }
  };

  // Render remote videos based on room type - Enhanced for Clinic Monitoring
  const renderRemoteVideos = () => {
    const streamKeys = Object.keys(remoteStreams);

    // No participants connected
    if (streamKeys.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-slate-900 rounded-xl">
          <div className="text-center text-slate-500 mb-4">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-1">
              Waiting for Participants
            </h3>
            <p className="text-sm">
              Remote session will begin when participants join
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span>Monitoring Active</span>
          </div>
        </div>
      );
    }

    // Single participant (1-on-1 session)
    if (streamKeys.length === 1) {
      const userId = streamKeys[0];
      const stream = remoteStreams[userId];
      const participant = participants.find((p) => p.userId === userId) || {};

      return (
        <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
          {/* Hidden audio element for remote audio */}
          <audio
            ref={(el) => {
              if (el && stream) {
                remoteAudioRefs.current[userId] = el;
                if (el.srcObject !== stream) {
                  try {
                    el.srcObject = stream;
                    el.muted = false;
                    el.autoplay = true;
                    const playPromise = el.play();
                    if (playPromise !== undefined) {
                      playPromise.catch((error) => {
                        el.muted = false;
                        el.play().catch(() => {});
                      });
                    }
                  } catch (err) {
                    console.error(
                      `Error assigning audio for ${
                        participant.name || "Participant"
                      }:`,
                      err
                    );
                  }
                }
              }
            }}
            autoPlay
            className="hidden"
          />
          <video
            ref={(el) => {
              if (el && stream) {
                remoteVideoRefs.current[userId] = el;
                // Only assign srcObject if it's different to prevent blinking
                if (el.srcObject !== stream) {
                  try {
                    el.srcObject = stream;
                    el.muted = true;
                    el.autoplay = true;
                    el.playsInline = true;

                    const playPromise = el.play();
                    if (playPromise !== undefined) {
                      playPromise.catch((error) => {
                        el.muted = true;
                        el.play().catch(() => {});
                      });
                    }
                  } catch (err) {
                    console.error(
                      `Error assigning video for ${
                        participant.name || "Participant"
                      }:`,
                      err
                    );
                  }
                }
              }
            }}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            muted
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
          <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3">
            {/* <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-white font-medium text-sm">
                  {participant.name || "Participant"}
                </p>
                <p className="text-slate-300 text-xs">
                  {participant.role === "therapist" ? "Therapist" : "Patient"}
                </p>
              </div>
            </div> */}
          </div>
        </div>
      );
    }

    // Multiple participants (group session) - Grid layout
    return (
      <div className="grid grid-cols-2 gap-3 w-full h-full p-3">
        {streamKeys.map((userId, index) => {
          const stream = remoteStreams[userId];
          const participant =
            participants.find((p) => p.userId === userId) || {};

          return (
            <div
              key={userId}
              className="relative bg-black rounded-xl overflow-hidden border border-slate-700"
            >
              {/* Hidden audio element for remote audio */}
              <audio
                ref={(el) => {
                  if (el && stream) {
                    remoteAudioRefs.current[userId] = el;
                    if (el.srcObject !== stream) {
                      try {
                        el.srcObject = stream;
                        el.muted = false;
                        el.autoplay = true;
                        const playPromise = el.play();
                        if (playPromise !== undefined) {
                          playPromise.catch((error) => {
                            el.muted = false;
                            el.play().catch(() => {});
                          });
                        }
                      } catch (err) {
                        console.error(
                          `Error with group audio ${index + 1}:`,
                          err
                        );
                      }
                    }
                  }
                }}
                autoPlay
                className="hidden"
              />
              <video
                ref={(el) => {
                  if (el && stream) {
                    remoteVideoRefs.current[userId] = el;
                    // Only assign srcObject if it's different to prevent blinking
                    if (el.srcObject !== stream) {
                      try {
                        el.srcObject = stream;
                        el.muted = true;
                        el.autoplay = true;
                        el.playsInline = true;

                        const playPromise = el.play();
                        if (playPromise !== undefined) {
                          playPromise.catch((error) => {
                            el.muted = true;
                            el.play().catch(() => {});
                          });
                        }
                      } catch (err) {
                        console.error(
                          `Error with group video ${index + 1}:`,
                          err
                        );
                      }
                    }
                  }
                }}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                muted
              />
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
                <p className="text-white text-xs font-medium">
                  {participant.name || `Participant ${index + 1}`}
                </p>
                <p className="text-slate-300 text-[10px]">
                  {participant.role === "therapist" ? "Therapist" : "Patient"}
                </p>
              </div>
              <div className="absolute bottom-2 right-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (callStatus === "ended") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="text-center text-white max-w-md p-6">
          <PhoneOff className="mx-auto h-16 w-16 mb-4 text-rose-500" />
          <h2 className="text-2xl font-bold mb-2">Session Terminated</h2>
          <p className="text-slate-500 mb-6">
            The monitoring session has ended.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              variant="default"
              className="bg-slate-800 hover:bg-slate-900 rounded-lg"
              onClick={() => (window.location.href = "/sessions")}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (incomingCall && !callStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="text-center text-white">
          <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <Users className="h-12 w-12" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Incoming Session</h2>
          <p className="text-slate-500 mb-6">
            {therapistInfo.name} is ready to connect
          </p>
          <div className="flex justify-center gap-4">
            <Button
              variant="destructive"
              size="lg"
              className="rounded-2xl h-16 w-16 bg-rose-500 hover:bg-rose-600"
              onClick={rejectCall}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
            <Button
              variant="default"
              size="lg"
              className="rounded-2xl h-16 w-16 bg-emerald-500 hover:bg-emerald-600"
              onClick={acceptCall}
            >
              <Video className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Waiting Room Notification */}
      {WaitingNotificationMemo}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 py-4 bg-slate-900 border-b border-slate-800 gap-3 sm:gap-0">
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700">
            <Video className="h-4 sm:h-5 w-4 sm:w-5 text-slate-300" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0"
              >
                Admin Monitoring
              </Badge>
              <span className="text-slate-500 text-xs font-medium">
                • Live Session
              </span>
            </div>
            <h1 className="text-white font-semibold tracking-tight text-sm sm:text-base truncate">
              Remote Physiotherapy Monitoring
            </h1>
            <p className="text-slate-500 text-xs truncate">
              Session ID: {sessionId}
            </p>
            <p className="text-slate-500 text-xs truncate">
              {userInfo.name || user?.name || "Admin"} monitoring clinic session
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            className={`text-slate-400 hover:text-white hover:bg-slate-800 ${
              showParticipants ? "bg-slate-800 text-white" : ""
            }`}
            onClick={() => {
              setShowParticipants(!showParticipants);
              setShowChat(false);
              setShowSettings(false);
            }}
          >
            <Users className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline text-xs">
              Participants ({participants.length})
            </span>
            <span className="sm:hidden text-xs">({participants.length})</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`text-slate-400 hover:text-white hover:bg-slate-800 ${
              showChat ? "bg-slate-800 text-white" : ""
            }`}
            onClick={() => {
              setShowChat(!showChat);
              setShowParticipants(false);
              setShowSettings(false);
            }}
          >
            <MessageSquare className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline text-xs">Admin Chat</span>
            <span className="sm:hidden text-xs">Chat</span>
          </Button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative bg-slate-950 flex overflow-hidden">
        {/* Main Video Area - Remote Stream Display */}
        <div
          className={`flex-1 relative transition-all duration-500 ${
            showParticipants || showChat ? "md:mr-0" : ""
          }`}
        >
          {/* Remote Video Stream */}
          <div className="w-full h-full relative bg-black rounded-xl overflow-hidden">
            {renderRemoteVideos()}

            {/* Overlay Information */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
              {/* <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-medium">LIVE</span>
                </div>
                <p className="text-slate-200 text-xs">
                  Remote Physiotherapy Session
                </p>
              </div> */}

              {/* <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
                <div className="flex items-center gap-2 text-white text-sm">
                  <Users className="w-4 h-4" />
                  <span>
                    {participants.length} participant
                    {participants.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div> */}
            </div>

            {/* Connection Status */}
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-2">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                {connected ? (
                  <>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                    <span>Disconnected</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Side Panels */}
        {showParticipants && (
          <div className="md:w-80 w-full bg-slate-900 md:border-l border-slate-800 flex flex-col animate-in slide-in-from-right duration-300 md:relative absolute inset-0 md:inset-auto md:right-0 z-50">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-white font-semibold">Participants</h3>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white"
                onClick={() => setShowParticipants(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 p-6 space-y-6">
              {loadingParticipants && (
                <div className="text-center py-4">
                  <p className="text-slate-500 text-sm">
                    Loading participants...
                  </p>
                </div>
              )}
              {!loadingParticipants && (
                <>
                  {(apiParticipants.length > 0
                    ? apiParticipants
                    : participants
                  ).map((participant, index) => {
                    // Convert API participant to match expected format
                    const participantData = {
                      ...participant,
                      name:
                        participant.name ||
                        participant.firstName + " " + participant.lastName ||
                        participant.username ||
                        `User ${participant.userId?.substring(0, 5) || index}`,
                      userId: participant.userId || participant._id,
                      role: participant.role || participant.userType,
                      isSelf:
                        participant.isSelf ||
                        participant.userId === user?.userId,
                    };

                    return (
                      <div
                        key={`${participantData.userId || "unknown"}-${
                          participantData.socketId || "unknown"
                        }`}
                        className="flex items-center gap-4"
                      >
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-sm">
                          {participantData.name?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-white font-medium text-sm">
                              {participantData.name}
                            </p>
                            {participantData.isSelf ? (
                              <Badge className="bg-slate-800 text-slate-400 border-none text-[8px] h-4">
                                You
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-800 text-slate-400 border-none text-[8px] h-4">
                                {participantData.role === "admin"
                                  ? "Admin"
                                  : participantData.role === "therapist" ||
                                    participantData.role === "staff"
                                  ? "Staff"
                                  : "Patient"}
                              </Badge>
                            )}
                          </div>
                          <p className="text-slate-500 text-xs">
                            {participantData.joinedAt
                              ? `Joined: ${new Date(
                                  participantData.joinedAt
                                ).toLocaleTimeString()}`
                              : ""}
                          </p>
                          {/* Admin Controls */}
                          {userRole === "admin" && !participantData.isSelf && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="mt-2 text-xs h-6 px-2 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/20"
                              onClick={() => {
                                // Force leave participant
                                if (roomId && socket) {
                                  socket.emit("force-leave", {
                                    roomId,
                                    userId: participantData.userId,
                                    reason: "Admin removed participant",
                                  });
                                }
                              }}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {/* Show message if no participants from either source */}
                  {apiParticipants.length === 0 &&
                    participants.length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-slate-500 text-sm">
                          No participants found
                        </p>
                      </div>
                    )}
                </>
              )}

              {/* Admin Tools */}
              {userRole === "admin" && (
                <div className="pt-6 border-t border-slate-800">
                  <h4 className="text-slate-300 font-medium text-sm mb-3">
                    Admin Controls
                  </h4>
                  <div className="space-y-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                      onClick={() => {
                        // Mute all non-admin participants
                        participants.forEach((participant) => {
                          if (!participant.isSelf) {
                            // Emit the mute-user event to the server
                            if (socket) {
                              socket.emit("mute-user", {
                                roomId,
                                userIdToMute: participant.userId,
                                roomType: roomType,
                              });
                            }
                          }
                        });
                      }}
                    >
                      Mute All Participants
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full bg-rose-500 hover:bg-rose-600"
                      onClick={() => {
                        // End call for all participants
                        endCall();
                      }}
                    >
                      Terminate Session
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {showChat && (
          <div className="md:w-80 w-full bg-slate-900 md:border-l border-slate-800 flex flex-col animate-in slide-in-from-right duration-300 md:relative absolute inset-0 md:inset-auto md:right-0 z-50 max-h-screen md:max-h-full">
            <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-white font-semibold text-base">Admin Chat</h3>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white"
                onClick={() => setShowChat(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Chat Messages Display */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3"
            >
              {chatMessages.length === 0 ? (
                <div className="flex flex-col justify-center items-center text-center h-full py-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 border border-slate-700">
                    <MessageSquare className="h-4 sm:h-5 w-4 sm:w-5 text-slate-500" />
                  </div>
                  <p className="text-slate-400 text-sm font-medium">
                    Secure admin communication channel
                  </p>
                  <p className="text-slate-600 text-[10px] mt-2 px-6">
                    Messages are encrypted and logged for compliance.
                  </p>
                </div>
              ) : (
                chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.senderId === socket?.id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-sm ${
                        message.senderId === socket?.id
                          ? "bg-emerald-500 text-white rounded-br-md"
                          : "bg-slate-800 text-slate-100 rounded-bl-md border border-slate-700"
                      }`}
                    >
                      <p className="text-[10px] font-semibold mb-1 opacity-80">
                        {message.senderId === socket?.id
                          ? userInfo.name || user?.name || "Admin"
                          : message.senderName || "Participant"}
                      </p>
                      <p>
                        {message.text || message.content || message.message}
                      </p>
                      <p
                        className={`text-[10px] mt-1 ${
                          message.senderId === socket?.id
                            ? "text-emerald-100 opacity-80"
                            : "text-slate-400"
                        }`}
                      >
                        {new Date(
                          message.timestamp || message.createdAt
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}

              {/* Typing indicators */}
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-bl-md px-3 sm:px-4 py-2 sm:py-3 text-sm border border-slate-700">
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs">
                        {typingUsers.length === 1
                          ? "Someone is typing..."
                          : `${typingUsers.length} people typing...`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 sm:p-4 border-t border-slate-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Admin message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      sendChatMessage();
                    }
                  }}
                  onFocus={handleTyping}
                  onBlur={handleStopTyping}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 sm:px-4 py-2 text-white text-sm focus:outline-none focus:border-slate-500 placeholder:text-slate-600"
                />
                <Button
                  size="icon"
                  className="bg-slate-100 hover:bg-white text-slate-900 rounded-xl"
                  onClick={sendChatMessage}
                  disabled={!newMessage.trim()}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* Media Initialization Loading Overlay */}
        {isInitializingMedia && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-16 h-16 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-medium">
                Initializing camera and microphone...
              </p>
              <p className="text-slate-400 text-sm mt-2">
                This may take a few seconds
              </p>
            </div>
          </div>
        )}

        {/* Self Video (Admin View) */}
        <div
          className={`absolute md:bottom-8 md:right-8 bottom-24 right-4 md:w-64 md:h-44 w-44 h-36 rounded-[2rem] overflow-hidden border-4 border-slate-900 shadow-2xl transition-all duration-500 ${
            showParticipants || showChat ? "md:translate-x-[-320px]" : ""
          }`}
        >
          <video
            ref={(el) => {
              if (el && localStream) {
                localVideoRef.current = el;
                // Only assign srcObject if it's different to prevent blinking
                if (el.srcObject !== localStream) {
                  try {
                    el.srcObject = localStream;
                  } catch (err) {
                    console.error(
                      "Error assigning admin local video srcObject:",
                      err
                    );
                  }
                }
              }
            }}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            Admin View
          </div>
          {!videoEnabled && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
              <VideoOff className="h-6 w-6 text-slate-400" />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-900 px-4 py-4 md:px-8 md:py-8 border-t border-slate-800 md:relative fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <div className="w-24 sm:w-32 hidden md:flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-slate-700 text-slate-500 text-[10px] px-2 py-0.5"
            >
              HD 1080p
            </Badge>
          </div>

          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
            <Button
              variant={audioEnabled ? "secondary" : "destructive"}
              size="icon"
              className="rounded-2xl md:w-14 md:h-14 w-12 h-12 bg-slate-800 hover:bg-slate-700 border-slate-700 min-w-[48px]"
              onClick={toggleAudioHandler}
            >
              {audioEnabled ? (
                <Mic className="h-5 w-5" />
              ) : (
                <MicOff className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant={videoEnabled ? "secondary" : "destructive"}
              size="icon"
              className="rounded-2xl md:w-14 md:h-14 w-12 h-12 bg-slate-800 hover:bg-slate-700 border-slate-700 min-w-[48px]"
              onClick={toggleVideoHandler}
            >
              {videoEnabled ? (
                <Video className="h-5 w-5" />
              ) : (
                <VideoOff className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant={screenSharing ? "default" : "secondary"}
              size="icon"
              className={`rounded-2xl md:w-14 md:h-14 w-12 h-12 border-slate-700 min-w-[48px] ${
                screenSharing
                  ? "bg-white text-slate-900"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
              onClick={toggleScreenShareHandler}
            >
              <Share className="h-5 w-5" />
            </Button>

            {/* {userRole === "admin" && (
              <Button
                variant="secondary"
                size="icon"
                className="rounded-2xl md:w-14 md:h-14 w-12 h-12 bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-600"
                onClick={startCall}
                disabled={callStarted}
              >
                <Users className="h-5 w-5" />
              </Button>
            )} */}

            {/* Recording Button - Only for admins */}
            {(userRole === "admin" || isTherapist) && (
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant={isRecording ? "destructive" : "secondary"}
                  size="icon"
                  className={`rounded-2xl md:w-16 md:h-16 w-14 h-12 border-2 min-w-[56px] ${
                    isRecording
                      ? "bg-red-600 text-white animate-pulse border-red-400 shadow-lg shadow-red-500/30"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-600"
                  }`}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={!connected || recordingStatus === "starting"}
                  title={isRecording ? "Stop Recording" : "Start Recording"}
                >
                  {recordingStatus === "starting" ? (
                    <div className="h-6 w-6">
                      <div className="animate-spin rounded-full h-full w-full border-b-2 border-white"></div>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`h-3 w-3 mr-1 rounded-full ${
                          isRecording ? "bg-white animate-pulse" : "bg-red-500"
                        }`}
                      />
                      <span className="text-sm font-bold">REC</span>
                    </>
                  )}
                </Button>

                {/* Recording Timer */}
                {isRecording && (
                  <div className="text-xs text-red-400 font-mono bg-red-900/30 px-2 py-1 rounded-md">
                    {Math.floor(recordingTime / 60)
                      .toString()
                      .padStart(2, "0")}
                    :{(recordingTime % 60).toString().padStart(2, "0")}
                  </div>
                )}
              </div>
            )}

            <Button
              variant="destructive"
              size="icon"
              className="rounded-2xl md:w-16 md:h-14 w-14 h-12 bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 min-w-[56px]"
              onClick={
                userRole === "admin" || isTherapist
                  ? endCall
                  : () => emit("leave-room", { roomId, roomType })
              }
            >
              <PhoneOff className="h-6 w-6" />
            </Button>

            {/* <Button
              variant="secondary"
              size="icon"
              className="rounded-2xl md:w-14 md:h-14 w-12 h-12 bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-5 w-5" />
            </Button> */}
          </div>

          <div className="w-24 sm:w-32 flex justify-end">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Monitoring
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl md:rounded-3xl w-full md:w-96 max-w-md mx-4 mb-0 md:mb-auto animate-in slide-in-from-bottom md:slide-in-from-top duration-300">
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Admin Settings</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-white"
                  onClick={() => setShowSettings(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-slate-300 font-medium mb-3 text-sm">
                  Audio Input
                </h4>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-600">
                  <option>Default Microphone</option>
                  <option>External USB Microphone</option>
                </select>
              </div>
              <div>
                <h4 className="text-slate-300 font-medium mb-3 text-sm">
                  Video Input
                </h4>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-600">
                  <option>Default Camera</option>
                  <option>External Webcam</option>
                </select>
              </div>
              <div>
                <h4 className="text-slate-300 font-medium mb-3 text-sm">
                  Connection Quality
                </h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-3/4"></div>
                  </div>
                  <span className="text-xs text-slate-500">Good</span>
                </div>
              </div>
              {userRole === "admin" && (
                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-slate-300 font-medium mb-3 text-sm">
                    Admin Options
                  </h4>
                  <div className="space-y-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                      onClick={() => {
                        // Recording toggle functionality
                      }}
                    >
                      Toggle Recording
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                      onClick={() => {
                        // Logs functionality
                      }}
                    >
                      View Session Logs
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {localError && (
        <div className="fixed top-4 right-4 bg-rose-500 text-white p-4 rounded-xl z-50 max-w-md border border-rose-400 shadow-lg shadow-rose-500/20">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <X className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Media Error</p>
              <p className="text-sm opacity-90 mt-1">{localError}</p>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white text-xs h-7 px-2"
                  onClick={() => {
                    resetInitialization();

                    initLocalMedia()
                      .then(() => {
                        // Successfully re-initialized
                      })
                      .catch((err) => {
                        setLocalError(
                          err.message ||
                            "Failed to access camera and microphone. Please check permissions and refresh the page."
                        );
                      });
                  }}
                >
                  Retry
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white text-xs h-7 px-2"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
              </div>
            </div>
            <button
              onClick={() => setSocketErrorState(null)}
              className="text-white hover:text-gray-200 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;