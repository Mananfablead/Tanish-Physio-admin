import React, { useState, useEffect, useCallback } from "react";
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
  const { socket, connected, error, emit, on, setError: setSocketError} = useSocket(
    roomId,
    roomType
  );
  const [localError, setLocalError] = useState(null);

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

  // Auto-start call when admin joins successfully
  useEffect(() => {
    if (joinedCall && !callStarted && userRole === "admin") {
      console.log("🔄 Auto-starting call for admin...");
      startCall();
    }
  }, [joinedCall, callStarted, userRole, startCall]);

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  // Debug callActive changes
  console.log("📊 callActive value:", callActive);
  console.log("📊 callLogId value:", callLogId);

  // Effect to update video elements when streams change
  useEffect(() => {
    console.log("=== ADMIN VIDEO STREAM UPDATE EFFECT ===");
    console.log("Local stream:", !!localStream);
    console.log("Remote streams count:", Object.keys(remoteStreams).length);
    console.log("Remote streams keys:", Object.keys(remoteStreams));

    // Update local video when localStream changes
    if (localVideoRef.current && localStream) {
      try {
        if (localVideoRef.current.srcObject !== localStream) {
          localVideoRef.current.srcObject = localStream;
          console.log("✅ Admin local video element updated");

          // Ensure local video plays
          localVideoRef.current.muted = true;
          localVideoRef.current.autoplay = true;
          localVideoRef.current.playsInline = true;
        }
      } catch (err) {
        console.error("❌ Error setting admin local video srcObject:", err);
      }
    }

    // Update remote videos when remoteStreams change
    Object.entries(remoteStreams).forEach(([userId, stream]) => {
      if (remoteVideoRefs.current[userId] && stream) {
        try {
          const videoElement = remoteVideoRefs.current[userId];
          if (videoElement.srcObject !== stream) {
            videoElement.srcObject = stream;
            console.log(
              `✅ Admin remote video element updated for user: ${userId}`
            );

            // Ensure remote video plays
            videoElement.muted = true;
            videoElement.autoplay = true;
            videoElement.playsInline = true;

            // Play the video
            const playPromise = videoElement.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log(
                    `✅ Admin remote video playing for user: ${userId}`
                  );
                })
                .catch((error) => {
                  console.warn(
                    `⚠️ Admin remote video autoplay failed for ${userId}:`,
                    error
                  );
                  // Try to play muted
                  videoElement.muted = true;
                  videoElement.play().catch((err) => {
                    console.error(
                      `❌ Admin remote video play failed for ${userId}:`,
                      err
                    );
                  });
                });
            }
          }
        } catch (err) {
          console.error(
            `❌ Error setting admin remote video srcObject for ${userId}:`,
            err
          );
        }
      } else {
      }
    });
  }, [localStream, remoteStreams, remoteVideoRefs, localVideoRef]);

  // Additional effect to ensure video element gets stream when it becomes available
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      try {
        localVideoRef.current.srcObject = localStream;
        console.log("✅ Admin local video stream assigned via useEffect");
      } catch (err) {
        console.error("❌ Error assigning local stream to video element:", err);
      }
    }
  }, [localStream]);

  // Debug: Log callLogId changes
  useEffect(() => {
    console.log("🔍 callLogId changed to:", callLogId);

    // Validate callLogId format
    if (callLogId) {
      if (
        typeof callLogId !== "string" ||
        callLogId.length !== 24 ||
        !/^[0-9a-fA-F]{24}$/.test(callLogId)
      ) {
        console.warn("⚠️ Invalid callLogId format detected:", callLogId);
      } else {
        console.log("✅ Valid callLogId format confirmed");
      }
    }
  }, [callLogId]);

  // Fallback: Ensure we always have a valid callLogId when call is active
  useEffect(() => {
    console.log("🔄 CallLog creation useEffect triggered");
    console.log("callActive:", callActive);
    console.log("callLogId:", callLogId);
    console.log("sessionId:", sessionId);
    console.log("roomId:", roomId);
    console.log("roomType:", roomType);
    console.log("user:", user);

    if (callActive) {
      console.log("📞 Call is active, checking callLogId status...");
      console.log("Current callLogId:", callLogId);
      console.log("CallLogId type:", typeof callLogId);
      console.log("CallLogId length:", callLogId ? callLogId.length : "N/A");

      // If we don't have a valid callLogId, create a real one
      if (
        !callLogId ||
        (typeof callLogId === "string" && callLogId.length !== 24)
      ) {
        console.log(
          "⚠️ Invalid or missing callLogId detected! Creating real CallLog..."
        );

        // const createRealCallLog = async () => {
        //   try {
        //     console.log("🔄 Attempting to create CallLog in database...");
        //     console.log("Session ID:", sessionId || roomId);
        //     console.log("Room Type:", roomType);
        //     console.log("User ID:", user?.userId);

        //     // Validate required parameters
        //     const actualSessionId = sessionId || roomId;
        //     if (!actualSessionId) {
        //       console.error("❌ No sessionId or roomId available!");
        //       throw new Error("No session or room ID available");
        //     }

        //     // Create a real call log entry in the database
        //     console.log("📤 Calling adminVideoCallApi.createCallLog...");
        //     const response = await adminVideoCallApi.createCallLog(
        //       groupSessionId || actualSessionId, // Use groupSessionId if available, otherwise sessionId
        //       groupSessionId, // groupSessionId
        //       groupSessionId
        //         ? "group"
        //         : roomType === "group"
        //         ? "group"
        //         : "one-on-one", // type - prioritize groupSessionId
        //       [
        //         {
        //           userId: user?.userId || "admin-user",
        //           joinedAt: new Date(),
        //         },
        //       ]
        //     );

        //     console.log("📥 API Response:", response);

        //     if (response.callLog?._id) {
        //       console.log(
        //         "✅ Real CallLog created with ID:",
        //         response.callLog._id
        //       );
        //       setCallLogId(response.callLog._id);
        //     } else {
        //       throw new Error("API response missing callLog ID");
        //     }
        //   } catch (error) {
        //     console.error("❌ Failed to create CallLog via API:", error);
        //     console.error(
        //       "Error details:",
        //       error.response?.data || error.message
        //     );
        //     console.error("Error stack:", error.stack);

        //     // Immediate fallback to valid sample
        //     const fallbackId = "507f1f77bcf86cd799439011";
        //     console.log("🔧 Setting immediate fallback ObjectId:", fallbackId);
        //     setCallLogId(fallbackId);
        //   }
        // };

        // Execute immediately
        console.log("🚀 Executing createRealCallLog function...");
        // createRealCallLog();
      } else {
        console.log("✅ Valid callLogId already present");
      }
    } else {
      console.log("⏸️ Call is not active, skipping CallLog creation");
    }
  }, [callActive, callLogId, sessionId, roomId, roomType, user, setCallLogId]);

  const [screenSharing, setScreenSharing] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [callStatus, setCallStatus] = useState("connecting");
  const [incomingCall, setIncomingCall] = useState(false);
  const [callStartTime, setCallStartTime] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
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
      setSocketError(data.message || "An error occurred during the video call");
    };

    const handleJoinedCall = (data) => {
      console.log("=== ADMIN SUCCESSFULLY JOINED CALL ===");
      console.log("Join data:", data);
      setJoinedCall(true);
      setCallActive(true); // Set call as active when admin joins
      setCallStatus("connected");
      setSocketError(null); // Clear any previous errors
      console.log("✅ Admin joined call successfully");
      setError(null); // Clear any previous errors
      console.log("✅ Admin joined call successfully and call is now active");
    };

    const handleParticipantJoined = (data) => {
      console.log("=== ADMIN PARTICIPANT JOINED EVENT ===");
      console.log("Participant data:", data);
      console.log("Session details available:", !!sessionDetails);

      // Participants are validated through peer connections, not API calls
      // Allow all participants who successfully connect via WebRTC
      let isValidParticipant = true;
      let enhancedData = { ...data, isSelf: data.socketId === socket.id };
      
      console.log("✅ Admin participant joined via peer connection:", data.userId);

      // If the participant doesn't have a name, try to get it from socket data
      if (!enhancedData.name) {
        // Try to get name from the user prop if this is the current user
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
              : `Participant ${data.userId?.substring(0, 5) || data.socketId?.substring(0, 5) || "Unknown"}`);
        }
        
        console.log("Admin participant name assigned:", enhancedData.name);
      }

      // Only add valid participants to the list (avoid duplicates)
      if (isValidParticipant) {
        setParticipants((prev) => {
          // Check if participant already exists
          const exists = prev.some(
            (p) => p.userId === data.userId && p.socketId === data.socketId
          );
          if (exists) {
            console.log(
              "⚠️ Participant already exists (admin), skipping:",
              data.userId
            );
            return prev;
          }
          console.log("✅ Adding new participant (admin):", enhancedData);
          return [...prev, enhancedData];
        });
      } else {
        console.log(
          "❌ Invalid participant attempt blocked (admin):",
          data.userId
        );
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
  }, [socket, on, sessionDetails, setParticipants]);

  // Initialize media when properly connected and joined
  useEffect(() => {
    console.log("=== ADMIN MEDIA INITIALIZATION CHECK ===");
    console.log("Socket available:", !!socket);
    console.log("Socket connected:", connected);
    console.log("External connected:", externalConnected);
    console.log("Joined call status:", joinedCall);
    console.log("Local stream status:", !!localStream);
    console.log(
      "Can initialize:",
      socket && (externalConnected || connected) && joinedCall && !localStream
    );

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
      console.log("Admin: Initializing local media after joining call...");
      setIsInitializingMedia(true);
      setLocalError(null); // Clear any previous errors

      initLocalMedia()
        .then(() => {
          console.log("✅ Admin: Local media initialized successfully");
          setIsInitializingMedia(false);
        })
        .catch((err) => {
          console.error("❌ Admin: Error initializing media:", err);
          setIsInitializingMedia(false);
          setLocalError(
            err.message ||
              "Failed to access camera and microphone. Please check permissions and refresh the page."
          );
        });
    } else if (!socket) {
      console.log("⚠️ Admin: Socket not available yet");
    } else if (!(externalConnected || connected)) {
      console.log("⚠️ Admin: Not connected to socket");
    } else if (!joinedCall) {
      console.log("⚠️ Admin: Not joined call yet");
    } else if (localStream) {
      console.log("✅ Admin: Local stream already available");
    }
  }, [
    socket,
    externalConnected,
    connected,
    joinedCall,
    localStream,
    initLocalMedia,
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
      // Join the chat room
      socket.emit('join-room', {
        sessionId: sessionId
      });
      
      // Load existing messages
      loadChatMessages();
    }
  }, [sessionId, socket, externalConnected, connected]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, showChat]);

  // Participants are now populated through peer connections
  console.log("Admin: Participants will be populated through peer connections");

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
      const messageData = {
        content: newMessage.trim(),
        senderId: socket?.id,
        senderName: senderName,
        timestamp: new Date().toISOString()
      };
      
      // Send message via API
      await adminChatApi.sendMessage(sessionId, newMessage.trim());
      
      // Add to local chat messages immediately for better UX
      setChatMessages(prev => [...prev, messageData]);
      setNewMessage("");
      
      // Also broadcast via socket if available
      if (socket) {
        socket.emit("send-message", {
          roomId,
          roomType,
          message: messageData
        });
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
      setSocketError(data.message || "Connection error occurred");

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
      console.log("Successfully joined call:", data);
      setJoinedCall(true);
      setCallActive(true); // Set call as active when admin joins
      setCallStatus("connected");
      setSocketError(null); // Clear any previous errors
    };

    const handleParticipantJoined = (data) => {
      console.log("=== ADMIN PARTICIPANT JOINED EVENT ===");
      console.log("Participant data:", data);
      console.log("Session details available:", !!sessionDetails);

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
          console.log(
            "✅ Valid participant joined (admin):",
            enhancedData.name
          );
        }
      } else {
        // If no session details, allow participants but validate basic data
        if (data.userId && data.socketId) {
          isValidParticipant = true;
          console.log(
            "⚠️ No session details - allowing participant (admin):",
            data.userId
          );
        }
      }

      // Only add valid participants to the list
      if (isValidParticipant) {
        setParticipants((prev) => {
          const exists = prev.some(
            (p) => p.userId === data.userId && p.socketId === data.socketId
          );
          if (exists) {
            console.log(
              "⚠️ Participant already exists (admin), skipping:",
              data.userId
            );
            return prev;
          }
          console.log("✅ Adding new participant (admin):", enhancedData);
          return [...prev, enhancedData];
        });
      } else {
        console.log(
          "❌ Invalid participant attempt blocked (admin):",
          data.userId
        );
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
  }, [socket, on, onEndCall]);

  // Retry connection if it fails
  useEffect(() => {
    if (socketError && connectionAttempts < 3) {
      const timer = setTimeout(() => {
        setConnectionAttempts((prev) => prev + 1);
        setSocketError(null);
        // The socket will automatically reconnect
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [socketError, connectionAttempts]);

  // Set up socket listeners
  useEffect(() => {
    if (!socket || !(externalConnected || connected)) return;

    // Handle incoming offer
    const offerListener = (data) => {
      console.log("ADMIN: Offer received:", data);
      console.log("ADMIN: My socket ID:", socket.id);
      console.log("ADMIN: Sender ID:", data.senderId);

      // Only handle offers from other participants (not ourselves)
      if (data.senderId !== socket.id) {
        console.log("ADMIN: Processing offer from:", data.senderId);
        handleOffer(data.offer, data.senderId);
      } else {
        console.log("ADMIN: Ignoring own offer");
      }
    };

    // Handle WebRTC signaling events (new)
    const webRTCOfferListener = (data) => {
      console.log("ADMIN: WebRTC Offer received:", data);
      console.log("ADMIN: My socket ID:", socket.id);
      console.log("ADMIN: Sender ID:", data.senderId);

      if (data.senderId !== socket.id) {
        console.log("ADMIN: Processing WebRTC offer from:", data.senderId);
        handleOffer(data.offer, data.senderId);
      }
    };

    const webRTCAnswerListener = (data) => {
      console.log("ADMIN: WebRTC Answer received:", data);
      console.log("ADMIN: My socket ID:", socket.id);
      console.log("ADMIN: Sender ID:", data.senderId);

      if (data.senderId !== socket.id) {
        console.log("ADMIN: Processing WebRTC answer from:", data.senderId);
        handleAnswer(data.answer, data.senderId);
      }
    };

    const webRTCIceCandidateListener = (data) => {
      console.log("ADMIN: WebRTC ICE Candidate received:", data);
      console.log("ADMIN: My socket ID:", socket.id);
      console.log("ADMIN: Sender ID:", data.senderId);

      if (data.senderId !== socket.id) {
        console.log(
          "ADMIN: Processing WebRTC ICE candidate from:",
          data.senderId
        );
        handleIceCandidate(data.candidate, data.senderId);
      }
    };

    // Handle force-leave event from admin
    const forceLeaveListener = (data) => {
      console.log("Force leave event received:", data);
      if (data.userId === socket.id) {
        console.log("You have been removed from the session by admin");
        // End call locally
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
      console.log("ADMIN: Answer received:", data);
      console.log("ADMIN: My socket ID:", socket.id);
      console.log("ADMIN: Sender ID:", data.senderId);

      // Only handle answers from other participants (not ourselves)
      if (data.senderId !== socket.id) {
        console.log("ADMIN: Processing answer from:", data.senderId);
        handleAnswer(data.answer, data.senderId);
      } else {
        console.log("ADMIN: Ignoring own answer");
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
      console.log("Participant joined:", data);
      setParticipants((prev) => {
        // Avoid duplicates
        const exists = prev.some(
          (p) => p.userId === data.userId && p.socketId === data.socketId
        );
        if (exists) return prev;
        return [...prev, { ...data, isSelf: data.socketId === socket.id }];
      });
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
      console.log("Participant left:", data);
      // Remove the participant from the list
      setParticipants((prev) => {
        const updatedParticipants = prev.filter(
          (p) => p.userId !== data.userId
        );
        // If this was the last participant (other than admin), don't end the call
        // Admin session should continue even if all participants leave
        return updatedParticipants;
      });
    };

    // Handle call started - FIXED VERSION
    const callStartedListener = (data) => {
      console.log("=== CALL STARTED EVENT RECEIVED ===");
      console.log("Call started data:", data);
      console.log("callLogId in data:", data.callLogId);
      console.log("Current callLogId state:", callLogId);
      console.log("Session details available:", !!sessionDetails);
      console.log("Room ID:", roomId);

      setCallStatus("connected");
      setCallActive(true);
      setCallStartTime(Date.now());

      let finalCallLogId = null;

      if (data.callLogId) {
        finalCallLogId = data.callLogId;
        console.log("✅ Using callLogId from event:", data.callLogId);
      } else {
        console.warn("⚠️ No callLogId received in call-started event!");

        // Try multiple fallback options
        // Option 1: Use sessionDetails.sessionId if it looks like a valid ObjectId
        if (
          sessionDetails?.sessionId &&
          typeof sessionDetails.sessionId === "string" &&
          sessionDetails.sessionId.length === 24
        ) {
          finalCallLogId = sessionDetails.sessionId;
          console.log(
            "💡 Using sessionDetails.sessionId as fallback:",
            finalCallLogId
          );
        }
        // Option 2: Use roomId if it looks like a valid ObjectId
        else if (roomId && typeof roomId === "string" && roomId.length === 24) {
          finalCallLogId = roomId;
          console.log("💡 Using roomId as fallback:", finalCallLogId);
        }
        // Option 3: Use a valid MongoDB ObjectId sample
        else {
          finalCallLogId = "507f1f77bcf86cd799439011"; // Valid sample ObjectId
          console.log(
            "🔧 Using valid sample ObjectId as fallback:",
            finalCallLogId
          );
        }
      }

      // Always set the callLogId
      if (finalCallLogId) {
        setCallLogId(finalCallLogId);
        console.log("✅ Final callLogId set to:", finalCallLogId);
      } else {
        console.error("❌ FAILED to set any callLogId!");
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

    // Handle call ended - Asymmetric termination logic
    const callEndedListener = (data) => {
      console.log("Call ended by:", data.endedBy);
      console.log("Current socket ID:", socket.id);
      console.log("User role:", userRole);
      console.log("Initiator role:", data.initiatorRole);

      // Check if this is an admin-initiated termination
      const isAdminTermination =
        data.initiatorRole === "admin" || data.initiatorRole === "therapist";

      if (userRole === "admin" || userRole === "therapist") {
        // Admin/Therapist perspective
        if (isAdminTermination) {
          // Admin ended the call - this should end the monitoring session
          console.log("Admin-initiated termination: Ending monitoring session");
          setCallStatus("ended");
          setCallActive(false);
          setCallStartTime(null);
          setIncomingCall(false);
          setCallDuration(0);
          if (onEndCall) onEndCall();
        } else {
          // Client/patient ended the call - admin should stay in monitoring mode
          console.log(
            "Client-initiated termination: Keeping admin in monitoring mode"
          );
          // Remove the participant who left
          setParticipants((prev) =>
            prev.filter((p) => p.socketId !== data.endedBy)
          );
          // Keep admin session active for monitoring
          console.log("Patient left, admin monitoring continues");
        }
      } else {
        // Regular user perspective
        if (data.endedBy === socket.id) {
          // User themselves ended the call
          setCallStatus("ended");
          setCallActive(false);
          setCallStartTime(null);
          setIncomingCall(false);
          setCallDuration(0);
          if (onEndCall) onEndCall();
        } else {
          // Someone else ended the call, just remove them from participants
          setParticipants((prev) =>
            prev.filter((p) => p.socketId !== data.endedBy)
          );
          console.log("Participant left, user session continues");
        }
      }
    };

    // Handle audio toggle
    const audioToggleListener = (data) => {
      // Update UI to reflect other participant's audio status
    };

    // Handle video toggle
    const videoToggleListener = (data) => {
      // Update UI to reflect other participant's video status
    };

    // Handle screen share toggle
    const screenShareToggleListener = (data) => {
      // Update UI to reflect other participant's screen sharing status
    };

    // Handle user muted
    const userMutedListener = (data) => {
      // Handle if current user was muted by therapist
      if (data.userId === socket.id) {
        setAudioEnabled(false);
      }
    };

    // Handle chat message (from API)
    const chatMessageListener = (data) => {
      console.log("Admin received chat message:", data);
      
      // Determine sender name - use provided name or fallback
      const senderName = data.senderName || 
                        data.message?.senderName || 
                        (data.senderId === socket?.id ? (userInfo.name || user?.name || "Admin") : "Participant");
      
      // Add the received message to chat messages
      setChatMessages((prev) => [
        ...prev,
        {
          ...data.message,
          senderId: data.senderId || data.message.senderId,
          senderName: senderName,
          content: data.message.content || data.message.message || data.message.text,
          timestamp: data.message.timestamp || data.message.createdAt || new Date().toISOString()
        }
      ]);
    };

    // Handle real-time message broadcast
    const messageReceivedListener = (data) => {
      console.log("Admin received real-time message:", data);
      
      // Determine sender name - use provided name or fallback
      const senderName = data.senderName || 
                        data.message?.senderName || 
                        (data.senderId === socket?.id ? (userInfo.name || user?.name || "Admin") : "Participant");
      
      setChatMessages((prev) => [
        ...prev,
        {
          content: data.message.content || data.message.message || data.message.text || data.content,
          senderId: data.senderId || data.message?.senderId || socket?.id,
          senderName: senderName,
          timestamp: data.timestamp || data.message?.timestamp || data.createdAt || new Date().toISOString()
        }
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
    // Add WebRTC signaling listeners
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
      // Remove WebRTC signaling listeners
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
  ]);

  // Toggle audio
  const toggleAudioHandler = () => {
    try {
      const enabled = toggleAudio();
      setAudioEnabled(enabled);
    } catch (error) {
      console.error("Error toggling audio:", error);
      setSocketError("Failed to toggle audio");
    }
  };

  // Toggle video
  const toggleVideoHandler = () => {
    try {
      const enabled = toggleVideo();
      setVideoEnabled(enabled);
    } catch (error) {
      console.error("Error toggling video:", error);
      setSocketError("Failed to toggle video");
    }
  };

  // Toggle screen sharing
  const toggleScreenShareHandler = async () => {
    try {
      await toggleScreenShare();
      setScreenSharing(!screenSharing);
    } catch (error) {
      console.error("Error toggling screen share:", error);
      setSocketError("Failed to toggle screen sharing");
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
          <video
            ref={(el) => {
              if (el) {
                remoteVideoRefs.current[userId] = el;
                if (stream) {
                  try {
                    if (el.srcObject !== stream) {
                      el.srcObject = stream;
                      console.log(
                        `✅ Clinic monitoring: Remote video assigned for ${
                          participant.name || "Participant"
                        }`
                      );

                      // Ensure video plays properly
                      el.muted = true;
                      el.autoplay = true;
                      el.playsInline = true;

                      // Play the video
                      const playPromise = el.play();
                      if (playPromise !== undefined) {
                        playPromise
                          .then(() => {
                            console.log(
                              `✅ Clinic monitoring: Remote video playing for ${
                                participant.name || "Participant"
                              }`
                            );
                          })
                          .catch((error) => {
                            console.warn(
                              `⚠️ Clinic monitoring: Video autoplay failed for ${
                                participant.name || "Participant"
                              }:`,
                              error
                            );
                            // Try to play muted
                            el.muted = true;
                            el.play().catch((err) => {
                              console.error(
                                `❌ Clinic monitoring: Video play failed for ${
                                  participant.name || "Participant"
                                }:`,
                                err
                              );
                            });
                          });
                      }
                    }
                  } catch (err) {
                    console.error(
                      `❌ Clinic monitoring: Error assigning video for ${
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
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-white font-medium text-sm">
                  {participant.name || "Participant"}
                </p>
                <p className="text-slate-300 text-xs">
                  {participant.role === "therapist" ? "Therapist" : "Patient"}
                </p>
              </div>
            </div>
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
              <video
                ref={(el) => {
                  if (el) {
                    remoteVideoRefs.current[userId] = el;
                    if (stream) {
                      try {
                        if (el.srcObject !== stream) {
                          el.srcObject = stream;
                          console.log(
                            `✅ Clinic monitoring: Group video assigned for participant ${
                              index + 1
                            }`
                          );

                          // Ensure video plays
                          el.muted = true;
                          el.autoplay = true;
                          el.playsInline = true;

                          const playPromise = el.play();
                          if (playPromise !== undefined) {
                            playPromise.catch((error) => {
                              console.warn(
                                `⚠️ Clinic monitoring: Group video autoplay issue for participant ${
                                  index + 1
                                }:`,
                                error
                              );
                              el.muted = true;
                              el.play().catch((err) => {
                                console.error(
                                  `❌ Clinic monitoring: Group video play failed:`,
                                  err
                                );
                              });
                            });
                          }
                        }
                      } catch (err) {
                        console.error(
                          `❌ Clinic monitoring: Error with group video ${
                            index + 1
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
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700">
            <Video className="h-5 w-5 text-slate-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0"
              >
                Admin Monitoring
              </Badge>
              <span className="text-slate-500 text-xs font-medium">
                • Live Session
              </span>
            </div>
            <h1 className="text-white font-semibold tracking-tight">
              Remote Physiotherapy Monitoring
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Session ID: {sessionId}
            </p>
            <p className="text-slate-500 text-xs">
              {userInfo.name || user?.name || "Admin"} monitoring clinic session
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
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
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">
              Participants ({participants.length})
            </span>
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
            <MessageSquare className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Admin Chat</span>
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
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-medium">LIVE</span>
                </div>
                <p className="text-slate-200 text-xs">
                  Remote Physiotherapy Session
                </p>
              </div>

              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
                <div className="flex items-center gap-2 text-white text-sm">
                  <Users className="w-4 h-4" />
                  <span>
                    {participants.length} participant
                    {participants.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
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
              {participants.map((participant, index) => (
                <div
                  key={`${participant.userId || "unknown"}-${
                    participant.socketId || "unknown"
                  }`}
                  className="flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-sm">
                    {participant.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-medium text-sm">
                        {participant.name ||
                          (participant.firstName && participant.lastName
                            ? `${participant.firstName} ${participant.lastName}`
                            : null) ||
                          participant.displayName ||
                          `User ${
                            participant.userId?.substring(0, 5) || "Unknown"
                          }`}
                      </p>
                      {participant.isSelf ? (
                        <Badge className="bg-slate-800 text-slate-400 border-none text-[8px] h-4">
                          You
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-800 text-slate-400 border-none text-[8px] h-4">
                          {participant.role === "admin"
                            ? "Admin"
                            : participant.role === "therapist"
                            ? "Staff"
                            : "Patient"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs">
                      {participant.joinedAt
                        ? `Joined: ${new Date(
                            participant.joinedAt
                          ).toLocaleTimeString()}`
                        : ""}
                    </p>
                    {/* Admin Controls */}
                    {userRole === "admin" && !participant.isSelf && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="mt-2 text-xs h-6 px-2 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/20"
                        onClick={() => {
                          // Force leave participant
                          if (roomId && socket) {
                            socket.emit("force-leave", {
                              roomId,
                              userId: participant.userId,
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
              ))}
              {/* Add static entries if no participants yet */}
              {participants.length === 0 && (
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-sm">
                      {therapistInfo.name?.charAt(0)?.toUpperCase() || "T"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-medium text-sm">
                          {therapistInfo.name}
                        </p>
                        <Badge className="bg-slate-800 text-slate-400 border-none text-[8px] h-4">
                          Staff
                        </Badge>
                      </div>
                      <p className="text-slate-500 text-xs">Active</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-sm">
                      {userInfo.initials}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">
                        {userInfo.name}
                      </p>
                      <p className="text-slate-500 text-xs">You</p>
                    </div>
                  </div>
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
          <div className="md:w-80 w-full bg-slate-900 md:border-l border-slate-800 flex flex-col animate-in slide-in-from-right duration-300 md:relative absolute inset-0 md:inset-auto md:right-0 z-50">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-white font-semibold">Admin Chat</h3>
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
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="flex flex-col justify-center items-center text-center h-full py-8">
                  <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 border border-slate-700">
                    <MessageSquare className="h-5 w-5 text-slate-500" />
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
                    className={`flex ${message.senderId === socket?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                        message.senderId === socket?.id
                          ? 'bg-emerald-500 text-white rounded-br-md'
                          : 'bg-slate-800 text-slate-100 rounded-bl-md border border-slate-700'
                      }`}
                    >
                      <p className="text-[10px] font-semibold mb-1 opacity-80">
                        {message.senderId === socket?.id 
                          ? (userInfo.name || user?.name || "Admin")
                          : (message.senderName || 'Participant')}
                      </p>
                      <p>{message.content || message.message}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          message.senderId === socket?.id
                            ? 'text-emerald-100 opacity-80'
                            : 'text-slate-400'
                        }`}
                      >
                        {new Date(message.timestamp || message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              
              {/* Typing indicators */}
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-bl-md px-4 py-3 text-sm border border-slate-700">
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <span className="ml-2 text-xs">
                        {typingUsers.length === 1 ? 'Someone is typing...' : `${typingUsers.length} people typing...`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-800">
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
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-slate-500 placeholder:text-slate-600"
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
          className={`absolute md:bottom-8 md:right-8 bottom-4 right-4 md:w-64 md:h-44 w-44 h-36 rounded-[2rem] overflow-hidden border-4 border-slate-900 shadow-2xl transition-all duration-500 ${
            showParticipants || showChat ? "md:translate-x-[-320px]" : ""
          }`}
        >
          <video
            ref={(el) => {
              if (el) {
                localVideoRef.current = el;
                if (localStream) {
                  try {
                    el.srcObject = localStream;
                    console.log(
                      "✅ Admin local video ref and srcObject assigned"
                    );
                  } catch (err) {
                    console.error(
                      "❌ Error assigning admin local video srcObject:",
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
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="w-32 hidden md:flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-slate-700 text-slate-500"
            >
              HD 1080p
            </Badge>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button
              variant={audioEnabled ? "secondary" : "destructive"}
              size="icon"
              className="rounded-2xl md:w-14 md:h-14 w-12 h-12 bg-slate-800 hover:bg-slate-700 border-slate-700"
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
              className="rounded-2xl md:w-14 md:h-14 w-12 h-12 bg-slate-800 hover:bg-slate-700 border-slate-700"
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
              className={`rounded-2xl md:w-14 md:h-14 w-12 h-12 border-slate-700 ${
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
                  className={`rounded-2xl md:w-16 md:h-16 w-14 h-14 border-2 ${
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
              className="rounded-2xl md:w-16 md:h-14 w-14 h-12 bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 ml-4"
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

          <div className="w-32 flex justify-end">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
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
                        console.log("Toggle recording");
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
                        console.log("View session logs");
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
                        console.log(
                          "Admin: Local media re-initialized successfully"
                        );
                      })
                      .catch((err) => {
                        console.error(
                          "Admin: Error re-initializing media:",
                          err
                        );
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
              onClick={() => setSocketError(null)}
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