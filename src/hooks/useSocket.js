import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthRedux } from '../hooks/useAuthRedux';

const useSocket = (roomId, roomType) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(null);
    const { token } = useAuthRedux();

    // Initialize socket connection
    useEffect(() => {
        // Don't connect if we don't have required data
        console.log('useSocket: Initializing with roomId:', roomId);
        console.log('useSocket: Token available:', !!token);

        if (!roomId) {
            console.log('Waiting for roomId...');
            return;
        }

        if (!token) {
            console.log('Waiting for authentication token...');
            setError('Authentication required');
            return;
        }

        // Validate token format (basic check)
        if (typeof token !== 'string' || token.length < 10) {
            console.log('Invalid token format');
            setError('Invalid authentication token');
            return;
        }

        try {
            const socketOptions = {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            };

            // Always add auth token since we checked it exists above
            socketOptions.auth = { token: token };

            // Determine WebSocket server URL based on environment
            let serverUrl;
            if (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.includes('localhost')) {
                // Development environment - use localhost WebSocket server
                serverUrl = 'http://localhost:5000';
            } else if (import.meta.env.VITE_API_BASE_URL) {
                // Production environment - extract WebSocket URL from API URL
                // For production, remove '/api' and use the base URL for WebSocket
                serverUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '');
            } else {
                // Fallback to production WebSocket server URL based on project configuration
                serverUrl = 'https://apitanishvideo.fableadtech.in'; // Production WebSocket server
            }
            console.log('useSocket: Connecting to server:', serverUrl);
            const newSocket = io(serverUrl, socketOptions);

            newSocket.on('connect', () => {
                console.log('Connected to video call server');
                setConnected(true);
                setError(null);

                // Check if this is a monitoring reconnection
                const monitoringState = sessionStorage.getItem('monitoringReconnect');
                if (monitoringState) {
                    try {
                        const { roomId: storedRoomId, roomType: storedRoomType } = JSON.parse(monitoringState);
                        console.log('Restoring monitoring connection for room:', storedRoomId);

                        // Join the room as monitor/admin with restored state
                        newSocket.emit('join-room', {
                            [storedRoomType === 'group' ? 'groupSessionId' : 'sessionId']: storedRoomId,
                            userType: 'monitor',
                            isReconnect: true
                        });

                        // Clear the stored state
                        sessionStorage.removeItem('monitoringReconnect');
                    } catch (err) {
                        console.error('Error restoring monitoring state:', err);
                        // Fall back to normal join
                        newSocket.emit('join-room', {
                            [roomType === 'group' ? 'groupSessionId' : 'sessionId']: roomId,
                            userType: 'monitor'
                        });
                    }
                } else {
                    // Normal join
                    newSocket.emit('join-room', {
                        [roomType === 'group' ? 'groupSessionId' : 'sessionId']: roomId,
                        userType: 'monitor'
                    });
                }
            });

            // Add WebRTC signaling event handlers
            newSocket.on('offer', (data) => {
                console.log('=== ADMIN RECEIVED OFFER ===');
                console.log('Offer data:', data);
                console.log('Socket ID:', newSocket.id);
                console.log('Sender ID:', data.senderId);

                // Emit event for WebRTC hook to handle
                newSocket.emit('webrtc-offer-received', data);
            });

            newSocket.on('answer', (data) => {
                console.log('=== ADMIN RECEIVED ANSWER ===');
                console.log('Answer data:', data);
                console.log('Socket ID:', newSocket.id);
                console.log('Sender ID:', data.senderId);

                // Emit event for WebRTC hook to handle
                newSocket.emit('webrtc-answer-received', data);
            });

            newSocket.on('ice-candidate', (data) => {
                console.log('=== ADMIN RECEIVED ICE CANDIDATE ===');
                console.log('ICE candidate data:', data);
                console.log('Socket ID:', newSocket.id);
                console.log('Sender ID:', data.senderId);

                // Emit event for WebRTC hook to handle
                newSocket.emit('webrtc-ice-candidate-received', data);
            });

            newSocket.on('disconnect', (reason) => {
                console.log('❌ Disconnected from video call server:', reason);
                setConnected(false);

                // Check if this is a page refresh - if so, we want to preserve monitoring
                const isPageRefresh = reason === 'transport close' || reason === 'ping timeout';
                if (isPageRefresh) {
                    console.log('🔄 Page refresh detected, will attempt to reconnect as monitor');
                    // Store monitoring state to restore after reconnection
                    sessionStorage.setItem('monitoringReconnect', JSON.stringify({
                        roomId,
                        roomType,
                        timestamp: Date.now()
                    }));
                    // The reconnection will happen automatically due to reconnection options
                } else if (reason === 'io server disconnect') {
                    // Handle server-initiated disconnection
                    console.log('🔄 Server disconnected, attempting reconnection...');
                    setTimeout(() => {
                        if (newSocket) {
                            newSocket.connect();
                        }
                    }, 3000);
                }
            });

            newSocket.on('connect_error', (err) => {
                console.error('❌ Connection error:', err);
                
                // Handle specific "Invalid namespace" error
                if (err.message && err.message.includes('Invalid namespace')) {
                    console.error('❌ Invalid namespace error - Check WebSocket server URL configuration');
                    setError('Invalid namespace: Please check WebSocket server configuration');
                } else {
                    setError(err.message);
                }

                // Handle authentication errors specifically
                if (err.message && err.message.includes('Authentication')) {
                    console.log('🔒 Authentication failed, token might be invalid');
                    // Don't retry immediately for auth errors
                    return;
                }

                // Retry connection for network errors
                console.log('🔄 Retrying connection in 3 seconds...');
                setTimeout(() => {
                    if (newSocket && !newSocket.connected) {
                        newSocket.connect();
                    }
                }, 3000);
            });

            newSocket.on('error', (err) => {
                console.error('❌ Socket error:', err);

                // Handle specific session not active error
                if (err.message && err.message.includes('Session is not active at this time')) {
                    console.log('⚠️ Session is not active - blocking admin entry');
                    setError('⏰ Session Not Active\n\nThis monitoring session is not currently active.');
                } else if (err.message && err.message.includes('Unauthorized to join this session')) {
                    console.log('⚠️ Unauthorized admin access attempt');
                    setError('🔒 Access Denied\n\nYou are not authorized to monitor this session.');
                } else {
                    setError(err.message);
                }
            });

            setSocket(newSocket);

            // Cleanup on unmount - but preserve call on page refresh
            return () => {
                // Check if this is a page refresh/unload vs component unmount
                const isPageUnload = typeof window !== 'undefined' && (window.performance?.navigation?.type === 1 || window.event?.type === 'beforeunload');

                if (newSocket && !isPageUnload) {
                    try {
                        newSocket.emit('leave-room', {
                            roomId,
                            roomType
                        });
                    } catch (err) {
                        console.error('Error leaving room:', err);
                    }
                    try {
                        newSocket.close();
                    } catch (err) {
                        console.error('Error closing socket:', err);
                    }
                }
                // If it's a page refresh, keep the connection alive
            };
        } catch (err) {
            console.error('Error initializing socket:', err);
            console.error('Error details:', {
                message: err.message,
                stack: err.stack,
                name: err.name
            });
            setError(err.message);

            // Don't retry immediately for authentication errors
            if (!err.message || !err.message.includes('Authentication')) {
                // Try to reconnect after a delay for other errors
                setTimeout(() => {
                    if (!connected) {
                        console.log('Attempting to reconnect...');
                        // The useEffect will automatically retry due to the dependency on roomId, roomType, token
                    }
                }, 3000);
            }
        }
    }, [roomId, roomType, token]);

    // Wrap emit in useCallback to prevent unnecessary re-renders
    const emit = useCallback((event, data) => {
        if (socket && connected) {
            socket.emit(event, data);
        }
    }, [socket, connected]);

    // Listen for events
    const on = useCallback((event, callback) => {
        if (socket) {
            socket.on(event, callback);
            return () => socket.off(event, callback);
        }
    }, [socket]);

    return {
        socket,
        connected,
        error,
        emit,
        on,
        setError
    };
};

