import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockSessions } from "@/lib/session-data";
import { adminVideoCallApi } from "@/lib/videoCallApi";
import { useAuthRedux } from "@/hooks/useAuthRedux";
import ClinicMonitoring from "../components/VideoCall/ClinicMonitoring";


export default function VideoCallPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthRedux();
  console.log("session _id", id);
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState<{
    user: string;
    therapist: string;
  } | null>(null);
  const [connected, setConnected] = useState(false);
  const [sessionDetails, setSessionDetails] = useState<any>(null); // Store session details including participants

  // In a real app, this would fetch from an API
  useEffect(() => {
    const initializeCall = async () => {
      // In a real application, fetch session details from API
      if (id && user) {
        // For now, we'll skip mock data and focus on fetching from API

        // First generate a join token for the admin to join the session
        try {
          const userId = user._id;
          const tokenResponse = await adminVideoCallApi.generateJoinLink(
            id,
            userId,
            "admin"
          );
          console.log("Admin join token response:", tokenResponse);

          if (tokenResponse.success) {
            setConnected(true);
          } else {
            console.error(
              "Failed to generate admin join token:",
              tokenResponse
            );
          }
        } catch (tokenErr) {
          console.error("Error generating admin join token:", tokenErr);
        }

        // Fetch session participants
        try {
          const participantsResponse =
            await adminVideoCallApi.getSessionParticipants(id);
          console.log("Admin session participants:", participantsResponse);
          if (participantsResponse.success) {
            // Add participants data to sessionDetails
            setSessionDetails({
              participants: participantsResponse.data.participants,
            });
          }
        } catch (participantsErr) {
          console.warn(
            "Could not fetch session participants:",
            participantsErr
          );
          // Continue anyway
        }
      }
    };

    initializeCall();
  }, [id]);

  const handleEndCall = () => {
    // Close the current tab/window
    if (window.opener) {
      // If opened from parent window, close itself
      window.close();
    } else {
      // If it's the main window, navigate back to sessions
      navigate("/sessions");
    }
  };

  return (
    <ClinicMonitoring
      roomId={id || ""}
      roomType="session"
      userRole="admin"
      isTherapist={false} // Admin is not a therapist
      onEndCall={handleEndCall}
      sessionId={id || ""}
      connected={connected}
      sessionDetails={sessionDetails}
      user={user}
    />
  );
}