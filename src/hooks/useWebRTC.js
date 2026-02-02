// Ensure global is available for simple-peer
if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
    window.global = window;
}

import { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'simple-peer';

const useWebRTC = (roomId, socket, userRole = 'admin') => {
    const [peers, setPeers] = useState({});
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState({});
    const [callActive, setCallActive] = useState(false);
    const [callStarted, setCallStarted] = useState(false);
    const [callLogId, setCallLogId] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [userIdentity, setUserIdentity] = useState(null);
    const [initialized, setInitialized] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingStatus, setRecordingStatus] = useState('stopped'); // 'stopped', 'starting', 'recording'
    const [recorder, setRecorder] = useState(null);
    const [recordedChunks, setRecordedChunks] = useState([]);

    // Prevent cleanup on page refresh
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            // Store call state in sessionStorage to preserve it
            if (callActive) {
                sessionStorage.setItem('callState', JSON.stringify({
                    roomId,
                    callActive: true,
                    callStarted: callStarted,
                    timestamp: Date.now()
                }));
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [roomId, callActive, callStarted]);

    const peerRefs = useRef({});
    const localVideoRef = useRef(null);
    const remoteVideoRefs = useRef({});
    const localStreamRef = useRef(null);

    // Helper function to update both state and ref
    const updateLocalStream = useCallback((stream) => {
        setLocalStream(stream);
        localStreamRef.current = stream;
    }, []);

    // Initialize local media with timeout and retry logic
    const initLocalMedia = async (retryCount = 0) => {
        if (!socket) {
            throw new Error('Socket not connected');
        }

        const maxRetries = 3;
        const timeoutMs = 10000; // 10 seconds timeout

        try {
            console.log(`Initializing local media (attempt ${retryCount + 1}/${maxRetries + 1})`);

            // Create timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Media initialization took too long. Please check camera/microphone permissions and try again.'));
                }, timeoutMs);
            });

            // Try to get media with timeout
            const mediaPromise = navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            const stream = await Promise.race([mediaPromise, timeoutPromise]);

            updateLocalStream(stream);
            console.log('✅ Media initialized successfully');
            return stream;

        } catch (error) {
            console.error('Error accessing media devices:', error);

            // Handle specific error types
            if (error.name === 'NotAllowedError') {
                throw new Error('Camera and microphone access denied. Please enable permissions in browser settings and refresh the page.');
            } else if (error.name === 'NotFoundError') {
                throw new Error('No camera or microphone found. Please connect devices and try again.');
            } else if (error.name === 'OverconstrainedError') {
                // Try with basic constraints
                if (retryCount < maxRetries) {
                    console.log('Retrying with basic constraints...');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return initLocalMedia(retryCount + 1);
                }
                throw new Error('Device constraints not supported. Please check your camera/microphone specifications.');
            } else if (error.message.includes('took too long')) {
                // Timeout error - try again with audio only
                if (retryCount < maxRetries) {
                    console.log('Timeout occurred, trying audio only...');
                    try {
                        const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
                            audio: true,
                            video: false
                        });
                        updateLocalStream(audioOnlyStream);
                        console.log('✅ Audio-only mode initialized');
                        return audioOnlyStream;
                    } catch (audioError) {
                        console.error('Audio-only also failed:', audioError);
                        throw new Error('Please check your camera and microphone permissions, then refresh the page.');
                    }
                }
                throw error;
            } else if (error.name === 'NotReadableError') {
                throw new Error('Camera/microphone is being used by another application. Please close other apps and try again.');
            } else {
                // For other errors, try audio-only as fallback
                if (retryCount < maxRetries) {
                    console.log('Trying audio only mode...');
                    try {
                        const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
                            audio: true,
                            video: false
                        });
                        updateLocalStream(audioOnlyStream);
                        console.log('✅ Audio-only mode initialized');
                        return audioOnlyStream;
                    } catch (audioError) {
                        console.error('Audio only also failed:', audioError);
                        throw new Error('Please check your camera and microphone permissions, then refresh the page.');
                    }
                }
                throw error;
            }
        }
    };

    // Create peer connection
    const createPeer = (userId, initiator, stream) => {
        console.log("=== ADMIN CREATING PEER CONNECTION ===");
        console.log("User ID:", userId);
        console.log("Initiator:", initiator);
        console.log("Local stream available:", !!localStream);
        console.log("Local stream tracks:", localStream ? localStream.getTracks().length : 0);
        console.log("Provided stream:", !!stream);
        console.log("Socket connected:", socket?.connected);
        console.log("Socket ID:", socket?.id);
        console.log("User Role:", userRole);
        console.log("Participants count:", Object.keys(peerRefs.current).length);

        // Clean up existing peer connection if it exists
        if (peerRefs.current[userId]) {
            console.log("ADMIN: Cleaning up existing peer connection for:", userId);
            peerRefs.current[userId].destroy();
            delete peerRefs.current[userId];
        }

        // Check if we have a valid stream before creating peer
        const finalStream = stream || localStream;
        if (!finalStream) {
            console.error('❌ No stream available to create peer connection for user:', userId);
            return null;
        }

        // Validate stream tracks
        const audioTracks = finalStream.getAudioTracks();
        const videoTracks = finalStream.getVideoTracks();

        if (audioTracks.length === 0 && videoTracks.length === 0) {
            console.error('❌ Stream has no audio or video tracks for user:', userId);
            return null;
        }

        console.log(`✅ Stream validation passed - Audio tracks: ${audioTracks.length}, Video tracks: ${videoTracks.length}`);

        let peer;
        try {
            console.log('Creating new Peer connection for user:', userId, 'with stream:', !!finalStream);

            peer = new Peer({
                initiator,
                trickle: false, // Set to false for more reliable connection
                stream: finalStream,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                        { urls: 'stun:stun.stunprotocol.org:3478' },
                        { urls: 'stun:stun.voiparound.com:3478' },
                        // Add TURN servers for better connectivity
                        {
                            urls: 'turn:openrelay.metered.ca:80',
                            username: 'openrelayproject',
                            credential: 'openrelayproject'
                        },
                        {
                            urls: 'turn:openrelay.metered.ca:443',
                            username: 'openrelayproject',
                            credential: 'openrelayproject'
                        }
                    ]
                }
            });

            console.log('Peer object created:', !!peer);

            // Verify peer was created successfully and has required methods
            if (!peer) {
                console.error('Peer is null/undefined');
                return null;
            }

            // Check if peer has basic methods
            if (typeof peer.on !== 'function') {
                console.error('Peer object missing .on method');
                console.error('Peer type:', typeof peer);
                console.error('Peer keys:', Object.keys(peer || {}));
                return null;
            }

            if (typeof peer.signal !== 'function') {
                console.error('Peer object missing .signal method');
                return null;
            }

            if (typeof peer.destroy !== 'function') {
                console.error('Peer object missing .destroy method');
                return null;
            }

            console.log('Peer object verified successfully');
        } catch (error) {
            console.error('Error creating peer connection for user:', userId, error);
            console.error('Error details:', error.message, error.stack);
            return null;
        }

        // Log when peer is ready
        peer.on('connect', () => {
            console.log('✅ ADMIN Peer connection established with:', userId);
        });

        // Properly handle stream events
        peer.on('stream', (remoteStream) => {
            console.log("=== ADMIN REMOTE STREAM RECEIVED ===");
            console.log("From user:", userId);
            console.log("Stream ID:", remoteStream.id);
            console.log("Stream tracks:", remoteStream.getTracks());
            console.log("Stream active:", remoteStream.active);
            console.log("Stream track kinds:", remoteStream.getTracks().map(t => t.kind));
            console.log("Current remote streams count:", Object.keys(remoteStreams).length);

            // Validate remote stream
            if (!remoteStream || remoteStream.getTracks().length === 0) {
                console.error("❌ Invalid remote stream received");
                return;
            }

            // Ensure stream is active
            if (!remoteStream.active) {
                console.warn("⚠️ ADMIN Remote stream is not active, waiting...");
                // Wait for stream to become active
                const checkActive = setInterval(() => {
                    if (remoteStream.active) {
                        console.log("✅ ADMIN Remote stream became active");
                        clearInterval(checkActive);
                        processRemoteStream(remoteStream, userId);
                    }
                }, 100);

                // Timeout after 5 seconds
                setTimeout(() => {
                    clearInterval(checkActive);
                    if (!remoteStream.active) {
                        console.error("❌ ADMIN Remote stream failed to activate within 5 seconds");
                    }
                }, 5000);
                return;
            }

            processRemoteStream(remoteStream, userId);
        });

        // Helper function to process remote stream
        const processRemoteStream = (remoteStream, userId) => {
            console.log("=== ADMIN PROCESSING REMOTE STREAM ===");
            console.log("User ID:", userId);
            console.log("Stream ID:", remoteStream.id);

            setRemoteStreams(prev => {
                const newState = {
                    ...prev,
                    [userId]: remoteStream
                };
                console.log("✅ ADMIN Remote streams updated:", Object.keys(newState));
                return newState;
            });

            // Immediate video element update
            updateRemoteVideoElement(userId, remoteStream);

            // Fallback updates
            setTimeout(() => updateRemoteVideoElement(userId, remoteStream), 100);
            setTimeout(() => updateRemoteVideoElement(userId, remoteStream), 500);
            setTimeout(() => updateRemoteVideoElement(userId, remoteStream), 1000);
        };

        // Helper function to update video element
        const updateRemoteVideoElement = (userId, stream) => {
            // Check if ref exists, if not, try again after a short delay
            if (!remoteVideoRefs.current[userId]) {
                 setTimeout(() => {
                    updateRemoteVideoElement(userId, stream);
                }, 100);
                return;
            }

            // Check if ref exists, if not, try again after a short delay
            if (!remoteVideoRefs.current[userId]) {
                 setTimeout(() => {
                    updateRemoteVideoElement(userId, stream);
                }, 100);
                return;
            }

            if (remoteVideoRefs.current[userId] && stream) {
                try {
                    const videoElement = remoteVideoRefs.current[userId];
                    if (videoElement.srcObject !== stream) {
                        videoElement.srcObject = stream;
                        console.log(`✅ ADMIN Remote video element updated for user: ${userId}`);

                        // Ensure video plays
                        videoElement.muted = true; // Mute to allow autoplay
                        videoElement.autoplay = true;
                        videoElement.playsInline = true;

                        // Play the video
                        const playPromise = videoElement.play();
                        if (playPromise !== undefined) {
                            playPromise
                                .then(() => {
                                    console.log(`✅ ADMIN Remote video playing for user: ${userId}`);
                                })
                                .catch(error => {
                                    console.warn(`⚠️ ADMIN Remote video autoplay failed for ${userId}:`, error);
                                    // Try to play muted
                                    videoElement.muted = true;
                                    videoElement.play().catch(err => {
                                        console.error(`❌ ADMIN Remote video play failed for ${userId}:`, err);
                                    });
                                });
                        }
                    }
                } catch (err) {
                    console.error(`❌ Error setting admin remote video srcObject for ${userId}:`, err);
                }
            } else {
                console.log(`⚠️ ADMIN Remote video ref or stream not available for: ${userId}`);
            }
        };

        peer.on('signal', (data) => {
            if (!socket) return;

            console.log("📡 ADMIN Sending signal data:", data.type);
            console.log("Signal data:", JSON.stringify(data, null, 2));

            if (data.type === 'offer') {
                socket.emit('offer', {
                    roomId,
                    offer: data,
                    senderId: socket.id
                });
            } else if (data.type === 'answer') {
                socket.emit('answer', {
                    roomId,
                    answer: data,
                    senderId: socket.id,
                    targetId: userId
                });
            } else if (data.type === 'candidate') {
                socket.emit('ice-candidate', {
                    roomId,
                    candidate: data,
                    senderId: socket.id,
                    targetId: userId
                });
            }
        });

        peer.on('close', () => {
            setRemoteStreams(prev => {
                const newState = { ...prev };
                delete newState[userId];
                return newState;
            });
            delete peerRefs.current[userId];
        });

        peer.on('error', (err) => {
            console.error('❌ ADMIN Peer connection error for user', userId, ':', err);
            // Add more detailed error logging
            if (err.code === 'ERR_CONNECTION_FAILURE') {
                console.error('Connection failure - check network/firewall');
            } else if (err.code === 'ERR_DATA_CHANNEL') {
                console.error('Data channel error');
            } else if (err.code === 'ERR_ICE_CONNECTION_FAILURE') {
                console.error('ICE connection failed - check STUN/TURN servers');
            } else if (err.code === 'ERR_SIGNALING') {
                console.error('Signaling error - check socket connection');
            }

            // Clean up failed peer connection
            if (peerRefs.current[userId]) {
                try {
                    peerRefs.current[userId].destroy();
                } catch (destroyErr) {
                    console.error('Error destroying admin peer:', destroyErr);
                }
                delete peerRefs.current[userId];
            }
        });

        peerRefs.current[userId] = peer;
        return peer;
    };

    // Handle incoming offer
    const handleOffer = async (offer, senderId) => {
        console.log("=== ADMIN HANDLE OFFER CALLED ===");
        console.log("Offer received from:", senderId);
        console.log("Offer data:", JSON.stringify(offer, null, 2));
        console.log("Socket available:", !!socket);
        console.log("Socket connected:", socket?.connected);
        console.log("Local stream available:", !!localStream);

        // Clean up any existing connection with this user
        if (peerRefs.current[senderId]) {
            console.log("🧹 ADMIN: Cleaning up existing connection before handling offer");
            peerRefs.current[senderId].destroy();
            delete peerRefs.current[senderId];
        }

        if (!localStream) {
            console.log("📱 ADMIN: Initializing local media...");
            await initLocalMedia();
        }

        console.log("🔄 ADMIN: Creating peer connection for:", senderId);
        const peer = createPeer(senderId, false, localStream);
        if (!peer) {
            console.error("❌ ADMIN: Failed to create peer connection for:", senderId);
            return;
        }
        console.log("📡 ADMIN: Signaling offer...");
        try {
            await peer.signal(offer);
            console.log("✅ ADMIN: Offer handled successfully");
        } catch (error) {
            console.error("❌ ADMIN: Error handling offer:", error);
        }
    };

    // Handle incoming answer
    const handleAnswer = async (answer, senderId) => {
        console.log("=== ADMIN HANDLE ANSWER CALLED ===");
        console.log("Answer received from:", senderId);

        if (peerRefs.current[senderId]) {
            try {
                await peerRefs.current[senderId].signal(answer);
                console.log("✅ ADMIN: Answer handled successfully");
            } catch (error) {
                console.error("❌ ADMIN: Error handling answer:", error);
            }
        } else {
            console.log("⚠️ ADMIN: No peer connection found for:", senderId);
            // Create peer connection if not exists and handle the answer
            if (!localStream) {
                await initLocalMedia();
            }
            const peer = createPeer(senderId, false, localStream);
            if (!peer) {
                console.error("❌ ADMIN: Failed to create peer connection for:", senderId);
                return;
            }
            try {
                await peer.signal(answer);
                console.log("✅ ADMIN: Answer handled with new peer connection");
            } catch (error) {
                console.error("❌ ADMIN: Error handling answer with new peer:", error);
            }
        }
    };

    // Handle ICE candidate
    const handleIceCandidate = async (candidate, senderId) => {
        if (peerRefs.current[senderId]) {
            await peerRefs.current[senderId].signal(candidate);
        }
    };

    // Toggle audio
    const toggleAudio = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                if (socket) {
                    socket.emit('audio-toggle', {
                        roomId,
                        muted: !audioTrack.enabled
                    });
                }
                return audioTrack.enabled;
            }
        }
        return false;
    };

    // Toggle video
    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                if (socket) {
                    socket.emit('video-toggle', {
                        roomId,
                        videoEnabled: videoTrack.enabled
                    });
                }
                return videoTrack.enabled;
            }
        }
        return false;
    };

    // Toggle screen sharing
    const toggleScreenShare = async () => {
        if (!localStream) return;

        const screenTrack = localStream.getVideoTracks().find(track => track.label.includes('Screen'));

        if (screenTrack) {
            // Stop screen sharing and revert to camera
            screenTrack.stop();
            const cameraTrack = await navigator.mediaDevices.getUserMedia({ video: true });
            localStream.addTrack(cameraTrack.getVideoTracks()[0]);

            if (socket) {
                socket.emit('screen-share-toggle', {
                    roomId,
                    sharing: false
                });
            }
        } else {
            // Start screen sharing
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true
                });

                const videoTrack = screenStream.getVideoTracks()[0];
                const oldTrack = localStream.getVideoTracks().find(track => !track.label.includes('Screen'));

                if (oldTrack) {
                    oldTrack.stop();
                }

                localStream.removeTrack(oldTrack);
                localStream.addTrack(videoTrack);

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = localStream;
                }

                if (socket) {
                    socket.emit('screen-share-toggle', {
                        roomId,
                        sharing: true
                    });
                }
            } catch (error) {
                console.error('Error sharing screen:', error);
            }
        }
    };

    // Mute a specific user (therapist only)
    const muteUser = (userId) => {
        if ((userRole === 'therapist' || userRole === 'admin') && socket) {
            socket.emit('mute-user', {
                roomId,
                userIdToMute: userId,
                roomType: roomId.startsWith('group') ? 'group' : 'session'
            });
        }
    };

    // End call (therapist only)
    const endCall = () => {
        if ((userRole === 'therapist' || userRole === 'admin') && socket) {
            console.log('Admin ending call for room:', roomId);
            socket.emit('end-call', {
                roomId,
                roomType: roomId.startsWith('group') ? 'group' : 'session'
            });

            // Also trigger local call ending for immediate UI update
            if (typeof setCallActive === 'function') {
                setCallActive(false);
            }
            if (typeof setCallStatus === 'function') {
                setCallStatus('ended');
            }
        }
    };

    // Start call (therapist only)
    const startCall = () => {
        if ((userRole === 'therapist' || userRole === 'admin') && socket) {
            socket.emit('call-start', {
                roomId,
                roomType: roomId.startsWith('group') ? 'group' : 'session'
            });
            setCallStarted(true);
        }
    };

    // Accept call
    const acceptCall = () => {
        if (socket) {
            socket.emit('call-accept', {
                roomId,
                roomType: roomId.startsWith('group') ? 'group' : 'session'
            });
        }
    };

    // Reject call
    const rejectCall = () => {
        if (socket) {
            socket.emit('call-reject', {
                roomId,
                roomType: roomId.startsWith('group') ? 'group' : 'session'
            });
        }
    };

    // Handle socket events for WebRTC signaling and participants
    useEffect(() => {
        if (!socket) return;

        // Handle WebRTC signaling events
        const handleWebRTCOffer = (data) => {
            console.log('=== ADMIN WEBRTC OFFER RECEIVED ===');
            console.log('Offer data:', data);
            console.log('Sender ID:', data.senderId);
            console.log('My socket ID:', socket.id);

            if (data.senderId !== socket.id) {
                handleOffer(data.offer, data.senderId);
            }
        };

        const handleWebRTCAnswer = (data) => {
            console.log('=== ADMIN WEBRTC ANSWER RECEIVED ===');
            console.log('Answer data:', data);
            console.log('Sender ID:', data.senderId);

            if (data.senderId !== socket.id) {
                handleAnswer(data.answer, data.senderId);
            }
        };

        const handleWebRTCIceCandidate = (data) => {
            console.log('=== ADMIN WEBRTC ICE CANDIDATE RECEIVED ===');
            console.log('ICE candidate data:', data);
            console.log('Sender ID:', data.senderId);

            if (data.senderId !== socket.id) {
                handleIceCandidate(data.candidate, data.senderId);
            }
        };

        const handleParticipantJoined = (data) => {
            console.log('ADMIN: Participant joined:', data);
            console.log('ADMIN: Participant role data:', data.role, data.isTherapist);
            setParticipants(prev => {
                // Avoid duplicates by checking both userId and socketId
                const exists = prev.some(p =>
                    p.userId === data.userId && p.socketId === data.socketId
                );
                if (exists) {
                    console.log('ADMIN: Participant already exists, skipping');
                    return prev;
                }
                const newParticipant = {
                    userId: data.userId,
                    socketId: data.socketId,
                    role: data.role || (data.isTherapist ? 'therapist' : (data.isUser ? 'patient' : userRole)),
                    isTherapist: data.isTherapist || (data.role === 'therapist' || data.role === 'admin'),
                    isUser: data.isUser || (data.role === 'patient'),
                    joinedAt: new Date(),
                    isSelf: data.socketId === socket.id
                };
                console.log('ADMIN: Adding new participant:', newParticipant);
                return [...prev, newParticipant];
            });

            // If the participant is a client/patient, create offer
            if (data.role === 'patient' || !data.role || (data.isUser || data.role === 'client' || data.isUser === true)) {
                console.log('ADMIN: Patient joined, creating offer');
                setTimeout(async () => {
                    // Use the ref to get the current localStream value
                    let currentLocalStream = localStreamRef.current;

                    if (!currentLocalStream) {
                        await initLocalMedia();
                        // Get the updated stream after initialization
                        currentLocalStream = localStreamRef.current;
                    }

                    // Ensure local stream is available before creating peer
                    if (!currentLocalStream) {
                        console.error('❌ Local stream still not available after init for patient:', data.socketId);
                        return;
                    }

                    // Create offer for the patient
                    const peer = createPeer(data.socketId, true, currentLocalStream);
                    if (!peer) {
                        console.error('Failed to create peer connection for patient:', data.socketId);
                        return;
                    }
                    console.log('ADMIN: Created offer for patient:', data.socketId);
                }, 1000); // Increased timeout to ensure media is ready
            }

            // If the participant is an admin/therapist and this is client joining admin's perspective, handle appropriately
            if (data.role === 'admin' || data.role === 'therapist' || data.isTherapist) {
                console.log('ADMIN: Another admin/therapist joined, preparing to handle their offer');
                // Just make sure our local stream is ready to respond to offers
                if (!localStream) {
                    setTimeout(async () => {
                        await initLocalMedia();
                    }, 500);
                }
            }
        };

        const handleParticipantLeft = (data) => {
            console.log('ADMIN: Participant left:', data);
            setParticipants(prev => {
                const filtered = prev.filter(p =>
                    p.userId !== data.userId && p.socketId !== data.socketId
                );
                console.log('ADMIN: Participants after removal:', filtered);
                return filtered;
            });
        };

        const handleJoinedCall = (data) => {
            console.log('ADMIN: Joined call successful:', data);
            // Set current user identity
            const identity = {
                userId: socket.user?.userId,
                socketId: socket.id,
                role: userRole,
                isTherapist: userRole === 'therapist' || userRole === 'admin',
                isUser: userRole === 'patient'
            };
            setUserIdentity(identity);
            console.log('ADMIN: User identity set:', identity);

            // Add self to participants list
            setParticipants(prev => {
                const selfExists = prev.some(p => p.socketId === socket.id);
                if (!selfExists) {
                    const selfParticipant = {
                        userId: socket.user?.userId,
                        socketId: socket.id,
                        role: userRole,
                        isTherapist: userRole === 'therapist' || userRole === 'admin',
                        isUser: userRole === 'patient',
                        joinedAt: new Date(),
                        isSelf: true
                    };
                    console.log('ADMIN: Adding self to participants:', selfParticipant);
                    return [...prev, selfParticipant];
                }
                return prev;
            });
        };

        // Add WebRTC signaling listeners
        socket.on('webrtc-offer-received', handleWebRTCOffer);
        socket.on('webrtc-answer-received', handleWebRTCAnswer);
        socket.on('webrtc-ice-candidate-received', handleWebRTCIceCandidate);

        // Add participant listeners
        socket.on('participant-joined', handleParticipantJoined);
        socket.on('participant-left', handleParticipantLeft);
        socket.on('joined-call', handleJoinedCall);

        // Cleanup
        return () => {
            socket.off('webrtc-offer-received', handleWebRTCOffer);
            socket.off('webrtc-answer-received', handleWebRTCAnswer);
            socket.off('webrtc-ice-candidate-received', handleWebRTCIceCandidate);
            socket.off('participant-joined', handleParticipantJoined);
            socket.off('participant-left', handleParticipantLeft);
            socket.off('joined-call', handleJoinedCall);
        };
    }, [socket, userRole, setParticipants, handleOffer, handleAnswer, handleIceCandidate, initLocalMedia, createPeer, localStream]);

    // Cleanup on unmount - but preserve call on page refresh
    useEffect(() => {
        return () => {
            // Check if this is a page refresh/unload vs component unmount
            const isPageUnload = typeof window !== 'undefined' && (window.performance?.navigation?.type === 1 || window.event?.type === 'beforeunload');

            if (!isPageUnload) {
            // Only clean up if it's a normal component unmount, not page refresh
                if (localStream) {
                    localStream.getTracks().forEach(track => track.stop());
                }

                Object.values(peerRefs.current).forEach(peer => {
                    if (peer) peer.destroy();
                });

                // Clean up socket listeners if socket exists
                if (socket) {
                    try {
                        socket.removeAllListeners();
                    } catch (err) {
                        console.error('Error removing socket listeners:', err);
                    }
                }
            } else {
                // For page refresh, we want to preserve patient connections
                console.log('Page refresh detected - preserving patient connections');
                // Don't stop tracks or destroy peers - let them continue
                // The admin will reconnect and resume monitoring
            }
        };
    }, [socket, localStream]);

    // Start recording function
    const startRecording = useCallback(async () => {
        if (!localStream && Object.keys(remoteStreams).length === 0) {
            console.error('No streams available for recording');
            return false;
        }

        try {
            setRecordingStatus('starting');

            // Create a mixed stream containing both local and remote audio/video
            const mixedStream = new MediaStream();

            // Add local stream tracks
            if (localStream) {
                localStream.getTracks().forEach(track => {
                    mixedStream.addTrack(track.clone());
                });
            }

            // Add remote stream tracks if available
            Object.values(remoteStreams).forEach(remoteStream => {
                remoteStream.getTracks().forEach(track => {
                    mixedStream.addTrack(track.clone());
                });
            });

            // Create MediaRecorder
            const mediaRecorder = new MediaRecorder(mixedStream, {
                mimeType: 'video/webm;codecs=vp9', // Specify codec for better compatibility
            });

            const chunks = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                console.log('Recording stopped, processing chunks...');

                const blob = new Blob(chunks, { type: 'video/webm' });

                // Upload recording to server
                try {
                    const formData = new FormData();
                    formData.append('recording', blob, `recording-${roomId}-${Date.now()}.webm`);
                    formData.append('callLogId', callLogId);

                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/video-call/recording/upload`, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('Upload failed:', errorData);
                    } else {
                        const result = await response.json();
                        console.log('Recording uploaded successfully:', result);
                    }
                } catch (uploadError) {
                    console.error('Error uploading recording:', uploadError);
                }
            };

            mediaRecorder.start();
            setRecorder(mediaRecorder);
            setIsRecording(true);
            setRecordingStatus('recording');

            console.log('Recording started successfully');
            return true;
        } catch (error) {
            console.error('Error starting recording:', error);
            setRecordingStatus('stopped');
            return false;
        }
    }, [localStream, remoteStreams, roomId, callLogId]);

    // Stop recording function
    const stopRecording = useCallback(() => {
        if (recorder && recorder.state === 'recording') {
            recorder.stop();
            setIsRecording(false);
            setRecordingStatus('stopped');

            // Clean up the mixed stream tracks
            if (recorder.stream) {
                recorder.stream.getTracks().forEach(track => track.stop());
            }

            setRecorder(null);
            console.log('Recording stopped');
            return true;
        }
        return false;
    }, [recorder]);

    return {
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
        // Recording functions
        isRecording,
        recordingStatus,
        startRecording,
        stopRecording
    };
};

export default useWebRTC;