// Special hook for admin chat functionality
export const useAdminChatSocket = () => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [adminOnlineCount, setAdminOnlineCount] = useState(0);
    const [anyAdminOnline, setAnyAdminOnline] = useState(false);
    const { token } = useAuthRedux();

    useEffect(() => {
        if (!token) return;

        const socketOptions = {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            auth: { token }
        };

        let serverUrl;
        if (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.includes('localhost')) {
            serverUrl = 'http://localhost:5000';
        } else if (import.meta.env.VITE_API_BASE_URL) {
            serverUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '');
        } else {
            serverUrl = 'https://apitanishvideo.fableadtech.in';
        }

        const newSocket = io(serverUrl, socketOptions);

        newSocket.on('connect', () => {
            console.log('Admin chat socket connected');
            setConnected(true);

            // Join admin support room
            newSocket.emit('join-default-chat');

            // Request current admin status
            newSocket.emit('admin-status-request');
        });

        // Listen for admin status updates
        newSocket.on('admin-status-update', (data) => {
            console.log('Admin status update received:', data);
            setAnyAdminOnline(data.online);
            // Update count if provided
            if (data.onlineCount !== undefined) {
                setAdminOnlineCount(data.onlineCount);
            }
        });

        // Listen for admin presence updates
        newSocket.on('admin-presence', (data) => {
            console.log('Admin presence update:', data);
            setAnyAdminOnline(data.presence === 'online');
        });

        newSocket.on('disconnect', () => {
            console.log('Admin chat socket disconnected');
            setConnected(false);
            setAnyAdminOnline(false);
            setAdminOnlineCount(0);
        });

        newSocket.on('connect_error', (err) => {
            console.error('Admin chat socket connection error:', err);
            setConnected(false);
            setAnyAdminOnline(false);
            setAdminOnlineCount(0);
        });

        setSocket(newSocket);

        return () => {
            if (newSocket) {
                newSocket.close();
            }
        };
    }, [token]);

    const emit = useCallback((event, data) => {
        if (socket && connected) {
            socket.emit(event, data);
        }
    }, [socket, connected]);

    const on = useCallback((event, callback) => {
        if (socket) {
            socket.on(event, callback);
            return () => socket.off(event, callback);
        }
    }, [socket]);

    return {
        socket,
        connected,
        adminOnlineCount,
        anyAdminOnline,
        emit,
        on
    };
};

export default useSocket;