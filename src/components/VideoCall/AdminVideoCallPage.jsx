import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthRedux } from "@/hooks/useAuthRedux";
import VideoCall from "@/components/VideoCall/VideoCall";
import { adminVideoCallApi } from "@/lib/videoCallApi";

const AdminVideoCallPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthRedux();
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [callDetails, setCallDetails] = useState(null);

  useEffect(() => {
    const initializeCall = async () => {
      try {
        if (!sessionId || !user) {
          setError("Invalid session or user");
          return;
        }

        // Verify user is admin or therapist
        if (user.role !== "admin" && user.role !== "therapist") {
          setError(
            "Access denied. Only admins and therapists can access video calls."
          );
          return;
        }

        // Get call details
        try {
          const detailsResponse = await adminVideoCallApi.getCallDetails(
            sessionId
          );
          if (detailsResponse.success) {
            setCallDetails(detailsResponse.data);
          }
        } catch (err) {
          console.warn("Could not fetch call details:", err);
        }

        // Generate call token
        const response = await adminVideoCallApi.generateJoinLink(
          sessionId,
          user.userId,
          user.role
        );

        if (response.success) {
          setToken(response.token);
        } else {
          setError(response.message || "Failed to generate call token");
        }
      } catch (err) {
        console.error("Error initializing call:", err);
        setError("Failed to initialize call");
      } finally {
        setLoading(false);
      }
    };

    initializeCall();
  }, [sessionId, user]);

  const handleEndCall = () => {
    navigate("/admin/dashboard");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Initializing video call...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center text-white max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center text-white">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Call Not Available</h2>
          <p className="text-gray-400">Unable to join this video call.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900">
      {/* Admin Call Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Admin Video Call</h1>
            <p className="text-gray-400 text-sm">Session ID: {sessionId}</p>
            {callDetails && (
              <p className="text-gray-400 text-sm">
                {callDetails.session.user?.name} with{" "}
                {callDetails.session.therapist?.name}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/admin/call-monitoring")}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Call Monitoring
            </button>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Exit Call
            </button>
          </div>
        </div>
      </div>

      <VideoCall
        roomId={sessionId}
        roomType="session"
        isTherapist={user.role === "admin" || user.role === "therapist"}
        onEndCall={handleEndCall}
        sessionId={sessionId}
      />
    </div>
  );
};

export default AdminVideoCallPage;
