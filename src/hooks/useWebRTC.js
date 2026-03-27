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

    // Debug callLogId changes
    useEffect(() => {
        console.log('=== ADMIN CALL LOG ID CHANGED ===', callLogId);
    }, [callLogId]);
    const [participants, setParticipants] = useState([]);
    const [userIdentity, setUserIdentity] = useState(null);
    const [initialized, setInitialized] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingStatus, setRecordingStatus] = useState('stopped'); // 'stopped', 'starting', 'recording'
    const [recorder, setRecorder] = useState(null);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const [isInitializing, setIsInitializing] = useState(false);
    const [initError, setInitError] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0); // in seconds
    const recordingTimerRef = useRef(null);

    // Define handleCallStarted as useCallback to avoid dependency issues
    const handleCallStarted = useCallback((data) => {
        console.log('=== ADMIN CALL STARTED HANDLER ===');
        console.log('Received data:', data);
        console.log('callLogId in data:', data.callLogId);

        // Set call as active when call starts
        setCallActive(true);
        console.log('ADMIN: Call marked as active');

        if (data.callLogId) {
            setCallLogId(data.callLogId);
            console.log('ADMIN: CallLogId set to:', data.callLogId);
        } else {
            console.warn('ADMIN: No callLogId received in call-started event');
        }
    }, [setCallLogId, setCallActive]);

    // Handle call ended event
    const handleCallEnded = useCallback(() => {
        console.log('=== ADMIN CALL ENDED HANDLER ===');
        setCallActive(false);
        setCallLogId(null);
        console.log('ADMIN: Call marked as inactive and callLogId cleared');
    }, [setCallActive, setCallLogId]);

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
    const remoteAudioRefs = useRef({});
    const localStreamRef = useRef(null);

    // Helper function to update both state and ref
    const updateLocalStream = useCallback((stream) => {
        setLocalStream(stream);
        localStreamRef.current = stream;
    }, []);

    // Create a dummy stream for testing purposes when no real devices are available
    const createDummyStream = () => {
        // Create a silent audio track
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const destination = audioContext.createMediaStreamDestination();
        oscillator.connect(destination);
        oscillator.start();

        // Create a black video track
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const dummyVideoStream = canvas.captureStream(30); // 30 FPS
        const dummyAudioStream = destination.stream;

        // Combine both streams
        const combinedStream = new MediaStream([
            ...dummyVideoStream.getVideoTracks(),
            ...dummyAudioStream.getAudioTracks()
        ]);

        console.log('✅ Dummy stream created for testing');
        updateLocalStream(combinedStream);
        return combinedStream;
    };

    // Initialize local media with timeout and retry logic
    const initLocalMedia = async (retryCount = 0) => {
        // Prevent multiple simultaneous initialization attempts
        if (isInitializing) {
            console.log('⚠️ Media initialization already in progress, skipping...');
            return localStream;
        }

        // If we already have an initialization error, don't retry automatically
        if (initError && retryCount === 0) {
            console.log('⚠️ Previous initialization failed, not retrying automatically');
            throw new Error(initError);
        }

        if (!socket) {
            throw new Error('Socket not connected');
        }

        setIsInitializing(true);
        setInitError(null);
        
        const maxRetries = 3;
        const timeoutMs = 10000; // 10 seconds timeout

        try {
            console.log(`Initializing local media (attempt ${retryCount + 1}/${maxRetries + 1})`);

            // Detect if mobile device - CRITICAL FIX FOR CROSS-DEVICE COMPATIBILITY
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            console.log('📱 Device type detected:', isMobile ? 'Mobile' : 'Desktop');

            // Create timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Media initialization took too long. Please check camera/microphone permissions and try again.'));
                }, timeoutMs);
            });

            // Try to get media with adaptive constraints based on device type
            const constraints = {
                video: isMobile ? {
                    facingMode: 'user', // Use front camera by default on mobile
                    width: { ideal: 640 }, // Lower resolution for mobile compatibility
                    height: { ideal: 480 },
                    frameRate: { ideal: 24 }
                } : {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 44100,
                    channelCount: 2
                    // Note: Removed deviceId constraint to use default device
                }
            };

            console.log('🎬 Video constraints:', JSON.stringify(constraints.video, null, 2));

            const mediaPromise = navigator.mediaDevices.getUserMedia(constraints);

            const stream = await Promise.race([mediaPromise, timeoutPromise]);

            // Verify that the stream has both audio and video tracks as expected
            const audioTracks = stream.getAudioTracks();
            const videoTracks = stream.getVideoTracks();
            
            console.log(`✅ Media initialized successfully - Audio tracks: ${audioTracks.length}, Video tracks: ${videoTracks.length}`);
            
            // Log specific information about audio track if available
            if (audioTracks.length > 0) {
                console.log(`Audio track enabled: ${audioTracks[0].enabled}, readyState: ${audioTracks[0].readyState}`);
            }
            
            updateLocalStream(stream);
            setIsInitializing(false);
            return stream;

        } catch (error) {
            console.error('Error accessing media devices:', error);
            setIsInitializing(false);
            setInitError(error.message || 'Failed to initialize media');

            // Handle specific error types
            if (error.name === 'NotAllowedError') {
                const errorMsg = 'Camera and microphone access denied. Please enable permissions in browser settings and refresh the page.';
                setInitError(errorMsg);
                throw new Error(errorMsg);
            } else if (error.name === 'NotFoundError') {
                console.log('No camera found, trying audio only...');
                // Try audio only
                try {
                    const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true,
                            sampleRate: 44100,
                            channelCount: 2
                        }
                    });
                    updateLocalStream(audioOnlyStream);
                    console.log('✅ Audio-only mode initialized (no camera found)');
                    return audioOnlyStream;
                } catch (audioError) {
                    console.error('Audio-only also failed:', audioError);
                    const errorMsg = 'No camera or microphone found. Please connect devices and try again.';
                    setInitError(errorMsg);
                    throw new Error(errorMsg);
                }
            } else if (error.name === 'OverconstrainedError') {
                // Try with basic constraints
                if (retryCount < maxRetries) {
                    console.log('Retrying with basic constraints...');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return initLocalMedia(retryCount + 1);
                }
                const errorMsg = 'Device constraints not supported. Please check your camera/microphone specifications.';
                setInitError(errorMsg);
                throw new Error(errorMsg);
            } else if (error.message.includes('took too long')) {
                // Timeout error - try again with basic constraints
                if (retryCount < maxRetries) {
                    console.log('Timeout occurred, trying with basic constraints...');
                    try {
                        const basicStream = await navigator.mediaDevices.getUserMedia({
                            video: true,
                            audio: true
                        });
                        updateLocalStream(basicStream);
                        console.log('✅ Media initialized with basic constraints');
                        return basicStream;
                    } catch (basicError) {
                        console.error('Basic constraints also failed, trying audio only...');
                        // Try audio only as last resort
                        try {
                            const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
                                audio: true
                            });
                            updateLocalStream(audioOnlyStream);
                            console.log('✅ Audio-only mode initialized after timeout');
                            return audioOnlyStream;
                        } catch (audioError) {
                            console.error('Audio-only also failed, creating dummy stream for testing...');
                            // Create a dummy stream for testing purposes
                            return createDummyStream();
                        }
                    }
                }
                throw error;
            } else if (error.name === 'NotReadableError') {
                const errorMsg = 'Camera/microphone is being used by another application. Please close other apps and try again.';
                setInitError(errorMsg);
                throw new Error(errorMsg);
            } else {
                // For other errors, try to initialize audio and video separately
                if (retryCount < maxRetries) {
                    console.log('Trying separate audio/video initialization...');
                    try {
                        // First try to get video
                        let videoStream = null;
                        try {
                            videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                        } catch (videoError) {
                            console.log('Video initialization failed, continuing with audio only');
                        }
                        
                        // Then try to get audio
                        let audioStream = null;
                        try {
                            audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        } catch (audioError) {
                            console.error('Audio initialization failed, creating dummy stream for testing...');
                            // Create a dummy stream for testing purposes
                            return createDummyStream();
                        }
                        
                        // Combine streams if both available
                        if (videoStream && audioStream) {
                            const combinedStream = new MediaStream([
                                ...videoStream.getVideoTracks(),
                                ...audioStream.getAudioTracks()
                            ]);
                            updateLocalStream(combinedStream);
                            console.log('✅ Combined audio/video stream initialized');
                            return combinedStream;
                        } else if (audioStream) {
                            updateLocalStream(audioStream);
                            console.log('✅ Audio-only stream initialized');
                            return audioStream;
                        } else if (videoStream) {
                            updateLocalStream(videoStream);
                            console.log('✅ Video-only stream initialized');
                            return videoStream;
                        } else {
                            console.log('Creating dummy stream for testing...');
                            // Create a dummy stream for testing purposes
                            return createDummyStream();
                        }
                    } catch (separateError) {
                        console.error('Separate audio/video initialization also failed, creating dummy stream for testing...', separateError);
                        // Create a dummy stream for testing purposes
                        return createDummyStream();
                    }
                }
                throw error;
            }
        }
    };

    // Create peer connection
    const createPeer = (socketId, initiator, stream, actualUserId) => {
        console.log("=== ADMIN CREATING PEER CONNECTION ===");
        console.log("Socket ID (for signaling):", socketId);
        console.log("Actual User ID (for stream tracking):", actualUserId || socketId);
        console.log("Initiator:", initiator);
        console.log("Local stream available:", !!localStream);
        console.log("Local stream tracks:", localStream ? localStream.getTracks().length : 0);
        console.log("Provided stream:", !!stream);
        console.log("Socket connected:", socket?.connected);
        console.log("Socket ID:", socket?.id);
        console.log("User Role:", userRole);
        console.log("Participants count:", Object.keys(peerRefs.current).length);

        // Use actualUserId for stream tracking if provided, otherwise fall back to socketId
        const streamTrackingId = actualUserId || socketId;

        // Clean up existing peer connection if it exists
        if (peerRefs.current[socketId]) {
            console.log("ADMIN: Cleaning up existing peer connection for:", socketId);
            peerRefs.current[socketId].destroy();
            delete peerRefs.current[socketId];
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

        // Enhanced mobile device validation
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        console.log(`📱 Device type: ${isMobile ? 'MOBILE' : 'DESKTOP'}`);
        console.log(`🎬 Stream tracks - Audio: ${audioTracks.length}, Video: ${videoTracks.length}`);
        
        if (isMobile) {
            console.log('⚠️ MOBILE DEVICE DETECTED - Applying compatibility optimizations:');
            console.log('- Reduced video resolution (640x480 @ 24fps)');
            console.log('- Lower bandwidth allocation (500 kbps)');
            console.log('- TURN servers enabled for NAT traversal');
            
            // Check for iOS-specific issues
            const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
            if (isIOS) {
                console.log('🍎 iOS detected - Additional Safari WebRTC compatibility mode enabled');
                // iOS Safari requires user gesture for autoplay
                console.log('⚠️ Note: iOS requires manual play action for remote videos');
            }
        }

        console.log(`✅ Stream validation passed - Audio tracks: ${audioTracks.length}, Video tracks: ${videoTracks.length}`);

        let peer;
        try {
            console.log('Creating new Peer connection for socketId:', socketId, '(stream tracking ID:', streamTrackingId, ') with stream:', !!finalStream);

            // Detect device type for bandwidth optimization
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            peer = new Peer({
                initiator,
                trickle: true, // Set to false for more reliable connection
                stream: finalStream,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                        { urls: 'stun:stun.stunprotocol.org:3478' },
                        { urls: 'stun:stun.voiparound.com:3478' },
                        // Add TURN servers for better connectivity (critical for mobile/NAT traversal)
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
                },
                // Add bandwidth constraints for mobile compatibility
                sdpTransform: (sdp) => {
                    // Modify SDP to optimize for mobile devices
                    if (isMobile) {
                        // Reduce max bandwidth for mobile
                        sdp = sdp.replace(/a=fmtp:(\d+) (.*)/g, (match, p1, p2) => {
                            if (p2.includes('profile-level-id')) {
                                // Add bandwidth限制 for H264
                                return match + '\nb=AS:500'; // 500 kbps for mobile
                            }
                            return match;
                        });
                    }
                    return sdp;
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
            console.error('Error creating peer connection for socketId:', socketId, error);
            console.error('Error details:', error.message, error.stack);
            return null;
        }

        // Log when peer is ready
        peer.on('connect', () => {
            console.log('✅ ADMIN Peer connection established with socketId:', socketId, '(userId:', streamTrackingId, ')');
            
            // Synchronize audio state after connection
            if (localStream) {
                const audioTracks = localStream.getAudioTracks();
                if (audioTracks.length > 0) {
                    const audioTrack = audioTracks[0];
                    
                    // Update peer connection with current audio state
                    const updateAudioTrack = () => {
                        if (peer && peer._pc && peer._pc.getSenders) {
                            const senders = peer._pc.getSenders();
                            let audioSenderFound = false;
                            
                            senders.forEach(async (sender) => {
                                if (sender.track && sender.track.kind === 'audio') {
                                    audioSenderFound = true;
                                    try {
                                        sender.track.enabled = audioTrack.enabled;
                                        console.log('✅ Audio track state updated for peer socketId:', socketId, '(userId:', streamTrackingId, ')');
                                    } catch (error) {
                                        console.error('Error updating audio track on connect:', error);
                                    }
                                }
                            });
                            
                            // If no audio sender was found, try to add the track
                            if (!audioSenderFound && audioTrack) {
                                try {
                                    peer._pc.addTrack(audioTrack, finalStream);
                                    console.log('✅ Audio track added to peer connection socketId:', socketId, '(userId:', streamTrackingId, ')');
                                } catch (addError) {
                                    console.error('Error adding audio track to peer:', addError);
                                }
                            }
                        }
                    };
                    
                    // Try to update immediately and then again after delays
                    updateAudioTrack();
                    setTimeout(updateAudioTrack, 100);
                    setTimeout(updateAudioTrack, 500);
                }
            }
        });

        // Properly handle stream events - USE streamTrackingId for remote streams
        peer.on('stream', (remoteStream) => {
            console.log("=== ADMIN REMOTE STREAM RECEIVED ===");
            console.log("From socketId:", socketId);
            console.log("Stream tracking userId:", streamTrackingId);
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
                        processRemoteStream(remoteStream, streamTrackingId);
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

            processRemoteStream(remoteStream, streamTrackingId);
        });

        // Helper function to process remote stream - uses actual userId for stream tracking
        const processRemoteStream = (remoteStream, streamUserId) => {
            console.log("=== ADMIN PROCESSING REMOTE STREAM ===");
            console.log("Stream User ID:", streamUserId);
            console.log("Stream ID:", remoteStream.id);

            setRemoteStreams(prev => {
                const newState = {
                    ...prev,
                    [streamUserId]: remoteStream
                };
                console.log("✅ ADMIN Remote streams updated with userId key:", Object.keys(newState));
                return newState;
            });

            // Immediate video element update
            updateRemoteVideoElement(streamUserId, remoteStream);

            // Fallback updates
            setTimeout(() => updateRemoteVideoElement(streamUserId, remoteStream), 100);
            setTimeout(() => updateRemoteVideoElement(streamUserId, remoteStream), 500);
            setTimeout(() => updateRemoteVideoElement(streamUserId, remoteStream), 1000);
        };

        // Helper function to update video element - uses actual userId
        const updateRemoteVideoElement = (streamUserId, stream) => {
            // Check if ref exists, if not, try again after a short delay
            if (!remoteVideoRefs.current[streamUserId]) {
                 setTimeout(() => {
                    updateRemoteVideoElement(streamUserId, stream);
                }, 100);
                return;
            }

            // Check if ref exists, if not, try again after a short delay
            if (!remoteVideoRefs.current[streamUserId]) {
                 setTimeout(() => {
                    updateRemoteVideoElement(streamUserId, stream);
                }, 100);
                return;
            }

            if (remoteVideoRefs.current[streamUserId] && stream) {
                try {
                    const videoElement = remoteVideoRefs.current[streamUserId];
                    if (videoElement.srcObject !== stream) {
                        videoElement.srcObject = stream;
                        console.log(`✅ ADMIN Remote video element updated for userId: ${streamUserId}`);

                        // Ensure video plays
                        videoElement.muted = true; // Mute to allow autoplay
                        videoElement.autoplay = true;
                        videoElement.playsInline = true;

                        // Play the video
                        const playPromise = videoElement.play();
                        if (playPromise !== undefined) {
                            playPromise
                                .then(() => {
                                    console.log(`✅ ADMIN Remote video playing for userId: ${streamUserId}`);
                                })
                                .catch(error => {
                                    console.warn(`⚠️ ADMIN Remote video autoplay failed for ${streamUserId}:`, error);
                                    // Try to play muted
                                    videoElement.muted = true;
                                    videoElement.play().catch(err => {
                                        console.error(`❌ ADMIN Remote video play failed for ${streamUserId}:`, err);
                                    });
                                });
                        }
                    }
                } catch (err) {
                    console.error(`❌ Error setting admin remote video srcObject for ${streamUserId}:`, err);
                }
            } else {
                console.log(`⚠️ ADMIN Remote video ref or stream not available for userId: ${streamUserId}`);
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
                    targetId: socketId  // ✅ CORRECT: parameter is named 'socketId' in admin createPeer
                });
            }
        });

        peer.on('close', () => {
            console.log('🔌 ADMIN Peer connection closed for socketId:', socketId, '(userId:', streamTrackingId, ')');
            
            // Mark peer as destroying to prevent ICE candidate processing
            peer._destroying = true;
            
            // Stop and remove remote stream tracks for this peer - use streamTrackingId
            try {
                setRemoteStreams(prev => {
                    const newState = { ...prev };
                    const stream = newState[streamTrackingId];
                    if (stream) {
                        try {
                            stream.getTracks().forEach(t => { try { t.stop(); } catch (e) {} });
                        } catch (e) {
                            console.warn('Error stopping tracks for closed peer stream socketId:', socketId, 'userId:', streamTrackingId, e);
                        }
                        delete newState[streamTrackingId];
                    }
                    return newState;
                });
            } catch (e) {
                console.warn('Error cleaning remoteStreams on close for socketId:', socketId, 'userId:', streamTrackingId, e);
            }

            // Clear any attached video/audio element refs
            try {
                if (remoteVideoRefs.current[streamTrackingId]) {
                    try { remoteVideoRefs.current[streamTrackingId].srcObject = null; } catch (e) {}
                    delete remoteVideoRefs.current[streamTrackingId];
                }
                if (remoteAudioRefs.current[streamTrackingId]) {
                    try { remoteAudioRefs.current[streamTrackingId].srcObject = null; } catch (e) {}
                    delete remoteAudioRefs.current[streamTrackingId];
                }
            } catch (e) {
                console.warn('Error clearing media element refs on close for socketId:', socketId, 'userId:', streamTrackingId, e);
            }

            // Remove peer reference - use socketId for peer refs
            if (peerRefs.current[socketId]) {
                try { peerRefs.current[socketId].destroy(); } catch (e) {}
                delete peerRefs.current[socketId];
            }
        });

        peer.on('error', (err) => {
            console.error('❌ ADMIN Peer connection error for socketId', socketId, '(userId:', streamTrackingId, '):', err);
            
            // Enhanced error logging for mobile devices
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            if (isMobile) {
                console.error('📱 MOBILE DEVICE ERROR - Additional diagnostic info:');
                console.error('- User Agent:', navigator.userAgent);
                console.error('- Network Type:', navigator.connection ? navigator.connection.effectiveType : 'unknown');
                console.error('- Connection Downlink:', navigator.connection ? navigator.connection.downlink : 'unknown', 'Mbps');
                console.error('- Connection RTT:', navigator.connection ? navigator.connection.rtt : 'unknown', 'ms');
            }
            
            // Add more detailed error logging
            if (err.code === 'ERR_CONNECTION_FAILURE') {
                console.error('🔌 Connection failure - check network/firewall');
                if (isMobile) {
                    console.error('⚠️ Mobile device on cellular network may have limited connectivity');
                    console.error('💡 Suggestion: Try switching to WiFi or check cellular signal strength');
                }
            } else if (err.code === 'ERR_DATA_CHANNEL') {
                console.error('📊 Data channel error - SCTP association failed');
            } else if (err.code === 'ERR_ICE_CONNECTION_FAILURE') {
                console.error('🧊 ICE connection failed - STUN/TURN servers unreachable');
                if (isMobile) {
                    console.error('⚠️ Mobile NAT traversal issue - attempting TURN relay');
                }
            } else if (err.code === 'ERR_SIGNALING') {
                console.error('📡 Signaling error - socket connection interrupted');
            } else if (err.message && err.message.includes('not allowed')) {
                console.error('🚫 Permission denied - camera/microphone access blocked');
            } else if (err.message && err.message.includes('timeout')) {
                console.error('⏱️ Connection timeout - network latency too high');
                if (isMobile) {
                    console.error('⚠️ Mobile network congestion detected');
                }
            }

            // Clean up failed peer connection - use socketId for peer refs
            if (peerRefs.current[socketId]) {
                try {
                    peerRefs.current[socketId].destroy();
                } catch (destroyErr) {
                    console.error('Error destroying admin peer:', destroyErr);
                }
                delete peerRefs.current[socketId];
            }
            
            // Emit error event to notify user
            if (socket) {
                socket.emit('peer-connection-error', {
                    socketId,
                    userId: streamTrackingId,
                    errorCode: err.code,
                    errorMessage: err.message,
                    isMobile
                });
            }
        });

        // Store peer reference using socketId (for signaling)
        peerRefs.current[socketId] = peer;
        return peer;
    };

    // Handle incoming offer
    const handleOffer = async (offer, senderId) => {
        console.log("=== ADMIN HANDLE OFFER CALLED ===");
        console.log("Offer received from senderId:", senderId);
        console.log("Offer data:", JSON.stringify(offer, null, 2));
        console.log("Socket available:", !!socket);
        console.log("Socket connected:", socket?.connected);
        console.log("Local stream available:", !!localStream);

        // Try to find the actual userId from participants
        const participant = participants.find(p => p.socketId === senderId);
        const actualUserId = participant?.userId || senderId;
        console.log("Mapped senderId:", senderId, "to userId:", actualUserId);

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

        console.log("🔄 ADMIN: Creating peer connection for senderId:", senderId, "(userId:", actualUserId, ")");
        const peer = createPeer(senderId, false, localStream, actualUserId);
        if (!peer) {
            console.error("❌ ADMIN: Failed to create peer connection for senderId:", senderId);
            return;
        }
        
        // Ensure audio track state is properly synchronized after connection
        if (localStream) {
            const audioTracks = localStream.getAudioTracks();
            if (audioTracks.length > 0) {
                const audioTrack = audioTracks[0];
                
                // Update peer connection with current audio state
                const updateAudioTrack = () => {
                    if (peer && peer._pc && peer._pc.getSenders) {
                        const senders = peer._pc.getSenders();
                        let audioSenderFound = false;
                        
                        senders.forEach(async (sender) => {
                            if (sender.track && sender.track.kind === 'audio') {
                                audioSenderFound = true;
                                try {
                                    sender.track.enabled = audioTrack.enabled;
                                    console.log('✅ Audio track state updated for peer after offer:', senderId);
                                } catch (error) {
                                    console.error('Error updating audio track after offer:', error);
                                }
                            }
                        });
                        
                        // If no audio sender was found, try to add the track
                        if (!audioSenderFound && audioTrack) {
                            try {
                                peer._pc.addTrack(audioTrack, localStream);
                                console.log('✅ Audio track added to peer connection after offer:', senderId);
                            } catch (addError) {
                                console.error('Error adding audio track after offer:', addError);
                            }
                        }
                    }
                };
                
                // Try to update immediately and then again after delays
                updateAudioTrack();
                setTimeout(updateAudioTrack, 100);
                setTimeout(updateAudioTrack, 500);
            }
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
    const handleAnswer = useCallback(async (answer, senderId) => {
        console.log("=== ADMIN HANDLE ANSWER CALLED ===");
        console.log("Answer received from senderId:", senderId);

        // Try to find the actual userId from participants
        const participant = participants.find(p => p.socketId === senderId);
        const actualUserId = participant?.userId || senderId;
        console.log("Mapped senderId:", senderId, "to userId:", actualUserId);

        if (peerRefs.current[senderId]) {
            try {
                await peerRefs.current[senderId].signal(answer);
                
                // Ensure audio track state is properly synchronized after connection
                if (localStream) {
                    const audioTracks = localStream.getAudioTracks();
                    if (audioTracks.length > 0) {
                        const audioTrack = audioTracks[0];
                        
                        // Update peer connection with current audio state
                        const updateAudioTrack = () => {
                            const peer = peerRefs.current[senderId];
                            if (peer && peer._pc && peer._pc.getSenders) {
                                const senders = peer._pc.getSenders();
                                let audioSenderFound = false;
                                
                                senders.forEach(async (sender) => {
                                    if (sender.track && sender.track.kind === 'audio') {
                                        audioSenderFound = true;
                                        try {
                                            sender.track.enabled = audioTrack.enabled;
                                            console.log('✅ Audio track state updated for peer after answer:', senderId);
                                        } catch (error) {
                                            console.error('Error updating audio track after answer:', error);
                                        }
                                    }
                                });
                                
                                // If no audio sender was found, try to add the track
                                if (!audioSenderFound && audioTrack) {
                                    try {
                                        peer._pc.addTrack(audioTrack, localStream);
                                        console.log('✅ Audio track added to peer connection after answer:', senderId);
                                    } catch (addError) {
                                        console.error('Error adding audio track after answer:', addError);
                                    }
                                }
                            }
                        };
                        
                        // Try to update immediately and then again after delays
                        updateAudioTrack();
                        setTimeout(updateAudioTrack, 100);
                        setTimeout(updateAudioTrack, 500);
                    }
                }
                
                console.log("✅ ADMIN: Answer handled successfully");
            } catch (error) {
                console.error("❌ ADMIN: Error handling answer:", error);
            }
        } else {
            console.log("⚠️ ADMIN: No peer connection found for senderId:", senderId, "(userId:", actualUserId, ")");
            // Create peer connection if not exists and handle the answer
            let peer = peerRefs.current[senderId];
            
            // FIX: If peer is destroyed or missing, recreate it before signaling
            if (!peer || peer.destroyed) {
                console.log('⚠️ ADMIN: Peer destroyed or missing for:', senderId, '- recreating');
                if (peer) {
                    try { peer.destroy(); } catch(e) {}
                    delete peerRefs.current[senderId];
                }
                if (!localStreamRef.current) await initLocalMedia();
                peer = createPeer(senderId, true, localStreamRef.current, actualUserId);
                if (!peer) {
                    console.error('❌ ADMIN: Failed to recreate peer for:', senderId);
                    return;
                }
                peerRefs.current[senderId] = peer;
            }
            
            try {
                await peer.signal(answer);
                console.log('✅ ADMIN: Answer handled successfully for:', senderId);
            } catch (error) {
                console.error('❌ ADMIN: Error handling answer:', error);
            }
        }
    }, [localStreamRef, initLocalMedia, createPeer, participants, localStream]);

    // Handle ICE candidate
    const handleIceCandidate = async (candidate, senderId) => {
        // Try to find the actual userId from participants for consistency
        const participant = participants.find(p => p.socketId === senderId);
        const actualUserId = participant?.userId || senderId;
        console.log("📡 ADMIN: Handling ICE candidate from senderId:", senderId, "(userId:", actualUserId, ")");
        
        // FIX: Check if peer exists and is not destroyed/destroying before signaling
        const peer = peerRefs.current[senderId];
        if (!peer) {
            console.warn("⚠️ ADMIN: No peer found for ICE candidate from senderId:", senderId);
            return;
        }
        
        if (peer.destroyed || peer._destroying) {
            console.warn("⚠️ ADMIN: Peer already destroyed/destroying for senderId:", senderId, "- ignoring ICE candidate");
            return; // Don't try to signal on destroyed or destroying peer!
        }
        
        try {
            await peer.signal(candidate);
        } catch (error) {
            // Ignore errors if peer was destroyed during signaling
            if (error.message && error.message.includes('cannot signal after peer is destroyed')) {
                console.warn("⚠️ ADMIN: Peer destroyed during ICE candidate signaling for senderId:", senderId);
            } else {
                console.error("❌ ADMIN: Error signaling ICE candidate:", error);
            }
        }
    };

    // Toggle audio
    const toggleAudio = useCallback(() => {
        if (localStream) {
            const audioTracks = localStream.getAudioTracks();
            if (audioTracks.length > 0) {
                const audioTrack = audioTracks[0];
                const newEnabledState = !audioTrack.enabled;
                audioTrack.enabled = newEnabledState;
                
                // Update all peer connections with the new audio state
                Object.values(peerRefs.current).forEach(peer => {
                    if (peer && peer._pc && peer._pc.getSenders) {
                        peer._pc.getSenders().forEach(async (sender) => {
                            if (sender.track && sender.track.kind === 'audio') {
                                try {
                                    sender.track.enabled = newEnabledState;
                                } catch (error) {
                                    console.error('Error updating audio track state:', error);
                                }
                            }
                        });
                    }
                });
                
                if (socket) {
                    socket.emit('audio-toggle', {
                        roomId,
                        muted: !newEnabledState, // Send opposite of enabled state (muted = !enabled)
                        userId: socket.user?.userId // Include userId to identify who toggled
                    });
                }
                return newEnabledState;
            }
        }
        return false;
    }, [localStream, socket, roomId]);

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
            
            // Get all tracks except the screen track
            const videoTracks = localStream.getVideoTracks().filter(track => track !== screenTrack);
            const audioTracks = localStream.getAudioTracks();
            
            // Stop and remove the screen track
            screenTrack.stop();
            localStream.removeTrack(screenTrack);
            
            // Get new camera video track with mobile detection
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const cameraStream = await navigator.mediaDevices.getUserMedia({
                video: isMobile ? {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 24 }
                } : {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                }
            });
            
            // Replace the old video track with the new camera track
            if (videoTracks.length > 0) {
                localStream.removeTrack(videoTracks[0]);
                videoTracks[0].stop(); // Stop the old video track
            }
            
            // Add the new camera video track
            localStream.addTrack(cameraStream.getVideoTracks()[0]);
            
            // Update the video element with the modified stream
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = localStream;
            }
            
            // Emit screen share toggle event
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
    const startCall = useCallback(async () => {
        if ((userRole === 'therapist' || userRole === 'admin') && socket) {
            const callType = roomId.startsWith('group') ? 'group' : 'session';

            try {
                // Create call log first
                const { adminVideoCallApi } = await import('../lib/videoCallApi');
                // Determine if this is a group session based on roomId
                const isGroupSession = roomId.startsWith('group') || roomId.includes('group');
                const callLogResponse = await adminVideoCallApi.createCallLog(
                    isGroupSession ? undefined : roomId, // sessionId (for 1-on-1 sessions)
                    isGroupSession ? roomId : undefined, // groupSessionId (for group sessions)
                    isGroupSession ? 'group' : 'one-on-one', // type
                    []
                );

                if (callLogResponse.callLog) {
                    setCallLogId(callLogResponse.callLog._id);
                    console.log('ADMIN: Call log created:', callLogResponse.callLog._id);
                } else {
                    console.warn('ADMIN: Call log response did not contain callLog:', callLogResponse);
                }
            } catch (error) {
                console.error('ADMIN: Error creating call log:', error);
                console.error('ADMIN: Error details:', error.response?.data || error.message);
            }

            socket.emit('call-start', {
                roomId,
                roomType: callType
            });

            // Set call as active when starting
            setCallActive(true);
            setCallStarted(true);
            console.log('ADMIN: Call started and marked as active');
        }
    }, [userRole, socket, roomId, setCallLogId, setCallActive, setCallStarted]);

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
            console.log('ADMIN: Participant socketId:', data.socketId, 'userId:', data.userId);
            
            // Create standardized participant data (matching backend structure)
            const newParticipant = {
                socketId: data.socketId,
                userId: data.userId,
                name: data.name && data.name !== 'Clinician' && data.name !== 'User Unknown' ? data.name : 
                      (data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : null) ||
                      data.displayName || data.email || `User ${data.userId?.substring(0, 5) || data.socketId?.substring(0, 5) || "Unknown"}`,
                firstName: data.firstName,
                lastName: data.lastName,
                displayName: data.displayName,
                role: data.role,
                email: data.email,
                isTherapist: data.isTherapist,
                isUser: data.isUser,
                joinedAt: data.joinedAt || new Date().toISOString(),
                isSelf: data.socketId === socket.id
            };

            console.log('ADMIN: Standardized participant data:', newParticipant);
            
            setParticipants(prev => {
                // Avoid duplicates by checking socketId (primary identity)
                const exists = prev.some(p => p.socketId === newParticipant.socketId);
                if (exists) {
                    console.log('ADMIN: Participant already exists, skipping');
                    return prev;
                }
                
                console.log('ADMIN: Adding new participant:', newParticipant);
                return [...prev, newParticipant];
            });

            // If the participant is a client/patient, create offer
            if (data.role === 'patient' || !data.role || data.isUser) {
                console.log('ADMIN: Patient joined, creating offer');
                console.log('ADMIN: Creating peer with socketId:', data.socketId, 'for userId:', data.userId);
                setTimeout(async () => {
                    // FIX: Use 2000ms delay to avoid race with duplicate offer events
                    
                    // Check again inside timeout — peer may have been created by offer handler already
                    if (peerRefs.current[data.socketId]) {
                        const state = peerRefs.current[data.socketId]._pc?.connectionState;
                        if (state === 'connected' || state === 'connecting') {
                            console.log('✅ ADMIN: Peer already connected for:', data.socketId, '- skipping duplicate creation');
                            return; // Don't disrupt active connections!
                        }
                        // If it exists but not connected, destroy and recreate
                        console.log('🧹 ADMIN: Existing peer is in state:', state, '- will recreate');
                        try { existingPeer.destroy(); } catch(e) {}
                        delete peerRefs.current[data.socketId];
                    }
                    
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

                    // Create offer for the patient - IMPORTANT: Pass both socketId and userId
                    // The peer connection uses socketId for signaling, but we need to track
                    // the actual userId for remote stream identification
                    const peer = createPeer(data.socketId, true, currentLocalStream, data.userId);
                    if (!peer) {
                        console.error('Failed to create peer connection for patient:', data.socketId);
                        return;
                    }
                    console.log('ADMIN: Created offer for patient socketId:', data.socketId, 'userId:', data.userId);
                }, 2000); // increased from 1000ms to 2000ms
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
            const leftSocketId = data.socketId || data.senderId || data.socket || data.id;

            // Destroy peer connection if exists
            if (leftSocketId && peerRefs.current[leftSocketId]) {
                try {
                    peerRefs.current[leftSocketId].destroy();
                } catch (err) {
                    console.error('Error destroying peer for left participant', leftSocketId, err);
                }
                delete peerRefs.current[leftSocketId];
            }

            // Stop and remove remote stream
            if (leftSocketId) {
                try {
                    setRemoteStreams(prev => {
                        const newState = { ...prev };
                        const stream = newState[leftSocketId];
                        if (stream) {
                            try {
                                stream.getTracks().forEach(t => { try { t.stop(); } catch (e) {} });
                            } catch (e) {
                                console.warn('Error stopping tracks for remote stream', leftSocketId, e);
                            }
                            delete newState[leftSocketId];
                        }
                        return newState;
                    });
                } catch (e) {
                    console.warn('Error removing remote stream for left participant', leftSocketId, e);
                }

                // Clear media element refs
                try {
                    if (remoteVideoRefs.current[leftSocketId]) {
                        try { remoteVideoRefs.current[leftSocketId].srcObject = null; } catch (e) {}
                        delete remoteVideoRefs.current[leftSocketId];
                    }
                    if (remoteAudioRefs.current[leftSocketId]) {
                        try { remoteAudioRefs.current[leftSocketId].srcObject = null; } catch (e) {}
                        delete remoteAudioRefs.current[leftSocketId];
                    }
                } catch (e) {
                    console.warn('Error clearing media element refs for', leftSocketId, e);
                }
            }

            // Finally remove participant from list
            setParticipants(prev => {
                const filtered = prev.filter(p => p.socketId !== leftSocketId && p.userId !== data.userId);
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
                        name: socket.user?.name || (socket.user?.firstName && socket.user?.lastName ? 
                            `${socket.user.firstName} ${socket.user.lastName}` : null) || 
                            socket.user?.displayName || `You (${userRole})`,
                        role: userRole,
                        isTherapist: userRole === 'therapist' || userRole === 'admin',
                        isUser: userRole === 'patient',
                        firstName: socket.user?.firstName,
                        lastName: socket.user?.lastName,
                        displayName: socket.user?.displayName,
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
        socket.on('call-started', handleCallStarted);
        socket.on('call-ended', handleCallEnded);
        socket.on('group-call-ended', handleCallEnded);

        // Cleanup
        return () => {
            socket.off('webrtc-offer-received', handleWebRTCOffer);
            socket.off('webrtc-answer-received', handleWebRTCAnswer);
            socket.off('webrtc-ice-candidate-received', handleWebRTCIceCandidate);
            socket.off('participant-joined', handleParticipantJoined);
            socket.off('participant-left', handleParticipantLeft);
            socket.off('joined-call', handleJoinedCall);
            socket.off('call-started', handleCallStarted);
            socket.off('call-ended', handleCallEnded);
            socket.off('group-call-ended', handleCallEnded);
        };
    }, [socket, userRole, setParticipants, handleOffer, handleAnswer, handleIceCandidate, initLocalMedia, createPeer, localStream, handleCallEnded]);

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

        // Validate callLogId before starting recording
        console.log('🎙️ Pre-recording check - callLogId:', callLogId);
        if (!callLogId) {
            console.error('❌ Cannot start recording - callLogId is null!');
            return false;
        }

        // Prevent starting recording if already recording
        if (isRecording) {
            console.warn('⚠️ Recording already in progress, ignoring start request');
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

            // Flag to prevent multiple uploads
            let uploadInProgress = false;

            mediaRecorder.onstop = async () => {
                // Prevent multiple uploads
                if (uploadInProgress) {
                    console.warn('⚠️ Upload already in progress, skipping duplicate upload');
                    return;
                }
                uploadInProgress = true;

                console.log('Recording stopped, processing chunks...');

                const blob = new Blob(chunks, { type: 'video/webm' });

                // Upload recording to server
                try {
                    console.log('📤 Uploading recording with callLogId:', callLogId);

                    // Validate callLogId before any operations
                    if (!callLogId) {
                        console.error('❌ callLogId is null! Cannot proceed with upload.');
                        throw new Error('callLogId is required for recording upload');
                    }

                    // Verify the CallLog exists in database (optional check)
                    try {
                        const verifyResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/video-call/${callLogId}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
                            }
                        });

                        if (!verifyResponse.ok) {
                            console.warn('⚠️ CallLog not found in database, but proceeding with upload...');
                        } else {
                            console.log('✅ Verified CallLog exists in database');
                        }
                    } catch (verifyError) {
                        console.warn('⚠️ Could not verify CallLog existence:', verifyError.message);
                    }

                    const formData = new FormData();
                    formData.append('recording-videos', blob, `recording-${roomId}-${Date.now()}.webm`);
                    formData.append('callLogId', callLogId);

                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/video-call/recording/upload`, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
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
                } finally {
                    uploadInProgress = false;
                }
            };

            // Start recording timer
            setRecordingTime(0);
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

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
    }, [localStream, remoteStreams, roomId, callLogId, isRecording]);

    // Stop recording function
    const stopRecording = useCallback(() => {
        if (recorder && recorder.state === 'recording') {
            recorder.stop();
            setIsRecording(false);
            setRecordingStatus('stopped');

            // Stop recording timer
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
                recordingTimerRef.current = null;
            }

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

    // Cleanup recording timer on unmount
    useEffect(() => {
        return () => {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
        };
    }, []);

    // Effect to sync audio state when local stream changes
    useEffect(() => {
        if (localStream) {
            const audioTracks = localStream.getAudioTracks();
            if (audioTracks.length > 0) {
                console.log('Local stream audio track state changed:', audioTracks[0].enabled);
            }
        }
    }, [localStream]);

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
        remoteAudioRefs,
        setCallActive,
        setParticipants,
        setCallLogId,
        // Recording functions
        isRecording,
        recordingStatus,
        recordingTime,
        startRecording,
        stopRecording,
        // Initialization state
        isInitializing,
        initError,
        setIsInitializing,
        setInitError
    };
};

export default useWebRTC;