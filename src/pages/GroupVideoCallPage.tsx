import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthRedux } from "@/hooks/useAuthRedux";
import GroupVideoCall from "@/components/VideoCall/GroupVideoCall";
import { adminVideoCallApi } from "@/lib/videoCallApi";

export default function GroupVideoCallPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthRedux();
  const [connected, setConnected] = useState(false);
  const [sessionDetails, setSessionDetails] = useState<any>(null);

  // Memoize session details to prevent unnecessary re-renders
  const memoizedSessionDetails = useMemo(() => {
    return sessionDetails;
  }, [JSON.stringify(sessionDetails)]);

  // In a real app, this would fetch from an API
  useEffect(() => {
    const initializeCall = async () => {
      // In a real application, fetch session details from API
      if (id && user) {
        console.log("🎯 Initializing group video call on page load:", id);
        
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

        // Fetch session participants for group call
        try {
          const participantsResponse =
            await adminVideoCallApi.getSessionParticipants(id);
          console.log("Group session participants:", participantsResponse);
          if (participantsResponse.success) {
            const sessionInfo = {
              participants: participantsResponse.data.participants,
              type: "group",
              groupSessionId: id,
            };
            setSessionDetails(sessionInfo);
            console.log("✅ Group session details set:", sessionInfo);
          }
        } catch (participantsErr) {
          console.warn(
            "Could not fetch group session participants:",
            participantsErr
          );
          // Continue anyway - participants will be discovered via WebRTC signaling
        }
      }
    };

    initializeCall();
  }, [id, user]);

  const handleEndCall = () => {
    navigate("/bookings-and-sessions");
  };

  return (
    <GroupVideoCall
      groupSessionId={id}
      userRole="admin"
      onEndCall={handleEndCall}
      user={user}
      connected={connected}
      sessionDetails={memoizedSessionDetails}
    />
  );
}
