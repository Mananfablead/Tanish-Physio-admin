import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuthRedux } from '../hooks/useAuthRedux';

const useSocket = (roomId, roomType) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(null);
    const { token } = useAuthRedux();

    // Initialize socket connection
    useEffect(() => {
        if (!roomId || !token) return;

        try {
            const newSocket = io(process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000', {
                auth: {
                    token: token
                }
            });

            newSocket.on('connect', () => {
                console.log('Connected to video call server');
                setConnected(true);
                setError(null);

                // Join the room
                newSocket.emit('join-room', {
                    [roomType === 'group' ? 'groupSessionId' : 'sessionId']: roomId
                });
            });

            newSocket.on('disconnect', () => {
                console.log('Disconnected from video call server');
                setConnected(false);
            });

            newSocket.on('connect_error', (err) => {
                console.error('Connection error:', err);
                setError(err.message);
            });

            setSocket(newSocket);

            // Cleanup on unmount
            return () => {
                if (newSocket) {
                    newSocket.emit('leave-room', {
                        roomId,
                        roomType
                    });
                    newSocket.close();
                }
            };
        } catch (err) {
            setError(err.message);
            console.error('Error initializing socket:', err);
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
        on
    };
};

export default useSocket;