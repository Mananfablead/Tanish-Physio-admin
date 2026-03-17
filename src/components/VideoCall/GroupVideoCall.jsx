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
  Monitor,
  Volume2,
  VolumeX,
  User,
  Crown,
} from "lucide-react";
import useSocket from "@/hooks/useSocket";
import useWebRTC from "@/hooks/useWebRTC";
import { adminVideoCallApi } from "@/lib/videoCallApi";
import { adminChatApi } from "@/lib/chatApi";
import WaitingNotification from "@/components/WaitingRoom/WaitingNotification";

const GroupVideoCall = ({
  groupSessionId,
  userRole = "admin",
  onEndCall,
  user,
}) => {
  const { socket, connected, error, emit, on, setError } = useSocket(
    groupSessionId,
    "group"
  );

  const [joinedCall, setJoinedCall] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [participantAudioStatus, setParticipantAudioStatus] = useState({});
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [groupSessionDetails, setGroupSessionDetails] = useState(null);
  const [callDuration, setCallDuration] = useState(0);

  const {
    localStream,
    remoteStreams,
    callActive,
    callStarted,
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
  } = useWebRTC(groupSessionId, socket, userRole);

  // Local state for tracking if call has started (used for UI purposes)
  const [callHasStarted, setCallHasStarted] = useState(false);

  // Timer for call duration
  useEffect(() => {
    let interval;
    if (callActive) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callActive]);

  // Update local video when localStream changes
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      try {
        console.log('📹 Assigning local stream to video element in GroupVideoCall');
        // Check if it's a valid MediaStream before accessing tracks
        if (typeof localStream.getTracks === 'function') {
          console.log('📹 Local stream tracks:', localStream.getTracks().length);
        }
        localVideoRef.current.srcObject = localStream;
      } catch (err) {
        console.error('Error assigning local stream to video element:', err);
        console.error('Local stream value:', localStream);
      }
    }
  }, [localStream]);

  // Format call duration
  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Initialize media and join call
  useEffect(() => {
    let hasJoinedRoom = false; // Prevent duplicate joins
    
    const initializeCall = async () => {
      try {
        if (!socket || !connected) {
          console.log('⏳ Waiting for socket connection...');
          return;
        }

        // Wait a bit to ensure socket is fully established
        await new Promise(resolve => setTimeout(resolve, 200));

        // Prevent duplicate initialization
        if (hasJoinedRoom) {
          console.log('⏭️ Already joined room, skipping initialization');
          return;
        }

        console.log('✅ Socket is connected, initializing...');
        console.log('📋 GroupVideoCall props:', {
          groupSessionId,
          userRole,
          hasSocket: !!socket,
          isConnected: connected,
        });

        // Initialize local media FIRST before joining room
        console.log('🎥 Initializing local media...');
        const mediaResult = await initLocalMedia();
        console.log('✅ Local media initialized:', mediaResult ? 'SUCCESS' : 'FAILED');
        console.log('📹 Local stream tracks:', localStream?.getTracks().length);

        // Join the group session - send ONLY groupSessionId field (not sessionId)
        console.log('📡 Emitting join-room with:', {
          groupSessionId: groupSessionId,
          sessionId: undefined,
        });
        
        socket.emit("join-room", {
          groupSessionId: groupSessionId,
          sessionId: undefined, // Explicitly set to undefined so backend knows it's a group session
        });

        hasJoinedRoom = true;
        console.log('✅ join-room emitted successfully');
        setJoinedCall(true);
      } catch (err) {
        console.error("Error initializing group call:", err);
        setError("Failed to initialize group call: " + err.message);
      }
    };

    initializeCall();
    
    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up GroupVideoCall initialization');
      hasJoinedRoom = false;
    };
  }, [socket, connected, groupSessionId]); // Keep dependencies minimal

  // Fetch group session details
  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        const response = await adminVideoCallApi.getSessionParticipants(
          groupSessionId
        );
        if (response.success) {
          setGroupSessionDetails(response.data);
        }
      } catch (error) {
        console.error("Error fetching group session details:", error);
      }
    };

    fetchSessionDetails();
  }, [groupSessionId]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const offerListener = (data) => handleOffer(data.offer, data.senderId);
    const answerListener = (data) => handleAnswer(data.answer, data.senderId);
    const iceCandidateListener = (data) =>
      handleIceCandidate(data.candidate, data.senderId);

    const participantJoinedListener = (data) => {
      console.log('🎉 ADMIN: Participant joined event:', data);
      setParticipants((prev) => {
        // Check by socketId first (most reliable)
        const existsBySocketId = prev.some((p) => p.socketId === data.socketId);
        if (existsBySocketId) {
          console.log('⚠️ Participant already exists (by socketId):', data.socketId);
          return prev;
        }
        
        // Also check by userId
        const existsByUserId = prev.some((p) => p.userId === data.userId);
        if (existsByUserId) {
          console.log('⚠️ Participant already exists (by userId):', data.userId);
          return prev;
        }

        const newParticipant = {
          socketId: data.socketId,
          userId: data.userId,
          name: data.name || (data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : `Participant ${data.userId?.slice(0, 5) || 'Unknown'}`),
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role || "participant",
          email: data.email,
          isSelf: data.userId === user?._id,
          isTherapist: data.isTherapist,
          isUser: data.isUser,
          joinedAt: data.joinedAt || new Date().toISOString(),
        };
        
        console.log('✅ Adding new participant:', newParticipant);
        const updated = [...prev, newParticipant];
        console.log('📊 Total participants:', updated.length);
        return updated;
      });
      
      // Initialize audio status for the new participant (default to enabled)
      if (data.userId) {
        setParticipantAudioStatus(prev => ({
          ...prev,
          [data.userId]: true // Audio enabled by default
        }));
      }
    };

    const participantLeftListener = (data) => {
      setParticipants((prev) => prev.filter((p) => p.userId !== data.userId));
      
      // Remove audio status for the leaving participant
      if (data.userId) {
        setParticipantAudioStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[data.userId];
          return newStatus;
        });
      }
    };

    const groupCallStartedListener = (data) => {
      setCallActive(true);
      setCallHasStarted(true);
    };

    const groupCallEndedListener = (data) => {
      setCallActive(false);
      setCallHasStarted(false);
      if (onEndCall) onEndCall();
    };

    const participantStatusChangedListener = (data) => {
      setParticipants((prev) =>
        prev.map((p) =>
          p.userId === data.userId
            ? { ...p, isMuted: data.isMuted, isVideoOff: data.isVideoOff }
            : p
        )
      );
      
      // Update audio status for the participant
      if (data.userId) {
        setParticipantAudioStatus(prev => ({
          ...prev,
          [data.userId]: !data.isMuted // Store whether audio is enabled (opposite of muted)
        }));
      }
    };

    const participantScreenSharingListener = (data) => {

    };

    const messageReceivedListener = (data) => {
      console.log('💬 Message received:', data);
      setChatMessages((prev) => [
        ...prev,
        {
          user: data.senderName || 'Participant',
          message: data.content,
          timestamp: data.timestamp || new Date().toISOString(),
        },
      ]);
    };

    // Add listeners
    on("offer", offerListener);
    on("answer", answerListener);
    on("ice-candidate", iceCandidateListener);
    on("participant-joined", participantJoinedListener);
    on("participant-left", participantLeftListener);
    on("group-call-started", groupCallStartedListener);
    on("group-call-ended", groupCallEndedListener);
    on("participant-status-changed", participantStatusChangedListener);
    on("participant-screen-sharing", participantScreenSharingListener);
    on("message-received", messageReceivedListener);

    return () => {
      socket.off("offer", offerListener);
      socket.off("answer", answerListener);
      socket.off("ice-candidate", iceCandidateListener);
      socket.off("participant-joined", participantJoinedListener);
      socket.off("participant-left", participantLeftListener);
      socket.off("group-call-started", groupCallStartedListener);
      socket.off("group-call-ended", groupCallEndedListener);
      socket.off(
        "participant-status-changed",
        participantStatusChangedListener
      );
      socket.off(
        "participant-screen-sharing",
        participantScreenSharingListener
      );
      socket.off("message-received", messageReceivedListener);
    };
  }, [
    socket,
    on,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    setCallActive,
    setParticipants,
    user,
    onEndCall,
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

  // Toggle screen share
  const toggleScreenShareHandler = async () => {
    try {
      const isSharing = await toggleScreenShare();
      setScreenSharing(isSharing);

      if (socket) {
        socket.emit(isSharing ? "screen-share-start" : "screen-share-stop", {
          groupSessionId,
          userId: user?._id,
        });
      }
    } catch (error) {
      console.error("Error toggling screen share:", error);
      setError("Failed to toggle screen share");
    }
  };

  // Mute participant (admin only)
  const handleMuteParticipant = (userId) => {
    if (userRole === "admin") {
      muteUser(userId);

      if (socket) {
        socket.emit("participant-muted", {
          groupSessionId,
          userId,
          isMuted: true,
        });
      }
    }
  };

  // Send chat message
  const sendChatMessage = async () => {
    if (!newMessage.trim() || !groupSessionId) return;

    try {
      // Generate UUID for message deduplication
      const messageId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );

      const senderName = user?.name || "Admin";

      // Send message via socket
      setNewMessage("");

      if (socket && socket.connected) {
        socket.emit("send-message", {
          roomId: groupSessionId,
          roomType: "group",
          message: {
            content: newMessage.trim(),
            messageId: messageId,
            attachments: [],
          },
        });
        console.log(
          "Message sent via socket with messageId:",
          messageId
        );
      }
    } catch (error) {
      console.error("Error sending chat message:", error);
      setError("Failed to send message");
    }
  };

  // Render participant videos in grid
  const renderParticipantVideos = () => {
    const participantKeys = Object.keys(remoteStreams);

    if (participantKeys.length === 0) {
      return (
        <div className="flex items-center justify-center w-full h-full bg-slate-900 rounded-xl">
          <div className="text-center text-slate-500">
            <Users className="mx-auto h-12 w-12 mb-2" />
            <p>Waiting for participants...</p>
          </div>
        </div>
      );
    }

    // Grid layout based on participant count
    let gridClass = "grid gap-2 w-full h-full";

    if (participantKeys.length === 1) {
      gridClass += " grid-cols-1";
    } else if (participantKeys.length === 2) {
      gridClass += " grid-cols-2 grid-rows-1";
    } else if (participantKeys.length <= 4) {
      gridClass += " grid-cols-2 grid-rows-2";
    } else if (participantKeys.length <= 6) {
      gridClass += " grid-cols-3 grid-rows-2";
    } else {
      gridClass += " grid-cols-3 grid-rows-3";
    }

    return (
      <div className={gridClass}>
        {participantKeys.map((userId, index) => {
          // Try to find participant by userId first, then by socketId matching
          const participant = participants.find((p) => p.userId === userId);
          
          // Fallback: try to match by other properties if userId doesn't match
          const matchedParticipant = participant || participants.find((p) => {
            // Check if this remote stream belongs to this participant
            const remoteStream = remoteStreams[userId];
            return remoteStream && p.socketId && remoteStream.id.includes(p.socketId);
          });
          
          const displayName = matchedParticipant?.name || 
                             (matchedParticipant?.firstName && matchedParticipant?.lastName) ? 
                               `${matchedParticipant.firstName} ${matchedParticipant.lastName}` : 
                               `Participant ${index + 1}`;
          
          return (
            <div
              key={userId}
              className="relative bg-black rounded-lg overflow-hidden border border-slate-700"
            >
              <video
                ref={(el) => (remoteVideoRefs.current[userId] = el)}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Participant info overlay */}
              <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {matchedParticipant?.isSelf && (
                    <Crown className="h-3 w-3 text-yellow-400" />
                  )}
                  <span className="truncate">
                    {displayName}
                  </span>
                </div>

                <div className="flex gap-1">
                  {matchedParticipant?.isMuted && (
                    <MicOff className="h-3 w-3 text-red-400" />
                  )}
                  {matchedParticipant?.isVideoOff && (
                    <VideoOff className="h-3 w-3 text-red-400" />
                  )}
                  {matchedParticipant?.isSelf && (
                    <User className="h-3 w-3 text-blue-400" />
                  )}
                </div>
              </div>

              {/* Admin controls for each participant */}
              {userRole === "admin" && !matchedParticipant?.isSelf && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-6 w-6 p-0 bg-red-500/20 hover:bg-red-500/30"
                    onClick={() => handleMuteParticipant(matchedParticipant.userId)}
                  >
                    <VolumeX className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <X className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Connection Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Waiting Room Notification for group sessions */}
      <WaitingNotification
        socket={socket}
        sessionId={groupSessionId}
        onPatientApproved={() => {}}
      />
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-blue-400" />
            <h1 className="text-lg font-semibold">Group Session Monitor</h1>
          </div>
          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
            {participants.length} participants
          </Badge>
          {callActive && (
            <Badge variant="secondary" className="font-mono">
              {formatDuration(callDuration)}
            </Badge>
          )}
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
            <span className="hidden md:inline">Participants</span>
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
            <span className="hidden md:inline">Chat</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={onEndCall}
            className="flex items-center gap-2"
          >
            <PhoneOff className="h-4 w-4" />
            <span className="hidden sm:inline">End Session</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 relative p-4">
          {renderParticipantVideos()}

          {/* Local video preview */}
          <div className="absolute bottom-4 right-4 w-48 h-32 bg-black rounded-lg overflow-hidden border-2 border-slate-600">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
              You
            </div>
          </div>
        </div>

        {/* Participants Panel */}
        {showParticipants && (
          <div className="w-80 bg-slate-900 border-l border-slate-700 flex flex-col">
            <div className="p-4 border-b border-slate-700">
              <h3 className="font-semibold">
                Participants ({participants.length})
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {participants.map((participant) => (
                <div
                  key={participant.userId}
                  className="flex items-center gap-3 mb-3 p-2 bg-slate-800 rounded"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                    {participant.isSelf ? (
                      <Crown className="h-4 w-4 text-yellow-400" />
                    ) : (
                      <User className="h-4 w-4 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {participant.name}
                        {participant.isSelf && " (You)"}
                      </span>
                      {participant.isSelf && (
                        <Crown className="h-3 w-3 text-yellow-400" />
                      )}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {participant.isMuted && (
                        <MicOff className="h-3 w-3 text-red-400" />
                      )}
                      {participant.isVideoOff && (
                        <VideoOff className="h-3 w-3 text-red-400" />
                      )}
                      {!participant.isMuted && !participant.isVideoOff && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  {userRole === "admin" && !participant.isSelf && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-6 w-6 p-0"
                      onClick={() => handleMuteParticipant(participant.userId)}
                    >
                      <VolumeX className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Panel */}
        {showChat && (
          <div className="w-80 bg-slate-900 border-l border-slate-700 flex flex-col">
            <div className="p-4 border-b border-slate-700">
              <h3 className="font-semibold">Group Chat</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {chatMessages.map((msg, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium text-slate-300">{msg.user}</div>
                    <div className="text-slate-400">{msg.message}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-slate-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                />
                <Button size="sm" onClick={sendChatMessage}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="bg-slate-900 border-t border-slate-700 p-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            size="lg"
            variant={audioEnabled ? "secondary" : "destructive"}
            className="rounded-full h-12 w-12"
            onClick={toggleAudioHandler}
          >
            {audioEnabled ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </Button>

          <Button
            size="lg"
            variant={videoEnabled ? "secondary" : "destructive"}
            className="rounded-full h-12 w-12"
            onClick={toggleVideoHandler}
          >
            {videoEnabled ? (
              <Video className="h-5 w-5" />
            ) : (
              <VideoOff className="h-5 w-5" />
            )}
          </Button>

          <Button
            size="lg"
            variant={screenSharing ? "default" : "secondary"}
            className="rounded-full h-12 w-12"
            onClick={toggleScreenShareHandler}
          >
            <Share className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupVideoCall;
