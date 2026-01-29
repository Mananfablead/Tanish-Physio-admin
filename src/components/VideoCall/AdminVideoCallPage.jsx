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
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Initializing monitoring session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center text-white max-w-md p-6">
          <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
            <X className="h-8 w-8 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-white">Access Error</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <Button
            onClick={() => navigate("/admin/dashboard")}
            className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 px-6 rounded-xl transition-colors border border-slate-700"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center text-white p-6">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
            <Video className="h-8 w-8 text-slate-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-white">Session Unavailable</h2>
          <p className="text-slate-500">Unable to establish monitoring connection.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Admin Session Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700">
            <Video className="h-5 w-5 text-slate-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0">Admin Monitoring</Badge>
              <span className="text-slate-500 text-xs font-medium">• Live Session</span>
            </div>
            <h1 className="text-white font-semibold tracking-tight">Session Monitoring</h1>
            <p className="text-slate-500 text-xs mt-1">Session ID: {sessionId}</p>
            {callDetails && (
              <p className="text-slate-500 text-xs">
                {callDetails.session.user?.name} with {callDetails.session.therapist?.name}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl px-4"
            onClick={() => navigate("/admin/call-monitoring")}
          >
            <Users className="h-4 w-4 mr-2" />
            Monitoring Dashboard
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="bg-rose-500 hover:bg-rose-600 rounded-xl px-4 shadow-lg shadow-rose-500/20"
            onClick={() => navigate("/admin/dashboard")}
          >
            <X className="h-4 w-4 mr-2" />
            Exit Monitoring
          </Button>
        </div>
      </div>

      <VideoCall
        roomId={sessionId}
        roomType="session"
        userRole={user.role}
        onEndCall={handleEndCall}
        sessionId={sessionId}
      />
    </div>
  );
};

export default AdminVideoCallPage;
