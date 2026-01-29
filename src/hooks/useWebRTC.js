// Ensure global is available for simple-peer
if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
    window.global = window;
}

import { useState, useEffect, useRef } from 'react';
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

    const peerRefs = useRef({});
    const localVideoRef = useRef(null);
    const remoteVideoRefs = useRef({});

    // Initialize local media
    const initLocalMedia = async () => {
        if (!socket) {
            throw new Error('Socket not connected');
        }
        try {
            // First try to get both video and audio
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            return stream;
        } catch (error) {
            console.error('Error accessing media devices:', error);

            // If both video and audio failed, try audio only
            if (error.name === 'NotFoundError' || error.name === 'OverconstrainedError' || error.name === 'NotAllowedError') {
                try {
                    console.log('Trying audio only mode...');
                    const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
                        audio: true,
                        video: false
                    });

                    setLocalStream(audioOnlyStream);
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = audioOnlyStream;
                    }

                    return audioOnlyStream;
                } catch (audioError) {
                    console.error('Audio only also failed:', audioError);

                    // If audio only also fails, try to create a dummy stream
                    try {
                        console.log('Creating dummy stream as fallback...');
                        const dummyStream = new MediaStream();
                        setLocalStream(dummyStream);
                        return dummyStream;
                    } catch (dummyError) {
                        console.error('All media access attempts failed:', dummyError);
                        throw error; // Throw original error
                    }
                }
            } else {
            // For other types of errors, throw the original error
                throw error;
            }
        }
    };

    // Create peer connection
    const createPeer = (userId, initiator, stream) => {
        const peer = new Peer({
            initiator,
            trickle: true, // Changed to true for better ICE candidate handling
            stream: stream || localStream,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun.stunprotocol.org:3478' },
                    { urls: 'stun:stun.voiparound.com:3478' }
                ]
            }
        });

        peer.on('signal', (data) => {
            if (data.type === 'offer' || data.type === 'answer') {
                socket.emit('offer', {
                    roomId,
                    offer: data,
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

        peer.on('stream', (remoteStream) => {
            setRemoteStreams(prev => ({
                ...prev,
                [userId]: remoteStream
            }));

            // Update video ref when stream is available
            setTimeout(() => {
                if (remoteVideoRefs.current[userId]) {
                    remoteVideoRefs.current[userId].srcObject = remoteStream;
                }
            }, 100);
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
            console.error('Peer connection error:', err);
            // Add more detailed error logging
            if (err.code === 'ERR_CONNECTION_FAILURE') {
                console.error('Connection failure - check network/firewall');
            } else if (err.code === 'ERR_DATA_CHANNEL') {
                console.error('Data channel error');
            }
        });

        peerRefs.current[userId] = peer;
        return peer;
    };

    // Handle incoming offer
    const handleOffer = async (offer, senderId) => {
        if (!localStream) {
            await initLocalMedia();
        }

        const peer = createPeer(senderId, false);
        await peer.signal(offer);
    };

    // Handle incoming answer
    const handleAnswer = async (answer, senderId) => {
        if (peerRefs.current[senderId]) {
            await peerRefs.current[senderId].signal(answer);
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
                        videoEnabled: !videoTrack.enabled
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
            socket.emit('end-call', {
                roomId,
                roomType: roomId.startsWith('group') ? 'group' : 'session'
            });
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

    // Handle socket events for participants
    useEffect(() => {
        if (!socket) return;

        const handleParticipantJoined = (data) => {
            console.log('ADMIN: Participant joined:', data);
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
                    role: data.role || (data.isTherapist ? 'therapist' : 'patient'),
                    isTherapist: data.isTherapist,
                    isUser: data.isUser,
                    joinedAt: new Date(),
                    isSelf: data.socketId === socket.id
                };
                console.log('ADMIN: Adding new participant:', newParticipant);
                return [...prev, newParticipant];
            });
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

        // Add listeners
        socket.on('participant-joined', handleParticipantJoined);
        socket.on('participant-left', handleParticipantLeft);
        socket.on('joined-call', handleJoinedCall);

        // Cleanup
        return () => {
            socket.off('participant-joined', handleParticipantJoined);
            socket.off('participant-left', handleParticipantLeft);
            socket.off('joined-call', handleJoinedCall);
        };
    }, [socket, userRole, setParticipants]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
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
        };
    }, [socket]);

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
        setCallLogId
    };
};

export default useWebRTC;