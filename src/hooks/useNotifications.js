import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthRedux } from './useAuthRedux';
import { toast } from './use-toast';

export const useNotifications = () => {
    const { token, user } = useAuthRedux();
    const socketRef = useRef(null);

    useEffect(() => {
        if (!token || !user) {
            return;
        }

        // Connect to notification socket
        const socket = io('http://localhost:5001', { // Adjust URL as needed
            auth: { token },
            transports: ['websocket', 'polling']
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Connected to notification socket');
            // Join user's notification room
            socket.emit('join-notifications', {});
        });

        socket.on('notifications-joined', (data) => {
            console.log('Joined notifications channel:', data);
        });

        socket.on('client-notification', (data) => {
            console.log('Received notification:', data);

            // Show toast notification
            toast({
                title: data.title || "Notification",
                description: data.message || "You have a new notification",
                variant: data.priority === 'high' ? "destructive" : "default"
            });

            // Handle specific notification types
            if (data.type === 'google_meet_ready') {
                // Store Google Meet link in localStorage for easy access
                if (data.googleMeetLink) {
                    localStorage.setItem(`google_meet_link_${data.sessionId}`, JSON.stringify({
                        link: data.googleMeetLink,
                        code: data.googleMeetCode,
                        timestamp: data.timestamp
                    }));
                }

                // Show special toast for Google Meet
                toast({
                    title: "Google Meet Available",
                    description: "Your alternative meeting link is ready. Check your session details or join directly.",
                    variant: "default"
                });
            } else if (data.type === 'google_meet_updated') {
                // Update Google Meet link in localStorage when it's updated by admin
                if (data.googleMeetLink) {
                    localStorage.setItem(`google_meet_link_${data.sessionId}`, JSON.stringify({
                        link: data.googleMeetLink,
                        code: data.googleMeetCode,
                        timestamp: data.timestamp
                    }));
                }

                // Show special toast for updated Google Meet
                toast({
                    title: "Google Meet Link Updated",
                    description: "Your therapist has updated the Google Meet link for your session. Check your session details.",
                    variant: "default"
                });
            }
        });

        socket.on('connection-failure-reported', (data) => {
            console.log('Connection failure reported:', data);
            toast({
                title: "Report Submitted",
                description: "Your connection issue has been reported to our team.",
                variant: "default"
            });
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from notification socket');
        });

        socket.on('connect_error', (error) => {
            console.error('Notification socket connection error:', error);
        });

        // Cleanup on unmount
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [token, user]);

    // Function to manually trigger connection failure report
    const reportConnectionFailure = (sessionId, errorDetails = '') => {
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('report-connection-failure', {
                sessionId,
                errorDetails
            });
        }
    };

    return {
        socket: socketRef.current,
        reportConnectionFailure
    };
};