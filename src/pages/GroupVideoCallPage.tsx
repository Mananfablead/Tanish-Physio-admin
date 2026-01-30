import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    const initializeCall = async () => {
      try {
        if (!id || !user) {
          setError("Missing session ID or user authentication");
          setLoading(false);
          return;
        }

        // Generate admin join token
        const tokenResponse = await adminVideoCallApi.generateJoinLink(
          id,
          user._id,
          "admin"
        );

        if (tokenResponse.success) {
          setConnected(true);
        } else {
          setError(tokenResponse.message || "Failed to generate join token");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to initialize call");
      } finally {
        setLoading(false);
      }
    };

    initializeCall();
  }, [id, user]);

  const handleEndCall = () => {
    navigate("/group-sessions");
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
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
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
    />
  );
}
