import { useEffect } from "react";
import VideoCallComponent from "../../components/VideoCall/VideoCall"; // Adjust path as needed

interface VideoCallProps {
  sessionId: string;
  user: string;
  therapist: string;
  onLeaveCall: () => void;
}

export function VideoCall({ sessionId, onLeaveCall }: VideoCallProps) {
  // In the admin context, we assume the admin is the therapist
  const isTherapist = true;

  return (
    <VideoCallComponent
      roomId={sessionId}
      roomType="session"
      isTherapist={isTherapist}
      onEndCall={onLeaveCall}
    />
  );
}
