import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  Monitor,
  MonitorOff,
  Users,
  Volume2,
  VolumeX,
  Settings,
  MessageCircle,
  MoreHorizontal,
  X,
  UserPlus,
  Volume1,
  Square,
} from "lucide-react";
import useSocket from "@/hooks/useSocket";
import useWebRTC from "@/hooks/useWebRTC";
import { adminVideoCallApi } from "@/lib/videoCallApi";
import { adminChatApi } from "@/lib/chatApi";

const VideoCall = ({
  roomId,
  roomType = "session",
  userRole = "admin",
  onEndCall,
  sessionId, // Add sessionId prop for API calls
  connected: externalConnected = false, // Add connected prop from parent
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

  // Initialize media when socket connects
  useEffect(() => {
    console.log("Admin: Socket connected status:", connected);
    console.log("Admin: Joined call status:", joinedCall);
    console.log("Admin: Local stream status:", !!localStream);

    if (connected && !localStream) {
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
  }, [connected, joinedCall, localStream, initLocalMedia]);

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
      setParticipants((prev) => prev.filter((p) => p.userId !== data.userId));

      // If this was the last participant, end the call
      if (participants.length <= 1) {
        setCallStatus("ended");
        if (onEndCall) onEndCall();
      }
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
      setCallStatus("ended");
      setCallActive(false);
      setCallStartTime(null);
      setIncomingCall(false);
      setCallDuration(0);
      if (onEndCall) onEndCall();
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
        <div className="flex items-center justify-center w-full h-full bg-gray-900 rounded-xl">
          <div className="text-center text-gray-400">
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
          <div className="flex items-center justify-center w-full h-full bg-gray-900 rounded-xl">
            <div className="text-center text-gray-400">
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
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
        <div className="text-center text-white">
          <Phone className="mx-auto h-16 w-16 mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Call Ended</h2>
          <p className="text-gray-400">The call has been ended.</p>
        </div>
      </div>
    );
  }

  if (incomingCall && !callStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
        <div className="text-center text-white">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="h-12 w-12" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Incoming Call</h2>
          <p className="text-gray-400">From your therapist</p>
          <div className="flex justify-center gap-4 mt-6">
            <Button
              variant="destructive"
              size="lg"
              className="rounded-full h-14 w-14"
              onClick={rejectCall}
            >
              <Phone className="h-6 w-6" />
            </Button>
            <Button
              variant="default"
              size="lg"
              className="rounded-full h-14 w-14 bg-green-500 hover:bg-green-600"
              onClick={acceptCall}
            >
              <Phone className="h-6 w-6 rotate-180" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-semibold text-white">
              {roomType === "group" ? "Group Session" : "Video Call"}
            </h1>
            <p className="text-xs text-gray-400">
              {joinedCall
                ? "Connected"
                : connected
                ? "Joining call..."
                : "Connecting..."}
              {callActive && callDuration > 0 && (
                <span className="ml-2">
                  • {Math.floor(callDuration / 60)}:
                  {String(callDuration % 60).padStart(2, "0")}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            onClick={() => setShowParticipants(!showParticipants)}
          >
            <Users className="h-4 w-4" />
            <span className="ml-1">{participants.length}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            onClick={() => setShowChat(!showChat)}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
          {/* Remote Videos */}
          <div
            className={`lg:col-span-3 ${
              showParticipants || showChat ? "lg:col-span-2" : "lg:col-span-3"
            }`}
          >
            {renderRemoteVideos()}
          </div>

          {/* Local Video */}
          <div
            className={`relative ${
              showParticipants || showChat ? "lg:hidden" : "lg:block"
            } h-48 lg:h-full`}
          >
            <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
              {localStream ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <div className="text-center text-gray-400">
                    <Video className="mx-auto h-8 w-8 mb-2" />
                    <p>Camera Off</p>
                  </div>
                </div>
              )}
              {!videoEnabled && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                  <VideoOff className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                You
              </div>
            </div>
          </div>

          {/* Side Panels */}
          {showParticipants && (
            <div className="lg:col-span-1 bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Participants</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  onClick={() => setShowParticipants(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {participants.map((participant, index) => (
                  <div
                    key={`${participant.userId}-${participant.socketId}`}
                    className="flex items-center gap-3 p-2 bg-gray-700 rounded"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs">
                      {participant.isTherapist ? "T" : "P"}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        {participant.isSelf
                          ? "You (Therapist)"
                          : participant.isTherapist
                          ? "Another Therapist"
                          : `Patient ${index + 1}`}
                      </p>
                      <p className="text-xs text-gray-400">
                        {participant.joinedAt
                          ? `Joined: ${new Date(
                              participant.joinedAt
                            ).toLocaleTimeString()}`
                          : ""}
                      </p>
                      {/* Admin Controls */}
                      {(userRole === "therapist" || userRole === "admin") &&
                        !participant.isTherapist && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="mt-1 text-xs"
                            onClick={() => {
                              // Force leave participant or other admin action
                              if (roomId) {
                                // TODO: Add force leave API endpoint
                              }
                            }}
                          >
                            Force Leave
                          </Button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Admin Tools */}
              {(userRole === "therapist" || userRole === "admin") && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <h4 className="font-medium text-white mb-2">Admin Tools</h4>
                  <div className="space-y-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        // Mute all participants
                        participants.forEach((participant) => {
                          if (!participant.isTherapist) {
                            muteUser(participant.userId);
                          }
                        });
                      }}
                    >
                      Mute All
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        // End call for all participants
                        endCall();
                      }}
                    >
                      End Call for All
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {showChat && (
            <div className="lg:col-span-1 bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Chat</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  onClick={() => setShowChat(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="h-64 overflow-y-auto mb-4">
                {chatMessages.length > 0 ? (
                  <div className="space-y-2">
                    {chatMessages.map((msg, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium text-blue-400">
                          {msg.senderId?.name || "Unknown"}:
                        </span>
                        <span className="text-gray-300 ml-2">
                          {msg.message}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="mx-auto h-8 w-8 mb-2" />
                    <p>No messages yet</p>
                  </div>
                )}
                {typingUsers.length > 0 && (
                  <div className="text-xs text-gray-400 italic">
                    {typingUsers.length} user{typingUsers.length > 1 ? "s" : ""}{" "}
                    typing...
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      sendChatMessage();
                    }
                  }}
                  onFocus={handleTyping}
                  onBlur={handleStopTyping}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Button size="sm" onClick={sendChatMessage}>
                  Send
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={audioEnabled ? "secondary" : "destructive"}
            size="icon"
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
            variant={videoEnabled ? "secondary" : "destructive"}
            size="icon"
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
            variant={screenSharing ? "default" : "secondary"}
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={toggleScreenShareHandler}
          >
            {screenSharing ? (
              <MonitorOff className="h-5 w-5" />
            ) : (
              <Monitor className="h-5 w-5" />
            )}
          </Button>

          {(userRole === "therapist" || userRole === "admin") && (
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full h-12 w-12 bg-purple-600 hover:bg-purple-700"
              onClick={startCall}
              disabled={callStarted}
            >
              <Volume2 className="h-5 w-5" />
            </Button>
          )}

          <Button
            variant="destructive"
            size="icon"
            className="rounded-full h-14 w-14 bg-red-500 hover:bg-red-600"
            onClick={
              userRole === "therapist" || userRole === "admin"
                ? endCall
                : () => emit("leave-room", { roomId, roomType })
            }
          >
            <Phone className="h-6 w-6" />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end lg:items-center justify-center z-50">
          <div className="bg-gray-800 rounded-t-lg lg:rounded-lg p-6 w-full lg:w-96 max-w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Settings</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
                onClick={() => setShowSettings(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Video Quality
                </label>
                <select className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option>Auto</option>
                  <option>720p</option>
                  <option>1080p</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Audio Input
                </label>
                <select className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option>Default Microphone</option>
                  <option>Headset Microphone</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Audio Output
                </label>
                <select className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option>Default Speaker</option>
                  <option>Headphones</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg z-50 max-w-md">
          <div className="flex items-start gap-2">
            <X className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm opacity-90">{error}</p>
              {connectionAttempts < 3 && (
                <p className="text-xs opacity-75 mt-1">
                  Retrying... ({connectionAttempts + 1}/3)
                </p>
              )}
            </div>
            <button
              onClick={() => setError(null)}
              className="text-white hover:text-gray-200"
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