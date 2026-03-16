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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionDetails, setSessionDetails] = useState<any>(null);

  // Memoize session details to prevent unnecessary re-renders
  const memoizedSessionDetails = useMemo(() => {
    return sessionDetails;
  }, [JSON.stringify(sessionDetails)]);

  useEffect(() => {
    // Wait for both id and user to be available
    if (!id) {
      console.log("⏳ Waiting for session ID...");
      return;
    }
    
    if (!user || !user._id) {
      console.log("⏳ Waiting for user authentication...");
      return;
    }
    
    const initializeCall = async () => {
      try {
        console.log("🔍 GroupVideoCallPage Debug Info:");
        console.log("  - URL ID param:", id);
        console.log("  - User object:", user);
        console.log("  - User._id:", user._id);
        
        console.log("🎯 Initializing group video call:", id);

        // Generate admin join token
        const tokenResponse = await adminVideoCallApi.generateJoinLink(
          id,
          user._id,
          "admin"
        );

        console.log("🎯 Admin join token response:", tokenResponse);

        if (tokenResponse.success) {
          setConnected(true);
          setLoading(false);
        } else {
          const errorMsg = tokenResponse.message || "Failed to generate join token";
          console.error("❌ Token generation failed:", errorMsg);
          setError(errorMsg);
          setLoading(false);
        }

        // Fetch session participants for group call
        try {
          const participantsResponse = await adminVideoCallApi.getSessionParticipants(id);
          console.log("🎯 Group session participants:", participantsResponse);
          
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
          console.warn("⚠️ Could not fetch group session participants:", participantsErr);
          // Continue anyway - participants will be discovered via WebRTC signaling
        }
        
      } catch (err: any) {
        console.error("❌ Error initializing group call:", err);
        setError(err.response?.data?.message || "Failed to initialize call");
        setLoading(false);
      }
    };

    initializeCall();
  }, [id, user]);

  const handleEndCall = () => {
    navigate("/sessions");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Initializing group call...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center max-w-md p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => {
                console.log("🔄 Retrying connection...");
                setError(null);
                setLoading(true);
                // Force re-run of useEffect by clearing and resetting state
                setConnected(false);
                setTimeout(() => {
                  window.location.reload();
                }, 100);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              🔄 Retry Connection
            </button>
            <button
              onClick={() => navigate("/group-sessions")}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Back to Group Sessions
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!connected || !id) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Connecting to group session...</p>
        </div>
      </div>
    );
  }

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
