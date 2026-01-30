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
  isTherapist = false, // Add isTherapist prop
  onEndCall,
  sessionId, // Add sessionId prop for API calls
  connected: externalConnected = false, // Add connected prop from parent
  user, // Add user prop to get user info
}) => {
  const { socket, connected, error, emit, on, setError } = useSocket(
    roomId,
    roomType
  );

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
  } = useWebRTC(roomId, socket, userRole);

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [callStatus, setCallStatus] = useState("connecting"); // connecting, connected, ringing, missed, ended
  const [incomingCall, setIncomingCall] = useState(false);
  const [callStartTime, setCallStartTime] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [therapistInfo, setTherapistInfo] = useState({ name: "", specialty: "" });
  const [userInfo, setUserInfo] = useState({ name: "", initials: "" });

  // Initialize media when socket connects
  useEffect(() => {
    console.log("Admin: Socket connected status:", connected);
    console.log("Admin: Joined call status:", joinedCall);
    console.log("Admin: Local stream status:", !!localStream);

    if (socket && connected && !localStream) {
      console.log("Admin: Initializing local media...");
      initLocalMedia()
        .then(() => {
          console.log("Admin: Local media initialized successfully");
        })
        .catch((err) => {
          console.error("Admin: Error initializing media:", err);
          setError(
            "Failed to access camera and microphone. Please check permissions."
          );
        });
    }
  }, [socket, connected, joinedCall, localStream, initLocalMedia]);

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

  // Load chat messages
  useEffect(() => {
    if (sessionId) {
      loadChatMessages();
    }
  }, [sessionId]);

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
      await adminChatApi.sendMessage(sessionId, newMessage.trim());
      setNewMessage("");
      await loadChatMessages(); // Refresh messages
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
      setError(data.message || "Connection error occurred");
      setCallStatus("ended");
    };

    const handleJoinedCall = (data) => {
      console.log("Successfully joined call:", data);
      setJoinedCall(true);
      setCallStatus("connected");
      setError(null); // Clear any previous errors
    };

    const handleParticipantJoined = (data) => {
      console.log("Participant joined (admin):", data);
      // Update participants list
      setParticipants((prev) => {
        const exists = prev.some(
          (p) => p.userId === data.userId && p.socketId === data.socketId
        );
        if (exists) return prev;
        return [...prev, { ...data, isSelf: data.socketId === socket.id }];
      });
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
  }, [socket, on]);

  // Retry connection if it fails
  useEffect(() => {
    if (error && connectionAttempts < 3) {
      const timer = setTimeout(() => {
        setConnectionAttempts((prev) => prev + 1);
        setError(null);
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

    // Handle call started
    const callStartedListener = (data) => {
      setCallStatus("connected");
      setCallActive(true);
      setCallStartTime(Date.now());
      if (data.callLogId) {
        setCallLogId(data.callLogId);
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
      console.log("Call ended by:", data.endedBy);
      // Only end admin session if admin themselves ended the call
      if (data.endedBy === socket.id) {
        setCallStatus("ended");
        setCallActive(false);
        setCallStartTime(null);
        setIncomingCall(false);
        setCallDuration(0);
        if (onEndCall) onEndCall();
      } else {
        // If someone else ended the call, just remove them from participants
        setParticipants((prev) =>
          prev.filter((p) => p.socketId !== data.endedBy)
        );
        // Keep admin session active
        console.log("Participant left, admin session continues");
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

    // Handle chat message
    const chatMessageListener = (data) => {
      setChatMessages((prev) => [...prev, data.message]);
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
    cleanupFunctions.push(on("typing", typingListener));
    cleanupFunctions.push(on("stop-typing", stopTypingListener));

    // Cleanup listeners
    return () => {
      cleanupFunctions.forEach((cleanup) => {
        if (typeof cleanup === "function") {
          cleanup();
        }
      });
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
  ]);

  // Toggle audio
  const toggleAudioHandler = () => {
    try {
      const enabled = toggleAudio();
      setAudioEnabled(enabled);
    } catch (error) {
      console.error("Error toggling audio:", error);
      setError("Failed to toggle audio");
    }
  };

  // Toggle video
  const toggleVideoHandler = () => {
    try {
      const enabled = toggleVideo();
      setVideoEnabled(enabled);
    } catch (error) {
      console.error("Error toggling video:", error);
      setError("Failed to toggle video");
    }
  };

  // Toggle screen sharing
  const toggleScreenShareHandler = async () => {
    try {
      await toggleScreenShare();
      setScreenSharing(!screenSharing);
    } catch (error) {
      console.error("Error toggling screen share:", error);
      setError("Failed to toggle screen sharing");
    }
  };

  // Render remote videos based on room type
  const renderRemoteVideos = () => {
    if (roomType === "session") {
      // 1-on-1 call - single remote video
      const userId = Object.keys(remoteStreams)[0];
      if (userId) {
        return (
          <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
            <video
              ref={(el) => (remoteVideoRefs.current[userId] = el)}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        );
      }
      return (
        <div className="flex items-center justify-center w-full h-full bg-slate-900 rounded-xl">
          <div className="text-center text-slate-500">
            <Users className="mx-auto h-12 w-12 mb-2" />
            <p>Waiting for participant...</p>
          </div>
        </div>
      );
    } else {
      // Group call - grid of videos
      const streamKeys = Object.keys(remoteStreams);
      if (streamKeys.length === 0) {
        return (
          <div className="flex items-center justify-center w-full h-full bg-slate-900 rounded-xl">
            <div className="text-center text-slate-500">
              <Users className="mx-auto h-12 w-12 mb-2" />
              <p>Waiting for participants...</p>
            </div>
          </div>
        );
      }

      if (streamKeys.length === 1) {
        // Single participant
        return (
          <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
            <video
              ref={(el) => (remoteVideoRefs.current[streamKeys[0]] = el)}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        );
      } else {
        // Multiple participants - grid layout
        return (
          <div className="grid grid-cols-2 grid-rows-2 gap-2 w-full h-full">
            {streamKeys.map((userId, index) => (
              <div
                key={userId}
                className="relative bg-black rounded-lg overflow-hidden"
              >
                <video
                  ref={(el) => (remoteVideoRefs.current[userId] = el)}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  Participant {index + 1}
                </div>
              </div>
            ))}
          </div>
        );
      }
    }
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
          <p className="text-slate-500 mb-6">{therapistInfo.name} is ready to connect</p>
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
<<<<<<< HEAD
            <h1 className="text-white font-semibold tracking-tight">{therapistInfo.name} Session</h1>
            <p className="text-slate-500 text-xs mt-1">Session ID: {sessionId}</p>
            <p className="text-slate-500 text-xs">
              {userInfo.name} monitoring {therapistInfo.name}
            </p>
=======
            <h1 className="text-white font-semibold tracking-tight">
              Session Monitoring
            </h1>
>>>>>>> 028fe05f4447466a124211e01a1ae2437b6566c9
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
            <span className="hidden md:inline">Participants ({participants.length})</span>
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
        {/* Main Video (Primary Participant) */}
        <div
          className={`flex-1 relative flex items-center justify-center transition-all duration-500 ${
            showParticipants || showChat ? "md:mr-0" : ""
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-950/50 pointer-events-none" />
          <div className="text-center">
            <div className="w-40 h-40 bg-slate-900 rounded-[2.5rem] mx-auto mb-6 flex items-center justify-center border border-slate-800 shadow-2xl relative overflow-hidden">
<<<<<<< HEAD
              <img 
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face" 
                alt={therapistInfo.name} 
                className="w-full h-full object-cover opacity-60" 
              />
            </div>
            <h2 className="text-2xl font-semibold text-white tracking-tight mb-2">{therapistInfo.name}</h2>
            <p className="text-slate-500 font-medium">{therapistInfo.specialty}</p>
=======
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face"
                alt="Participant"
                className="w-full h-full object-cover opacity-60"
              />
            </div>
            <h2 className="text-2xl font-semibold text-white tracking-tight mb-2">
              Primary Participant
            </h2>
            <p className="text-slate-500 font-medium">
              Monitoring Active Session
            </p>
>>>>>>> 028fe05f4447466a124211e01a1ae2437b6566c9
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
                  key={`${participant.userId}-${participant.socketId}`}
                  className="flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-sm">
                    {participant.name?.charAt(0)?.toUpperCase() || participant.userId?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-medium text-sm">
                        {participant.isTherapist ? therapistInfo.name : userInfo.name}
                      </p>
                      <Badge className="bg-slate-800 text-slate-400 border-none text-[8px] h-4">
<<<<<<< HEAD
                        {participant.isTherapist ? "Staff" : "You"}
=======
                        {participant.isSelf
                          ? "You"
                          : participant.isTherapist
                          ? "Staff"
                          : "User"}
>>>>>>> 028fe05f4447466a124211e01a1ae2437b6566c9
                      </Badge>
                    </div>
                    <p className="text-slate-500 text-xs">
                      {participant.joinedAt
                        ? `Joined: ${new Date(
                            participant.joinedAt
                          ).toLocaleTimeString()}`
                        : "Active"}
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
<<<<<<< HEAD
              {/* Add static entries if no participants yet */}
              {participants.length === 0 && (
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-sm">
                      {therapistInfo.name?.charAt(0)?.toUpperCase() || 'T'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-medium text-sm">{therapistInfo.name}</p>
                        <Badge className="bg-slate-800 text-slate-400 border-none text-[8px] h-4">Staff</Badge>
                      </div>
                      <p className="text-slate-500 text-xs">Active</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-sm">
                      {userInfo.initials}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{userInfo.name}</p>
                      <p className="text-slate-500 text-xs">You</p>
                    </div>
                  </div>
                </>
              )}
              
=======

>>>>>>> 028fe05f4447466a124211e01a1ae2437b6566c9
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
            <div className="flex-1 p-6 flex flex-col justify-center items-center text-center">
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
            <div className="p-6 border-t border-slate-800">
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
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-slate-500 placeholder:text-slate-600"
                />
                <Button
                  size="icon"
                  className="bg-slate-100 hover:bg-white text-slate-900 rounded-xl"
                  onClick={sendChatMessage}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* Self Video (Admin View) */}
        <div
          className={`absolute md:bottom-8 md:right-8 bottom-4 right-4 md:w-64 md:h-44 w-44 h-36 rounded-[2rem] overflow-hidden border-4 border-slate-900 shadow-2xl transition-all duration-500 ${
            showParticipants || showChat ? "md:translate-x-[-320px]" : ""
          }`}
        >
          <div className="w-full h-full bg-slate-800 relative flex items-center justify-center">
            <div className="text-center">
              <div className="w-14 h-14 bg-slate-700 rounded-2xl mx-auto mb-2 flex items-center justify-center border border-slate-600">
                <Video className="h-6 w-6 text-slate-500" />
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Admin View
              </p>
            </div>
            {!videoEnabled && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
                <VideoOff className="h-6 w-6 text-slate-400" />
              </div>
            )}
          </div>
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

            {userRole === "admin" && (
              <Button
                variant="secondary"
                size="icon"
                className="rounded-2xl md:w-14 md:h-14 w-12 h-12 bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-600"
                onClick={startCall}
                disabled={callStarted}
              >
                <Users className="h-5 w-5" />
              </Button>
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

            <Button
              variant="secondary"
              size="icon"
              className="rounded-2xl md:w-14 md:h-14 w-12 h-12 bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>
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
                  <span className="text-xs text-slate-500">Excellent</span>
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

      {error && (
        <div className="fixed top-4 right-4 bg-rose-500 text-white p-4 rounded-xl z-50 max-w-md border border-rose-400 shadow-lg shadow-rose-500/20">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <X className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Connection Error</p>
              <p className="text-sm opacity-90 mt-1">{error}</p>
              {connectionAttempts < 3 && (
                <p className="text-xs opacity-75 mt-2">
                  Retrying... ({connectionAttempts + 1}/3)
                </p>
              )}
            </div>
            <button
              onClick={() => setError(null)}
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