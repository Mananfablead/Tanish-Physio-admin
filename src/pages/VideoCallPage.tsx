import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VideoCall } from '@/components/ui/VideoCall';
import { mockSessions } from '@/lib/session-data';

export default function VideoCallPage() {
  const { id } = useParams<{ id: string }>();
  console.log("session _id", id)
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState<{ user: string; therapist: string } | null>(null);

  // In a real app, this would fetch from an API
  useEffect(() => {
    // Mock data for demonstration
    if (id) {
      // Find the session in mock data
      const allSessions = [...mockSessions.upcoming, ...mockSessions.live, ...mockSessions.completed, ...mockSessions.cancelled];
      const session = allSessions.find(s => s.id.toString() === id);
      
      if (session) {
        setSessionData({
          user: session.user,
          therapist: session.therapist
        });
      }
    }
  }, [id]);

  const handleEndCall = () => {
    // Close the current tab/window
    if (window.opener) {
      // If opened from parent window, close itself
      window.close();
    } else {
      // If it's the main window, navigate back to sessions
      navigate('/sessions');
    }
  };
console.log("sessionData------>>",sessionData)
  if (!sessionData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading video call...</p>
        </div>
      </div>
    );
  }

  return (
    <VideoCall 
      roomId={id || ''} 
      roomType="session"
      isTherapist={true}
      onEndCall={handleEndCall}
    />
  );
}