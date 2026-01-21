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

const VideoCall = ({
  roomId,
  roomType = "session",
  isTherapist = false,
  onEndCall,
}) => {
  const { socket, connected, error, emit, on } = useSocket(roomId, roomType);
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
  } = useWebRTC(roomId, socket, isTherapist);

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

  // Initialize media when socket connects
  useEffect(() => {
    if (connected && !localStream) {
      initLocalMedia().catch((err) =>
        console.error("Error initializing media:", err)
      );
    }
  }, [connected, localStream, initLocalMedia]);

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

  // Set up socket listeners
  useEffect(() => {
    if (!socket) return;

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
      setParticipants((prev) => [...prev, data]);
      if (data.isTherapist && !isTherapist) {
        setIncomingCall(true);
      }
    };

    // Handle participant left
    const participantLeftListener = (data) => {
      setParticipants((prev) => prev.filter((p) => p.userId !== data.userId));
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
      setCallStatus("ended");
      setCallActive(false);
      setCallStartTime(null);
      setIncomingCall(false);
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

    // Add listeners
    on("offer", offerListener);
    on("answer", answerListener);
    on("ice-candidate", iceCandidateListener);
    on("participant-joined", participantJoinedListener);
    on("participant-left", participantLeftListener);
    on("call-started", callStartedListener);
    on("call-accepted", callAcceptedListener);
    on("call-rejected", callRejectedListener);
    on("call-ended", callEndedListener);
    on("audio-toggle", audioToggleListener);
    on("video-toggle", videoToggleListener);
    on("screen-share-toggle", screenShareToggleListener);
    on("user-muted", userMutedListener);

    // Cleanup listeners
    return () => {
      socket.off("offer", offerListener);
      socket.off("answer", answerListener);
      socket.off("ice-candidate", iceCandidateListener);
      socket.off("participant-joined", participantJoinedListener);
      socket.off("participant-left", participantLeftListener);
      socket.off("call-started", callStartedListener);
      socket.off("call-accepted", callAcceptedListener);
      socket.off("call-rejected", callRejectedListener);
      socket.off("call-ended", callEndedListener);
      socket.off("audio-toggle", audioToggleListener);
      socket.off("video-toggle", videoToggleListener);
      socket.off("screen-share-toggle", screenShareToggleListener);
      socket.off("user-muted", userMutedListener);
    };
  }, [
    socket,
    on,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    isTherapist,
    onEndCall,
  ]);

  // Toggle audio
  const toggleAudioHandler = () => {
    const enabled = toggleAudio();
    setAudioEnabled(enabled);
  };

  // Toggle video
  const toggleVideoHandler = () => {
    const enabled = toggleVideo();
    setVideoEnabled(enabled);
  };

  // Toggle screen sharing
  const toggleScreenShareHandler = () => {
    toggleScreenShare();
    setScreenSharing(!screenSharing);
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
              {connected ? "Connected" : "Connecting..."}
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
                    key={participant.userId}
                    className="flex items-center gap-3 p-2 bg-gray-700 rounded"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs">
                      {participant.isUser ? "P" : "T"}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        {participant.isTherapist
                          ? "Therapist"
                          : `Participant ${index}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="mx-auto h-8 w-8 mb-2" />
                  <p>No messages yet</p>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Button size="sm">Send</Button>
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

          {isTherapist && (
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
              isTherapist
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
        <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg z-50">
          {error}
        </div>
      )}
    </div>
  );
};

export default VideoCall;
