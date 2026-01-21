import { useEffect } from "react";
import VideoCallComponent from "../../components/VideoCall/VideoCall"; // Adjust path as needed

interface VideoCallProps {
  roomId: string;
  roomType?: string;
  isTherapist?: boolean;
  onEndCall?: () => void;
}

export function VideoCall({ roomId, roomType = "session", isTherapist = true, onEndCall }: VideoCallProps) {
  return (
    <VideoCallComponent
      roomId={roomId}
      roomType={roomType}
      isTherapist={isTherapist}
      onEndCall={onEndCall}
    />
  );
}
